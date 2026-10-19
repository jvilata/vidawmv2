<template>
    <q-item class="row">
      <div class="portfolio-grid-scroll">
        <q-table
          class="activosGrid-header-table"
          virtual-scroll
          :pagination="pagination"
          :rows-per-page-options="[0]"
          :virtual-scroll-sticky-size-start="48"
          row-key="id"
          :rows="registrosSeleccionados"
          :columns="columns"
          table-style="max-height: 66vh; max-width: 96vw"
          wrap-cells
          style="table-layout: auto; width: 100%"
        >
          <template v-slot:top-right>
            <q-btn v-if="this.trackRecord" color="blue-8" icon="content_copy" label="Copy LTM → Last" no-caps @click="copyLtmToLast" class="q-mr-sm" />
            <q-btn color="teal-7" icon="analytics" label="Generar informe" no-caps @click="generarInforme" class="q-mr-sm" />
            <q-btn color="indigo" icon="archive" label="Exportar a Excel" no-caps @click="exportarExcel" />
          </template>

          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th v-if="this.trackRecord"></q-th>
              <q-th v-for="col in props.cols" :key="col.name" :props="props"
                :style="col.headerStyle">
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>

          <template v-slot:body="props">
            <q-tr :props="props" :key="`m_${props.row.id}`" @mouseover="rowId=`m_${props.row.id}`"
              :class="{ 'row-desinvertida': isDesinvertida(props.row) }">
              <q-td v-if="this.trackRecord">
                <div style="min-width:30px;display:flex;align-items:center;gap:2px">
                  <q-icon v-if="isDesinvertida(props.row)"
                    name="check_circle" color="blue-grey-4" size="16px">
                    <q-tooltip>Desinvertida · {{ (props.row.fechaDesinversion || '').substring(0,10) }}</q-tooltip>
                  </q-icon>
                  <q-btn flat v-if="rowId===`m_${props.row.id}`"
                    @click.stop="deleteRecord(props.row.id)"
                    round dense size="sm" color="red" icon="delete">
                    <q-tooltip>Borrar</q-tooltip>
                  </q-btn>
                </div>
              </q-td>

              <!-- ↓ :class aplica el borde directamente al <td>, no al div interno -->
              <q-td v-for="col in props.cols" :key="col.name" :props="props"
                :class="{ 'col-group-sep': ['revenueCurrent','lastRevenues','revenueIni'].includes(col.name) }">
                <div :style="col.style">
                  <div v-if="['fundName', 'nombre'].includes(col.name) && !this.trackRecord" @click="clickColumn(col.name, props.row)">{{ col.value }}</div>
                  <div v-if="['fundName', 'nombre'].includes(col.name) && this.trackRecord">{{ col.value }}</div>
              <!--   <div v-if="['ebitdaCurrentAbs'].includes(col.name)"
                    :style="parseFloat(props.row.ebitdaCurrentAbs) >= parseFloat(props.row.ebitdaIniAbs)
                      ? (props.row.ebitdaCurrentAbs == props.row.ebitdaIniAbs ? 'background:orange;color:white' : 'background:green;color:white')
                      : 'background:red;color:white'">{{ col.value }}</div>
                  <div v-if="['revenueCurrent'].includes(col.name)"
                    :style="parseFloat(props.row.revenueCurrent) >= parseFloat(props.row.revenueIni)
                      ? (props.row.revenueCurrent == props.row.revenueIni ? 'background:orange;color:white' : 'background:green;color:white')
                      : 'background:red;color:white'">{{ col.value }}</div>
                  --> 
                      <div v-if="['ebitdaCurrentAbs'].includes(col.name)"
                        :style="compareStyle(props.row.ebitdaCurrentAbs, props.row.lastEbitda, props.row.ebitdaIniAbs)">{{ col.value }}</div>
                      <div v-if="['revenueCurrent'].includes(col.name)"
                        :style="compareStyle(props.row.revenueCurrent, props.row.lastRevenues, props.row.revenueIni)">{{ col.value }}</div>
                  <div v-if="!['ebitdaCurrentAbs','revenueCurrent','fundName','nombre'].includes(col.name)">{{ col.value }}</div>
                </div>
                <div :style="col.style" v-if="['verDoc'].includes(col.name) && props.row['url']">
                  <q-btn icon="open_in_browser" color="primary" style="width:50px" @click="verDocumento(props.row)"/>
                </div>
                <q-popup-edit v-if="this.trackRecord && !['fundName','verDoc'].includes(col.name)"
                  v-model="props.row[col.name]"
                  v-slot="scope"
                  max-height="600px"
                  buttons auto-save
                  @save="(val) => onPopupSave(props.row, col.name, val)">

                  <q-input v-if="['nombre','ownership','ebitdaCurrent','ebitdaCurrentAbs','revenueCurrent','debtCurrent','grossmult','investedCapital','revenueIni','ebitdaIniAbs','ebitdaIni','debtEbitdaIni','lastRevenues','lastEbitda','lastNetDebt','lastGrossMult'].includes(col.name)"
                    v-model="scope.value" />

                  <q-select v-if="col.name === 'ltmUpdateDate'"
                    outlined label="LTM Update Date" stack-label
                    v-model="scope.value"
                    :options="listaQuarters"
                    clearable emit-value
                    @update:model-value="v => handleDateSelect('ltmUpdateDate', props.row, v)" />

                  <q-select v-if="col.name === 'lastUpdateDate'"
                    outlined label="Last Update Date" stack-label
                    v-model="scope.value"
                    :options="listaQuarters"
                    clearable emit-value
                    @update:model-value="v => handleDateSelect('lastUpdateDate', props.row, v)" />

                  <q-input v-if="['fundName'].includes(col.name)" readonly v-model="scope.value" />
                  <q-input v-if="['comentario'].includes(col.name)" type="textarea" v-model="scope.value" autogrow />
                  <q-input v-if="['url'].includes(col.name)"        type="textarea" v-model="scope.value" autogrow />

                  <q-select v-if="['geografia'].includes(col.name)"
                    outlined clearable label="Geografía" stack-label
                    v-model="scope.value" :options="listaGeografias"
                    option-value="codElemento" option-label="codElemento" emit-value />
                  <q-select v-if="['sector'].includes(col.name)"
                    outlined clearable label="Sector" stack-label
                    v-model="scope.value" :options="listaSectores"
                    option-value="codElemento" option-label="codElemento" emit-value />
                  <q-select v-if="['subsector'].includes(col.name)"
                    outlined clearable label="Sub-Sector" stack-label
                    v-model="scope.value" :options="listaSubSectores"
                    option-value="codElemento" option-label="codElemento" emit-value />
                  <q-select v-if="['divisa'].includes(col.name)"
                    outlined clearable label="Currency" stack-label
                    v-model="scope.value" :options="listaDivisasPortfolio"
                    option-value="codElemento" option-label="codElemento" emit-value />
                  <q-select v-if="['crossTransaction'].includes(col.name)"
                    class="col-xs-6 col-sm-2" label="Cross-Transaction"
                    v-model="scope.value" :options="listaSINO"
                    option-value="id" option-label="desc" emit-value map-options />
                  <wgDate v-if="['fechaInversion'].includes(col.name)"   v-model="scope.value" clearable />
                  <wgDate v-if="['fechaDesinversion'].includes(col.name)" v-model="scope.value" clearable />
                </q-popup-edit>
              </q-td>
            </q-tr>
          </template>

          <template v-if="this.trackRecord" v-slot:no-data>
            <div class="absolute-bottom text-center q-mb-sm">
              <q-btn @click="addRecord()" round dense color="indigo-5" size="20px" icon="add">
                <q-tooltip>Añadir</q-tooltip>
              </q-btn>
            </div>
            <div>Pulse + para añadir</div>
          </template>

          <template v-slot:bottom>
            <div v-if="this.trackRecord" class="absolute-bottom text-center q-mb-sm">
              <q-btn @click="addRecord()" round dense color="indigo-5" size="20px" icon="add">
                <q-tooltip>Añadir</q-tooltip>
              </q-btn>
            </div>
            <div>{{ registrosSeleccionados.length ? registrosSeleccionados.length + ' Filas' : 'No hay registros, pulse + para añadir' }}</div>
          </template>

        </q-table>
      </div>
    </q-item>
