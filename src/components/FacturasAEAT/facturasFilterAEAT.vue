  <!-- componente que se llama desde accionesMain y que presenta el formulario de filtro y el boton de busqueda -->
  <template>
  <q-card style="width: 400px;" class="q-pr-xs q-gutter-xs">
    <q-card-section class="bg-primary text-white">
      <div class="text-h6">Filtrar por</div>
    </q-card-section>

    <q-form @submit="getRecords" class="q-gutter-y-xs">
      <q-input outlined clearable label="Nro Factura" stack-label v-model="filterR.nroFactura" />
      <q-select
        outlined
        clearable
        label="Cliente/Prov."
        stack-label
        v-model="filterR.idCliente"
        :options="listaEntidadesFilter"
        option-value="id"
        option-label="nombre"
        emit-value
        map-options
        @filter="filterEntidades"
        use-input
        hide-selected
        fill-input
        input-debounce="0"
      />
      <q-input outlined clearable label="Fecha Desde" stack-label v-model="filterR.fechainicial" type="date" />
      <q-input outlined clearable label="Fecha Hasta" stack-label v-model="filterR.fechafinal" type="date" />
     <q-select
        outlined
        clearable
        label="Activo"
        stack-label
        v-model="filterR.idActivo"
        :options="listaActivosFilter"
        option-value="id"
        option-label="nombre"
        emit-value
        map-options
        @filter="filterActivos"
        use-input
        hide-selected
        fill-input
        input-debounce="0"
      />
      <q-input outlined label="Tipo Factura: EMITIDA" readonly/>
      <q-input outlined label="Estado Factura: ENVIADA AEAT" readonly/>
      <q-card-actions align="right">
        <q-btn  flat type="submit" label="Buscar" color="primary"/>
        <q-btn  flat label="Cancel" color="primary" @click="$emit('hide')"/><!-- lo captura accionesMain -->
      </q-card-actions>
  </q-form>
  </q-card>
</template>

<script>
import { mapState } from 'vuex'
import { date } from 'quasar'
//import wgDate from 'components/General/wgDate.vue'
export default {
  props: ['modelValue'], // value es el objeto con los campos de filtro que le pasa accionesMain con v-model
  data () {
    return {
      filterR: {
        tipoFactura: "EMITIDA",
        estadoFactura: "ENVIADA AEAT"
      },
      listaEntidadesFilter: [],
      listaActivosFilter: []
    }
  },
  computed: {
    ...mapState('tablasAux', ['listaSINO', 'listaUsers', 'listaMeses', 'listaEstadosFactura', 'listaTiposFactura']),
    ...mapState('entidades', ['listaEntidades']),
    ...mapState('activos', ['listaActivos'])
  },
  methods: {
    filterEntidades (val, update, abort) {
      update(() => {
        const needle = val.toLowerCase()
        this.listaEntidadesFilter = this.listaEntidades.filter(v => v.nombre.toLowerCase().indexOf(needle) > -1)
      })
    },
    filterActivos (val, update, abort) {
      update(() => {
        const needle = val.toLowerCase()
        this.listaActivosFilter = this.listaActivos.filter(v => v.nombre.toLowerCase().indexOf(needle) > -1)
      })
    },
    getRecords () {
      this.$emit('getRecords', this.filterR) // lo captura accionesMain
    },
    formatDate (pdate) {
      return date.formatDate(pdate, 'DD-MM-YYYY')
    }
  },
  /*components: {
    wgDate: wgDate
  },*/
  mounted () {
    this.filterR = Object.assign({}, this.modelValue) // asignamos valor del parametro por si viene de otro tab
  }
}
</script>
