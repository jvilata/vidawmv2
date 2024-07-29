<template>
  <div class="row">
    <div class="col" >
      <q-item class="q-ma-md q-pa-xs  text-grey-8">
        <q-item-section  class="col-sm-2" align="center">
          <q-select 
            outlined
            label="KPI"
            stack-label
            v-model="filterR.kpi"
            :options="listaKpi"
            @update:model-value="cargarDatosGraficos"
          />
        </q-item-section>
      </q-item>
      <q-item >
        <q-item-section align="center">
          <apexchart ref="evol1" height= "400px" width="1000px" type="scatter" :options="chartOptions" :series="series" :key="refresh"></apexchart>
        </q-item-section>
      </q-item>
    </div>
  </div>
</template>
<script>
// doc in: https://github.com/apexcharts/vue-apexcharts , https://apexcharts.com/
import { numeralInstance } from 'boot/numeral.js'
import { date } from 'quasar'
export default {
  props: ['value'],
  data: function () {
    return { 
      filterR: { kpi: 'Net Mult.' },
      listaKpi: ['Net Mult.', 'Net IRR', 'DPI'],
      copiaSeleccionados: [],
      refresh: 0,
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
            if (val == 0) { return '' }
            else return val + 'x'
          },
          style: {
            fontSize: '12px',
            fontFamily: 'Helvetica, Arial, sans-serif',
            fontWeight: 'normal'
            // colors: ['dark']
          }
        },
        tooltip: {

          y: {
            formatter: function (valY) {
              if (valY == 0) { return 'No aplica' }
              return valY + 'x'
            }
          }
        },
        yaxis: {
          title: {
            text: 'KPI',
            style: {
                fontSize: '15px',
                fontFamily: 'Helvetica, Arial, sans-serif',
                fontWeight: 'normal'
              }
          }
        },
        xaxis: {
            title: {
              text: 'Holding Period',
              style: {
                fontSize: '15px',
                fontFamily: 'Helvetica, Arial, sans-serif',
                fontWeight: 'normal'
              }
            }
        },
        series: [] // { name:'nom serie', type: 'line', data: [] }
      }
    }
  },
  methods: {
    cargarDatosGraficos () {
      
      this.series = []
      
      //Recorro datos, para ir extrayendo holding period
      var yearActual = date.formatDate(new Date(), 'YYYY')
      var holdingPeriodTmp = ''
      var etiqAnt = ''
      var arr = []

      this.copiaSeleccionados.forEach(row => {
        if (row.launch !== '') {
          holdingPeriodTmp = yearActual - row.cartLaunch
          row.holdingPeriod = holdingPeriodTmp
        } else row.holdingPeriod = yearActual
        
      })

      this.copiaSeleccionados.sort(function (a, b) { // ordeno el array por etiquetavalor
        return (a.holdingPeriod < b.holdingPeriod ? -1 : 1)
      })


      this.copiaSeleccionados.forEach(row => { 
        if (row.holdingPeriod !== etiqAnt) { 
            arr.push(row.holdingPeriod) // aL cambiar de etiqueta guardo la anterior
        }
          etiqAnt = row.holdingPeriod
      })

      
      this.chartOptions = {
        ...this.chartOptions,
        labels: arr // es un array de HOLDING PERIODS 
      }
      
      var pos = -1
      var rowAnt = {}
      this.copiaSeleccionados.forEach(row => {
        console.log('row', row)
        // meto data (eje Y)
        var objSerieX = {
          name: row.nombre,
          type: 'scatter',
          data: []
        }
        if (rowAnt.holdingPeriod !== row.holdingPeriod) pos++

        for (var i = 0; i < pos; i++) {
          objSerieX.data.push(0)
        }
        
        
        if (this.filterR.kpi === 'Net Mult.') {
          //objSerieX.data = [row.cartNetmult]
          objSerieX.data.push(row.cartNetmult)
        }
        else if (this.filterR.kpi === 'Net IRR') {
         // objSerieX.data = [row.cartNetirr]
          objSerieX.data.push(row.cartNetirr)
        }
        else if (this.filterR.kpi === 'DPI') {
          //objSerieX.data = [row.cartDpi]
          objSerieX.data.push(row.cartDpi)
        }
        this.series.push(objSerieX) 
        rowAnt = row
      })



           
      console.log('series', this.series)
      
      console.log('array de labels', arr)
      
      this.refresh++
    }
  },
  mounted () {
    if (this.value === undefined) return
    this.copiaSeleccionados = [...this.value]
   this.cargarDatosGraficos()

  }
}
</script>
