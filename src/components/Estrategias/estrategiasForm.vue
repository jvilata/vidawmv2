<template>
    <div>
      <q-card flat>
        <q-card-section   class="q-pa-xs">
              <q-item class="q-pa-xs bg-indigo-1 text-grey-8">
                <!-- cabecera de formulario. Botón de busqueda y cierre de tab -->
                <q-item-section avatar>
                  <div class="row">
                    <q-btn  icon="save"  class="q-ma-xs" :color="colorBotonSave" dense @click="updateRecord" />
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
              <q-input outlined v-model="recordToSubmit.id" label="Id" class="col-xs-3 col-sm-2" />
              <q-select
                class="col-xs-6 col-sm-10"
                outlined
                label="Tipo Activo"
                stack-label
                v-model="recordToSubmit.tipoActivo"
                :options="listaTiposActivo"
                option-value="codElemento"
                option-label="codElemento"
                emit-value
              />      
          </div>
          <q-input class="row q-mb-sm" autofocus outlined v-model="recordToSubmit.nombre" label="Nombre de la estrategia"/>
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
                @filter="filterEntidadesActivos"
              />
          
          
          <q-input class="q-my-md" outlined v-model="recordToSubmit.descripcion" label="Descripción (opcional)"
              type="textarea"
              counter
              @keyup.enter.stop />

        
          </q-card-section>
      </q-card>
      </q-scroll-area>
    </div>
  </template>
  
  <script>
  import { mapState, mapActions } from 'vuex'
  import { axiosInstance, headerFormData } from 'boot/axios.js'
  export default {
    props: ['id'],
    data () {
      return {
        title: 'Estrategias',
        value: {},
        hasChanges: false,
        colorBotonSave: 'primary',
        listaEntidadesActivosFilter: [],
        recordToSubmit: {
          id: -1,
          nombre: '',
          nombreEntidad: '',
          tipoActivo: '',
          descripcion: ''
        } // inicializamos los campos, sino no funciona bien
      }
    },
    computed: {
      ...mapState('tablasAux', ['listaTiposActivo', 'listaTiposProducto', 'listaEstadosActivo']),
      ...mapState('entidades', ['listaEntidadesActivos']),
      ...mapState('login', ['user']),
      ...mapState('tabs', ['tabs']),
    listaEntidadesComp () {
      if (this.listaEntidadesActivosFilter.length <= 0) return this.listaEntidadesActivos
      else return this.listaEntidadesActivosFilter
    }
    },
    methods: {
      ...mapActions('entidades', ['loadEntidades', 'loadEntidadesActivos']),
      filterEntidadesActivos (val, update, abort) {
        update(() => {
          const needle = val.toLowerCase()
          this.listaEntidadesActivosFilter = this.listaEntidadesActivos.filter(v => v.nombre.toLowerCase().indexOf(needle) > -1)
        })
     },
     updateRecord () {
      var formData = new FormData()
      for (var key in this.recordToSubmit) {
        formData.append(key, this.recordToSubmit[key])
      }
     
      return this.$axios.post('estrategias/bd_estrategias.php/guardarBD', formData, headerFormData)
        .then(response => {
          this.colorBotonSave = 'primary'
          this.hasChanges = false
          this.$q.notify('Se ha actualizado registro')
        })
        .catch(error => {
          this.$q.dialog({ title: 'Error', message: error })
        })
    },
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
      this.loadEntidadesActivos()
      // en this.value tengo: {id: 1, nombre: 'LGT CESB', idEntidad: 265, tipoActivo: 'CAP.RIESGO', nombreEntidad: 'LGT CAPITAL PARTNERS SUIZA'}
      var objFilter = {
        id: this.value.id
      }
      this.$axios.get('estrategias/bd_estrategias.php/findEstrategiasFilter', { params: objFilter })
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
  