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
        <facturasFilterAEAT
          v-model="filterRecord"
          @getRecords="getRecords"
          @hide="expanded = !expanded"
        />
      </q-dialog>

      <!-- formulario tabla de resultados de busqueda -->
      <facturasGridAEAT
        v-model="filterRecord"
        fromFacturasMain=true
        :key="refreshKey"
        />
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import facturasFilterAEAT from 'components/FacturasAEAT/facturasFilterAEAT.vue'
import facturasGridAEAT from 'components/FacturasAEAT/facturasGridAEAT.vue'
export default {
  props: ['id'], // se pasan como parametro desde mainTabs. value = { registrosSeleccionados: [], filterRecord: {} }
  data () {
    return {
      expanded: false,
      refreshKey: 0,
      visible: '',
      filterRecord: {},
      nomFormulario: 'Facturas Emitidas - Enviadas AEAT',
      registrosSeleccionados: []
    }
  },
  computed: {
    ...mapState('login', ['user']), // importo state.user desde store-login
    ...mapState('tabs', ['tabs']),
    ...mapState('entidades', ['listaEntidades']),
    ...mapState('activos', ['listaActivos'])
  },
  methods: {
    ...mapActions('entidades', ['loadEntidades']),
    ...mapActions('activos', ['loadActivos']),
    getRecords (filter) {

      Object.assign(this.filterRecord, filter)
      this.refreshKey++
      this.expanded = false
    }
  },
  mounted () {
    if (this.listaEntidades.length <= 0) this.loadEntidades() // carga store listaEntidades
    if (this.listaActivos.length <= 0) this.loadActivos(this.user.codEmpresa) // carga store listaActivos
    // es la primera vez que entro, cargo valores po defecto
      // Object.assign(this.filterRecord, { codEmpresa: this.user.codEmpresa, estadoFactura: 'PENDIENTE' })
      this.getRecords({ codEmpresa: this.user.codEmpresa, estadoFactura: 'ENVIADA AEAT', tipoFactura: 'EMITIDA' })
    
  },
  unmounted () {
    this.$emit('changeTab', Object.assign({}, this.filterRecord))
  },
  components: {
    facturasFilterAEAT: facturasFilterAEAT,
    facturasGridAEAT: facturasGridAEAT
  }
}
</script>
