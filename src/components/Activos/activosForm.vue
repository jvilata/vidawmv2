<template>
  <div>
    <q-card flat>
      <q-card-section   class="q-pa-xs">
            <q-item class="q-pa-xs bg-indigo-1 text-grey-8">
              <!-- cabecera de formulario. Botón de busqueda y cierre de tab -->
              <q-item-section avatar>
                <div class="row">
                  <q-btn  icon="save"  class="q-ma-xs" :color="colorBotonSave" dense @click="updateRecord" />
                  <q-btn icon="more_vert"  class="q-ma-xs" color="primary" dense>
                    <q-menu ref="menu1">
                      <q-list dense>
                        <q-item
                          v-for="(opcion, index) in listaOpciones"
                          :key="index"
                          clickable
                          v-close-popup
                          @click="ejecutarOpcion(opcion)"
                          >
                          <q-item-section avatar>
                            <q-icon :name="opcion.icon" />
                          </q-item-section>
                          <q-item-section>{{opcion.title}}</q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </div>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-h6">
                  {{ recordToSubmit.nombre }}
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
    <q-scroll-area style="height: calc(100vh - 210px); ">
    <q-card flat>
      <q-card-section  class="q-pt-none q-pl-xs q-pr-xs">
        <div class="row q-mb-sm">
            <q-input outlined v-model="recordToSubmit.id" label="Id" class="col-xs-6 col-sm-2" />
            <q-select
              class="col-xs-6 col-sm-4"
              outlined
              label="Tipo Activo"
              stack-label
              v-model="recordToSubmit.tipoActivo"
              :options="listaTiposActivo"
              option-value="codElemento"
              option-label="codElemento"
              emit-value
            />
            <q-select
              class="col-xs-6 col-sm-2"
              label="Computa"
              stack-label
              outlined
              v-model="recordToSubmit.computa"
              :options="listaSINO"
              option-value="id"
              option-label="desc"
              emit-value
              map-options
            />
            <q-select
              class="col-xs-6 col-sm-4"
              label="Estado Activo"
              stack-label
              outlined
              v-model="recordToSubmit.estadoActivo"
              :options="listaEstadosActivo"
              option-value="codElemento"
              option-label="valor1"
              emit-value
              map-options
            />
        </div>
        <div v-if="recordToSubmit.estadoActivo==='4'" class="row q-mb-sm">
            <q-select
              class="col-xs-8 col-sm-8"
              outlined
              clearable
              label="Cod.empresa"
              stack-label
              v-model="recordToSubmit.codOtraEmpresa"
              :options="listaEmpresas"
              option-value="codElemento"
              option-label="valor1"
              emit-value
              map-options
            />
            <q-input outlined v-model="recordToSubmit.idActivoOtra" label="Id Activo" class="col-xs-4 col-sm-4" />
        </div>
        <q-input class="row q-mb-sm" autofocus outlined v-model="recordToSubmit.nombre" label="Nombre" @blur="recordToSubmit.carpetaDrive =recordToSubmit.nombre" />
        <q-input class="row q-mb-sm" outlined v-model="recordToSubmit.carpetaDrive" label="Nombre en OneDrive"/>
        <q-input class="row q-mb-sm" outlined v-model="recordToSubmit.descripcion" label="Descripción"
            type="textarea"
            counter
            @keyup.enter.stop />
        <div class="row q-mb-sm" v-if="recordToSubmit.tipoActivo ==='CAJA'"  >
          <q-input 
          class="col-xs-12 col-sm-12" 
            outlined 
            v-model="recordToSubmit.iban" 
            label="IBAN"/>
        </div>
        <div class="row q-mb-sm">
          <q-select
              class="col-xs-12 col-sm-6"
              label="Moneda"
              stack-label
              outlined
              clearable
              v-model="recordToSubmit.moneda"
              :options="listaMonedas"
              option-value="codElemento"
              option-label="codElemento"
              emit-value
          />
          <q-input outlined v-model="recordToSubmit.rentabEsp" label="Rent.Esp.Año" class="col-xs-6 col-sm-3"/>
          <q-input outlined v-model="recordToSubmit.rentabReal" label="R.Futura/TIR" class="col-xs-6 col-sm-3"/>
        </div>
          <q-select
          class="row q-mb-sm"
          outlined
          clearable
          label="Gestor/Arrend"
          stack-label
          v-model="recordToSubmit.idEntidad"
          :options="listaEntidadesComp"
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
          <div class="row q-mb-sm">
            <q-input class="col-11" outlined v-model="recordToSubmit.urlinfo" label="URL Info"/>
            <q-btn @click="openWindow(recordToSubmit.urlinfo)" class="col-1 bg-primary text-white" dense icon="open_in_browser"/>
          </div>
          <q-input class="row q-mb-sm" outlined v-model="recordToSubmit.comentarios" label="comentarios"
            type="textarea"
            counter
            @keyup.enter.stop/>
        </q-card-section>
    </q-card>
    </q-scroll-area>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { axiosInstance, headerFormData } from 'boot/axios.js'
