  <!-- componente que se llama desde accionesMain y que presenta el formulario de filtro y el boton de busqueda -->
  <template>
  <q-card class="q-pt-none q-pl-xs q-pr-xs">
      <div class="row">
        <q-select
          class="col-xs-12 col-sm-2"
          outlined
          label="Tipo Factura"
          stack-label
          v-model="recordToSubmit.tipoFactura"
          :options="listaTiposFactura"
          option-value="codElemento"
          option-label="codElemento"
          emit-value
        />
        <q-input class="col-xs-4 col-sm-2" outlined label="Nro Factura" stack-label v-model="recordToSubmit.nroFactura" />
        <q-select
          v-if="(recordToSubmit.EmitidaPorTerceroODestinatario === 'Tercero' || recordToSubmit.EmitidaPorTerceroODestinatario === 'T')"
          class="col-xs-8 col-sm-3"
          outlined
          label="Cliente / Proveedor."
          stack-label
          v-model="recordToSubmit.idCliente"
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
        <q-select
          v-else 
          class="col-xs-8 col-sm-5"
          outlined
          label="Cliente / Proveedor."
          stack-label
          v-model="recordToSubmit.idCliente"
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
        <q-input v-if="recordToSubmit.tipoFactura == 'EMITIDA'"
          class="col-xs-12 col-sm-2" outlined label="Fecha Expedición" stack-label :model-value="formatDate(recordToSubmit.fecha)" @update:model-value="val => recordToSubmit.fecha=val" >
          <template v-slot:append>
              <q-icon name="event" class="cursos-pointer">
                <q-popup-proxy >
                  <wgDate v-model="recordToSubmit.fecha"/>
                </q-popup-proxy>
              </q-icon>
          </template>
        </q-input>
        <q-input v-if="recordToSubmit.tipoFactura != 'EMITIDA'"
          class="col-xs-12 col-sm-3" outlined label="Fecha Expedición" stack-label :model-value="formatDate(recordToSubmit.fecha)" @update:model-value="val => recordToSubmit.fecha=val" >
          <template v-slot:append>
              <q-icon name="event" class="cursos-pointer">
                <q-popup-proxy >
                  <wgDate v-model="recordToSubmit.fecha"/>
                </q-popup-proxy>
              </q-icon>
          </template>
        </q-input>
        <q-select
          v-if="recordToSubmit.tipoFactura == 'EMITIDA'"
          class="col-xs-12 col-sm-1"
          outlined
          label="Emisor:"
          stack-label
          v-model="recordToSubmit.EmitidaPorTerceroODestinatario"
          :options="listaEmitidaPor"
          emit-value
        />
        <q-select
          v-if="(recordToSubmit.EmitidaPorTerceroODestinatario === 'Tercero' || recordToSubmit.EmitidaPorTerceroODestinatario === 'T')"
          class="col-xs-8 col-sm-2"
          outlined
          label="Emitida por Tercero:"
          stack-label
          v-model="recordToSubmit.TerceroEmisorIDEntidad"
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
        <q-select
          v-if="recordToSubmit.tipoFactura == 'EMITIDA'"
          class="col-xs-12 col-sm-2"
          outlined
          label="Factura Emitida"
          stack-label
          v-model="recordToSubmit.tipoFacturaEmitida"
          :options="listaTipoFacturaEmitida"
          option-value="codElemento"
          option-label="valor1"
          map-options
          emit-value
        />
        <q-select
          v-if="recordToSubmit.tipoFactura == 'EMITIDA' && recordToSubmit.tipoFacturaEmitida !== 'F1'"
          class="col-xs-12 col-sm-4"
          outlined
          label="Tipo Fact Rectificativa"
          stack-label
          v-model="recordToSubmit.TipoRectificativa"
          :options="listaTipoRectificativa"
          option-value="codElemento"
          option-label="valor1"
          map-options
          emit-value
        />
        <q-select
          v-if="recordToSubmit.tipoFactura == 'EMITIDA' && recordToSubmit.tipoFacturaEmitida !== 'F1'"
          class="col-xs-12 col-sm-4"
          outlined
          label="Nro Fact Rectificativa."
          stack-label
          v-model="recordToSubmit.Rect_NumSerieFactura"
          :options="listaFactEmitidasFilter"
          option-value="nroFactura"
          option-label="nroFactura"
          emit-value
          map-options
          @filter="filterFactEmitidas"
          use-input
          hide-selected
          fill-input
          input-debounce="0"
        />
        <q-input class="col-xs-10 col-sm-5" outlined stack-label v-model="recordToSubmit.archivoDrive" label="Archivo Drive"/>
        <q-btn @click="abrirURL" class="col-xs-2 col-sm-1 bg-primary text-white" dense icon="open_in_browser"/>
        <q-select
          class="col-xs-5 col-sm-2"
          label="Estado Factura"
          stack-label
          outlined
          v-model="recordToSubmit.estadoFactura"
          :options="listaEstadosFactura"
          option-value="codElemento"
          option-label="codElemento"
          emit-value
        />
        <q-input class="col-xs-7 col-sm-2" outlined stack-label v-model="recordToSubmit.carpeta" label="Carpeta Drive"/>
      </div>
      <div class="row">
        <q-input class="col-xs-6 col-sm-3" outlined readonly stack-label v-model="recordToSubmit.base" label="Base"/>
        <q-input class="col-xs-2 col-sm-2" outlined stack-label v-model="recordToSubmit.por_retencion" label="%Retención" @blur="$emit('calculartotalesfac', recordToSubmit)"/>
        <q-input class="col-xs-4 col-sm-2" outlined readonly stack-label v-model="recordToSubmit.retencion" label="Retención"/>
        <q-input class="col-xs-6 col-sm-2" outlined readonly stack-label v-model="recordToSubmit.totalIva" label="Total Iva"/>
        <q-input class="col-xs-6 col-sm-3" outlined readonly stack-label v-model="recordToSubmit.totalFactura" label="Total Factura"/>
      </div>
  </q-card>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { date, openURL } from 'quasar'
