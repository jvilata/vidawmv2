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
    <q-scroll-area style="height: calc(100vh - 210px); ">
    <q-card flat>
      <q-card-section  class="q-pt-none q-pl-xs q-pr-xs">
        <div class="row q-mb-sm">
            <q-input outlined v-model="recordToSubmit.id" label="Id" class="col-xs-6 col-sm-2" />
            <q-input autofocus outlined clearable v-model="recordToSubmit.nombreAbreviado" label="Nombre" class="col-xs-6 col-sm-10"/>
        </div>
        <q-input class="row q-mb-sm" outlined clearable v-model="recordToSubmit.nombre" label="Nombre"/>
        <q-input class="row q-mb-sm" outlined clearable v-model="recordToSubmit.carpetaDrive" label="Nombre en OneDrive"/>
        <q-input class="row q-mb-sm" outlined clearable v-model="recordToSubmit.nif" label="NIF"/>
        <q-input class="row q-mb-sm" outlined clearable v-model="recordToSubmit.cuentaCorriente" label="Cuenta Corriente"/>
        <q-input class="row q-mb-sm" outlined clearable v-model="recordToSubmit.email" label="Email"/>
        <q-input class="row q-mb-sm" outlined clearable v-model="recordToSubmit.telefono" label="Telefono"/>
        <div class="row q-mb-sm">
          <q-input class="col-xs-6 col-sm-6" outlined clearable label="Fecha Alta" stack-label :model-value="formatDate(recordToSubmit.fechaAlta)" @update:model-value="val => recordToSubmit.fechaAlta=val" >
            <template v-slot:append>
                <q-icon name="event" class="cursos-pointer">
                  <q-popup-proxy ref="fechaAlta">
                    <wgDate v-model="recordToSubmit.fechaAlta" @update:model-value="$refs.fechaAlta.hide()"/>
                  </q-popup-proxy>
                </q-icon>
            </template>
          </q-input>
          <q-input class="col-xs-6 col-sm-6" outlined clearable label="Fecha Baja" stack-label :model-value="formatDate(recordToSubmit.fechaBaja)" @update:model-value="val => recordToSubmit.fechaBaja=val" >
            <template v-slot:append>
                <q-icon name="event" class="cursos-pointer">
                  <q-popup-proxy ref="fechaBaja">
                    <wgDate v-model="recordToSubmit.fechaBaja" @update:model-value="$refs.fechaBaja.hide()"/>
                  </q-popup-proxy>
                </q-icon>
            </template>
          </q-input>
        </div>
        <div class="row q-mb-sm">
          <q-input class="col-xs-6 col-sm-6" outlined clearable label="Hora Inicio1" stack-label v-model="recordToSubmit.horaInicio1">
            <template v-slot:append>
                <q-icon name="access_time" class="cursos-pointer">
                  <q-popup-proxy ref="horaInicio1">
                    <q-time v-model="recordToSubmit.horaInicio1"
                      @update:model-value="$refs.horaInicio1.hide()"
                      :hour-options="hourOptions"
                      :minute-options="minuteOptions"
                      :second-options="secondOptions"
                      mask="HH:mm"
                      format24h
                    />
                  </q-popup-proxy>
                </q-icon>
            </template>
          </q-input>
          <q-input class="col-xs-6 col-sm-6" outlined clearable label="Hora Fin1" stack-label v-model="recordToSubmit.horaFin1">
            <template v-slot:append>
                <q-icon name="access_time" class="cursos-pointer">
                  <q-popup-proxy ref="horaFin1">
                    <q-time v-model="recordToSubmit.horaFin1"
                      @update:model-value="$refs.horaFin1.hide()"
                      :hour-options="hourOptions"
                      :minute-options="minuteOptions"
                      :second-options="secondOptions"
                      mask="HH:mm"
                      format24h
                    />
                  </q-popup-proxy>
                </q-icon>
            </template>
          </q-input>
        </div>
        <div class="row q-mb-sm">
          <q-input class="col-xs-6 col-sm-6" outlined clearable label="Hora Inicio2" stack-label v-model="recordToSubmit.horaInicio2">
            <template v-slot:append>
                <q-icon name="access_time" class="cursos-pointer">
                  <q-popup-proxy ref="horaInicio2">
                    <q-time v-model="recordToSubmit.horaInicio2"
                      @update:model-value="$refs.horaInicio2.hide()"
                      :hour-options="hourOptions"
                      :minute-options="minuteOptions"
                      :second-options="secondOptions"
                      mask="HH:mm"
                      format24h
                    />
                  </q-popup-proxy>
                </q-icon>
            </template>
          </q-input>
          <q-input class="col-xs-6 col-sm-6" outlined clearable label="Hora Fin2" stack-label v-model="recordToSubmit.horaFin2">
            <template v-slot:append>
                <q-icon name="access_time" class="cursos-pointer">
                  <q-popup-proxy ref="horaFin2">
                    <q-time v-model="recordToSubmit.horaFin2"
                      @update:model-value="$refs.horaFin2.hide()"
                      :hour-options="hourOptions"
                      :minute-options="minuteOptions"
                      :second-options="secondOptions"
                      mask="HH:mm"
                      format24h
                    />
                  </q-popup-proxy>
                </q-icon>
            </template>
          </q-input>
        </div>
        <div class="row q-mb-sm">
          <q-input class="col-xs-6 col-sm-8" outlined clearable v-model="recordToSubmit.horasJornada" label="Horas Jornada"/>
          <q-select class="col-xs-6 col-sm-4"
            label="Doble Factor"
            stack-label
            outlined
            clearable
            v-model="recordToSubmit.dobleFactor"
            :options="listaSINO"
            option-value="id"
            option-label="desc"
            emit-value
            map-options
          />
        </div>
        </q-card-section>
    </q-card>
    </q-scroll-area>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { axiosInstance, headerFormData } from 'boot/axios.js'
