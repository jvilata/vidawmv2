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
                <portfolioAbovePlan :value="registrosSeleccionados" :key="refreshRec"/>
              </q-item-section>
            </q-item>
          </div>
          
        </div>
  </template>
  
  <script>
  import { mapState, mapActions } from 'vuex'
  import portfolioAbovePlan from 'components/Portfolio/portfolioAbovePlan.vue'
  export default {
    props: ['value'], // en 'value' tenemos la tabla de datos del filtro (se lanza desde estrategiasMain, en v-model="filterRecord")
    data () {
      return {
        registrosSeleccionados: []
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
          
          })
          .catch(error => {
            this.$q.dialog({ title: 'Error', message: error })
          })
      }
      
      
    },
    mounted () {

      if (Object.keys(this.value).length > 0) this.getRecords(this.value)
      this.loadGeografias(this.user.codEmpresa)
      this.loadSectores(this.user.codEmpresa)
      
    },
    components: {
        //wgDate: wgDate
        portfolioAbovePlan: portfolioAbovePlan
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
  