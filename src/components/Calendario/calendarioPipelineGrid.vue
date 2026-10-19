<template>
  <q-item class="row q-ma-xs q-pa-xs">
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
          <q-th
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
          >
            <div :style="col.style">
              {{ col.label }}
            </div>
          </q-th>
          <q-th> </q-th>
        </q-tr>
      </template>

      <template v-slot:body="props">
        <q-tr :props="props" :key="`m_${props.row.id}`"
          @mouseover="rowId=`m_${props.row.id}`"
          :class="[(props.row.id !== selectedRowID) ? '':'bg-green-1']"
          @click="selectedRowID = props.row.id">
          <q-td
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
          >
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

      
  </q-item>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { date } from 'quasar'
export default {
  props: ['filterRecord'], // en 'value' tenemos la tabla de datos del grid
  data () {
    return {
      expanded: false,
      rowId: '',
      selectedRowID: '',
      registrosSeleccionados: [],
      visible: false,
      columns: [
        { name: 'anyo0', align: 'left', label: 'Año 0', field: 'anyo0', sortable: true },
        { name: 'anyo1', align: 'left', label: 'Año 1', field: 'anyo1', sortable: true },
        { name: 'anyo2', align: 'left', label: 'Año 2', field: 'anyo2', sortable: true },
        { name: 'anyo3', align: 'left', label: 'Año 3', field: 'anyo3', sortable: true },
        { name: 'anyo4', align: 'left', label: 'Año 4', field: 'anyo4', sortable: true },

      ],
      rows: [],
      pagination: { rowsPerPage: 0 }
    }
  },
  computed: {
    ...mapState('login', ['user']),
    ...mapState('tablasAux', ['listaTipoEstancia', 'listaTipoTarifa'])
  },
  methods: {
    getRecords () {
      // a implementar
    },
    editarRecord (row, col) {
       // a implementar
    },
    guardarRecord (record) {
       // a implementar
    },
    borrarRecord (record) {
       // a implementar
    }
  },
  mounted () {
    this.getRecords()
  }
}
</script>


<style lang="sass">
.estanciasGrid-header-table
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

  td:first-child
    background-color: $orange-1
  th:first-child
    position: sticky
    left: 0
    z-index: 3
  td:first-child
    position: sticky
    left: 0
    z-index: 2

  /* this is when the loading indicator appears */
  &.q-table--loading thead tr:last-child th
    /* height of all previous header rows */
    top: 48px
</style>