import { openURL, date } from 'quasar'
import wgDate from 'components/General/wgDate.vue'
export default {
  props: ['id'],
  data () {
    return {
      title: 'Personal',
      value: {},
      hasChanges: false,
      colorBotonSave: 'primary',
      listaEntidadesFilter: [],
      recordToSubmit: {
        id: -1,
        nombre: '',
        nombreAbreviado: '',
        cuentaCorriente: '',
        email: '',
        fechaAlta: '',
        fechaBaja: '',
        nif: '',
        carpetaDrive: '',
        horaInicio1: '',
        horaFin1: '',
        horaInicio2: '',
        horaFin2: '',
        horasJornada: '',
        dobleFactor: 0
      }, // inicializamos los campos, sino no funciona bien
      hourOptions: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
      minuteOptions: [0, 30],
      secondOptions: [0, 10, 20, 30, 40, 50],
      listaOpciones: [
        { name: 'carpetaOneDrive', title: 'Carpeta OneDrive', icon: 'cloud', function: 'carpetaOneDrive' }
      ]
    }
  },
  computed: {
    ...mapState('tablasAux', ['listaEmpresas', 'listaSINO', 'listaMonedas', 'listaTiposActivo', 'listaMeses', 'listaTiposProducto', 'listaEstadosActivo', 'listaMonedas']),
    ...mapState('entidades', ['listaEntidades']),
    ...mapState('login', ['user']),
    ...mapState('tabs', ['tabs'])
  },
  methods: {
    ejecutarOpcion (opcion) {
      this[opcion.function](this.value)
      this.$refs.menu1.hide()
    },
    carpetaOneDrive () {
      var url = axiosInstance.defaults.baseURL + 'onedrive/abrirCarpeta.php?empresa=' + this.user.nomEmpresa + '&tipo=PERSONAL&carpeta=' +
        this.recordToSubmit.carpetaDrive
      this.openWindow(url)
    },
    openWindow (strUrl) {
      if (window.cordova === undefined) { // desktop
        openURL(strUrl)
      } else { // estamos en un disp movil
        window.cordova.InAppBrowser.open(strUrl, '_system') // openURL
      }
    },
    updateRecord () {
      var formData = new FormData()
      for (var key in this.recordToSubmit) {
        formData.append(key, this.recordToSubmit[key])
      }
      return this.$axios.post('personal/bd_personal.php/guardarBD', formData, headerFormData)
        .then(response => {
          this.colorBotonSave = 'primary'
          this.hasChanges = false
          this.$q.notify('Se ha actualizado registro')
          this.$emit('updated', this.recordToSubmit)
        })
        .catch(error => {
          this.$q.dialog({ title: 'Error2', message: error })
        })
    },
    formatDate (pdate) {
      if (pdate === null || pdate === '' || pdate === '0000-00-00 00:00:00') return ''
      else return date.formatDate(date.extractDate(pdate, 'YYYY-MM-DD HH:mm:ss'), 'DD-MM-YYYY')
    }
  },
  components: {
    wgDate: wgDate
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
    this.$axios.get(`personal/bd_personal.php/findPersonalFilter/${this.value.id}`, { params: objFilter })
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
    // bthis.$emit('input', this.recordToSubmit) // v-model: para devolver el valor a atributo 'value', evento input
    // this.$emit('changeTab', { idTab: this.value.idTab, filterRecord: {}, registrosSeleccionados: Object.assign({}, this.recordToSubmit) }) // para conservar valores cuando vuelva a selec tab
  }
}
</script>

<style>

</style>
