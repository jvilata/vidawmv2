  <!-- componente que se llama desde estrategiasMain y que presenta el formulario de filtro y el boton de busqueda -->
  <template>
    <q-card style="width: 400px;" class="q-pr-xs q-gutter-xs">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">Filtrar por</div>
      </q-card-section>
  
      <q-form @submit="getRecords" class="q-gutter-y-xs">
        <q-input outlined clearable label="Id" stack-label v-model="filterR.id" />
        <q-input outlined clearable label="Nombre" stack-label v-model="filterR.nombre" />
        <q-select
          outlined
          clearable
          label="Gestor/Arrend"
          stack-label
          v-model="filterR.idEntidad"
          :options="listaEntidadesActivosFilter"
          option-value="id"
          option-label="nombre"
          emit-value
          map-options
          @filter="filterEntidadesActivos"
          use-input
          hide-selected
          fill-input
          input-debounce="0"
      />
        <q-select
          outlined
          clearable
          label="Tipo Activo"
          stack-label
          v-model="filterR.tipoActivo"
          :options="listaTiposActivo"
          option-value="codElemento"
          option-label="codElemento"
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
        listaEntidadesFilter: [],
        listaEntidadesActivosFilter: []
      }
    },
    computed: {
      ...mapState('tablasAux', ['listaSINO', 'listaUsers', 'listaTipoAcc', 'listaTiposActivo', 'listaMeses', 'listaTiposProducto', 'listaEstadosActivo', 'listaTipoOperacion']),
      ...mapState('entidades', ['listaEntidadesActivos'])
    },
    methods: {
      ...mapActions('entidades', ['loadEntidadesActivos']),
      filterEntidadesActivos (val, update, abort) {
      update(() => {
        const needle = val.toLowerCase()
        this.listaEntidadesActivosFilter = this.listaEntidadesActivos.filter(v => v.nombre.toLowerCase().indexOf(needle) > -1)
      })
    },
      getRecords () {
        this.$emit('getRecords', this.filterR) // lo captura estrategiasMain
      },
      formatDate (pdate) {
        return date.formatDate(pdate, 'DD-MM-YYYY')
      }
    },
    mounted () {
      this.filterR = Object.assign({}, this.modelValue) // asignamos valor del parametro por si viene de otro tab
      this.loadEntidadesActivos()
    }
  }
  </script>
  