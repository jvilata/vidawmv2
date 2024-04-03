<template>
  <apexchart height="300px" type="donut" :options="chartOptionsdonut" :series="seriesdonut" :key="refresh"></apexchart>
</template>
<script>
// doc in: https://github.com/apexcharts/vue-apexcharts , https://apexcharts.com/
import { numeralInstance } from 'boot/numeral.js'
export default {
  props: ['value'],
  data: function () {
    return {
      refresh: 0,
      chartOptionsdonut: {
        labels: [],
        legend: {
          show: false,
          position: 'top'
        },
        theme: {
          palette: 'palette3'
        },
        plotOptions: {
          pie: {
            donut: {
              size: '40%',
              labels: {
                show: true,
                value: {
                  show: true,
                  fontSize: '12px',
                  formatter: function (val) {
                    return numeralInstance(parseFloat(val)).format('0,0')
                  }
                },
                total: {
                  show: true,
                  fontSize: '12px',
                  formatter: function (val) {
                    var tot = val.globals.seriesTotals.reduce((a, b) => {
                      return a + b
                    }, 0)
                    return numeralInstance(parseFloat(tot)).format('0,0')
                  }
                }
              }
            },
            dataLabels: {
              offset: 20,
              minAngleToShowLabel: 11
            }
          }
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return numeralInstance(parseFloat(val)).format('0,0')
            }
          }
        },
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 400,
          animateGradually: {
            enabled: true,
            delay: 350
          },
          dynamicAnimation: {
            enabled: true,
            speed: 550
          }
        },
        dataLabels: {
          dropShadow: {
            enabled: false
          },
          formatter: function (val, opt) {
            return opt.w.globals.labels[opt.seriesIndex] + ':  ' + numeralInstance(parseFloat(val)).format('0.00') + '%'
          },
          style: {
            fontSize: '8px',
            fontFamily: 'Helvetica, Arial, sans-serif',
            fontWeight: 'bold',
            colors: ['dark']
          }
        }
      },
      seriesdonut: []
    }
  },
  methods: {
  },
  mounted () {
    // this.value // [{serie: "ALTERN.R FIJA", etiquetavalor: "03/2020", valor: "733464.0000"},...]
    if (this.value === undefined) return
    this.chartOptionsdonut = {
      ...this.chartOptionsdonut,
      labels: Array.from(this.value, row => row.serie)
    }
    this.seriesdonut = Array.from(this.value, row => parseFloat(row.valor))
    this.refresh++
  } 
}
</script>
