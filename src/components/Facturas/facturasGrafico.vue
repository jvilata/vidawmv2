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
        <facturasFilter
          v-model="filterRecord"
          @getRecords="getRecords"
          @hide="expanded = !expanded"
        />
      </q-dialog>
    <div class="col" >
      <q-item class="q-ma-md q-pa-xs bg-indigo-1 text-grey-8">
        <q-item-section align="center">
          <div class="text-h6">Histórico de Facturación</div>
        </q-item-section>
        <q-item-section  class="col-sm-4" align="center">
          <q-select 
            outlined
            label="Periodo"
            stack-label
            v-model="filterRecord.tipoAgrupacion"
            :options="listaPeriodo"
            @update:model-value="cargarDatos"
          />
        </q-item-section>
      </q-item>
      <q-item >
        <q-item-section align="center">
          <apexchart ref="evol1" height= "400px" width="1000px" type="line" :options="chartOptions" :series="series"></apexchart>
        </q-item-section>
      </q-item>
    </div>
</div>
</template>
<script>
// doc in: https://github.com/apexcharts/vue-apexcharts , https://apexcharts.com/
import { numeralInstance } from 'boot/numeral.js'
import { mapState, mapActions } from 'vuex'
import facturasFilter from 'components/Facturas/facturasFilter.vue'
export default {
  props: ['id'], // se pasan como parametro desde mainTabs. value = { registrosSeleccionados: [], filterRecord: {} }
  data () {
    return {
      expanded: false,
      refreshKey: 0,
      visible: '',
      value: {},
      listaPeriodo: ['Años', 'Meses'],
      filterRecord: {
        tipoAgrupacion: 'Años'

      },
      nomFormulario: 'Facturas',
      registrosSeleccionados: [],
      registrosGraficoFacturas: [],
      registrosGraficoFacturasTmp: [],
      chartOptions: {
        labels: [],
        stacked: false,
        legend: {
          show: true,
          position: 'top'
        },
        dataLabels: {
          enabled: true,
          formatter: function (val, opt) {
            return numeralInstance(parseFloat(val) / 1000).format('0,0') + 'k'
          },
          style: {
            fontSize: '10px',
            fontFamily: 'Helvetica, Arial, sans-serif',
            fontWeight: 'normal'
            // colors: ['dark']
          }
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return numeralInstance(parseFloat(val)).format('0,0')
            }
          }
        }
      },
      series: []
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
      this.filterRecord = Object.assign({}, filter)
      this.refreshKey++
      this.expanded = false
      
      this.$axios.get('facturas/bd_facturas.php/findFacturasGraph', { params: this.filterRecord })
        .then(response => {
          this.registrosGraficoFacturasTmp = [...response.data]
          this.getRecordsGraph()
        })
        .catch(error => {
          this.$q.dialog({ title: 'Error', message: error })
        })
      
    },
    cargarDatos(){
      this.getRecords(this.filterRecord)
    },
    getRecordsGraph () {
      this.series = []
      this.registrosGraficoFacturas = [...this.registrosGraficoFacturasTmp] //registros: etiquetavalor y totalbase

      this.registrosGraficoFacturas.sort(function (a, b) { // ordeno el array por etiquetavalor (year)
        return a.etiquetavalor < b.etiquetavalor
      })
     var arr = []
      
      this.registrosGraficoFacturas.forEach(row => {
        arr.push(row.etiquetavalor) // la cambiar de etiqueta guardo la anterior
      })
      this.chartOptions = {
        ...this.chartOptions,
        labels: arr // es un array de strings
      }


      var objSerieBruto = {
        name: 'Facturación',
        type: 'line',
        data: []
      }
      this.series.push(objSerieBruto) 
      
      this.registrosGraficoFacturas.forEach(row => {
        objSerieBruto.data.push(row.totalbase)
      })
    }
      
    },
  mounted () {
    this.filterRecord.codEmpresa = this.user.codEmpresa
    this.filterRecord.tipoFactura= "EMITIDA"
    this.value = this.filterRecord
    console.log(this.filterRecord)
    if (this.listaEntidades.length <= 0) this.loadEntidades() // carga store listaEntidades
    if (this.listaActivos.length <= 0) this.loadActivos(this.user.codEmpresa) // carga store listaActivos
    if (this.value === undefined) this.value = Object.assign({}, this.tabs[this.id].meta.value)
    this.getRecords(this.value)
  },
  unmounted () {
    this.$emit('changeTab', Object.assign({}, this.filterRecord))
  },
  components: {
    facturasFilter: facturasFilter
  }
}
</script>
