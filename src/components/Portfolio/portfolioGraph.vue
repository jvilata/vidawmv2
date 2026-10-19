<template>
    <div class="row">
          <div class="col" >
            <q-item class="q-ma-md q-pa-xs bg-indigo-1 text-grey-8">
              <q-item-section align="center">
                <div class="text-h6">Total Value Multiple</div>
              </q-item-section>
            </q-item>
            <q-item >
              <q-item-section align="center">
               <!-- <portfolioAbovePlan :value="registrosSeleccionados" :key="refreshRec"/>-->
                <apexchart height="400px" width="400px" type="donut" :options="chartOptionsMultiple" :series="series" :key="refresh"></apexchart>
              </q-item-section>
            </q-item>
          </div>
          <div class="col" >
            <q-item class="q-ma-md q-pa-xs bg-indigo-1 text-grey-8">
              <q-item-section align="center">
                <div class="text-h6">Diversificación por Geografías</div>
              </q-item-section>
            </q-item>
            <q-item >
              <q-item-section align="center">
               <!-- <portfolioAbovePlan :value="registrosSeleccionados" :key="refreshRec"/>-->
                <apexchart height="400px" width="400px" type="donut" :options="chartOptionsMultiple2" :series="series2" :key="refresh"></apexchart>
              </q-item-section>
            </q-item>
          </div>
        </div>
        <div class="row">
          <div class="col" >
            <q-item class="q-ma-md q-pa-xs bg-indigo-1 text-grey-8">
              <q-item-section align="center">
                <div class="text-h6">Diversificación por Sectores</div>
              </q-item-section>
            </q-item>
            <q-item >
              <q-item-section align="center">
               <!-- <portfolioAbovePlan :value="registrosSeleccionados" :key="refreshRec"/>-->
                <apexchart height="400px" width="400px" type="donut" :options="chartOptionsMultiple3" :series="series3" :key="refresh"></apexchart>
              </q-item-section>
            </q-item>
          </div>
          <div class="col" >
            <q-item class="q-ma-md q-pa-xs bg-indigo-1 text-grey-8">
              <q-item-section align="center">
                <div class="text-h6">Diversificación por Sub-Sectores</div>
              </q-item-section>
            </q-item>
            <q-item >
              <q-item-section align="center">
               <!-- <portfolioAbovePlan :value="registrosSeleccionados" :key="refreshRec"/>-->
                <apexchart height="400px" width="400px" type="donut" :options="chartOptionsMultiple4" :series="series4" :key="refresh"></apexchart>
              </q-item-section>
            </q-item>
          </div>
        </div>
  </template>
  
  <script>
  import { numeralInstance } from 'boot/numeral.js'

  import { mapState, mapActions } from 'vuex'
  const COLORS = [
  '#4682B4', '#2E473B', '#BF8640', '#B95046',
  '#45A152', '#505B63', '#4097A6', '#A15E45',
  '#9480B3', '#73A9A2', '#BFBFBF', '#7A909E',
  '#A2B354', '#324667'
]

