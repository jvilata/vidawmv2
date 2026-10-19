  <!-- componente que se llama desde accionesMain y que presenta el formulario de filtro y el boton de busqueda -->
  <template>
  <q-card style="max-width: 800px;" class="q-pr-xs q-gutter-xs">
    <q-form @submit="saveForm" @keyup.esc="$emit('close')">
      <q-card-section class="row bg-primary text-white">
        <div class="text-h6">{{title}}</div>
        <q-space />
        <q-btn
            @click="$emit('close')"
            flat
            round
            dense
            icon="close"/>
      </q-card-section>
      <q-card-section>
        <div class="row">
          <q-select
            class="col-xs-12 col-sm-12"
            outlined
            clearable
            label="Activo"
            stack-label
            v-model="recordToSubmit.idActivo"
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
          <q-input class="col-xs-12 col-sm-12" outlined v-model="recordToSubmit.descripcion" label="Descripción"
                  type="textarea"
                  counter
                  @keyup.enter.stop />
        </div>
        <div class="row">
          <q-input class="col-xs-6 col-sm-3" outlined label="Unidades" stack-label v-model="recordToSubmit.unidades" @update:model-value="calcularDatosLinea" />
          <q-input class="col-xs-6 col-sm-3" outlined label="Precio" stack-label v-model="recordToSubmit.precio" @update:model-value="calcularDatosLinea"/>
          <q-input class="col-xs-6 col-sm-3" outlined label="%Dto" stack-label v-model="recordToSubmit.pdescuento" @update:model-value="calcularDatosLinea" />
          <q-input class="col-xs-6 col-sm-3" outlined label="Descuento" stack-label v-model="recordToSubmit.descuento" readonly  />
        </div>
        <div class="row">
          <q-input class="col-xs-6 col-sm-3" outlined stack-label v-model="recordToSubmit.neto" readonly label="Neto"/>
          <q-input class="col-xs-6 col-sm-3" outlined stack-label v-model="recordToSubmit.piva" label="%Iva" @update:model-value="calcularDatosLinea"/>
          <q-input class="col-xs-6 col-sm-3" outlined stack-label v-model="recordToSubmit.totalIva" readonly label="Total Iva"/>
          <q-input class="col-xs-6 col-sm-3" outlined stack-label v-model="recordToSubmit.totalLinea" readonly label="Total Linea"/>
        </div>
      </q-card-section>
      <q-card-actions class="row items-center justify-between">
        <div class="row items-center q-gutter-sm">
          <q-checkbox
            v-model="isOperacionExenta"
            label="Operación Exenta"
            @update:model-value="onOperacionExentaChange" />
          <div v-if="isOperacionExenta" class="text-caption text-grey-8">
            E1 - Exención por el Art. 20.
          </div>
        </div>
        <div>
          <q-btn type="submit" label="Save" color="primary"/>
          <q-btn @click="$emit('close')" label="Cancel" color="negative"/>
        </div>
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script>
import { mapState } from 'vuex'
import { date } from 'quasar'
export default {
  props: ['modelValue', 'operacionExenta'], // value es el objeto con los campos de filtro que le pasa accionesMain con v-model
  data () {
    return {
      title: 'Detalle línea',
      recordToSubmit: {},
      listaActivosFilter: [],
      isOperacionExenta: false
    }
  },
  computed: {
    ...mapState('activos', ['listaActivos'])
  },
  methods: {
    filterActivos (val, update, abort) {
      update(() => {
        const needle = val.toLowerCase()
        this.listaActivosFilter = this.listaActivos.filter(v => v.nombre.toLowerCase().indexOf(needle) > -1)
      })
    },
    saveForm () {
      delete this.recordToSubmit.descuento // campo calculado
      this.$emit('saveRecord', this.recordToSubmit) // lo captura accionesMain
      this.$emit('updateOperacionExenta', this.isOperacionExenta ? 'SI' : 'NO') // se guarda en cabfacturas
    },
    formatDate (pdate) {
      return date.formatDate(pdate, 'DD-MM-YYYY')
    },
    calcularDatosLinea () {
      var obj = {
        unidades: parseFloat(this.recordToSubmit.unidades),
        precio: parseFloat(this.recordToSubmit.precio),
        pdescuento: parseFloat(this.recordToSubmit.pdescuento),
        piva: parseFloat(this.recordToSubmit.piva)
      }
      obj.descuento = Math.round((obj.unidades * obj.precio * obj.pdescuento / 100.0) * 100.0) / 100
      obj.neto = Math.round((obj.unidades * obj.precio - obj.descuento) * 100.0) / 100 // base de iva
      obj.totalIva = Math.round((obj.neto * obj.piva / 100.0) * 100.0) / 100
      obj.totalLinea = Math.round((obj.neto + obj.totalIva) * 100.0) / 100
      Object.assign(this.recordToSubmit, obj)
      if (obj.piva === 0) { // %Iva a 0 => marcamos Operación Exenta automáticamente
        this.isOperacionExenta = true
      } else this.isOperacionExenta = false
    },
    onOperacionExentaChange (val) {
      if (val) { // el usuario tica el checkbox a mano => ponemos %Iva a 0
        this.recordToSubmit.piva = 0
        this.calcularDatosLinea()
      }
    }
  },
  mounted () {
    this.recordToSubmit = Object.assign({}, this.modelValue) // asignamos valor del parametro por si viene de otro tab
    this.isOperacionExenta = this.operacionExenta === 'SI' // inicializamos desde cabecera (cabfacturas)
    this.calcularDatosLinea()
  }
}
</script>
