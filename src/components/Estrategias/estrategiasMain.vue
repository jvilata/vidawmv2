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
        <estrategiasFilter
          v-model="filterRecord"
          @getRecords="getRecords"
          @hide="expanded = !expanded"
        />
      </q-dialog>
      <!-- formulario tabla de resultados de busqueda -->
      <estrategiasGrid
        v-model="filterRecord"
        :key="refreshKey"
        />
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import estrategiasFilter from 'components/Estrategias/estrategiasFilter.vue'
import estrategiasGrid from 'components/Estrategias/estrategiasGrid.vue'

export default {
  props: [], // se pasan como parametro desde mainTabs. value = { registrosSeleccionados: [], filterRecord: {} }
  data () {
    return {
      expanded: false,
      refreshKey: 0,
      visible: '',
      filterRecord: {},
      nomFormulario: 'Estrategias',
      registrosSeleccionados: []
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
      this.refreshKey++
      this.expanded = false
    }
  },
  mounted () {
      this.filterRecord = { codEmpresa: this.user.codEmpresa }
      this.getRecords(this.filterRecord)
  },
  unmounted () {
    this.$emit('changeTab', Object.assign({}, this.filterRecord))
  },
  components: {
    estrategiasFilter: estrategiasFilter,
    estrategiasGrid: estrategiasGrid
  }
}
</script>
