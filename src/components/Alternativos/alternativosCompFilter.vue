  <!-- componente que se llama desde accionesMain y que presenta el formulario de filtro y el boton de busqueda -->
  <template>
  <q-card style="width: 400px;" class="q-pr-xs q-gutter-xs">
    <q-card-section class="bg-primary text-white">
      <div class="text-h6">Filtrar por</div>
    </q-card-section>
    
    <q-form @submit="getRecords" class="q-gutter-y-xs">
      <q-select class="col"
      outlined
      clearable
      label="Tipo Activo"
      stack-label
      v-model="filterR.tipoActivo"
      :options="listaTiposActivo"
      option-value="codElemento"
      option-label="codElemento"
      multiple
      use-chips
      emit-value
      />
      <q-select
        outlined
        clearable
        label="Cod.empresa"
        stack-label
        v-model="filterR.codOtraEmpresa"
        :options="listaEmpresas"
        option-value="codElemento"
        option-label="valor1"
        multiple
        use-chips
        emit-value
        map-options
      />
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
        label="Estado Activo"
        stack-label
        outlined
        clearable
        v-model="filterR.estadoActivo"
        multiple
        :options="listaEstadosActivo"
        option-value="codElemento"
        option-label="valor1"
        emit-value
        map-options
        use-chips
      />
      <q-select
      outlined
      clearable
      label="Tipo Producto"
      stack-label
      v-model="filterR.tipoProducto"
      :options="listaTiposProducto"
      option-value="codElemento"
      option-label="codElemento"
      emit-value
        multiple
        use-chips
      />
      <!--q-input outlined clearable label="Nombre" stack-label v-model="filterR.nombre" /-->
      <!-- en q-select multiple los valores estan en un array, como en nuestro caso estan en un string separados por comas
          hay que crear un array con los valores en el columns format (split) y aqui volver a convertir el array a string (join) -->
      <q-select
        label="Computa"
        stack-label
        outlined
        clearable
        v-model="filterR.computa"
        :options="listaSINO"
        option-value="id"
        option-label="desc"
        emit-value
        map-options
      />
      <q-select
        label="Track Record / Cartera Actual"
        stack-label
        outlined
        v-model="filterR.trackRecord"
        :options="listaTrackRecord"
        @update:model-value="cargarDatos"
      />
      <q-input outlined clearable label="Launch Desde" stack-label v-model="filterR.launch" />
      <!--<q-input outlined clearable label="Launch Hasta" stack-label v-model="filterR.launchHasta" />-->
      <q-input outlined clearable label="Avg Gross Mult Desde" stack-label v-model="filterR.avgGrossMult" />
      <q-input outlined clearable label="Avg Gross IRR Desde" stack-label v-model="filterR.avgGrossIrr" />
      <q-input outlined clearable label="Avg Net Mult Desde" stack-label v-model="filterR.avgNetMult" />
      <q-input outlined clearable label="Avg Net IRR Desde" stack-label v-model="filterR.avgNetIrr" />
      <q-input outlined clearable label="Avg Cash Yeld Desde" stack-label v-model="filterR.avgCashYeld" />
      <q-card-actions align="right">
        <q-btn  flat type="submit" label="Buscar" color="primary" @click="getRecords"/>
        <q-btn  flat label="Cancel" color="primary" @click="$emit('hide')"/><!-- lo captura accionesMain -->
      </q-card-actions>
  </q-form>
  </q-card>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { date } from 'quasar'
export default {
  props: ['value'], // value es el objeto con los campos de filtro que le pasa accionesMain con v-model
  data () {
    return {
      filterR: {
        trackRecord: 'Track Record' //por defecto - inicializamos a track record
        //launchHasta: ''
      },
      listaEntidadesActivosFilter: [],
      listaActivosFilter: [],
      listaTrackRecord: ['Track Record', 'Cartera Actual']
      
    }
  },
  computed: {
    ...mapState('tablasAux', ['listaEmpresas','listaSINO', 'listaUsers', 'listaTipoAcc', 'listaTiposActivo', 'listaMeses', 'listaTiposProducto', 'listaEstadosActivo', 'listaTipoOperacion']),
    ...mapState('entidades', ['listaEntidadesActivos']),
    ...mapState('activos', ['listaActivos']),
    ...mapState('login', ['user']) // importo state.user desde store-login
  },
  methods: {
    ...mapActions('entidades', ['loadEntidadesActivos']),
    ...mapActions('activos', ['loadActivos']),
    filterActivos (val, update, abort) {
      update(() => {
        const needle = val.toLowerCase()
        this.listaActivosFilter = this.listaActivos.filter(v => v.nombre.toLowerCase().indexOf(needle) > -1)
      })
    },
    filterEntidadesActivos (val, update, abort) {
      update(() => {
        const needle = val.toLowerCase()
        this.listaEntidadesActivosFilter = this.listaEntidadesActivos.filter(v => v.nombre.toLowerCase().indexOf(needle) > -1)
      })
    },
    cargarDatos(){
      //console.log('Valor de filterR.trackRecord', this.filterR.trackRecord)
    },
    getRecords () {
      this.$emit('getRecords', this.filterR) // lo captura accionesMain
    },
    formatDate (pdate) {
      return date.formatDate(pdate, 'DD-MM-YYYY')
    }
  },
  mounted () {
    this.filterR = Object.assign({}, this.value) // asignamos valor del parametro por si viene de otro tab
    //this.filterR.launchHasta = (new Date()).getFullYear()
    this.loadEntidadesActivos()
    if (this.listaActivos.length <= 0) this.loadActivos(this.user.codEmpresa) // carga store listaActivos
  },
  unmounted () {
    // guardamos valor en tabs por si despus queremos recuperarlo
    this.$emit('input', this.filterR)
  }
}
</script>
