  <!-- componente principal de definicion de formularios. Se apoya en otros 2 componentes: Filter y Grid -->
  <template>
    <div style="height: calc(100vh - 105px)" >
      <q-item clickable v-ripple @click="expanded = !expanded" class="q-ma-md q-pa-xs bg-indigo-1 text-grey-8">
        <!-- cabecera de formulario. Botón de busqueda y cierre de tab -->
        <q-item-section avatar>
          <q-icon name="fas fa-filter" />
        </q-item-section>
        <q-item-section >
          <q-item-label class="text-h6">
            {{ nomFormulario }}
          </q-item-label>
          <q-item-label>
            <small>{{ Object.keys(filterRecord).length > 0 ? filterRecord : 'Pulse para definir filtro' }}</small>
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn
          @click="$emit('close')"
          flat
          round
          dense
          icon="close"/>
        </q-item-section>
      </q-item>

      <q-dialog v-model="expanded"  >
        <!-- formulario con campos de filtro -->
        <dashboardFilter
          :model-value="filterRecord"
          @saveChanges="(value) => Object.assign(filterRecord, value)"
          @getRecords="getRecords"
          @hide="expanded = !expanded"
        />
      </q-dialog>

      <q-tab-panels v-model="ltab" animated >
          <q-tab-panel v-for="(tab, index) in menuItems" :key="index" :name="tab.link.name"  class="q-pa-none">
            <router-view :value="filterRecord" :key="refreshRec" :keyValue="refreshRec"/>
          </q-tab-panel>
      </q-tab-panels>
      <!-- podemos poner tabs en el pie para dispositivos moviles pero quita pantalla y no me gusta -->
      <q-tabs v-model="ltab" dense
        class="absolute-bottom bg-primary text-white">
        <q-route-tab v-for="(tab,index) in menuItems"
          no-caps
          :key="index"
          :icon="tab.icon"
          :label="tab.title"
          :name="tab.link.name"
          :to="{ name: tab.link.name }"
          exact />
      </q-tabs>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import dashboardFilter from 'components/Dashboard/dashboardFilter.vue'
export default {
  props: [], // se pasan como parametro desde mainTabs. value = { registrosSeleccionados: [], filterRecord: {} }
  data () {
    return {
      expanded: false,
      visible: '',
      refreshRec: 0,
      filterRecord: {},
      ltab: '',
      nomFormulario: 'Dashboard',
      menuItems: [
        {
          title: 'Panel Datos',
          // caption: '',
          icon: 'table_chart',
          link: { name: 'panelDatos' }
        },
        {
          title: 'Planif.Inversión',
          icon: 'list',
          link: { name: 'gridPlanifComp' }
        },
        {
          title: 'Compr.RVble',
          icon: 'list',
          link: { name: 'gridPlanif' }
        },
       {
          title: 'Resumen Tipos',
          icon: 'pie_chart',
          link: { name: 'resumenTipos' }
        },
        {
          title: 'Analisis Tipos',
          icon: 'pie_chart',
          link: { name: 'analisisTipos' }
        },
        {
          title: 'Evolución Patrimonio',
          icon: 'show_chart',
          link: { name: 'evolucionPatrimonio' }
        },
        {
          title: 'Evolución Clases Act',
          icon: 'multiline_chart',
          link: { name: 'evolucionClases' }
        },
        {
          title: 'Por Entidades',
          icon: 'bar_chart',
          link: { name: 'patrimonioEntidad' }
        },
        {
          title: 'Rentab Activos',
          icon: 'bar_chart',
          link: { name: 'rentabActivos' }
        },
        {
          title: 'Comprometido',
          icon: 'insert_chart_outlined',
          link: { name: 'patrimonioComprometido' }
        }
      ],
      registrosPatrimonioEntidad: [],
      registrosPatrimonioComprometido: []
    }
  },
  computed: {
    ...mapState('login', ['user']),
    ...mapState('tabs', ['tabs']),
    ...mapState('tablasAux', ['listaMeses'])
  },
  methods: {
    getRecords (filter, saltar = false) { // saltar marcara si tenemos que saltar la carga del grid activosInverison
      Object.assign(this.filterRecord, filter) // no haría falta pero así obliga a refrescar el componente para que visulice el filtro
      this.expanded = false
      this.ltab = 'panelDatos'
      this.refreshRec++ // obliga a refrescar el componente para que cargue los nuevos datos
    }
  },
  mounted () {
    this.filterRecord['codEmpresa'] = this.user.codEmpresa // añado campo codEmpresa
    if (Object.keys(this.tabs['dashboard-1'].meta.value).length > 0) { // si ya hemos cargado previamente los recargo al volver a este tab
      this.expanded = false
      Object.assign(this.filterRecord, this.tabs['dashboard-1'].meta.value)
      this.$router.push({ name: 'panelDatos' })
      this.getRecords(this.filterRecord, true) // carga datos de panel datos, saltandose la carga del grid de activosInversion
    } else { // es la primera vez que entro, cargo valores po defecto
      this.filterRecord['mes'] = this.listaMeses[0].mes // ultimo mes
      this.$router.push({ name: 'panelDatos' })
      this.getRecords(this.filterRecord)
    }
  },
  unmounted () {
    this.$emit('changeTab', Object.assign({}, this.filterRecord))
  },
  components: {
    dashboardFilter: dashboardFilter
  }
}
</script>
