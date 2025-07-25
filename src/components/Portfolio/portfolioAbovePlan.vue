<template>
    <apexchart height="400px" width="400px" type="donut" :options="chartOptionsdonut" :series="series" :key="refresh"></apexchart>
  </template>
  <script>
  // doc in: https://github.com/apexcharts/vue-apexcharts , https://apexcharts.com/
  import { numeralInstance } from 'boot/numeral.js'
  export default {
    props: ['value'],
    data: function () {
      return {
        refresh: 0,
        registrosSeleccionados: [],
        series:[],
        chartOptionsdonut: {
          labels: ['Gross Multiple < 1', 'Gross Multiple = 1', '[1.01 <= Gross Mult <= 1.25]', '[1.26 <= Gross Mult <= 1.50]', '[1.51 <= Gross Mult <= 1.75]', '[1.76 <= Gross Mult <= 2.0]', '[2.01 <= Gross Mult <= 2.5]', '[2.51 <= Gross Mult <= 3.0]', 'Gross Multiple > 3.0'],
          legend: {
            show: true,
            position: 'top'
          },
          /*theme: {
            palette: 'palette3'
          },*/
          //colors: ["#FF5733", "#33FF57", "#3357FF", "#FF33A1", "#FF8C33", "#8C33FF"],
          colors: ['#d01313', '#eb653b', '#4870a4', '#2db3d4', '#39a900', '#007832'],

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
                      return numeralInstance(parseFloat(val)).format('0.00')
                    }
                    
                  },
                  total: {
                    show: true,
                    fontSize: '12px',
                    formatter: function (val) {
                      var tot = val.globals.seriesTotals.reduce((a, b) => {
                        return a + b
                      }, 0)
                      return numeralInstance(parseFloat(tot)).format('0.00')
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
                return val
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
              return numeralInstance(parseFloat(val)).format('0.00') + '%'
            },
            style: {
              fontSize: '10px',
              fontFamily: 'Helvetica, Arial, sans-serif',
              fontWeight: 'bold',
              colors: ['dark']
            }
          }
        }
      }
    },
    methods: {
        getRecords (filter) { //filter es lo que recojo de modelValue
        // hago la busqueda de registros segun condiciones del formulario Filter que ha lanzado el evento getRecords
        var objFilter = Object.assign({}, filter)
         //plan =='above' // plan =='below'
        
        // objFilter.estadoActivo = (objFilter.estadoActivo !== null ? objFilter.estadoActivo.join() : null) // paso de array a concatenacion de strings (join)
        return this.$axios.get('activos/bd_portfolio_companies.php/findPortfolioCompaniesFilter', { params: objFilter })
          .then(response => {
            this.registrosSeleccionados = response.data
            console.log('response', response.data)
           
            this.cargarGraph(this.registrosSeleccionados)
          })
          .catch(error => {
            this.$q.dialog({ title: 'Error', message: error })
          })
      },
      cargarGraph (obj) {
        // Inicializar contadores para cada rango
        var categories = [0, 0, 0, 0, 0, 0, 0, 0, 0];

        // Recorrer los datos y clasificar `grossmult`
        for (var i = 0; i < obj.length; i++) {
            var mult = obj[i].grossmult;
            /*if (mult < 1.0) categories[0]++;
            else if (mult >= 1.0 && mult <= 1.25) categories[1]++;
            else if (mult >= 1.26 && mult <= 1.50) categories[2]++;
            else if (mult >= 1.51 && mult <= 1.75) categories[3]++;
            else if (mult >= 1.76 && mult <= 2.0) categories[4]++;
            else categories[5]++;*/
            if (mult < 1.0) categories[0]++;
            else if (mult == 1.0) categories[1]++;
            else if (mult > 1.0 && mult <= 1.25) categories[2]++;
            else if (mult > 1.25 && mult <= 1.50) categories[3]++;
            else if (mult > 1.50 && mult <= 1.75) categories[4]++;
            else if (mult > 1.75 && mult <= 2.0) categories[5]++;
            else if (mult > 2.0 && mult <= 2.5) categories[6]++;
            else if (mult > 2.5 && mult <= 3.0) categories[7]++;
            else categories[8]++;
        }

        // Asignar los datos procesados a `series`
        this.series = categories;
        this.refresh++
      }
    },
    mounted () {
      console.log('value al entrar en graph', this.value)
      this.cargarGraph(this.value)
      //this.getRecords()
      
      this.refresh++
    } 
  }
  </script>
  