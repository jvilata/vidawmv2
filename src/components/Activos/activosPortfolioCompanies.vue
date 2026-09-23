<template>
  <div>
    <q-card flat>
      <q-card-section class="q-pa-xs">
        <q-item class="q-pa-xs bg-indigo-1 text-grey-8">
          <!-- cabecera de formulario. Botón de busqueda y cierre de tab -->
          <q-item-section avatar>
            <div class="row">
              <q-btn icon="save" class="q-ma-xs" :color="colorBotonSave" dense @click="updateRecord" />
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
    
    <!-- Añadida la clase aquí para que el :deep() de abajo funcione correctamente -->
    <portfolioGrid
      class="portfolio-grid-scroll"
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
      }
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
      this.refreshKey++
    }
  },
  watch: {
    recordToSubmit: {
      handler (val) {
        this.colorBotonSave = 'red'
        this.hasChanges = true
      },
      deep: true
    }
  },
  mounted () {
    if(this.tabs[this.id].name == 'activosFormMain') {
      var objFilter = { 
        idActivo: this.tabs[this.id].meta.keyValue
      }
      return this.$axios.get('activos/bd_portfolio_companies.php/findActTrackRecord', { params: objFilter })
        .then(response => {
          if (response.data.length > 0) { 
            this.value = Object.assign({}, response.data[0])
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
  },
  components: {
    portfolioGrid: portfolioGrid
  }
}
</script>

<style lang="sass" scoped>
.portfolio-grid-scroll
  // Obliga al contenedor de Quasar a generar scroll horizontal si la tabla supera el ancho
  :deep(.q-table__middle)
    overflow-x: auto
    max-width: 100%

  :deep(.q-table)
    min-width: 1200px
    border-collapse: separate // Crucial para que el sticky horizontal no se rompa en navegadores modernos

    thead tr th
      position: sticky
      z-index: 1
    thead tr:first-child th
      top: 0
      background-color: $indigo-1

    // --- CONGELAR PRIMERA Y SEGUNDA COLUMNA SIMULTÁNEAMENTE ---
    // Atacamos tanto al primer como al segundo hijo por si Quasar mete un checkbox oculto delante
    thead tr th:nth-child(1),
    thead tr th:nth-child(2)
      position: sticky
      left: 0
      z-index: 3
      background-color: $indigo-1 !important

    tbody tr td:nth-child(1),
    tbody tr td:nth-child(2)
      position: sticky
      left: 0
      z-index: 2
      background-color: white !important
</style>