<template>
  <apexchart height="500px" type="donut" :options="chartOptionsdonut" :series="seriesdonut" :key="refresh"></apexchart>
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
        grid: {
          padding: {
            top: -10,    // Un valor negativo puede ayudar a subir el gráfico si hay mucho espacio arriba
            bottom: 0,
            left: 10,
            right: 10
          }
        },

        labels: [],
        legend: {
          show: true,
          position: 'bottom',
          // Reducimos la fuente aquí
          fontSize: '10px', 
          fontFamily: 'Helvetica, Arial',
          fontWeight: 400,
          // Esto ayuda a que no empuje tanto al gráfico hacia arriba
          offsetY: 0, 
          itemMargin: {
            horizontal: 5,      // Menos espacio horizontal entre gestores
            vertical: 2         // Menos espacio vertical entre líneas
          },
          formatter: function (seriesName, opts) {
            const percent = opts.w.globals.seriesPercent[opts.seriesIndex]
            return seriesName + ' (' + numeralInstance(parseFloat(percent) / 100).format('0.00%') + ')'
          }
        },
       /* theme: {
          palette: 'palette3'
        },*/
        plotOptions: {
          pie: {
            donut: {
              size: '50%',
              labels: {
                show: true,
                value: {
                  show: true,
                  fontSize: '14px',
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
              offsetX: 20,
              minAngleToShowLabel: 15
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
            return  numeralInstance(parseFloat(val)).format('0.00') + '%'
          },
          style: {
            fontSize: '12px',
            fontFamily: 'Helvetica, Arial, sans-serif',
            fontWeight: 'bold',
            colors: ['#fff']
          }
        }
      },
      seriesdonut: []
    }
  },
  methods: {
    generateColors (n) {
      const baseColors = [
      { h: 210, s: 45, l: 50 }, // 1. Azul Principal
      { h: 155, s: 35, l: 28 }, // 2. Verde Bosque Profundo (Sustituto del Ocre - Muy serio y oscuro)
      { h: 45,  s: 50, l: 50 }, // 6. Naranja corporativo
      { h: 10,  s: 45, l: 50 }, // 11. Rojo suave
      { h: 130, s: 40, l: 45 }, // 4. Verde Esmeralda
      { h: 210, s: 10, l: 35 }, // 5. Gris Carbón    
      { h: 190, s: 45, l: 45 }, // 7. Petróleo / Cyan oscuro
      { h: 25,  s: 40, l: 45 }, // 8. Terracota / Teja
      { h: 255, s: 25, l: 60 }, // Violeta corporativo
      { h: 170, s: 40, l: 55 },// 9. Verde azulado / Malaquita
      { h: 0,   s: 0,  l: 75 }, // 10. Gris Platino
      { h: 200, s: 15, l: 55 }, // 12. Gris Azulado medio
      { h: 85,  s: 40, l: 48 },  // 13. Verde Oliva / Lima seco
      { h: 220, s: 35, l: 30 } // 12. Azul Noche (Sustituto del Gris Azulado - Profundo y elegante)
      ]

      const colors = []

      for (let i = 0; i < n; i++) {
        const base = baseColors[i % baseColors.length]

        // cada vuelta ajusta ligeramente la luminosidad
        const cycle = Math.floor(i / baseColors.length)
        const lightness = Math.max(40, base.l - cycle * 6)

        colors.push(`hsl(${base.h}, ${base.s}%, ${lightness}%)`)
      }


      return colors
    }
  },
  mounted () {
    // this.value // [{serie: "ALTERN.R FIJA", etiquetavalor: "03/2020", valor: "733464.0000"},...]
    if (this.value === undefined) return
    const labels = this.value.map(row => row.serie)
    const series = this.value.map(row => parseFloat(row.valor))
    const colors = this.generateColors(series.length)


    this.chartOptionsdonut = {
      ...this.chartOptionsdonut,
      labels,
      colors
    }
    this.seriesdonut = series //Array.from(this.value, row => parseFloat(row.valor))
    this.refresh++
  } 
}
</script>