import wgDate from 'components/General/wgDate.vue'
export default {
  props: ['value'], // value es el objeto con los campos de filtro que le pasa accionesMain con v-model
  data () {
    return {
      recordToSubmit: {
        nroFactura: '',
        tipoFactura: '',
        idCliente: '',
        fecha: '',
        archivoDrive: '',
        estadoFactura: '',
        base: '',
        por_retencion: '',
        retencion: '',
        totalIva: '',
        totalFactura: ''
      },
      listaFactEmitidasFilter: [],
      listaEntidadesFilter: this.listaEntidades,
      listaActivosFilter: [],
      listaEmitidaPor: ['SELF', 'Destinatario', 'Tercero']
    }
  },
  computed: {
    ...mapState('tablasAux', ['listaEstadosFactura', 'listaTiposFactura', 'listaTipoFacturaEmitida', 'listaTipoRectificativa']),
    ...mapState('entidades', ['listaEntidades', 'listaNumFactEmitidas']),
    ...mapState('activos', ['listaActivos']),
    ...mapState('login', ['user'])
  },
  methods: {

    getRecords () {
      this.$emit('getRecords', this.recordToSubmit) // lo captura accionesMain
    },
    formatDate (pdate) {
      return date.formatDate(pdate, 'DD-MM-YYYY')
    },
    abrirURL () {
      if (this.recordToSubmit.archivoDrive !== '') {
        var str1 = ''
        if (this.recordToSubmit.estadoFactura === 'PENDIENTE') str1 = ''
        else str1 = this.recordToSubmit.carpeta + '/'
        var strUrl = 'https://vidawealth-my.sharepoint.com/personal/jvilata_vidawm_com/Documents/' +
          this.user.nomEmpresa + '/FACTURAS/' + str1 +
          this.recordToSubmit.archivoDrive
        if (window.cordova === undefined) { // desktop
          openURL(strUrl)
        } else { // estamos en un disp movil
          window.cordova.InAppBrowser.open(strUrl, '_system') // openURL
        }
      }
    }
  },
  components: {
    wgDate: wgDate
  },
  mounted () {
    //this.$store.dispatch('entidades/loadNumFactEmitidas');

    this.listaEntidadesFilter = this.listaEntidades
    this.listaFactEmitidasFilter = this.listaNumFactEmitidas
    //console.log(this.listaNumFactEmitidas)
    this.recordToSubmit = Object.assign({}, this.value) // asignamos valor del parametro por si viene de otro tab
  }
}
</script>
