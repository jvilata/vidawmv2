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
                  {{ value.nombre ? value.nombre : 'Factura ' + value.nroFactura }}
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
                  <q-item key="print1" clickable v-close-popup @click="imprimirLiquidacion(registrosSeleccionados[0].id, 1)" >
                    <q-item-section avatar>
                      <q-icon name="brightness_5" />
                    </q-item-section>
                    <q-item-section>Regenerar liquidación</q-item-section>
                  </q-item>
                  <q-item key="excel1" clickable v-close-popup @click="exportarExcel(value.id)" >
                    <q-item-section avatar>
                      <q-icon name="table_view" />
                    </q-item-section>
                    <q-item-section>Exportar Excel</q-item-section>
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
            <div style="width: 60px">
            <!--edit icon . Decomentamos si necesitamos accion especifica de edicion -->
            <q-btn flat v-if="rowId===`m_${props.row.id}`"
              @click.stop="deleteRecord(props.row.id)"
              round
              dense
              size="sm"
              color="red"
              icon="delete"/>
              <q-btn flat v-if="rowId===`m_${props.row.id}`"
                @click.stop="imprimirLiquidacion(props.row.id, 0)"
                round
                dense
                size="sm"
                icon="print">
                <q-tooltip>Imprimir Liquidación</q-tooltip>
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
              <q-popup-edit v-if="!['user','ts'].includes(col.name)"
                v-model="props.row[col.name]"
                max-height="600px"
                buttons
                v-slot="scope"
                @save="updateRecord(props.row)">
                <!-- aqui definimos las ediciones especificas para cada columna -->
                <q-input v-model="scope.value" v-if="!['tipoOperacion','fecha','descripcion'].includes(col.name)"/>
                <q-input v-model="scope.value" v-if="['descripcion'].includes(col.name)"
                  type="textarea"
                  autofocus counter
                  @keyup.enter.stop
                  style="width: 400px;"/>
                <q-select v-if="['tipoOperacion'].includes(col.name)"
                  label="Tipo Operación"
                  v-model="scope.value"
                  :options="listaTipoOperacion"
                  option-value="codElemento"
                  option-label="codElemento"
                  emit-value
                  map-options
                />
                <wgDate v-if="['fecha'].includes(col.name)"
                  v-model="scope.value" />
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
import wgDate from 'components/General/wgDate.vue'
export default {
  props: ['id'], // en 'value' tenemos la tabla de datos del grid
  data () {
    return {
      registrosSeleccionados: [],
      value: {},
      rowId: '',
      columns: [
        { name: 'tipoOperacion', align: 'left', label: 'Tipo', field: 'tipoOperacion', sortable: true },
        { name: 'fecha', align: 'left', label: 'Fecha', field: 'fecha', sortable: true, format: val => date.formatDate(date.extractDate(val, 'YYYY-MM-DD'), 'DD-MM-YYYY'), style: 'width: 70px;' },
        { name: 'participaciones', align: 'left', label: 'NºParticip.', field: 'participaciones', sortable: true, format: val => this.$numeral(parseFloat(val)).format('0,0.000') },
        { name: 'precioUnitario', align: 'left', label: 'Prec.Unit.', field: 'precioUnitario', sortable: true, format: val => this.$numeral(parseFloat(val)).format('0,0.00') },
        { name: 'importe', align: 'left', label: 'Importe', field: 'importe', sortable: true, format: val => this.$numeral(parseFloat(val)).format('0,0.00') },
        { name: 'retencion', align: 'left', label: 'Retención', field: 'retencion', sortable: true, format: val => this.$numeral(parseFloat(val)).format('0,0.00') },
        { name: 'descripcion', align: 'left', label: 'Descripcion', field: 'descripcion', sortable: true, style: 'width: 300px; whiteSpace: normal' },
        { name: 'importeOriginal', align: 'left', label: 'Imp.Original', field: 'importeOriginal', sortable: true, format: val => this.$numeral(parseFloat(val)).format('0,0.00') },
        { name: 'fechaGeneracion', align: 'left', label: 'F.Pag/Cob', field: 'fechaGeneracion', sortable: true, format: val => (val !== null ? date.formatDate(date.extractDate(val, 'YYYY-MM-DD HH:mm:ss'), 'DD-MM-YYYY HH:mm:ss') : ''), style: 'width: 130px;' },
        { name: 'archivoDrive', align: 'left', label: 'Archivo Drive', field: 'archivoDrive', sortable: true, style: 'width: 300px; whiteSpace: normal' },
        { name: 'user', align: 'left', label: 'user', field: 'user', sortable: true },
        { name: 'ts', align: 'left', label: 'ts', field: 'ts', sortable: true, style: 'width: 130px;' }
      ],
      pagination: { rowsPerPage: 0 }
    }
  },
  computed: {
    ...mapState('login', ['user']),
    ...mapState('tabs', ['tabs']),
    ...mapState('tablasAux', ['listaTipoOperacion'])
  },
  methods: {
    formatDate (pdate) {
      return date.formatDate(date.extractDate(pdate, 'YYYY-MM-DD'), 'YYYY-MM-DD HH:mm:ss')
    },
    getRecords () {
      // se reutiliza el grid de movimientos para el form de activos y de facturas
      var objFilter = { tipoObjeto: (this.value.tipoFactura !== undefined ? 'F' : (this.value.tipoActivo !== undefined ? 'A' : 'N')), idObjeto: this.value.id }
      return this.$axios.get('movimientos/bd_movimientos.php/movimientos', { params: objFilter })
        .then(response => {
          this.registrosSeleccionados = response.data
        })
        .catch(error => {
          this.$q.dialog({ title: 'Error', message: error })
        })
    },
    addRecord (id) {
      // se reutiliza el grid de movimientos para el form de activos y de facturas
      var record = {
        codEmpresa: this.user.codEmpresa,
        // vigente: 1, // esto ha aparecido aquí y no deberia estar
        idObjeto: id,
        tipoObjeto: (this.value.tipoFactura !== undefined ? 'F' : (this.value.tipoActivo !== undefined ? 'A' : 'N')),
        tipoOperacion: (this.value.tipoFactura !== undefined ? 'PAGO' : (this.value.tipoActivo !== undefined ? 'VALORACION' : 'NOMINA')),
        importe: (this.value.tipoFactura !== undefined ? this.value.totalFactura : 0),
        descripcion: (this.value.tipoFactura !== undefined ? 'FRA ' + this.value.nroFactura + ' - ' + this.value.archivoDrive : ''),
        fechaGeneracion: null,
        fecha: date.formatDate(new Date(), 'YYYY-MM-DD 00:00:00'),
        user: this.user.user.email,
        ts: date.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss')
      }
      return this.$axios.post('movimientos/bd_movimientos.php/movimientos/', JSON.stringify(record))
        .then(response => {
          record.id = response.data.id
          this.registrosSeleccionados.push(record)
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
        return this.$axios.delete(`movimientos/bd_movimientos.php/movimientos/${id}`)
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
    updateRecord (record) {
      return this.$axios.put(`movimientos/bd_movimientos.php/movimientos/${record.id}`, JSON.stringify(record))
        .then(response => {
          return this.$axios.put(`movimientos/bd_movimientos.php/movimientos/${record.id}`, JSON.stringify(record))
            .then()
        })
        .catch(error => {
          this.$q.dialog({ title: 'Error', message: error })
        })
    },
    recalcularImportesMoneda () {
      this.$q.dialog({
        title: 'Confirmar',
        message: '¿ Desea recalcular importes ?',
        ok: true,
        cancel: true,
        persistent: true
      }).onOk(data => {
        var record = {
          codEmpresa: this.user.codEmpresa
        }
        return this.$axios.get('movimientos/bd_movimientos.php/recalcularImportesMoneda', { params: record })
          .then(response => {
            this.$q.dialog({ title: 'Aviso', message: 'Importes actualizados' })
          })
          .catch(error => {
            this.$q.dialog({ title: 'Error', message: error })
          })
      })
    },
    imprimirLiquidacion (id, regenerar) {
      var host = this.$axios.defaults.baseURL // 'https://vidawm.com/privado/php/'
      var strUrl = host + 'facturas/pdf_liquidacion.php/imprimirLiquidacion?id=' + id + '&aDisco=' + regenerar
      if (window.cordova === undefined) { // desktop
        openURL(strUrl)
      } else { // dispositivo movil
        window.cordova.InAppBrowser.open(strUrl, '_system') // openURL
      }
    },
    exportarExcel (id) {
      var sql = ''
      if (this.value.tipoActivo === 'A') { // activos
        sql = 'select activos.id,activos.nombre,activos.tipoActivo,mov.tipoOperacion,mov.fecha, ' +
        'replace(mov.participaciones,\'.\',\',\') as npartic,replace(mov.precioUnitario,\'.\',\',\') as pUnitario, ' +
        'replace(mov.importe,\'.\',\',\') as importeTotal,replace(mov.retencion,\'.\',\',\') as iretencion,mov.descripcion' +
        ' from activos left join movimientos mov on activos.id=mov.idObjeto and mov.tipoObjeto=\'A\' ' +
        ' where activos.id= ' + this.value.id
      } else { // facturas
        sql = 'select cabfacturas.tipoFactura,cabfacturas.nroFactura,cabfacturas.fecha,mov.tipoOperacion,mov.fecha, ' +
        'replace(mov.participaciones,\'.\',\',\') as npartic,replace(mov.precioUnitario,\'.\',\',\') as pUnitario, ' +
        'replace(mov.importe,\'.\',\',\') as importeTotal,replace(mov.retencion,\'.\',\',\') as iretencion,mov.descripcion' +
        ' from cabfacturas left join movimientos mov on cabfacturas.id=mov.idObjeto and mov.tipoObjeto=\'F\' ' +
        ' where cabfacturas.id= ' + this.value.id
      }

      var host = this.$axios.defaults.baseURL // 'https://vidawm.com/privado/php/'
      var strUrl = host + 'lib/exportExcel.php?SQL=' + sql + '&nompdf=movimientosObjeto.xls'
      if (window.cordova === undefined) { // desktop
        openURL(strUrl)
      } else { // dispositivo movil
        window.cordova.InAppBrowser.open(strUrl, '_system') // openURL
      }
    }
  },
  mounted () {
    Object.assign(this.value, this.tabs[this.id].meta.value)
    this.getRecords()
  },
  components: {
    wgDate: wgDate
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
