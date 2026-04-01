<template>
  <div>
    <q-card flat v-if="value.nombre">
      <q-card-section   class="q-pa-xs">
            <q-item class="q-pa-xs bg-indigo-1 text-grey-8">
              <!-- cabecera de formulario. Botón de busqueda y cierre de tab -->
              <q-item-section avatar>
                <q-icon name="edit" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-h6">
                  {{ value.nombre }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn
                @click="$emit('close')"
                flat
                round
                dense
                icon="close"/>
              </q-item-section>
            </q-item>
      </q-card-section>
    </q-card>
  <q-item class="row">
    <!-- GRID. en row-key ponemos la columna del json que sea la id unica de la fila -->
    <q-table
      class="facturasGrid-header-table"
      virtual-scroll
      :pagination="pagination"
      :rows-per-page-options="[0]"
      :virtual-scroll-sticky-size-start="48"
      row-key="id"
      :rows="registrosSeleccionados"
      :columns="columns"
      table-style="max-height: 66vh; max-width: 93vw"
      wrap-cells
    >

      <template v-slot:header="props">
        <!-- CABECERA DE LA TABLA -->
        <q-tr :props="props">
          <q-th>
            <q-btn icon="more_vert"  class="q-ma-xs" color="primary" dense>
              <q-menu ref="menu1">
                <q-list dense>
                  <q-item key="new1" clickable v-close-popup @click="addRecord" >
                    <q-item-section avatar>
                      <q-icon name="add" />
                    </q-item-section>
                    <q-item-section>Añadir Registro</q-item-section>
                  </q-item>
                  <q-item
                    v-for="(opcion, index) in listaOpciones"
                    :key="index"
                    clickable
                    @click="ejecutarOpcion(opcion)"
                    >
                    <q-item-section avatar>
                      <q-icon :name="opcion.icon" color="black" />
                    </q-item-section>
                    <q-item-section>{{opcion.title}}</q-item-section>
                    <q-item-section avatar v-if="opcion.children.length>0">
                      <q-icon name="keyboard_arrow_right" />
                    </q-item-section>
                      <q-menu v-if="opcion.children.length>0" anchor="top right" self="top left">
                        <q-list dense>
                          <q-item
                            v-for="(opcion1, index1) in opcion.children"
                            :key="index1"
                            clickable
                            v-close-popup
                            @click="ejecutarOpcion(opcion1)"
                            >
                            <q-item-section avatar>
                              <q-icon  :name="opcion1.icon"/>
                            </q-item-section>
                            
                            <q-item-section>{{opcion1.title}}</q-item-section>
                          </q-item>
                        </q-list>
                    </q-menu>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-th>

          <q-th
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
          >
            <q-popup-proxy v-if="col.name == 'estadoFactura'">
              <q-icon name="info" class="cursor-pointer text-primary" />
              <q-card class="q-pa-md" style="max-width: 300px">
                <div class="text-subtitle2">Estados de Facturas EMITIDAS</div>
                <div>1. PENDIENTE <br>
                  2. GENERADA AEAT: Una vez ya se ha enviado a la AEAT, pero ha dado un error parcial <br>
                  3. ENVIADA AEAT: aceptada sin errores por la AEAT <br>
                  4. ENVIADA: Enviada a contabilidad <br>
                  No podrán enviarse a contabilidad las facturas EMITIDAS si no se han enviado primero a la AEAT</div>
              </q-card>
            </q-popup-proxy>
            {{ col.label }}
            
          </q-th>
        </q-tr>
      </template>

      <template v-slot:body="props">
        <q-tr :props="props" :key="`m_${props.row.id}`" @mouseover="rowId=`m_${props.row.id}`">
          <q-td>
            <!-- columna de acciones: editar, borrar, etc -->
            <div style="width: 80px">
            <!--edit icon . Decomentamos si necesitamos accion especifica de edicion -->
            <q-btn flat v-if="rowId===`m_${props.row.id}`"
              @click.stop="editRecord(props.row, props.row.id)"
              round
              dense
              size="sm"
              color="primary"
              icon="edit">
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn flat v-if="rowId===`m_${props.row.id}`"
              @click.stop="deleteRecord(props.row.id)"
              round
              dense
              size="sm"
              color="red"
              icon="delete">
              <q-tooltip>Borrar</q-tooltip>
            </q-btn>
            <q-btn flat v-if="rowId===`m_${props.row.id}`"
              round
              dense
              size="sm"
              icon="more_vert">
              <q-tooltip anchor="top middle">Más Opciones</q-tooltip>
              <q-menu>
                <q-list dense style="min-width: 100px">
                  <q-item clickable @click="imprimir(props.row)">
                    <q-item-section avatar>
                      <q-icon name="print" />
                    </q-item-section>
                    <q-item-section>Imprimir</q-item-section>
                  </q-item>
                  <q-item clickable @click="duplicar(props.row)">
                    <q-item-section avatar>
                      <q-icon name="file_copy" />
                    </q-item-section>
                    <q-item-section>Duplicar</q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item clickable v-if="`${props.row.tipoFactura}`===`EMITIDA` && `${props.row.estadoFactura}`=== `PENDIENTE` || `${props.row.estadoFactura}`=== `GENERADA AEAT`" @click="enviarAEAT(props.row)">
                    <q-item-section avatar>
                      <q-icon name="send" />
                    </q-item-section>
                    <q-item-section>Enviar AEAT</q-item-section>
                  </q-item>
                  <q-item clickable @click="enviarEmail(props.row)">
                    <q-item-section avatar>
                      <q-icon name="email" />
                    </q-item-section>
                    <q-item-section>Enviar por email</q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item clickable @click="generarPago(props.row)">
                    <q-item-section avatar>
                      <q-icon name="brightness_5" />
                    </q-item-section>
                    <q-item-section>Generar Pago</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
            </div>
          </q-td>

          <q-td
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
          >
            <div :style="col.style">
              {{ col.value }}
            </div>
          </q-td>
        </q-tr>
      </template>

      <template v-slot:no-data>
        <div class="absolute-bottom q-mb-sm" style="left: 45vw">
          <q-btn
            @click.stop="addRecord"
            round
            dense
            color="primary"
            size="20px"
            icon="add">
            <q-tooltip>Añadir Registro</q-tooltip>
          </q-btn>
        </div>
        <div>
          No hay registros, pulse el botón + para añadir
        </div>
      </template>

      <template v-slot:bottom>
        <div class="absolute-bottom q-mb-sm" style="left: 45vw">
          <q-btn
            @click.stop="addRecord"
            round
            dense
            color="primary"
            size="20px"
            icon="add">
            <q-tooltip>Añadir Registro</q-tooltip>
          </q-btn>
        </div>
        <div>
          {{ registrosSeleccionados.length }} Filas
        </div>
      </template>

    </q-table>

    <q-dialog v-model="visibleSendMail"  >
      <sendMail :value="recordSendMail" @close="visibleSendMail=false"/>
    </q-dialog>
  </q-item>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { headerFormData } from 'boot/axios.js'
import { date, openURL } from 'quasar'
import { openBlobFile } from 'components/General/cordova.js'
import sendMail from 'components/SendMail/sendMail.vue'
import { useQuasar } from 'quasar'


export default {
  props: ['modelValue', 'id', 'fromFacturasMain'], // en 'value' tenemos el filtro
  data () {
    return {
      rowId: '',
      value: {},
      registrosSeleccionados: [],
      recordSendMail: {},
      visibleSendMail: false,
      columns: [
        { name: 'nomEntidad', align: 'left', label: 'Nombre', field: 'nomEntidad', sortable: true, style: 'width: 170px; whiteSpace: normal' },
        { name: 'fecha', align: 'left', label: 'Fecha', field: 'fecha', sortable: true, format: val => date.formatDate(date.extractDate(val, 'YYYY-MM-DD HH:mm:ss'), 'DD-MM-YYYY'), style: 'width: 70px;' },
        { name: 'nroFactura', align: 'left', label: 'NºFactura', field: 'nroFactura', sortable: true },
        { name: 'base', align: 'left', label: 'Base', field: 'base', sortable: true, format: val => this.$numeral(parseFloat(val)).format('0,0.00') },
        { name: 'totalIva', align: 'left', label: 'Total Iva', field: 'totalIva', sortable: true, format: val => this.$numeral(parseFloat(val)).format('0,0.00') },
        { name: 'totalFactura', align: 'left', label: 'Total Factura', field: 'totalFactura', sortable: true, format: val => this.$numeral(parseFloat(val)).format('0,0.00') },
        { name: 'por_retencion', align: 'left', label: '%Ret', field: 'por_retencion', sortable: true },
        { name: 'retencion', align: 'left', label: 'Retencion', field: 'retencion', sortable: true, format: val => this.$numeral(parseFloat(val)).format('0,0.00') },
        {
          name: 'nummov',
          align: 'left',
          label: 'Cobr/Pag',
          field: 'nummov',
          sortable: true,
          format: val => (val > 0 ? 'SI' : '')
        },
        { name: 'tipoFactura', align: 'right', label: 'Tipo', field: 'tipoFactura', sortable: true },
        { name: 'estadoFactura', align: 'left', label: 'Estado Factura', field: 'estadoFactura', sortable: true },
        { name: 'archivoDrive', align: 'left', label: 'archivoDrive', field: 'archivoDrive', sortable: true, style: 'width: 130px; whiteSpace: normal' },
        { name: 'id', label: 'Id', align: 'left', field: 'id', sortable: true },
        { name: 'idCliente', align: 'left', label: 'idEntidad', field: 'idCliente', sortable: true },
        { name: 'user', align: 'left', label: 'user', field: 'user', sortable: true },
        { name: 'ts', align: 'left', label: 'ts', field: 'ts', sortable: true }
      ],
      pagination: { rowsPerPage: 0 },
      listaOpciones: [
        {
          name: 'accionesDrive',
          title: 'Acciones Drive',
          icon: 'cloud',
          function: '',
          children: [
            { name: 'cargarFacturas', title: 'Cargar Facturas', icon: 'backup', function: 'cargarFacturas', children: [] },
            { name: 'cargarFacturas', title: 'Enviar Facturas', icon: 'email', function: 'enviarFacturas', children: [] },
            { name: 'enviarAEAT', title: 'Enviar AEAT', icon: 'send', function: 'enviarAEATGrupo', children: [] }

          ]
        }
      ]
    }
  },
  computed: {
    ...mapState('tablasAux', ['listaSINO']),
    ...mapState('entidades', ['entidadSelf', 'entidadAsesor']),
    ...mapState('login', ['user']),
    ...mapState('tabs', ['tabs'])
  },
  methods: {
    ...mapActions('tabs', ['addTab']),
    getRecords () {
      var objFilter = {}
      if (this.fromFacturasMain === undefined) {
        Object.assign(objFilter, { codEmpresa: this.user.codEmpresa, tipoObjeto: (this.value.tipoForm === 'ENTIDADES' ? 'E' : 'A'), idObjeto: this.value.id })
      } else Object.assign(objFilter, this.value) // viene de facturasMain

      objFilter.estadoFactura = (objFilter.estadoFactura && objFilter.estadoFactura !== null ? objFilter.estadoFactura.join() : null) // paso de array a concatenacion de strings (join)

     

      return this.$axios.get('facturas/bd_facturas.php/findFacturasFilter', { params: objFilter })
        .then(response => {
          this.registrosSeleccionados = response.data
        })
        .catch(error => {
          this.$q.dialog({ title: 'Error', message: error })
        })
    },
    addRecord () {
      var record = {
        codEmpresa: this.user.codEmpresa,
        tipoFactura: 'EMITIDA',
        tipoFacturaEmitida: 'F1', //Por defecto - F1: completa
        tipoRegistroEmitida: 'RegistroAlta',
        idCliente: 0,
        archivoDrive: '',
        estadoFactura: 'PENDIENTE',
        comentarios: '',
        carpeta: '',
        nroFactura: '-1',
        fecha: date.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
        base: 0,
        por_retencion: 0,
        retencion: 0,
        totalIva: 0,
        totalFactura: 0,
        user: this.user.user.email,
        ts: date.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
        EmitidaPorTerceroODestinatario: 'SELF'
      }
      return this.$axios.post('facturas/bd_facturas.php/findFacturasFilter/', record)
        .then(response => {
          record.id = response.data.id
          return this.$axios.get(`facturas/bd_facturas.php/findFacturasFilter/${record.id}`)
            .then(response => {
              record = response.data[0]
              this.registrosSeleccionados.push(record)
              this.editRecord(record, record.id)
            })
            .catch(error => {
              this.$q.dialog({ title: 'Error', message: error })
            })
        })
        .catch(error => {
          this.$q.dialog({ title: 'Error', message: error })
        })
    },
    deleteRecord (id) {
      this.$q.dialog({
        title: 'Confirmar',
        message: '¿ Borrar esta fila ?',
        ok: true,
        cancel: true,
        persistent: true
      }).onOk(() => {
        return this.$axios.delete(`facturas/bd_facturas.php/findFacturasFilter/${id}`)
          .then(response => {
            var index = this.registrosSeleccionados.findIndex(function (record) { // busco elemento del array con este id
              if (record.id === id) return true
            })
            this.registrosSeleccionados.splice(index, 1) // lo elimino del array
          })
          .catch(error => {
            this.$q.dialog({ title: 'Error', message: error })
          })
      })
    },
    editRecord (rowChanges, id) { // no lo uso aqui pero lod ejo como demo
      this.addTab(['facturasFormMain', 'Factura-' + rowChanges.id, rowChanges, rowChanges.id])
    },
    ejecutarOpcion (opcion) {
      if (opcion.children.length === 0) {
        this[opcion.function](this.selectedRowID)
        this.$refs.menu1.hide()
      }
    },
    imprimir (selected) {
      var paramRecord = {
        id: selected.id,
        aDisco: 0
      }
      var formData = new FormData()
      for (var key in paramRecord) {
        formData.append(key, paramRecord[key])
      }
      this.$axios.post('facturas/pdf_invoice.php/', formData, { responseType: 'blob' })
        .then(function (response) {
          if (window.cordova === undefined) { // desktop
            const url = window.URL.createObjectURL(new Blob([response.data], { type: response.data.type }))
            const link = document.createElement('a')
            link.href = url
            link.target = '_blank'
            document.body.appendChild(link)
            // window.open('', 'view') // abre nueva ventana para que no sustituya a la actual
            link.click()
          } else { // estamos en un disp movil
            const blobPdf = response.data // new Blob([response.data], { type: response.data.type })
            openBlobFile(selected.archivoDrive, blobPdf, response.data.type)
          }
        }).catch(error => {
          this.$q.dialog({ title: 'Error', message: error })
        })
    },
    duplicar (selected) {
      this.$axios.get('facturas/bd_facturas.php/copiarFactura', { params: { id: selected.id } })
        .then(response => {
          this.getRecords()
        })
        .catch(error => {
          this.$q.dialog({ title: 'Error', message: error })
        })
    },
    enviarEmail (selected) {
      if(selected.estadoFactura == "ENVIADA AEAT" || selected.estadoFactura == "GENERADA AEAT" || (selected.tipoFactura == 'RECIBIDA' && selected.estadoFactura == "PENDIENTE")) {
        this.recordSendMail = {
        destino: (selected.emailEntidad === '' ? this.entidadSelf.email : selected.emailEntidad),
        destinoCopia: this.entidadSelf.email, // jvilata@
        asunto: 'Factura de ' + this.user.nomEmpresa + ' número: ' + selected.nroFactura,
        texto: 'Hola,<br>Le adjuntamos factura ' + selected.nroFactura + ' por los servicios prestados de la empresa:' +
          this.user.nomEmpresa + '<br>Atentamente,<br>' + this.entidadSelf.nombre + '<br>' +
          (this.entidadSelf.logo !== '' ? '<img src="http://vidawm.com/privado/img/' + this.entidadSelf.logo + '"  width="100">' : ''),
        url: 'onedrive/downloadFactura.php?empresa=' + this.user.nomEmpresa + '&nombrePDF=' + selected.archivoDrive + '&carpeta=' + selected.carpeta
      }
      this.visibleSendMail = true
      }
      if (selected.estadoFactura == "PENDIENTE" && selected.tipoFactura == 'EMITIDA') {
        this.$q.dialog({
            title: 'ATENCIÓN',
            message: 'Antes de enviarse al destinatario, debe de enviarse a la AEAT'
          }).onOk(() => {
          // console.log('OK')
        })
      }
      
    },
    enviarAEAT (selected) {
     
      //Enviar a la agencia tributaria
      

      //SI respuesta AEAT OK: llamo a metodo copiarFacturasAEAT que me almacena en tabla facturasaeat y me cambia el estadoFactura a ENVIADA AEAT
      this.copiarFacturasAEAT(selected)

      /* var formData = new FormData()
      for (var key in selected) {
        formData.append(key, selected[key])
      }
    return this.$axios.post('facturas/bd_facturas.php/cambioEstadoFacturaAEAT', formData, headerFormData)
          .then(response => {
          this.$q.dialog({ title: 'Confirmar', message: 'Se ha cambiado el estado de la factura a "ENVIADA AEAT"' })
          
        })
        .catch(error => {
          this.$q.dialog({ title: 'Error', message: error })
        })
     //             this.copiarFacturasAEAT(selected)
      */

    },
    copiarFacturasAEAT(selected) {
      //Metodo para copiar datos en tabla: facturasaeat, y así que los campos que se visualicen desde el componente FACTURAS AEAT, sean los de la tabla AEAT
      var formData = new FormData()
      for (var key in selected) {
        formData.append(key, selected[key])
      }
      
    
      
    //  formData.append("estadoFact", 'GENERADO AEAT')

      return this.$axios.post('facturasAEAT/bd_facturasAEAT.php/guardarBD', formData, headerFormData)
        .then(response => {
          
          if (response.data.failure === 1) {
            
            this.$q.dialog({
              title: 'Error',
              message: response.data.message
            });
          } else {
            var res = response.data //aqui tengo el lastId insertado en facturasAEAT
            
              var formData1 = new FormData()
                formData1.append('id', res.id) //aqui tengo el lastId insertado en facturasAEAT
                formData1.append('estadoFactura', selected.estadoFactura)
            //Aqui envío a la AEAT
            return this.$axios.post('SIF/verifactu2.php/preparoVerifactu', formData1, headerFormData)
                    .then(response => {
                      
                      
                      this.$q.dialog({ title: 'Response', message: JSON.stringify(response.data.textoValidacion) })
                      
                      formData.append("respAEAT", JSON.stringify(response.data))
                      formData.append("estadoAEAT", JSON.stringify(response.data.textoValidacion).slice(1,-1))
                      formData.append('idAeat', res.id)
                      //almacenamos respuesta AEAT en cab_facturas

                      //Si resp OK -> cambiamos estado 
                      return this.$axios.post('facturasAEAT/bd_facturasAEAT.php/almacenoRespAEAT', formData, headerFormData)
                        .then(response => {
                          //this.$q.dialog({ title: 'Confirmar', message: 'Se ha cambiado el estado de la factura a "ENVIADA AEAT"' })
                          //this.$q.dialog({ title: 'Confirmar', message: 'La factura se ha enviado a la AEAT, y por eso se ha almacenado en la tabla Facturas AEAT' });
                          
                        
                        })
                        .catch(error => {
                            this.$q.dialog({ title: 'Error', message: error })
                        })

                    })
                    .catch(error => {
                       
                        this.$q.dialog({ title: 'Error', message: error })
                    })      
              
          }
        })
        .catch(error => {
          
          
          this.$q.dialog({ title: 'Error', message: error })
        })
      

    },
    generarPago (selected) {
      this.$axios.get('facturas/bd_facturas.php/generarPagoCobroFactura', { params: { id: selected.id } })
        .then(response => {
          this.$q.dialog({ title: 'Confirmar', message: 'Se ha generado movimiento' })
        })
        .catch(error => {
          this.$q.dialog({ title: 'Error', message: error })
        })
    },
    cargarFacturas () {
      var host = this.$axios.defaults.baseURL // 'https://vidawm.com/privado/php/'
      var strUrl = host + 'onedrive/recorrerCarpeta.php?codEmpresa=' + this.user.codEmpresa + '&empresa=' +
          this.user.nomEmpresa + '&tipo=FACTURAS&carpeta=FACTURAS&estado='
      if (window.cordova === undefined) { // desktop
        /* const link = document.createElement('a')
        link.href = host + 'onedrive/recorrerCarpeta.php?codEmpresa=' + this.user.codEmpresa + '&empresa=' +
          this.user.nomEmpresa + '&tipo=FACTURAS&carpeta=FACTURAS&estado='
        link.target = '_blank'
        document.body.appendChild(link)
        link.click() */
        openURL(strUrl)
      } else { // dispositivo movil
        window.cordova.InAppBrowser.open(strUrl, '_system') // openURL
      }
    },
    enviarFacturas () { //ENVÍO CONTABILIDAD
      var enviadoAEAT = false
      this.registrosSeleccionados.forEach(element => {
        if (element.tipoFactura == "EMITIDA" && element.estadoFactura == "PENDIENTE") {
          enviadoAEAT = true
          this.enviarAEAT(element)
        }else if (((element.tipoFactura == "EMITIDA" && (element.estadoFactura == "ENVIADA AEAT" || (element.estadoFactura == "GENERADA AEAT"))) || (element.tipoFactura == "RECIBIDA" && element.estadoFactura == "PENDIENTE") )) {
          enviadoAEAT = true
        }
      })
      if (enviadoAEAT) {
        this.recordSendMail = {
          destino: this.entidadAsesor.email, // 'rus@prifiscal.es'
          destinoCopia: this.entidadSelf.email, // 'jvilata@edicom.es',
          asunto: 'Te adjunto facturas de ' + this.user.nomEmpresa,
          texto: 'Hola,<br>Le adjuntamos facturas de la empresa:' + this.user.nomEmpresa + ' en este enlace de OnDrive:%enlace%' +
            '<br>Atentamente,<br>' + this.entidadSelf.nombre + '<br>' +
            (this.entidadSelf.logo !== '' ? '<img src="http://vidawm.com/privado/img/' + this.entidadSelf.logo + '"  width="100">' : ''),
          url: 'onedrive/moverElementosCarpeta.php?codEmpresa=' + this.user.codEmpresa + '&empresa=' + this.user.nomEmpresa +
            '&tipo=FACTURAS&carpeta=FACTURAS&estado='
        }
        this.visibleSendMail = true
      }
    },
    enviarAEATGrupo () {
      //Como tndremos varios envíos (si hay más de una) - haremos una cnexión a la AEAT por factura que tenemos que enviar - 
      // así obtendremos un mensaje de respuesta por factura
      this.registrosSeleccionados.forEach(element => {
        if (element.tipoFactura == "EMITIDA" && element.estadoFactura == "PENDIENTE") {
          //Enviar a la agencia tributaria --> URL PRUEBAS
          this.enviarAEAT(element)
        } 
      })
      
    }
  },
  components: {
    sendMail: sendMail
  },
  mounted () {
    this.value = this.modelValue
    if (this.value === undefined) this.value = Object.assign({}, this.tabs[this.id].meta.value)
    this.getRecords()
    /*Object.assign(this.value, this.tabs[this.id].meta.value)
    this.getRecords()*/
  }
}
</script>
<style lang="sass">
.facturasGrid-header-table
  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th
    /* bg color is important for th; just specify one */
    background-color: $indigo-1

  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0

  /* this is when the loading indicator appears */
  &.q-table--loading thead tr:last-child th
    /* height of all previous header rows */
    top: 48px
</style>
