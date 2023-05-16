<template>
  <div class="row">
    <div class="col" >
      <q-item class="q-ma-md q-pa-xs bg-indigo-1 text-grey-8">
        <q-item-section align="center">
          <div class="text-h6">Evolución de Patrimonio</div>
        </q-item-section>
        <q-item-section  class="col-sm-4" align="center">
          <q-select 
            outlined
            label="Periodo"
            stack-label
            v-model="filterR.periodo"
            :options="listaPeriodo"
            @update:model-value="cargarDatosGraficos"
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
export default {
  props: ['value'],
  data: function () {
    return {
      filterR: { periodo: 'Años' },
      listaPeriodo: ['Años', 'Meses'],
      registrosEvolucionPatrimonio: [],
      registrosEvolucionPatrimonioTmp: [],
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
        },
        annotations: {
          yaxis: [{
            y: 0,
            y2: 10000,
            borderColor: 'red',
            fillColor: 'red',
            opacity: 1
          }]
        }
      },
      series: [] // { name:'nom serie', type: 'line', data: [] }
    }
  },
  methods: {
    getEvolucionPatrimonio (objFilter) {
      // donut resumen patrimonio
      this.$axios.get('movimientos/bd_movimientos.php/findcevolucionPatrimonio/', { params: objFilter })
        .then(response => {
          this.registrosEvolucionPatrimonioTmp = [...response.data]
          this.cargarDatosGraficos()
        })
        .catch(error => {
          this.$q.dialog({ title: 'Error', message: error })
        })
    },
    cargarDatosGraficos () {
      this.series = []
      this.registrosEvolucionPatrimonio = [...this.registrosEvolucionPatrimonioTmp]

      this.registrosEvolucionPatrimonio.sort(function (a, b) { // ordeno el array por etiquetavalor
        return a.etiquetavalor.localeCompare(b.etiquetavalor)
      })
      var etiqAnt = ''
      var arr = []
      this.registrosEvolucionPatrimonio.forEach(row => {
        if (row.etiquetavalor !== etiqAnt) {
          if (this.filterR.periodo==='Meses' || row.etiquetavalor.substring(4,7)==='/01') { // solo mes enero
            arr.push(row.etiquetavalor) // la cambiar de etiqueta guardo la anterior
          }
          etiqAnt = row.etiquetavalor
        }
      })
      this.chartOptions = {
        ...this.chartOptions,
        labels: arr // es un array de strings
      }

      //this.registrosEvolucionPatrimonio.sort(function (a, b) { // ordeno el array por serie
      //  return a.serie.localeCompare(b.serie)
      //})
      var objSerieBruto = {
        name: 'Patrimonio Bruto',
        type: 'line',
        data: []
      }
      var objSerieApor = {
        name: 'Aportaciones',
        type: 'line',
        data: []
      }
      var objSerieDiv = {
        name: 'Dividendos',
        type: 'line',
        data: []
      }
      var objSerieBenef = {
        name: 'Beneficio',
        type: 'line',
        data: []
      }
      this.series.push(objSerieBruto) 
      this.series.push(objSerieApor) 
      this.series.push(objSerieBenef)
      this.series.push(objSerieDiv)
      var divacum = 0
      this.registrosEvolucionPatrimonio.forEach(row => {
        if (row.etiquetavalor.substring(4,7)==='/01') divacum += parseFloat(row.dividendos)
        if (this.filterR.periodo==='Meses' || row.etiquetavalor.substring(4,7)==='/01') { // solo mes enero
          objSerieBruto.data.push(row.bruto)
          if (row.etiquetavalor.substring(0,4)<='2018') {
            objSerieApor.data.push(row.bruto)
            divacum = parseFloat(row.bruto)
          } else {
            if (row.etiquetavalor.substring(4,7)==='/01') objSerieApor.data.push(divacum)
            else objSerieApor.data.push(divacum + parseFloat(row.dividendos))
          }
          objSerieBenef.data.push(row.beneficio)
          objSerieDiv.data.push(row.dividendos)
        }
      })
    }
  },
  mounted () {
    this.getEvolucionPatrimonio(this.value) // carga datos  evoluc patrim
  }
}
</script>
