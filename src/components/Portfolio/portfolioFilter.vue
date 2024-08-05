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
  