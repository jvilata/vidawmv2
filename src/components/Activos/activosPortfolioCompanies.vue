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
     
        <portfolioGrid
        :value="filterRecord"
        :key="refreshKey"
        :trackRecord="trackRecord"
        />
      
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
        refreshKey: 0,
        value: {},
        hasChanges: false,
        colorBotonSave: 'primary',
        trackRecord: true,
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
        idAct_trackrecord: this.value.id, //en id se almacena el id track record (varias filas)
        idEstrategia: this.value.idEstrategia,
        fundName: this.value.fundName
      }
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
     

      //Object.assign(this.value, this.tabs[this.id].meta.value)

      if(this.tabs[this.id].name == 'activosFormMain') { //accedo desde activo
        //llamada back para recuperar dato idAct_trackrecord por si viene del tab ppal del activo.
      
        var objFilter = { 
          idActivo: this.tabs[this.id].meta.keyValue //quito idEstrategia
        }
        return this.$axios.get('activos/bd_portfolio_companies.php/findActTrackRecord', { params: objFilter })
          .then(response => {
            //recuperamos id track record 
            if (response.data.length > 0) { 
              this.value = Object.assign({}, response.data[0])
              //Object.assign(this.value, response.data[0])
              this.getDatos(this.value)
            }
          })
          .catch(error => {
            this.$q.dialog({ title: 'Error', message: error })
          })
      } 
        
          
      
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
  
  <style lang="sass" scoped>
.portfolio-grid-scroll
  :deep(<inner-selector>) .activosGrid-header-table
    min-width: 1200px
    .q-table__top,
    .q-table__bottom,
    thead tr:first-child th
      background-color: $indigo-1
    thead tr th
      position: sticky
      z-index: 1
    thead tr:first-child th
      top: 0
    &.q-table--loading thead tr:last-child th
      top: 48px
    tbody td:nth-child(1)
      position: sticky
      left: 0
      z-index: 2
      background: white
    thead tr th:nth-child(1)
      position: sticky
      left: 0
      z-index: 3
      background-color: $indigo-1
</style>
  