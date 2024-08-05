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
                    PORTFOLIO COMPANIES - {{ this.filterRecord.fundName }} 
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
        <portfolioGrid
        :value="filterRecord"
        :key="refreshKey"
        :trackRecord="trackRecord"
        />
      </q-scroll-area>
    </div>
  </template>
  
  <script>
  import { mapState, mapActions } from 'vuex'
  import { axiosInstance, headerFormData } from 'boot/axios.js'
  import portfolioGrid from 'components/Portfolio/portfolioGrid.vue'

  export default {
    props: ['id'],
    data () {
      return {
        title: 'Portfolio',
        value: {},
        refreshKey: 0,
        hasChanges: false,
        colorBotonSave: 'primary',
        trackRecord: false,
        listaEntidadesActivosFilter: [],
        filterRecord: {},
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
    getDatos() {
      this.filterRecord = {
        idAct_trackrecord: this.value.id,
        idEstrategia: this.value.idEstrategia,
        fundName: this.value.fundName
      }
      this.trackRecord = true
      this.refreshKey++
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
      //Object.assign(this.filterRecord, this.tabs[this.id].meta.value)
      this.getDatos(this.value)
          
      
    },
    unmounted () {
      if (this.hasChanges) {
        this.$q.dialog({ title: 'Aviso', message: '¿ Desea guardar cambios ?', ok: true, cancel: true, persistent: true })
          .onOk(() => { this.updateRecord() })
      }
      // this.$emit('input', this.recordToSubmit) // v-model: para devolver el valor a atributo 'value', evento input
      // this.$emit('changeTab', { idTab: this.value.idTab, filterRecord: {}, registrosSeleccionados: Object.assign({}, this.recordToSubmit) }) // para conservar valores cuando vuelva a selec tab
    },
    components: {
      portfolioGrid: portfolioGrid
    }
  }
  </script>
  
  <style>
  
  </style>
  