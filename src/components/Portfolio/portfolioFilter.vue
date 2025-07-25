  <!-- componente que se llama desde portfolioMain y que presenta el formulario de filtro y el boton de busqueda -->
  <template>
    <q-card style="width: 400px;" class="q-pr-xs q-gutter-xs">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">Filtrar por</div>
      </q-card-section>
  
      <q-form @submit="getRecords" class="q-gutter-y-xs">
        <q-input outlined clearable label="Id" stack-label v-model="filterR.id" />
        <q-input outlined clearable label="Portfolio Company Name" stack-label v-model="filterR.nombre" />
        <q-select
          outlined
          clearable
          label="Estrategia"
          stack-label
          v-model="filterR.idEstrategia"
          :options="listaEstrategiasFilter"
          option-value="id"
          option-label="nombre"
          emit-value
          map-options
          @filter="filterEstrategias"
          use-input
          hide-selected
          fill-input
          input-debounce="0"
      />
      <q-input outlined clearable label="Fund Name" stack-label v-model="filterR.fundName" />
      <q-select
        outlined
        clearable
        label="Geografía"
        stack-label
        v-model="filterR.geografia"
        :options="listaGeografias"
        option-value="codElemento"
        option-label="codElemento"
        use-input
        multiple
        use-chips
        emit-value
      />
      <q-select
        outlined
        clearable
        label="Sector"
        stack-label
        v-model="filterR.sector"
        :options="listaSectores"
        option-value="codElemento"
        option-label="codElemento"
        use-input
        multiple
        use-chips
        emit-value
      />
      <q-select
        outlined
        clearable
        label="Below / Above Plan"
        stack-label
        v-model="filterR.plan"
        :options="listaPlan"
        option-value="value"
        option-label="label"   
        use-input
        emit-value
        map-options
     />
     <q-select
        outlined
        clearable
        label="Gross Mult."
        stack-label
        v-model="filterR.grossComp"
        :options="listaGrossComp"
        option-value="value"
        option-label="label"   
        use-input
        emit-value
        map-options
     />

        <q-card-actions align="right">
          <q-btn  flat type="submit" label="Buscar" color="primary"/>
          <q-btn  flat label="Cancel" color="primary" @click="$emit('hide')"/><!-- lo captura accionesMain -->
        </q-card-actions>
    </q-form>
    </q-card>
  </template>
  
  <script>
  import { mapState, mapActions } from 'vuex'
  import { date } from 'quasar'
  export default {
    props: ['modelValue'], // value es el objeto con los campos de filtro que le pasa estrategiasMain con v-model
    data () {
      return {
        filterR: {},
        
        listaPlan: [
          {
            label: 'Above Plan',
            value: 'above'
          },
          {
            label: 'Below Plan',
            value: 'below'
          }
          ],
          listaGrossComp: [

          /**
           if (mult < 1.0) categories[0]++;
            else if (mult == 1.0) categories[1]++;
            else if (mult > 1.0 && mult <= 1.25) categories[2]++;
            else if (mult > 1.25 && mult <= 1.50) categories[3]++;
            else if (mult > 1.50 && mult <= 1.75) categories[4]++;
            else if (mult > 1.75 && mult <= 2.0) categories[5]++;
            else if (mult > 2.0 && mult <= 2.5) categories[6]++;
            else if (mult > 2.5 && mult <= 3.0) categories[7]++;
            else categories[8]++;
           */
          {
            label: 'Gross mult. < 1.0x',
            value: '0'
          },
          {
            label: 'Gross mult. = 1.0x',
            value: '1'
          },
          {
            label: 'Gross mult. [1.01x - 1.25x]',
            value: '1.2'
          },
          {
            label: 'Gross mult. [1.26x - 1.5x]',
            value: '1.5'
          },
          {
            label: 'Gross mult. [1.51x - 1.75x]',
            value: '1.7'
          },
          {
            label: 'Gross mult. [1.76x - 2.0x]',
            value: '2'
          },
          {
            label: 'Gross mult. [2.01x - 2.5x]',
            value: '2.5'
          },
          {
            label: 'Gross mult. [2.51x - 3.0x]',
            value: '3'
          },
          {
            label: 'Gross mult. > 3.0x',
            value: '3.5'
          }
          ],
        listaEstrategiasFilter: []
      }
    },
    computed: {
      ...mapState('tablasAux', ['listaGeografias', 'listaSectores', 'listaSINO', 'listaUsers', 'listaTipoAcc', 'listaTiposActivo', 'listaMeses', 'listaTiposProducto', 'listaEstadosActivo', 'listaTipoOperacion']),
      ...mapState('activos', ['listaEstrategias']),
      ...mapState('login', ['user'])
    },
    methods: {
      ...mapActions('activos', ['loadEstrategias']),
      ...mapActions('tablasAux', ['loadGeografias', 'loadSectores']),
      filterEstrategias (val, update, abort) {
        update(() => {
          const needle = val.toLowerCase()
          this.listaEstrategiasFilter = this.listaEstrategias.filter(v => v.nombre.toLowerCase().indexOf(needle) > -1)
        })
      },
      getRecords () {
        this.$emit('getRecords', this.filterR) // lo captura portfolioMain
      },
      formatDate (pdate) {
        return date.formatDate(pdate, 'DD-MM-YYYY')
      }
    },
    mounted () {
      this.filterR = Object.assign({}, this.modelValue) // asignamos valor del parametro por si viene de otro tab
      this.loadEstrategias(this.user.codEmpresa)
      this.loadGeografias(this.user.codEmpresa)
      this.loadSectores(this.user.codEmpresa)
    }
  }
  </script>
  