const BASE_DONUT_OPTIONS = {
  legend: {
    show: true,
    position: 'bottom',
    fontSize: '11px'
  },
  colors: COLORS,
  plotOptions: {
    pie: {
      donut: {
        size: '50%',
        labels: {
          show: true,
          value: {
            fontSize: '12px',
            formatter: val => numeralInstance(val).format('0.00')
          },
          total: {
            show: true,
            fontSize: '12px',
            formatter: w =>
              numeralInstance(
                w.globals.seriesTotals.reduce((a, b) => a + b, 0)
              ).format('0.00')
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
    y: { formatter: val => val }
  },
  animations: {
    enabled: true,
    easing: 'easeinout',
    speed: 400,
    animateGradually: { enabled: true, delay: 350 },
    dynamicAnimation: { enabled: true, speed: 550 }
  },
  dataLabels: {
    dropShadow: { enabled: false },
    formatter: val => `${numeralInstance(val).format('0.00')}%`,
    style: {
      fontSize: '12px',
      fontWeight: 'bold',
      colors: ['#fff']
    }
  }
}
  
  export default {
    props: ['value'], // en 'value' tenemos la tabla de datos del filtro (se lanza desde estrategiasMain, en v-model="filterRecord")
    data () {
      return {
        registrosSeleccionados: [],
        series:[],
        series2:[],
        series3:[],
        series4:[],
        chartOptionsMultiple: {
          ...BASE_DONUT_OPTIONS,
          labels: [
            'Gross Multiple < 1', 
            'Gross Multiple = 1', 
            '[1.01 <= Gross Mult <= 1.25]', 
            '[1.26 <= Gross Mult <= 1.50]', 
            '[1.51 <= Gross Mult <= 1.75]', 
            '[1.76 <= Gross Mult <= 2.0]', 
            '[2.01 <= Gross Mult <= 2.5]', 
            '[2.51 <= Gross Mult <= 3.0]', 
            'Gross Multiple > 3.0'
          ]
        },
        chartOptionsMultiple2: {
          ...BASE_DONUT_OPTIONS,
          labels: [
            '1. AMERICA LATINA',
            '1. ASIA (SIN CHINA)',
            '1. CHINA',
            '1. ESPAÑA',
            '1. ESTADOS UNIDOS',
            '1. EUROPA (SIN ES)',
            '1. INDIA',
            '1. JAPON',
            '1. PAISES NORDICOS',
            '1. SUIZA',
            '1. UK',
            '1. AUSTRALIA',
            '1. OTROS'
          ]
        },
        chartOptionsMultiple3: {
          ...BASE_DONUT_OPTIONS,
           labels: [
            '5. COMMODITIES',
            '5. COMMUNICATION SERVICES',
            '5. CONSUMER DISCRETIONARY',
            '5. CONSUMER STAPLES',
            '5. DIGITAL & INFORMATION TECHNOLOGY',
            '5. ENERGY & UTILITIES',
            '5. FINANCIAL SERVICES',
            '5. HEALTH & SOCIAL',
            '5. INDUSTRIAL',
            '5. REAL ESTATE',
            '5. SERVICES',
            '5. TRANSPORT & LOGISTICS',
            '5. OTHER'
          ]
        },
        chartOptionsMultiple4: {
          ...BASE_DONUT_OPTIONS,
          labels: [
            '6. AIRPORTS',
            '6. PORTS',
            '6. TRAINS',
            '6. HIGHWAYS & ROADS',
            '6. TRANSPORTATION',
            '6. LOGISTICS',
            '6. ASSET LEASING',
            '6. CONTAINERS & PACKAGING',
            '6. DATA CENTERS',
            '6. FIBER (FTTH)',
            '6. TELECOM TOWERS',
            '6. SOFTWARE',
            '6. SERVICES',
            '6. ENERGY (GENERATION, MANAGEMENT)', 
            '6. MIDSTREAM (OIL, LNG)', 
            '6. RENEWABLE ENERGY',
            '6. UTILITIES',
            '6. WATER & WASTE'
          ]
        }
      }
    },
    computed: {
      ...mapState('tablasAux', ['listaSINO', 'listaTiposProducto', 'listaGeografias', 'listaSectores', 'listaMonedas', 'listaDivisasPortfolio']),
      ...mapState('login', ['user'])
    },
    methods: {
      ...mapActions('tabs', ['addTab']),
      ...mapActions('tablasAux', ['loadGeografias', 'loadSectores']),

      getRecords (filter) { //filter es lo que recojo de modelValue
        // hago la busqueda de registros segun condiciones del formulario Filter que ha lanzado el evento getRecords
        var objFilter = Object.assign({}, filter)
         //plan =='above' // plan =='below'
        
        // objFilter.estadoActivo = (objFilter.estadoActivo !== null ? objFilter.estadoActivo.join() : null) // paso de array a concatenacion de strings (join)
        return this.$axios.get('activos/bd_portfolio_companies.php/findPortfolioCompaniesFilter', { params: objFilter })
          .then(response => {
            this.registrosSeleccionados = response.data
            this.cargarGraph(this.registrosSeleccionados)
            this.cargarGraph2(this.registrosSeleccionados)
            this.cargarGraph3(this.registrosSeleccionados)
            this.cargarGraph4(this.registrosSeleccionados)

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
      },

      cargarGraph2 (obj) {
        // Inicializar contadores para cada rango
        var categories2 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        // Recorrer los datos y clasificar `grossmult`
        for (var i = 0; i < obj.length; i++) {
            var geog = obj[i].geografia;
           
            if (geog == "1. AMERICA LATINA") categories2[0]++;
            else if (geog == "1. ASIA (SIN CHINA)") categories2[1]++;
            else if (geog == "1. CHINA") categories2[2]++;
            else if (geog == "1. ESPAÑA") categories2[3]++;
            else if (geog == "1. ESTADOS UNIDOS") categories2[4]++;
            else if (geog == "1. EUROPA (SIN ES)") categories2[5]++;
            else if (geog == "1. INDIA") categories2[6]++;
            else if (geog == "1. JAPON") categories2[7]++;
            else if (geog == "1. PAISES NORDICOS") categories2[8]++;
            else if (geog == "1. SUIZA") categories2[9]++;
            else if (geog == "1. UK") categories2[10]++;
            else if (geog == "1. AUSTRALIA") categories2[11]++;
            else categories2[12]++;
        }
        // Asignar los datos procesados a `series`
        this.series2 = categories2;
        this.refresh++
    },
      cargarGraph3 (obj) {
        // Inicializar contadores para cada rango
        var categories2 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

          for (var i = 0; i < obj.length; i++) {
            var sector = obj[i].sector

            if (sector === '5. COMMODITIES') categories2[0]++
            else if (sector === '5. COMMUNICATION SERVICES') categories2[1]++
            else if (sector === '5. CONSUMER DISCRETIONARY') categories2[2]++
            else if (sector === '5. CONSUMER STAPLES') categories2[3]++
            else if (sector === '5. DIGITAL & INFORMATION TECHNOLOGY') categories2[4]++
            else if (sector === '5. ENERGY & UTILITIES') categories2[5]++
            else if (sector === '5. FINANCIAL SERVICES') categories2[6]++
            else if (sector === '5. HEALTH & SOCIAL') categories2[7]++
            else if (sector === '5. INDUSTRIAL') categories2[8]++
            else if (sector === '5. REAL ESTATE') categories2[9]++
            else if (sector === '5. SERVICES') categories2[10]++
            else if (sector === '5. TRANSPORT & LOGISTICS') categories2[11]++
            else categories2[12]++ // 5. OTHER
          }

        // Asignar los datos procesados a `series`
        this.series3 = categories2;
        this.refresh++
    },
      cargarGraph4 (obj) {
        // Inicializar contadores para cada rango
        var categories2 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

       // Recorrer los datos y clasificar por subsector
        for (var i = 0; i < obj.length; i++) {
          var subsector = obj[i].subsector

          if (subsector === '6. AIRPORTS') categories2[0]++
          else if (subsector === '6. PORTS') categories2[1]++
          else if (subsector === '6. TRAINS') categories2[2]++
          else if (subsector === '6. HIGHWAYS & ROADS') categories2[3]++
          else if (subsector === '6. TRANSPORTATION') categories2[4]++
          else if (subsector === '6. LOGISTICS') categories2[5]++
          else if (subsector === '6. ASSET LEASING') categories2[6]++
          else if (subsector === '6. CONTAINERS & PACKAGING') categories2[7]++
          else if (subsector === '6. DATA CENTERS') categories2[8]++
          else if (subsector === '6. FIBER (FTTH)') categories2[9]++
          else if (subsector === '6. TELECOM TOWERS') categories2[10]++
          else if (subsector === '6. SOFTWARE') categories2[11]++
          else if (subsector === '6. SERVICES') categories2[12]++
          else if (subsector === '6. ENERGY (GENERATION, MANAGEMENT)') categories2[13]++
          else if (subsector === '6. MIDSTREAM (OIL, LNG)') categories2[14]++
          else if (subsector === '6. RENEWABLE ENERGY') categories2[15]++
          else if (subsector === '6. UTILITIES') categories2[16]++
          else if (subsector === '6. WATER & WASTE') categories2[17]++
        }

        // Asignar los datos procesados a `series`
        this.series4 = categories2;
        this.refresh++
    }
    
     
    },
    mounted () {

      if (Object.keys(this.value).length > 0) this.getRecords(this.value)
      this.loadGeografias(this.user.codEmpresa)
      this.loadSectores(this.user.codEmpresa)
      //console.log(this.user)
      
    }
  }
    
  </script>

<style lang="sass">
.facturas1FormLineas-header-table
  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th
    /* bg color is important for th; just specify one */
    background-color: $indigo-1
  thead tr:nth-child(2) th
    /* bg color is important for th; just specify one */
    background-color: $indigo-1

  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0
  thead tr:nth-child(2) th
    top: 0

  td:first-child
    background-color: $orange-1
  td:nth-child(2)
    background-color: $orange-1
  th:first-child
    position: sticky
    left: 0
    z-index: 2
  th:nth-child(2)
    position: sticky
    left: 77px
    z-index: 2
  td:first-child
    position: sticky
    left: 0
    z-index: 1
  td:nth-child(2)
    position: sticky
    left: 77px
    z-index: 1

  /* this is when the loading indicator appears */
  &.q-table--loading thead tr:last-child th
    /* height of all previous header rows */
    top: 48px
  </style>
  