</template>

<script>
import * as XLSX from 'xlsx'
import { mapState, mapActions } from 'vuex'
import { date, openURL } from 'quasar'
import wgDate from 'components/General/wgDate.vue'
import { headerFormData } from 'boot/axios.js'

export default {
  props: ['id', 'value', 'trackRecord'],
  data () {
    return {
      rowId: '',
      trackRecordR: '',
      listaMonedasFilter: [],
      registrosSeleccionados: [],
      columns: [
        { name: 'nombre',           align: 'left', label: 'Portfolio Company Name', field: 'nombre',           fixed: 'left', sortable: true, style: 'width:200px;whiteSpace:normal' },
        { name: 'verDoc',           align: 'left', label: 'WEB',                    field: 'verDoc',           style: 'min-width:50px' },
        { name: 'fundName',         align: 'left', label: 'Fund Name',              field: 'fundName',         sortable: true, style: 'width:150px;whiteSpace:normal' },
        { name: 'geografia',        align: 'left', label: 'Geografía',              field: 'geografia',        sortable: true, style: 'width:150px;whiteSpace:normal' },
        { name: 'sector',           align: 'left', label: 'General Sector',         field: 'sector',           sortable: true, style: 'width:150px' },
        { name: 'subsector',        align: 'left', label: 'Sub-Sector',             field: 'subsector',        sortable: true, style: 'width:150px' },
        { name: 'divisa',           align: 'left', label: 'Currency',               field: 'divisa',           sortable: true, style: 'width:70px' },
        { name: 'ownership',        align: 'left', label: 'Ownership (%)',           field: 'ownership',        sortable: true },
        { name: 'investedCapital',  align: 'left', label: 'Invested Capital',        field: 'investedCapital',  sortable: true },
        { name: 'fechaInversion',   align: 'left', label: 'Investment Date',        field: 'fechaInversion',   sortable: true,
          format: val => val !== null ? date.formatDate(date.extractDate(val, 'YYYY-MM-DD HH:mm:ss'), 'MM/YYYY') : '' },
        // ── LTM ── separador aplicado via clase CSS en <td>, headerStyle en <th>
        { name: 'revenueCurrent',   align: 'left', label: 'LTM Revenue (abs)',      field: 'revenueCurrent',   sortable: true, headerStyle: 'border-left:3px solid #78909c;background:#e3f2fd' },
        { name: 'ebitdaCurrentAbs', align: 'left', label: 'LTM EBITDA (abs)',       field: 'ebitdaCurrentAbs', sortable: true, headerStyle: 'background:#e3f2fd' },
        { name: 'ebitdaCurrent',    align: 'left', label: 'LTM EV/EBITDA',          field: 'ebitdaCurrent',    sortable: true, headerStyle: 'background:#e3f2fd' },
        { name: 'debtCurrent',      align: 'left', label: 'LTM Debt/EBITDA',        field: 'debtCurrent',      sortable: true, headerStyle: 'background:#e3f2fd' },
        { name: 'grossmult',        align: 'left', label: 'Gross mult.',             field: 'grossmult',        sortable: true, headerStyle: 'background:#e3f2fd' },
        { name: 'ltmUpdateDate',    align: 'left', label: 'LTM Update Date',        field: 'ltmUpdateDate',    sortable: true, style: 'width:120px', headerStyle: 'background:#e3f2fd' },
        // ── LAST ──
        { name: 'lastRevenues',     align: 'left', label: 'Last Revenue (abs)',      field: 'lastRevenues',     sortable: true, headerStyle: 'border-left:3px solid #78909c;background:#e0f2f1' },
        { name: 'lastEbitda',       align: 'left', label: 'Last EBITDA (abs)',       field: 'lastEbitda',       sortable: true, headerStyle: 'background:#e0f2f1' },
        { name: 'lastNetDebt',      align: 'left', label: 'Last Net Debt/EBITDA',    field: 'lastNetDebt',      sortable: true, headerStyle: 'background:#e0f2f1' },
        { name: 'lastGrossMult',    align: 'left', label: 'Last Gross mult.',        field: 'lastGrossMult',    sortable: true, headerStyle: 'background:#e0f2f1' },
        { name: 'lastUpdateDate',   align: 'left', label: 'Last Update Date',        field: 'lastUpdateDate',   sortable: true, style: 'width:120px', headerStyle: 'background:#e0f2f1' },
        // ── ENTRY ──
        { name: 'revenueIni',       align: 'left', label: 'ENTRY Revenue (abs)',     field: 'revenueIni',       sortable: true, headerStyle: 'border-left:3px solid #78909c;background:#fff8e1' },
        { name: 'ebitdaIniAbs',     align: 'left', label: 'ENTRY EBITDA (abs)',      field: 'ebitdaIniAbs',     sortable: true, headerStyle: 'background:#fff8e1' },
        { name: 'ebitdaIni',        align: 'left', label: 'ENTRY EV/EBITDA',         field: 'ebitdaIni',        sortable: true, headerStyle: 'background:#fff8e1' },
        { name: 'debtEbitdaIni',    align: 'left', label: 'ENTRY Debt/EBITDA',       field: 'debtEbitdaIni',    sortable: true, headerStyle: 'background:#fff8e1' },
        { name: 'fechaDesinversion', align: 'left', label: 'Divestment Date',        field: 'fechaDesinversion', sortable: true,
          format: val => (val !== null) ? ((val !== '0000-00-00 00:00:00') ? date.formatDate(date.extractDate(val, 'YYYY-MM-DD HH:mm:ss'), 'MM/YYYY') : '') : '' },
        { name: 'crossTransaction', align: 'left', label: 'CrossTransaction',        field: 'crossTransaction', sortable: true,
          format: val => { var obj = this.listaSINO.find(x => x.id == val); return (obj !== undefined ? obj.desc : val) } },
        { name: 'comentario', align: 'left', label: 'Observations', field: 'comentario', sortable: true, style: 'min-width:200px;max-width:500px;white-space:normal;word-break:break-word', headerStyle: 'max-width:500px' },
        { name: 'url',        align: 'left', label: 'URL',          field: 'url',         sortable: true, style: 'min-width:200px;max-width:500px;white-space:normal', headerStyle: 'max-width:500px' }
      ],
      pagination: { rowsPerPage: 0 }
    }
  },

  computed: {
    ...mapState('tablasAux', ['listaSINO', 'listaTiposProducto', 'listaGeografias', 'listaSectores', 'listaSubSectores', 'listaMonedas', 'listaDivisasPortfolio']),
    ...mapState('login', ['user']),

    listaQuarters () {
      const qs = ['Q1', 'Q2', 'Q3', 'Q4']
      const y  = new Date().getFullYear()
      const opts = []
      for (let a = y - 2; a <= y + 3; a++) {
        qs.forEach(q => opts.push(`${q} ${a}`))
      }
      return opts
    }
  },

  methods: {
    ...mapActions('tabs', ['addTab']),
    ...mapActions('tablasAux', ['loadGeografias', 'loadSectores', 'loadSubSectores']),

    compareStyle (current, last, entry) {
      const c = parseFloat(current)
      if (isNaN(c)) return ''
      const refs = [last, entry].map(v => parseFloat(v)).filter(v => !isNaN(v))
      if (refs.length === 0) return ''
      const esRojo  = refs.some(v => c < v)
      const esVerde = refs.every(v => c > v)
      if (esRojo)  return 'background:red;color:white'
      if (esVerde) return 'background:green;color:white'
      return 'background:orange;color:white'   // igual a uno de los dos, pero no menor que ninguno
    },


    isDesinvertida (row) {
      return !!(row.fechaDesinversion &&
                row.fechaDesinversion !== '0000-00-00 00:00:00' &&
                row.fechaDesinversion !== '' &&
                row.fechaDesinversion !== null)
    },

    getRecords (filter) {
      var objFilter = Object.assign({}, filter)
      return this.$axios.get('activos/bd_portfolio_companies.php/findPortfolioCompaniesFilter', { params: objFilter })
        .then(response => { this.registrosSeleccionados = response.data })
        .catch(error   => { this.$q.dialog({ title: 'Error', message: error }) })
    },

    clickColumn (colName, row) {
      var copia = {}
      var copiaRow = {}
      copia.idAct_trackrecord = row.idAct_trackrecord
      if (colName === ('fundName' || 'nombre')) {
        return this.$axios.get('activos/bd_portfolio_companies.php/getActivoFromPortComp', { params: copia })
          .then(response => {
            copiaRow = response.data[0]
            this.addTab(['activosFormMain', 'Activo-' + copiaRow.id, copiaRow, copiaRow.id])
          })
          .catch(error => { this.$q.dialog({ title: 'Error', message: error }) })
      }
    },

    addRecord () {
      var record = {
        id: -1, nombre: 'New Company', codEmpresa: this.user.codEmpresa,
        idEstrategia: this.value.idEstrategia, idAct_trackrecord: this.value.idAct_trackrecord,
        geografia: '', sector: '', subsector: '', ownership: '',
        fechaInversion: date.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'), fechaDesinversion: null,
        revenueCurrent: '', ebitdaCurrentAbs: '', ebitdaCurrent: '', debtCurrent: '',
        ltmUpdateDate: '', grossmult: '', investedCapital: 0,
        lastRevenues: '', lastEbitda: '', lastNetDebt: '', lastGrossMult: '', lastUpdateDate: '',
        revenueIni: 0, ebitdaIniAbs: '', debtEbitdaIni: '', crossTransaction: '0', url: ''
      }
      var formData = new FormData()
      for (var key in record) {
        // No enviar null/undefined — FormData los convierte al string "null" que rompe MySQL
        if (record[key] !== null && record[key] !== undefined) {
          formData.append(key, record[key])
        }
      }
      return this.$axios.post('activos/bd_portfolio_companies.php/guardarBD', formData, headerFormData)
        .then(response => {
          record.id = response.data.id
          record.fundName = this.value.fundName
          this.registrosSeleccionados.push(record)
        })
        .catch(error => { this.$q.dialog({ title: 'Error', message: error }) })
    },

    updateRecord (record) {
      // Usar POST con FormData — el PHP guardarBD lee $_REQUEST que solo funciona con FormData.
      // El PUT con JSON va a execStandardMethod que no procesa correctamente los campos nuevos.
      var tmp = {}
      Object.assign(tmp, record)
      delete tmp.fundName
      delete tmp.estrategiaNombre

      var formData = new FormData()
      for (var key in tmp) {
        if (tmp[key] !== null && tmp[key] !== undefined) {
          formData.append(key, tmp[key])
        }
      }
      return this.$axios.post('activos/bd_portfolio_companies.php/guardarBD', formData, headerFormData)
        .catch(error => { this.$q.dialog({ title: 'Error', message: error }) })
    },

    deleteRecord (id) {
      this.$q.dialog({ title: 'Confirmar', message: '¿ Desea borrar esta Compañía ?', ok: true, cancel: true, persistent: true })
        .onOk(() => {
          return this.$axios.delete(`activos/bd_portfolio_companies.php/findPortfolioCompaniesFilter/${id}`)
            .then(response => {
              var index = this.registrosSeleccionados.findIndex(r => r.id === id)
              this.registrosSeleccionados.splice(index, 1)
            })
            .catch(error => { this.$q.dialog({ title: 'Error', message: error }) })
        })
    },

    verDocumento (record) {
      if (record.url !== '' && record.url !== null) {
        if (window.cordova === undefined) { openURL(record.url) }
        else { window.cordova.InAppBrowser.open(record.url, '_system') }
      }
    },

    onPopupSave (record, fieldName, val) {
      if (val !== undefined && val !== null) record[fieldName] = val
      this.updateRecord(record)
    },

    handleDateSelect (fieldName, row, val) {
      if (!val) return
      row[fieldName] = val
      this.updateRecord(row)
      this.propagateDateField(fieldName, val)
    },

    propagateDateField (field, value) {
      const idAct = this.value.idAct_trackrecord
      if (!idAct || !value) { console.warn('[propagateDateField] aborted — idAct:', idAct, 'value:', value); return }
      this.registrosSeleccionados.forEach(r => { r[field] = value })
      const formData = new FormData()
      formData.append('idAct_trackrecord', idAct)
      formData.append('field',             field)
      formData.append('value',             value)
      formData.append('codEmpresa',        this.user.codEmpresa)
      this.$axios.post('activos/bd_portfolio_companies.php/updateDateForAll', formData)
        .catch(error => { this.$q.dialog({ title: 'Error al propagar fecha', message: String(error) }) })
    },

    copyLtmToLast () {
      this.$q.dialog({
        title: 'Confirmar',
        message: '¿Copiar datos LTM a Last para TODAS las empresas de este fondo?',
        ok: { label: 'Copiar', color: 'blue-8' },
        cancel: { label: 'Cancelar', flat: true },
        persistent: true
      }).onOk(() => {
        this.registrosSeleccionados.forEach(r => {
          r.lastRevenues   = r.revenueCurrent
          r.lastEbitda     = r.ebitdaCurrentAbs
          r.lastNetDebt    = r.debtCurrent
          r.lastGrossMult  = r.grossmult
          r.lastUpdateDate = r.ltmUpdateDate
          this.updateRecord(r)
        })
        this.$q.notify({ type: 'positive', message: 'LTM copiado a Last para todas las empresas' })
      })
    },

    generarInforme () {
      const datos = this.registrosSeleccionados
      if (!datos || datos.length === 0) {
        this.$q.notify({ type: 'warning', message: 'No hay datos para generar el informe' })
        return
      }
      const html = this._buildReportHTML(datos)
      const w    = window.open('', '_blank')
      w.document.write(html)
      w.document.close()
    },

    _buildReportHTML (datos) {
      const datosJSON = JSON.stringify(datos)
      const fundName  = datos[0]?.fundName || 'Portfolio'
      const hoy       = new Date().toLocaleDateString('es-ES')
      return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Portfolio Report — ${fundName}</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"><\/script>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',Arial,sans-serif;background:#f0f2f8;color:#222}
  header{background:#075380;color:#fff;padding:20px 36px;display:flex;align-items:center;justify-content:space-between}
  header h1{font-size:22px;font-weight:700;letter-spacing:.3px}
  header .sub{font-size:12px;opacity:.7;margin-top:4px}
  .container{max-width:1400px;margin:0 auto;padding:28px 20px}
  .section-title{font-size:16px;font-weight:700;color:#075380;border-left:3px solid #0a6fa8;padding-left:10px;margin:32px 0 16px}
  .kpis{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:8px}
  .kpi{background:#fff;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,.08);padding:14px 22px;flex:1;min-width:140px}
  .kpi .lbl{font-size:10px;color:#546e7a;text-transform:uppercase;letter-spacing:.6px}
  .kpi .val{font-size:22px;font-weight:700;color:#075380;margin-top:4px}
  .grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin-bottom:10px}
  @media(max-width:1100px){.grid4{grid-template-columns:1fr 1fr}}
  @media(max-width:700px){.grid4{grid-template-columns:1fr}}
  .chart-card{background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.08);padding:18px;overflow:hidden}
  .chart-card h3{font-size:13px;font-weight:700;color:#075380;margin-bottom:12px}
  .evo-wrap{background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.08);padding:18px;margin-bottom:18px;overflow-x:auto}
  .evo-wrap h3{font-size:13px;font-weight:700;color:#075380;margin-bottom:12px}
  .evo-wrap canvas{min-width:600px}
  .tbl-wrap{background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.08);overflow:hidden;margin-bottom:24px}
  table{width:100%;border-collapse:collapse;font-size:12px}
  thead{background:#075380;color:#fff}
  th{padding:10px 12px;text-align:left;white-space:nowrap}
  td{padding:8px 12px;border-bottom:1px solid #eee;white-space:nowrap}
  tr:hover td{background:#f5f6ff}
  .pos{color:#2e7d32;font-weight:700}.neg{color:#c62828;font-weight:700}.neu{color:#e65100;font-weight:700}.na{color:#bbb}
  .badge{display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600}
  .badge-eur{background:#e3f0f8;color:#075380}.badge-usd{background:#e0f2f1;color:#00695c}
<\/style>
</head>
<body>
<header>
  <div><h1>📊 Portfolio Report — ${fundName}</h1><div class="sub">Generado: ${hoy} · ${datos.length} compañías</div></div>
  <div style="font-size:12px;opacity:.7">VidaWM</div>
</header>
<div class="container">
  <div class="section-title">Resumen</div>
  <div class="kpis" id="kpis"></div>
  <div class="section-title">Diversificación</div>
  <div class="grid4">
    <div class="chart-card"><h3>📊 Por Sector</h3><canvas id="cSector"></canvas></div>
    <div class="chart-card"><h3>🔍 Por Sub-Sector</h3><canvas id="cSubsector"></canvas></div>
    <div class="chart-card"><h3>🌍 Por Geografía</h3><canvas id="cGeo"></canvas></div>
    <div class="chart-card"><h3>💱 Exposición Moneda</h3><canvas id="cMoneda"></canvas></div>
  </div>
  <div class="section-title">Evolución Financiera por Empresa (Entry → Last → LTM)</div>
  <div class="evo-wrap"><h3>📈 Revenue (abs)</h3><canvas id="cRevenue"></canvas></div>
  <div class="evo-wrap"><h3>📈 EBITDA (abs)</h3><canvas id="cEbitda"></canvas></div>
  <div class="evo-wrap"><h3>📉 Net Debt / EBITDA</h3><canvas id="cDebt"></canvas></div>
  <div class="evo-wrap"><h3>✖ Gross Multiple</h3><canvas id="cGross"></canvas></div>
  <div class="section-title">Variación % Entry → LTM</div>
  <div class="tbl-wrap">
    <table>
      <thead><tr>
        <th>Empresa</th><th>Fondo</th><th>Moneda</th>
        <th>Rev: Entry→Last</th><th>Rev: Last→LTM</th><th>Rev: Entry→LTM</th>
        <th>EBITDA: Entry→Last</th><th>EBITDA: Last→LTM</th><th>EBITDA: Entry→LTM</th>
        <th>ND/EBITDA: Entry→Last</th><th>ND/EBITDA: Last→LTM</th>
        <th>Gross Mult: Last→LTM</th>
      </tr></thead>
      <tbody id="tblBody"></tbody>
    </table>
  </div>
</div>
<script>
const DATOS=${datosJSON}
const pct=(a,b)=>(a&&b&&parseFloat(b)!==0)?((parseFloat(a)-parseFloat(b))/Math.abs(parseFloat(b))*100).toFixed(1):null
const fmtPct=v=>{if(v===null)return '<span class="na">—</span>';const n=parseFloat(v);const cls=n>5?'pos':n<-5?'neg':'neu';return '<span class="'+cls+'">'+(n>=0?'+':'')+v+'%</span>'}
const INDIGO=['#075380','#0a6fa8','#0e8fd4','#0d6e6e','#11918f','#15b5b2','#2d6a4f','#40916c','#74c69d','#6a3d9a','#9b59b6','#c39bd3','#c0392b','#e74c3c','#f1948a','#d68910','#f39c12','#f8c471']
const TEAL=['#15b5b2','#11918f','#0d6e6e','#40916c','#2d6a4f','#1b4332','#e67e22','#d35400','#a04000','#8e44ad','#6c3483','#512e5f','#2874a6','#1a5276','#154360','#c0392b','#922b21','#641e16']
const agrupar=key=>{const m={};DATOS.forEach(d=>{const k=d[key]||'N/D';m[k]=(m[k]||0)+1});return m}
const totalInvested=DATOS.reduce((a,d)=>a+(parseFloat(d.investedCapital)||0),0)
const avgGross=DATOS.filter(d=>d.grossmult).reduce((a,d,_,arr)=>a+parseFloat(d.grossmult)/arr.length,0)
const nEUR=DATOS.filter(d=>(d.divisa||'').toUpperCase()==='EUR').length
const nUSD=DATOS.filter(d=>(d.divisa||'').toUpperCase()==='USD').length
document.getElementById('kpis').innerHTML=[
  {lbl:'Compañías',val:DATOS.length},
  {lbl:'Capital invertido',val:totalInvested.toLocaleString('es-ES',{maximumFractionDigits:0})+' M'},
  {lbl:'Avg Gross Mult',val:avgGross.toFixed(2)+'x'},
  {lbl:'En EUR',val:nEUR+' ('+Math.round(nEUR/DATOS.length*100)+'%)'},
  {lbl:'En USD',val:nUSD+' ('+Math.round(nUSD/DATOS.length*100)+'%)'},
].map(k=>'<div class="kpi"><div class="lbl">'+k.lbl+'</div><div class="val">'+k.val+'</div></div>').join('')
const donut=(id,map,palette)=>{const labels=Object.keys(map);const values=Object.values(map);new Chart(document.getElementById(id),{type:'doughnut',data:{labels,datasets:[{data:values,backgroundColor:labels.map((_,i)=>palette[i%palette.length]),borderWidth:2,borderColor:'#fff'}]},options:{responsive:true,cutout:'60%',plugins:{legend:{position:'bottom',labels:{font:{size:10},boxWidth:12}}}}})}
donut('cSector',agrupar('sector'),INDIGO)
donut('cSubsector',agrupar('subsector'),TEAL)
donut('cGeo',agrupar('geografia'),[...INDIGO,...TEAL])
donut('cMoneda',agrupar('divisa'),['#075380','#11918f','#d68910','#c0392b'])
const empresas=DATOS.map(d=>(d.nombre||'').substring(0,18))
const barChart=(id,entry,last,ltm)=>new Chart(document.getElementById(id),{type:'bar',data:{labels:empresas,datasets:[{label:'Entry',data:entry,backgroundColor:'#d68910',borderRadius:4},{label:'Last',data:last,backgroundColor:'#0a6fa8',borderRadius:4},{label:'LTM',data:ltm,backgroundColor:'#11918f',borderRadius:4}]},options:{responsive:true,plugins:{legend:{position:'top'}},scales:{x:{ticks:{font:{size:10}}},y:{ticks:{font:{size:10}}}}}})
barChart('cRevenue',DATOS.map(d=>parseFloat(d.revenueIni)||0),DATOS.map(d=>parseFloat(d.lastRevenues)||0),DATOS.map(d=>parseFloat(d.revenueCurrent)||0))
barChart('cEbitda',DATOS.map(d=>parseFloat(d.ebitdaIniAbs)||0),DATOS.map(d=>parseFloat(d.lastEbitda)||0),DATOS.map(d=>parseFloat(d.ebitdaCurrentAbs)||0))
barChart('cDebt',DATOS.map(d=>parseFloat(d.debtEbitdaIni)||0),DATOS.map(d=>parseFloat(d.lastNetDebt)||0),DATOS.map(d=>parseFloat(d.debtCurrent)||0))
barChart('cGross',DATOS.map(()=>null),DATOS.map(d=>parseFloat(d.lastGrossMult)||0),DATOS.map(d=>parseFloat(d.grossmult)||0))
document.getElementById('tblBody').innerHTML=DATOS.map(d=>{const divisa=(d.divisa||'EUR').toUpperCase();const badge='<span class="badge badge-'+divisa.toLowerCase()+'">'+divisa+'</span>';return '<tr><td><strong>'+(d.nombre||'')+'</strong></td><td style="color:#666">'+(d.fundName||'')+'</td><td>'+badge+'</td><td>'+fmtPct(pct(d.lastRevenues,d.revenueIni))+'</td><td>'+fmtPct(pct(d.revenueCurrent,d.lastRevenues))+'</td><td>'+fmtPct(pct(d.revenueCurrent,d.revenueIni))+'</td><td>'+fmtPct(pct(d.lastEbitda,d.ebitdaIniAbs))+'</td><td>'+fmtPct(pct(d.ebitdaCurrentAbs,d.lastEbitda))+'</td><td>'+fmtPct(pct(d.ebitdaCurrentAbs,d.ebitdaIniAbs))+'</td><td>'+fmtPct(pct(d.lastNetDebt,d.debtEbitdaIni))+'</td><td>'+fmtPct(pct(d.debtCurrent,d.lastNetDebt))+'</td><td>'+fmtPct(pct(d.grossmult,d.lastGrossMult))+'</td></tr>'}).join('')
<\/script>
</body>
</html>`
    },

    exportarExcel () {
      if (!this.registrosSeleccionados || this.registrosSeleccionados.length === 0) {
        this.$q.notify({ message: 'No hay datos disponibles para exportar', color: 'warning', icon: 'warning' })
        return
      }
      const datosParaExcel = this.registrosSeleccionados.map(row => {
        const crossTransObj   = this.listaSINO.find(x => x.id == row.crossTransaction)
        const crossTransLabel = crossTransObj !== undefined ? crossTransObj.desc : row.crossTransaction
        const fInversion      = row.fechaInversion ? date.formatDate(date.extractDate(row.fechaInversion, 'YYYY-MM-DD HH:mm:ss'), 'MM/YYYY') : ''
        const fDesinversion   = (row.fechaDesinversion && row.fechaDesinversion !== '0000-00-00 00:00:00')
          ? date.formatDate(date.extractDate(row.fechaDesinversion, 'YYYY-MM-DD HH:mm:ss'), 'MM/YYYY') : ''
        return {
          'Portfolio Company Name': row.nombre           || '',
          'Fund Name':              row.fundName         || '',
          'Geografía':              row.geografia        || '',
          'General Sector':         row.sector           || '',
          'Sub-Sector':             row.subsector        || '',
          'Currency':               row.divisa           || '',
          'Ownership (%)':          row.ownership        ? parseFloat(row.ownership)        : '',
          'Investment Date':        fInversion,
          'LTM Revenue (abs)':      row.revenueCurrent   ? parseFloat(row.revenueCurrent)   : '',
          'LTM EBITDA (abs)':       row.ebitdaCurrentAbs ? parseFloat(row.ebitdaCurrentAbs) : '',
          'LTM EV/EBITDA':          row.ebitdaCurrent    ? parseFloat(row.ebitdaCurrent)    : '',
          'LTM Debt/EBITDA':        row.debtCurrent      ? parseFloat(row.debtCurrent)      : '',
          'LTM Update Date':        row.ltmUpdateDate    || '',
          'Gross mult.':            row.grossmult        ? parseFloat(row.grossmult)        : '',
          'Invested Capital':       row.investedCapital  ? parseFloat(row.investedCapital)  : 0,
          'Last Revenue (abs)':     row.lastRevenues     ? parseFloat(row.lastRevenues)     : '',
          'Last EBITDA (abs)':      row.lastEbitda       ? parseFloat(row.lastEbitda)       : '',
          'Last Net Debt/EBITDA':   row.lastNetDebt      ? parseFloat(row.lastNetDebt)      : '',
          'Last Gross mult.':       row.lastGrossMult    ? parseFloat(row.lastGrossMult)    : '',
          'Last Update Date':       row.lastUpdateDate   || '',
          'ENTRY Revenue (abs)':    row.revenueIni       ? parseFloat(row.revenueIni)       : 0,
          'ENTRY EBITDA (abs)':     row.ebitdaIniAbs     ? parseFloat(row.ebitdaIniAbs)     : '',
          'ENTRY EV/EBITDA':        row.ebitdaIni        ? parseFloat(row.ebitdaIni)        : '',
          'ENTRY Debt/EBITDA':      row.debtEbitdaIni    ? parseFloat(row.debtEbitdaIni)    : '',
          'Divestment Date':        fDesinversion,
          'CrossTransaction':       crossTransLabel,
          'Observations':           row.comentario       || '',
          'URL':                    row.url              || ''
        }
      })
      const hojaTrabajo = XLSX.utils.json_to_sheet(datosParaExcel)
      const libroTrabajo = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(libroTrabajo, hojaTrabajo, 'Portfolio')
      const fechaStr = date.formatDate(new Date(), 'YYYY_MM_DD')
      XLSX.writeFile(libroTrabajo, `Reporte_Portfolio_${fechaStr}.xlsx`)
    }
  },

  mounted () {
    this.trackRecordR = this.trackRecord
    if (Object.keys(this.value).length > 0) this.getRecords(this.value)
    this.loadGeografias(this.user.codEmpresa)
    this.loadSectores(this.user.codEmpresa)
    this.loadSubSectores(this.user.codEmpresa)
  },

  components: { wgDate }
}
</script>

<style lang="sass">
.portfolio-grid-scroll
  max-height: calc(100vh - 160px)
  overflow-y: auto

.activosGrid-header-table
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

  // Separador limpio entre grupos de columnas — aplicado al <td> directamente
  td.col-group-sep
    border-left: 3px solid #78909c !important

  // Empresa desinvertida — fila en gris clarito
  tr.row-desinvertida td
    background-color: #f5f5f5 !important
    color: #9e9e9e !important
    font-style: italic
</style>