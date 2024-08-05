  <!-- componente principal de definicion de formularios. Se apoya en otros 2 componentes: Filter y Grid -->
  <template>
    <div style="height: calc(100vh - 105px)">
      <q-item clickable v-ripple @click="expanded = !expanded" class="q-ma-md q-pa-xs bg-indigo-1 text-grey-8">
        <!-- cabecera de formulario. Botón de busqueda y cierre de tab -->
        <q-item-section avatar>
          <q-icon name="fas fa-filter" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-h6">
            {{ nomFormulario }}
          </q-item-label>
          <q-item-label>
            <!-- poner un campo de fiterRecord que exista en este filtro -->
            <small>{{ Object.keys(filterRecord).length > 1 ? filterRecord : 'Pulse para definir filtro' }}</small>
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
        <portfolioFilter
          v-model="filterRecord"
          @getRecords="getRecords"
          @hide="expanded = !expanded"
        />
      </q-dialog>
      <!-- formulario tabla de resultados de busqueda -->
      <!--<portfolioGrid
        v-model="filterRecord"
        :key="refreshKey"
        />-->

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
import { mapState, mapActions } from 'vuex'
import portfolioFilter from 'components/Portfolio/portfolioFilter.vue'

export default {
  props: [], // se pasan como parametro desde mainTabs. value = { registrosSeleccionados: [], filterRecord: {} }
  data () {
    return {
      expanded: false,
      refreshRec: 0,
      visible: '',
      filterRecord: {},
      ltab: '',
      nomFormulario: 'Portfolio Companies',
      registrosSeleccionados: [],
      menuItems: [
        {
          title: 'Portfolio Grid',
          // caption: '',
          icon: 'table_chart',
          link: { name: 'portfolioGrid' }
        },
        {
          title: 'Gráficos',
          icon: 'bar_chart',
          link: { name: '' }
        }
      ]
    }
  },
  computed: {
    ...mapState('tabs', ['tabs']),
    ...mapState('login', ['user']), // importo state.user desde store-login
  },
  methods: {
    getRecords (filter) {
      // hago la busqueda de registros segun condiciones del formulario Filter que ha lanzado el evento getRecords
      this.filterRecord = Object.assign({}, filter)
      this.refreshRec++
      this.expanded = false
      this.ltab = 'portfolioGrid'
    }
  },
  mounted () {
      this.filterRecord = { codEmpresa: this.user.codEmpresa }
      
      this.getRecords(this.filterRecord)
      this.$router.push({ name: 'portfolioGrid' })
  },
  unmounted () {
    this.$emit('changeTab', Object.assign({}, this.filterRecord))
  },
  components: {
    portfolioFilter: portfolioFilter
  }
}
</script>
