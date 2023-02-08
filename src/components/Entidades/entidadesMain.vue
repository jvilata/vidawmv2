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
        <entidadesFilter
          :value="filterRecord"
          @saveChanges="(value) => Object.assign(filterRecord, value)"
          @getRecords="getRecords"
          @hide="expanded = !expanded"
        />
      </q-dialog>

      <!-- formulario tabla de resultados de busqueda -->
      <entidadesGrid
        :value="filterRecord"
        :key="refreshKey"
        />
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import entidadesFilter from 'components/Entidades/entidadesFilter.vue'
import entidadesGrid from 'components/Entidades/entidadesGrid.vue'
export default {
  props: [],
  data () {
    return {
      expanded: false,
      refreshKey: 0,
      visible: '',
      filterRecord: {},
      nomFormulario: 'Entidades',
      registrosSeleccionados: []
    }
  },
  computed: {
    ...mapState('tabs', ['tabs']),
    ...mapState('login', ['user'])
  },
  methods: {
    ...mapActions('tablasAux', ['loadTipoEntidad']),
    getRecords (filter) {
      // hago la busqueda de registros segun condiciones del formulario Filter que ha lanzado el evento getRecords
      Object.assign(this.filterRecord, filter)
      this.refreshKey++
      this.expanded = false
    }
  },
  mounted () {
    this.loadTipoEntidad() // carga tabla auxiliar
    if (Object.keys(this.tabs['Entidades-1'].meta.value).length > 0) {
        this.getRecords(this.tabs['Entidades-1'].meta.value) // filterRecord que hemos cargado en el unmount
    }
  },
  unmounted () {
    this.$emit('changeTab', Object.assign({}, this.filterRecord))
  },
  components: {
    entidadesFilter: entidadesFilter,
    entidadesGrid: entidadesGrid
  }
}
</script>