import { openURL } from 'quasar'
export default {
  props: ['id'],
  data () {
    return {
      title: 'Activos',
      value: {},
      hasChanges: false,
      colorBotonSave: 'primary',
      listaEntidadesFilter: [],
      recordToSubmit: {
        id: -1,
        nombre: '',
        carpetaDrive: '',
        descripcion: '',
        tipoActivo: '',
        estadoActivo: '',
        tipoProducto: '',
        iban: '',
        moneda: '',
        idEntidad: 0,
        computa: '',
        codOtraEmpresa: 0,
        idActivoOtra: '',
        urlinfo: '',
        comentarios: ''
      }, // inicializamos los campos, sino no funciona bien
      listaOpciones: [
        { name: 'carpetaOneDrive', title: 'Carpeta OneDrive', icon: 'cloud', function: 'carpetaOneDrive' }
      ]
    }
  },
  computed: {
    ...mapState('tablasAux', ['listaEmpresas', 'listaSINO', 'listaMonedas', 'listaTiposActivo', 'listaMeses', 'listaTiposProducto', 'listaEstadosActivo', 'listaMonedas']),
    ...mapState('entidades', ['listaEntidades']),
    ...mapState('login', ['user']),
    ...mapState('tabs', ['tabs']),
    listaEntidadesComp () {
      if (this.listaEntidadesFilter.length <= 0) return this.listaEntidades
      else return this.listaEntidadesFilter
    }
  },
  methods: {
    filterEntidades (val, update, abort) {
      update(() => {
        const needle = val.toLowerCase()
        this.listaEntidadesFilter = this.listaEntidades.filter(v => v.nombre.toLowerCase().indexOf(needle) > -1)
      })
    },
    ejecutarOpcion (opcion) {
      this[opcion.function]() //(this.value)
      this.$refs.menu1.hide()
    },
    carpetaOneDrive () {
      var estado = this.listaEstadosActivo.find(v => v.codElemento === this.recordToSubmit.estadoActivo)
      if (estado !== null) {
        var url = axiosInstance.defaults.baseURL + 'onedrive/abrirCarpeta.php?empresa=' + this.user.nomEmpresa + '&tipo=ACTIVOS&carpeta=' +
          this.recordToSubmit.carpetaDrive + '&estado=' + estado.valor1
        this.openWindow(url)
      } else {
        this.$q.dialog({ title: 'Aviso', message: 'El activo debe tener ESTADO configurado' })
      }
    },
    openWindow (strUrl) {
      if (window.cordova === undefined) { // desktop
        openURL(strUrl)
      } else { // estamos en un disp movil
        window.cordova.InAppBrowser.open(strUrl, '_system') // openURL
      }
    },
    updateRecord () {
      if (this.recordToSubmit.tipoProducto === '') this.recordToSubmit.tipoProducto = null
      var tmp = this.recordToSubmit.tipoProducto
      if (this.recordToSubmit.tipoProducto !== null) this.recordToSubmit.tipoProducto = JSON.stringify(this.recordToSubmit.tipoProducto.split(',')) // convierto a array en JSON
      var formData = new FormData()
      for (var key in this.recordToSubmit) {
        formData.append(key, this.recordToSubmit[key])
      }
      this.recordToSubmit.tipoProducto = tmp
      return this.$axios.post('activos/bd_activos.php/guardarBD', formData, headerFormData)
        .then(response => {
          this.colorBotonSave = 'primary'
          this.hasChanges = false
          this.$q.notify('Se ha actualizado registro')
        })
        .catch(error => {
          this.$q.dialog({ title: 'Error', message: error })
        })
    }
  },
  watch: {
    recordToSubmit: { // detecta cambios en las propiedades de este objeto (tienen que estar inicializadas en data())
      handler (val) {
        this.colorBotonSave = 'red'
        this.hasChanges = true
      },
      deep: true
    }
  },
  mounted () {
    Object.assign(this.value, this.tabs[this.id].meta.value)
    var objFilter = {
      id: this.value.id
    }
    this.$axios.get('activos/bd_activos.php/findActivosFilter', { params: objFilter })
      .then(response => {
        Object.assign(this.recordToSubmit, response.data[0])
        setTimeout(() => { this.colorBotonSave = 'primary'; this.hasChanges = false }, 50) // dejo pasar un poco porque en el render se modifica el registro
      })
      .catch(error => {
        this.$q.dialog({ title: 'Error', message: error })
      })
  },
  unmounted () {
    if (this.hasChanges) {
      this.$q.dialog({ title: 'Aviso', message: '¿ Desea guardar cambios ?', ok: true, cancel: true, persistent: true })
        .onOk(() => { this.updateRecord() })
    }
    // this.$emit('input', this.recordToSubmit) // v-model: para devolver el valor a atributo 'value', evento input
    // this.$emit('changeTab', { idTab: this.value.idTab, filterRecord: {}, registrosSeleccionados: Object.assign({}, this.recordToSubmit) }) // para conservar valores cuando vuelva a selec tab
  }
}
</script>

<style>

</style>
