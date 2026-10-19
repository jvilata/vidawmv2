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
        <q-select
          v-if="recordToSubmit.tipoFactura == 'EMITIDA'"
          class="col-xs-12 col-sm-2"
          outlined
          label="Tipo Registro"
          stack-label
          v-model="recordToSubmit.tipoRegistroEmitida"
          :options="listaRegistro"
          option-value="codElemento"
          option-label="valor1"
          map-options
          emit-value
        />
        <q-input v-if="((recordToSubmit.tipoFactura !== 'EMITIDA') || (recordToSubmit.tipoFactura == 'EMITIDA' && recordToSubmit.tipoRegistroEmitida !== 'RegistroAnulacion'))" class="col-xs-4 col-sm-1" outlined label="Nro Factura" stack-label v-model="recordToSubmit.nroFactura" />
        <q-select
          v-if="recordToSubmit.tipoFactura == 'EMITIDA' && recordToSubmit.tipoRegistroEmitida !== 'RegistroAlta'"
          class="col-xs-12 col-sm-2"
          outlined
          label="Nro Factura Anular"
          stack-label
          v-model="recordToSubmit.nroFactura"
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
        <q-select
          v-if="(recordToSubmit.EmitidaPorTerceroODestinatario === 'Tercero' || recordToSubmit.EmitidaPorTerceroODestinatario === 'T')"
          class="col-xs-8 col-sm-2"
          :style="nifSelectStyle" 
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
          @update:model-value="validacionNif(recordToSubmit)"       
        />
        <q-select
          v-else 
          class="col-xs-8 col-sm-4"
          :style="nifSelectStyle"
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
          @update:model-value="validacionNif(recordToSubmit)"
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
          v-if="recordToSubmit.tipoFactura == 'EMITIDA' && recordToSubmit.tipoRegistroEmitida !== 'RegistroAnulacion'"
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
          v-if="recordToSubmit.tipoFactura == 'EMITIDA' && recordToSubmit.tipoRegistroEmitida !== 'RegistroAnulacion'"
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
        <q-input v-if="recordToSubmit.tipoFactura == 'EMITIDA' && recordToSubmit.tipoFacturaEmitida !== 'F1'"
          class="col-xs-12 col-sm-2"
          outlined
          label="Tipo Rectificativa"
          stack-label
          v-model="tipoRectificativaFija"
          readonly
          emit-value
        />
        <q-select
          v-if="recordToSubmit.tipoFactura == 'EMITIDA' && recordToSubmit.tipoFacturaEmitida !== 'F1'"
          class="col-xs-12 col-sm-2"
          outlined
          label="Nro Fact Rectificativa"
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
        <q-input v-if= "recordToSubmit.tipoRegistroEmitida !== 'RegistroAnulacion'" class="col-xs-10 col-sm-4" outlined stack-label v-model="recordToSubmit.archivoDrive" label="Archivo Drive"/>
        <q-btn v-if= "recordToSubmit.tipoRegistroEmitida !== 'RegistroAnulacion'" @click="abrirURL" class="col-xs-2 col-sm-1 bg-primary text-white" dense icon="open_in_browser"/>
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
        <q-input v-if= "recordToSubmit.tipoRegistroEmitida !== 'RegistroAnulacion'" class="col-xs-7 col-sm-3" outlined stack-label v-model="recordToSubmit.carpeta" label="Carpeta Drive"/>
      </div>
      <div v-if= "recordToSubmit.tipoRegistroEmitida !== 'RegistroAnulacion'" class="row">
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
import { ref } from 'vue'; // Make sure ref is imported

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
      tipoRectificativaFija: 'Por sustitución',
      listaEmitidaPor: ['SELF', 'Destinatario', 'Tercero'],
      // NUEVO: Propiedad para controlar la clase del q-select de Cliente/Proveedor
      nifValidationClass: '' // Inicialmente vacía
    }
  },
  computed: {
    ...mapState('tablasAux', ['listaEstadosFactura', 'listaTiposFactura', 'listaTipoFacturaEmitida', 'listaTipoRectificativa', 'listaRegistro']),
    ...mapState('entidades', ['listaEntidades', 'listaNumFactEmitidas']),
    ...mapState('activos', ['listaActivos']),
    ...mapState('login', ['user']),
    nifSelectStyle() {
      // Determine the background color based on nifValidationClass
      let bgColor = 'white'; // Default or no validation color
      if (this.nifValidationClass === 'q-select-success') {
        bgColor = '#e6ffe6'; // Light green
      } else if (this.nifValidationClass === 'q-select-error') {
        bgColor = '#ffe6e6'; // Light red
      } else if (this.nifValidationClass === 'q-select-warning') {
        bgColor = '#fffacd'; // Light yellow
      }
      
      // Return a style object. Quasar will interpret this and apply it correctly.
      // For outlined fields, directly setting backgroundColor on the component often works
      // because Quasar internally applies it to the correct child element or uses it
      // to set its own CSS variable like --q-field-bg.
      return {
        backgroundColor: bgColor
      };
    }
  },
  methods: {
     ...mapActions('entidades', ['loadNumFactEmitidas']),
    filterEntidades (val, update, abort) {
      update(() => {
        const needle = val.toLowerCase()
        this.listaEntidadesFilter = this.listaEntidades.filter(v => v.nombre.toLowerCase().indexOf(needle) > -1)
      })
    },
    filterFactEmitidas (val, update, abort) {
      update(() => {
        const needle = val.toLowerCase()
        // Asegúrate de que this.listaNumFactEmitidas sea un array antes de intentar filtrar
        // Aunque el watcher ya se encargará de esto, es una buena práctica de seguridad.
        if (Array.isArray(this.listaNumFactEmitidas)) {
          this.listaFactEmitidasFilter = this.listaNumFactEmitidas.filter(v => v.nroFactura.toLowerCase().indexOf(needle) > -1)
        } else {
          this.listaFactEmitidasFilter = []; // Si no es array, resetea a vacío
        }
      })
    },
    filterActivos (val, update, abort) {
      update(() => {
        const needle = val.toLowerCase()
        this.listaActivosFilter = this.listaActivos.filter(v => v.nombre.toLowerCase().indexOf(needle) > -1)
      })
    },
    validacionNif(record) {
     
      var objRecord = {}
      if(record.tipoFactura == "EMITIDA" && (record.idCliente !== null && record.idCliente !== '0' && record.idCliente !== 0 && record.idCliente !== '' )) {
        //hago validacionNIF, si OK, entonces almaceno
        //recupero cif cliente: encontrarCifCliente
        this.nifValidationClass = ''; // Remueve cualquier estilo previo
        var idC = record.idCliente
        var varNif = '';
        var varNom = ''
        objRecord = {
          Nombre: varNom,
          Nif: varNif
        };
       
        //en varNom tengo {id, email, nombre} del cliente
        varNom = this.listaEntidadesFilter.find(ent => ent.id === record.idCliente)

        objRecord.Nombre = varNom.nombre

          return this.$axios.get(`facturasAEAT/bd_facturasAEAT.php/encontrarCifCliente`, { params: { idCliente: idC } })
          .then(response => {
            varNif = response.data.cif
            objRecord.Nif = varNif
            return this.$axios.get(`SIF/validacionNif.php`, { params: objRecord })
            .then(response => {
                if(response.data == "IDENTIFICADO"){
                  this.nifValidationClass = 'q-select-success';
                  this.$q.notify('Cliente IDENTIFICADO por la AEAT')
                } else {
                  this.nifValidationClass = 'q-select-error';
                  this.$q.notify('Cliente NO IDENTIFICADO por la AEAT')

                }
              })
              .catch(error => {
                this.$q.dialog({ title: 'Error en la Validación AEAT', message: error })
                // Si hay un error en la validación AEAT, ponlo en rojo
                this.nifValidationClass = 'q-select-error'; // Establece la clase de error
              })
          })
          .catch(error => {
            this.$q.dialog({ title: 'Error en la búsqueda del CIF', message: error })
            // Si hay un error en la Búsqueda del CIF, ponlo en rojo
            this.nifValidationClass = 'q-select-error'; // Establece la clase de error
          })
  
    } else {
      this.$q.notify({
        message: 'El NIF o Nombre del cliente NO es válido según la AEAT o no se ha seleccionado cliente.',
        color: 'warning',
        icon: 'warning',
        position: 'top',
        timeout: 2500
      });
      this.nifValidationClass = 'q-select-warning';

    }  

    },
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
    this.loadNumFactEmitidas(this.user.codEmpresa)

    this.listaEntidadesFilter = this.listaEntidades
    this.listaFactEmitidasFilter = this.listaNumFactEmitidas
    this.recordToSubmit = Object.assign({}, this.value) // asignamos valor del parametro por si viene de otro tab
  },
  watch: {
    recordToSubmit: { // detecta cambios en las propiedades de este objeto (tienen que estar inicializadas en data())
      handler (val) {
        this.$emit('hasChanges', { hasChanges: true, colorBotonSave: 'red' })
      },
      deep: true
    },
    listaNumFactEmitidas: {
      handler(newVal) {
        // Cuando listaNumFactEmitidas en el store cambia (es decir, cuando los datos llegan)
        // actualiza listaFactEmitidasFilter.
        this.listaFactEmitidasFilter = newVal;
      },
      immediate: true // Asegura que el handler se ejecute una vez al montar el componente
    },
  },
  unmounted () {
    // guardamos valor en tabs por si despus queremos recuperarlo
    
    this.$emit('saveChanges', this.recordToSubmit)
  }
}
</script>
<style scoped>
/* Keep the border color rules if you still want them */
.q-select-success.q-field--outlined .q-field__control:before {
  border-color: #4CAF50 !important; /* Verde */
}

.q-select-error.q-field--outlined .q-field__control:before {
  border-color: #F44336 !important; /* Rojo */
}

.q-select-warning.q-field--outlined .q-field__control:before {
  border-color: #FFEB3B !important; /* Amarillo */
}

/* Keep the label color rules if you still want them */
.q-select-success .q-field__label {
  color: #218838 !important;
}
.q-select-error .q-field__label {
  color: #C82333 !important;
}
.q-select-warning .q-field__label {
  color: #D39E00 !important;
}

/* You can remove the background-color rules for .q-field__control here: */
/* .q-select-success.q-field--outlined .q-field__control { background-color: ... } */
/* etc. */
</style>