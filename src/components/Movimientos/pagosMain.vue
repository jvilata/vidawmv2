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
        <pagosFilter
          :value="filterRecord"
          @saveChanges="(value) => Object.assign(filterRecord, value)"
          @getRecords="getRecords"
          @hide="expanded = !expanded"
        />
      </q-dialog>

      <!-- formulario tabla de resultados de busqueda -->
      <pagosGrid
        :value="registrosSeleccionados"
        @generarArbol = "getRecords(filterRecord)"
        />
    </div>
</template>

<script>
import { mapState } from 'vuex'
import pagosFilter from 'components/Movimientos/pagosFilter.vue'
import pagosGrid from 'components/Movimientos/movimientosPagosGrid.vue'
export default {
  props: [],
  data () {
    return {
      expanded: false,
      visible: '',
      filterRecord: {},
      nomFormulario: 'Pagos/Cobros',
      registrosSeleccionados: []
    }
  },
  computed: {
    ...mapState('tabs', ['tabs']),
    ...mapState('login', ['user']) // importo state.user desde store-login
  },
  methods: {
    generarArbol () {
      // ordenar el array por tipoActivo
      this.registrosSeleccionados.sort((a, b) => (a.generar <= b.generar ? -1 : 1))
      var arr = []
      var antGenerar = 'x'
      var obj = {}
      this.registrosSeleccionados.forEach(row => {
        // si tipoActivo != antTipoActivo  Insertamos 'obj' en arr como cabecera tipoActivo
        if (row.generar !== antGenerar) {
          obj = {
            id: -Math.floor((Math.random() * 999999) + 999999),
            generar: row.generar,
            // nombre: '',
            expend: true,
            importe: 0,
            children: []
          }
          arr.push(obj)
          antGenerar = row.generar
        }
        row.children = []
        obj.tipoOperacion = row.tipoOperacion
        obj.importe += parseFloat(row.importe)
        obj.nombre = (obj.generar === 0 ? 'NO GENERAR (' : 'GENERAR (') + (obj.children.length + 1) + ' activos)'
        obj.children.push(row)
      })
      this.registrosSeleccionados = arr
    },
    getRecords (filter) {
      // hago la busqueda de registros segun condiciones del formulario Filter que ha lanzado el evento getRecords
      Object.assign(this.filterRecord, filter) // no haría falta pero así obliga a refrescar el componente para que visulice el filtro
      var objFilter = Object.assign({}, filter)
      return this.$axios.get('movimientos/bd_movimientos.php/cpagoscobros', { params: objFilter })
        .then(response => {
          this.registrosSeleccionados = response.data
          // this.registrosSeleccionados.splice(0, 0, { id: -1, tipoActivo: 'CAP.RIESGO', nombre: '' })
          this.generarArbol()
          this.expanded = false
        })
        .catch(error => {
          this.$q.dialog({ title: 'Error', message: error })
        })
    }
  },
  mounted () {
    if (Object.keys(this.tabs['Pagos-1'].meta.value).length > 0) { // ya hemos cargado
      this.expanded = false
      Object.assign(this.filterRecord, this.tabs['Pagos-1'].meta.value)
      this.getRecords(this.filterRecord)
    } else { // es la primera vez que entro, cargo valores po defecto
      this.$axios.get('movimientos/bd_movimientos.php/borrarMarcasPago', { params: { codEmpresa: this.user.codEmpresa } })
        .then(response => {
          this.filterRecord = { codEmpresa: this.user.codEmpresa, tipoOperacion: 'PAGO' }
          this.getRecords(this.filterRecord)
        })
        .catch(error => {
          this.$q.dialog({ title: 'Error', message: error })
        })
    }
  },
  unmounted () {
    this.$emit('changeTab', Object.assign({}, this.filterRecord))
  },
  components: {
    pagosFilter: pagosFilter,
    pagosGrid: pagosGrid
  }
}
</script>
