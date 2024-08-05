<template>
    <q-item class="row">
      <!-- GRID. en row-key ponemos la columna del json que sea la id unica de la fila -->
      <q-table
        class="activosGrid-header-table"
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
            <q-th >
              <q-btn icon="more_vert"  class="q-ma-xs" color="primary" dense>
                <q-menu ref="menu1">
                  <q-list dense>
                    <q-item key="new1" clickable v-close-popup @click="addRecord" >
                      <q-item-section avatar>
                        <q-icon name="add" />
                      </q-item-section>
                      <q-item-section>Añadir Registro</q-item-section>
                    </q-item>
                    <q-item key="gene1" clickable v-close-popup @click="generarRentab" >
                      <q-item-section avatar>
                        <q-icon name="brightness_5" />
                      </q-item-section>
                      <q-item-section>Generar Rentabilidades ejercicio</q-item-section>
                    </q-item>
                    <q-item key="gene1" clickable v-close-popup @click="recalcularImportesMoneda" >
                      <q-item-section avatar>
                        <q-icon name="published_with_changes" />
                      </q-item-section>
                      <q-item-section>Recalcular importes moneda</q-item-section>
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
              <!--<q-btn flat v-if="rowId===`m_${props.row.id}`"
                @click.stop="duplicarActivo(props.row, props.row.id)"
                round
                dense
                size="sm"
                icon="file_copy">
                <q-tooltip>Duplicar</q-tooltip>
              </q-btn> -->
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
        <div class="absolute-bottom text-center q-mb-sm">
          <q-btn
            @click="addRecord()"
            round
            dense
            color="indigo-5"
            size="20px"
            icon="add">
            <q-tooltip>Añadir</q-tooltip>
          </q-btn>
        </div>
        <div>
          Pulse + para añadir
        </div>
      </template>
      <template v-slot:bottom>
        <div class="absolute-bottom text-center q-mb-sm">
          <q-btn
            @click="addRecord()"
            round
            dense
            color="indigo-5"
            size="20px"
            icon="add">
            <q-tooltip>Añadir</q-tooltip>
          </q-btn>
        </div>
        <div>
          {{ `${registrosSeleccionados.length ? registrosSeleccionados.length + ' Filas' : 'No hay registros, pulse + para añadir'}` }}
        </div>
      </template>
  
      </q-table>
    </q-item>
  </template>
  
  <script>
  import { mapState, mapActions } from 'vuex'
  import { date } from 'quasar'
  import { headerFormData, axiosInstance } from 'boot/axios.js'
  export default {
    props: ['modelValue'], // en 'value' tenemos la tabla de datos del filtro (se lanza desde estrategiasMain, en v-model="filterRecord")
    data () {
      return {
        rowId: '',
        registrosSeleccionados: [],
        columns: [
          { name: 'id', label: 'ID', align: 'left', field: 'id', sortable: true },
          { name: 'nombre', align: 'left', label: 'Nombre Estrategia', field: 'nombre', sortable: true, style: 'width: 200px; whiteSpace: normal' },
          { name: 'nombreEntidad', align: 'left', label: 'Gestor/Manager', field: 'nombreEntidad', sortable: true, style: 'width: 300px; whiteSpace: normal' },
          { name: 'tipoActivo', label: 'Tipo de Activo', align: 'left', field: 'tipoActivo', sortable: true }
        ],
        pagination: { rowsPerPage: 0 }
      }
    },
    computed: {
      ...mapState('tablasAux', ['listaSINO']),
      ...mapState('login', ['user'])
    },
    methods: {
      ...mapActions('tabs', ['addTab']),
      getRecords (filter) { //filter es lo que recojo de modelValue
        // hago la busqueda de registros segun condiciones del formulario Filter que ha lanzado el evento getRecords
        var objFilter = Object.assign({}, filter)
        
        // objFilter.estadoActivo = (objFilter.estadoActivo !== null ? objFilter.estadoActivo.join() : null) // paso de array a concatenacion de strings (join)
        return this.$axios.get('estrategias/bd_estrategias.php/findEstrategiasFilter', { params: objFilter })
          .then(response => {
            this.registrosSeleccionados = response.data
          })
          .catch(error => {
            this.$q.dialog({ title: 'Error', message: error })
          })
      },
      addRecord () {
        var record = {
          id: -1,
          nombre: 'Nueva Estrategia',
          idEntidad: '',
          codEmpresa: this.user.codEmpresa,
          tipoActivo: 'CAP.RIESGO',
          descripcion: '',
          user: this.user.user.email,
          ts: date.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss')
        }
        var formData = new FormData()
        for (var key in record) {
          formData.append(key, record[key])
        }
        
        return this.$axios.post('estrategias/bd_estrategias.php/guardarBD', formData, headerFormData)
          .then(response => {
            record.id = response.data.id
            this.registrosSeleccionados.push(record)
            this.editRecord(record, record.id)
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
          return axiosInstance.delete(`estrategias/bd_estrategias.php/findEstrategiasFilter/${id}`)
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
        this.addTab(['estrategiasFormMain', 'Estrategias-' + rowChanges.id, rowChanges, rowChanges.id])
      },
      //de momento tengo esta opcion oculta
      duplicarActivo (record, id) {
        this.$q.dialog({
          title: 'Confirmar',
          message: '¿ Duplicar este activo ?',
          ok: true,
          cancel: true,
          persistent: true
        }).onOk(() => {
          Object.assign(record, {
            nombre: 'Copy - ' + record.nombre,
            user: this.user.user.email,
            ts: date.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss')
          })
          record.id = -1 // para que inserte nuevo
          var formData = new FormData()
          for (var key in record) {
            formData.append(key, record[key])
          }
          return this.$axios.post('activos/bd_activos.php/guardarBD', formData, headerFormData)
            .then(response => {
              record.id = response.data.id
              this.registrosSeleccionados.push(record)
              var param1 = {
                id: id,
                idnew: record.id
              }
              this.$axios.get('activos/bd_activos.php/duplicarActivo', { params: param1 })
                .then(response => {
                  this.editRecord(record, record.id)
                })
            })
            .catch(error => {
              this.$q.dialog({ title: 'Error', message: error })
            })
        })
      }
    },
    mounted () {
      if (Object.keys(this.modelValue).length > 0) this.getRecords(this.modelValue)
    }
  }
  </script>

<style lang="sass">
.activosGrid-header-table
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
  