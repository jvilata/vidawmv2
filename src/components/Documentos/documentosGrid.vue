<template>
  <div>
    <q-card flat>
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
  <q-item class="row" >
    <!-- GRID. en row-key ponemos la columna del json que sea la id unica de la fila -->
    <q-table
      class="col activosGridMovimientos-header-table"
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
                  <q-item key="new1" clickable v-close-popup @click="addRecord(value.id)" >
                    <q-item-section avatar>
                      <q-icon name="add" />
                    </q-item-section>
                    <q-item-section>Añadir Registro</q-item-section>
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
            <div style="max-width: 20px">
            <!--edit icon . Decomentamos si necesitamos accion especifica de edicion -->
            <q-btn flat v-if="rowId===`m_${props.row.id}`"
              @click.stop="deleteRecord(props.row.id)"
              round
              dense
              size="sm"
              color="red"
              icon="delete"/>
            </div>
          </q-td>

          <q-td
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
          >
            <div :style="col.style" v-if="!['verDoc'].includes(col.name)">
              {{ col.value }}
            </div>
            <div :style="col.style" v-if="['verDoc'].includes(col.name) && props.row['url'] !== undefined">
              <q-btn icon="open_in_browser" color="primary" style='width:50px' @click="verDocumento(props.row)"/>
            </div>
              <q-popup-edit v-if="!['user','ts', 'tipoObjeto', 'idObjeto', 'verDoc'].includes(col.name)"
                v-model="props.row[col.name]"
                max-height="600px"
                buttons
                v-slot="scope"
                @save="updateRecord(props.row)">
                <!-- aqui definimos las ediciones especificas para cada columna -->
                <q-input v-model="scope.value"/>
              </q-popup-edit>
          </q-td>
        </q-tr>
      </template>

      <template v-slot:no-data>
        <div class="absolute-bottom q-mb-sm" style="left: 45vw">
          <q-btn
            @click.stop="addRecord(value.id)"
            round
            dense
            color="primary"
            size="20px"
            icon="add"/>
        </div>
        <div>
          No hay registros, pulse el botón + para añadir
        </div>
      </template>

      <template v-slot:bottom>
        <div class="absolute-bottom q-mb-sm" style="left: 45vw">
          <q-btn
            @click.stop="addRecord(value.id)"
            round
            dense
            color="primary"
            size="20px"
            icon="add"/>
        </div>
        <div>
          {{ registrosSeleccionados.length }} Filas
        </div>
      </template>

    </q-table>
  </q-item>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { date, openURL } from 'quasar'
export default {
  props: ['id'], // en 'value' tenemos la tabla de datos del grid
  data () {
    return {
      registrosSeleccionados: [],
      value: {},
      rowId: '',
      columns: [
        { name: 'asunto', align: 'left', label: 'Asunto Documento', field: 'asunto', sortable: true, style: 'width: 300px; whiteSpace: normal' },
        { name: 'url', align: 'left', label: 'URL', field: 'url', sortable: true, style: 'width: 300px; whiteSpace: normal' },
        { name: 'verDoc', align: 'left', label: 'Ver Doc.', field: 'verDoc' },
        { label: 'Tipo Obj', field: 'tipoObjeto', name: 'tipoObjeto' },
        { label: 'Id Obj.', field: 'idObjeto', name: 'idObjeto' },
        { name: 'user', align: 'left', label: 'user', field: 'user', sortable: true },
        { name: 'ts', align: 'left', label: 'ts', field: 'ts', sortable: true }
      ],
      pagination: { rowsPerPage: 0 }
    }
  },
  computed: {
    ...mapState('login', ['user']),
    ...mapState('tabs', ['tabs'])
  },
  methods: {
    formatDate (pdate) {
      return date.formatDate(date.extractDate(pdate, 'YYYY-MM-DD'), 'YYYY-MM-DD HH:mm:ss')
    },
    getRecords () {
      // se reutiliza el grid de movimientos para el form de activos y de facturas
      var objFilter = { tipoObjeto: (this.value.tipoFactura !== undefined ? 'F' : (this.value.tipoActivo !== undefined ? 'A' : (this.value.tipoEntidad !== undefined ? 'E' : 'N'))), idObjeto: this.value.id }
      return this.$axios.get('documentos/bd_documentos.php/documentos', { params: objFilter })
        .then(response => {
          this.registrosSeleccionados = response.data
        })
        .catch(error => {
          this.$q.dialog({ title: 'Error', message: error.message })
        })
    },
    addRecord (id) {
      // se reutiliza el grid de movimientos para el form de activos y de facturas
      var record = {
        codEmpresa: this.user.codEmpresa,
        idObjeto: id,
        tipoObjeto: (this.value.tipoFactura !== undefined ? 'F' : (this.value.tipoActivo !== undefined ? 'A' : (this.value.tipoEntidad !== undefined ? 'E' : 'N'))),
        asunto: 'nuevo documento',
        url: '',
        user: this.user.user.email,
        ts: date.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss')
      }
      return this.$axios.post('documentos/bd_documentos.php/documentos', JSON.stringify(record))
        .then(response => {
          record.id = response.data.id
          this.registrosSeleccionados.push(record)
        })
        .catch(error => {
          this.$q.dialog({ title: 'Error', message: error.message })
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
        return this.$axios.delete(`documentos/bd_documentos.php/documentos/${id}`)
          .then(response => {
            var index = this.registrosSeleccionados.findIndex(function (record) { // busco elemento del array con este id
              if (record.id === id) return true
            })
            this.registrosSeleccionados.splice(index, 1) // lo elimino del array
          })
          .catch(error => {
            this.$q.dialog({ title: 'Error', message: error.message })
          })
      })
    },
    updateRecord (record) {
      return this.$axios.put(`documentos/bd_documentos.php/documentos/${record.id}`, JSON.stringify(record))
        .then(response => {
          return this.$axios.put(`documentos/bd_documentos.php/documentos/${record.id}`, JSON.stringify(record))
          .then()
        })
        .catch(error => {
          this.$q.dialog({ title: 'Error', message: error.message })
        })
    },
    verDocumento (record) {
      if (record.url !== '' && record.url !== null) { // se podría comprobar que record.tipoOperacion==='NOMINA' porque si es pago no suele haber doc
        var strUrl = record.url
        if (window.cordova === undefined) { // desktop
          openURL(strUrl)
        } else { // estamos en un disp movil
          window.cordova.InAppBrowser.open(strUrl, '_system') // openURL
        }
      }
    }
  },
  mounted () {
    Object.assign(this.value, this.tabs[this.id].meta.value)
    this.getRecords()
  }
}
</script>
<style lang="sass">
.activosGridMovimientos-header-table
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
