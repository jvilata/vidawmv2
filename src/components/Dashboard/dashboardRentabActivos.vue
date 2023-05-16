<template>
  <div>
    <div class="q-ml-sm q-mr-sm row">
      <q-select dense class="col"
        outlined
        clearable
        label="Tipo Activo"
        stack-label
        v-model="filterR.tipoActivo1"
        :options="listaTiposActivo"
        option-value="codElemento"
        option-label="codElemento"
        multiple
        use-chips
        emit-value
      />
      <q-btn class="col-1" label="Mostrar" color="primary" @click="getRentabActivos(filterR)"/>
    </div>
  <div class="row">
    <div class="col" >
      <q-item class="q-ma-md q-pa-xs bg-indigo-1 text-grey-8">
        <q-item-section align="center">
          <div class="text-h6">Rentabilidad por Activo</div>
        </q-item-section>
      </q-item>
      <q-item >
        <q-item-section align="center">
          <apexchart ref="evol1" height= "400px" width="1000px" type="bar" :options="chartOptions" :series="series"></apexchart>
        </q-item-section>
      </q-item>
    </div>
  </div>
  </div>
</template>
<script>
// doc in: https://github.com/apexcharts/vue-apexcharts , https://apexcharts.com/
import { numeralInstance } from 'boot/numeral.js'
import { Loading } from 'quasar'
import { mapState, mapActions } from 'vuex'
var regtmp = [];
var este = null;
export default {
  props: ['value'],
  data: function () {
    return {
      registrosRentabActivos: [],
      filterR: { tipoActivo1: ['RENTA VBLE'] },
      chartOptions: {
        labels: [],
        chart: {
          stacked: false,
          events: {
            updated: function (chartContext, config) {
              Loading.hide()
            },
            dataPointSelection: function(event, chartContext, config) {
              este.addTab(['activosFormMain', 'Activo-' + regtmp[config.dataPointIndex].idActivo, regtmp[config.dataPointIndex], regtmp[config.dataPointIndex].idActivo])
            }
          }
        },
        legend: {
          show: true,
          position: 'top'
        },
        xaxis: {
          labels: {
            rotate: -65,
            style: {
              fontSize: '8px',
              fontFamily: 'Helvetica, Arial, sans-serif',
              fontWeight: 'normal',
              colors: ['dark']
            }
          }
        },
        dataLabels: {
          enabled: true,
          formatter: function (val, opt) {
            return Math.round((parseFloat(regtmp[opt.dataPointIndex].importe) - parseFloat(regtmp[opt.dataPointIndex].impcompventastotales))/1000) + 'k'
          },
          style: {
            fontSize: '8px',
            fontFamily: 'Helvetica, Arial, sans-serif',
            fontWeight: 'normal',
            colors: ['dark']
          }
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return numeralInstance(parseFloat(val)).format('0,0.0') 
            }
          }
        }
      },
      series: [] // { name:'nom serie', type: 'line', data: [] }
    }
  },
  computed: {
    ...mapState('tablasAux', ['listaTiposActivo', 'listaTiposProducto'])
  },
  methods: {
    ...mapActions('activos', ['loadActivos']),
    ...mapActions('tabs', ['addTab']),
    getRentabActivos (objFilter) {
      objFilter.tipoActivo = (objFilter.tipoActivo1 && objFilter.tipoActivo1 !== null ? objFilter.tipoActivo1.join() : null) // paso de array a concatenacion de strings (join)
      Object.assign(objFilter, {
        tipoOperacion: 'VALORACION',
        estadoActivo: '1,4',
        importem0: '1',
        computa: '1'
      })
      Loading.show()
      // donut resumen patrimonio
      this.$axios.get('movimientos/bd_movimientos.php/findcMovimientosComparado/', { params: objFilter })
        .then(response => {
          this.registrosRentabActivos = response.data
          this.cargarDatosGrafico()
          Loading.hide()
        })
        .catch(error => {
          Loading.hide()
          this.$q.dialog({ title: 'Error', message: error })
        })
    },
    cargarDatosGrafico () {
      // this.value // [{serie: "Euros", etiquetavalor: "CREDIT SUISSE", valor: "24253466.0000"},...]
      /* this.value.sort(function (a, b) { // ordeno el array por etiquetavalor
        return (a.etiquetavalor !== null ? a.etiquetavalor.localeCompare(b.etiquetavalor) : 0)
      }) */
      this.series = []
      var etiqAnt = ''
      var arr = []
      este = this
      regtmp = this.registrosRentabActivos
      this.registrosRentabActivos.forEach(row => {
        row.valor = Math.round((parseFloat(row.importe) - parseFloat(row.impcompventastotales))*100.0 / parseFloat(row.impcompventastotales)*10)/10
      })
      this.registrosRentabActivos.sort(function (a, b) { // ordeno el array por serie
        if (a.valor < b.valor) return 1
        else if (a.valor > b.valor) return -1
        else return 0
      })
      this.registrosRentabActivos.forEach(row => {
        if (row.nombre !== etiqAnt) {
          arr.push((row.nombre === null ? '' : row.nombre)) // la cambiar de etiqueta guardo la anterior
          etiqAnt = row.nombre
        }
      })
      this.chartOptions= {
        ...this.chartOptions,
        labels: arr // es un array de strings
      }
      
      var serieAnt = ''
      var obj = {}
      this.registrosRentabActivos.forEach(row => {
        if (row.tipoOperacion !== serieAnt) { // row.serie!== serieAnt ** this.serie es un array de objetos {name:'serie', type:'line', data:[1,3,4,..]}
          obj = {
            name: 'Rentab',// row.serie,
            type: 'column',
            data: []
          }
          this.series.push(obj) // la cambiar de serie guardo la anterior
          serieAnt = row.tipoOperacion // row.serie
        }
        obj.data.push(row.valor)
      })
    }
  },
  mounted () {
    Object.assign(this.filterR, this.value)
    this.getRentabActivos(this.filterR) // carga datos  patrim entidad
  }
}
</script>
