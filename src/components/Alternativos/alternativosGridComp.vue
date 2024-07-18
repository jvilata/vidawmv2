<template>
   <div style="height: calc(100vh - 105px)">
      <q-item clickable v-ripple @click="expanded = !expanded" class="q-ma-md q-pa-xs bg-indigo-1 text-grey-8">
        <!-- cabecera de formulario. Botón de busqueda y cierre de tab -->
        <q-item-section avatar>
          <q-icon name="fas fa-filter" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-h6">
            {{ nomFormulario }}
          </q-item-label>
          <q-item-label>
            <!-- poner un campo de fiterRecord que exista en este filtro -->
            <small>{{ Object.keys(filterRecord).length > 0 ? filterRecord : 'Pulse para definir filtro' }}</small>
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

      <q-dialog v-model="expanded"  >
        <!-- formulario con campos de filtro -->
        <alternativosCompFilter
          :value="filterRecord"
          @getRecords="v => getRecords(v)"
          @hide="expanded = !expanded"
        />
      </q-dialog>

      <q-expansion-item class="q-ml-md q-mb-md" group="somegroup" dense label="Gráficos" header-class="bg-indigo-1 text-grey-8">
        <div class="row">
          <div class="col-md" >
            <q-item class="q-ma-md q-pa-xs bg-indigo-1 text-grey-8">
              <q-item-section align="center">
                <div class="text-h6">Por Moneda</div>
              </q-item-section>
            </q-item>
            <q-item >
              <q-item-section align="center">
                <dashboardResumenPatrimonio :value="registrosAnalisisFondos1" :key="refreshRec"/>
              </q-item-section>
            </q-item>
          </div>
          <div class="col-md" >
            <q-item class="q-ma-md q-pa-xs bg-indigo-1 text-grey-8">
              <q-item-section align="center">
                <div class="text-h6">Por Gestor</div>
              </q-item-section>
            </q-item>
            <q-item >
              <q-item-section align="center">
                <dashboardResumenPatrimonio :value="registrosAnalisisFondos2" :key="refreshRec1"/>
              </q-item-section>
            </q-item>
          </div>
          <div class="col-md" >
            <q-item class="q-ma-md q-pa-xs bg-indigo-1 text-grey-8">
              <q-item-section align="center">
                <div class="text-h6">Por Tipo</div>
              </q-item-section>
            </q-item>
            <q-item >
              <q-item-section align="center">
                <alternativosPieChartFiltros :value="registrosSeleccionados"/>
              </q-item-section>
            </q-item>
          </div>
        </div>
      </q-expansion-item>
      <q-expansion-item
        class="q-pt-md q-pl-sm q-pr-xs"
        group="somegroup1"
        :label="filterRecord.trackRecord"
        dense
        default-opened
        header-class="bg-orange-1 text-grey-8"
      >
      
        <q-item class="row">
          <q-input class="col-xs-3 col-sm-2" outlined suffix="x" label="Avg.Gross Multiple" stack-label v-model="recordToSubmit.avgSoldGrossMultiple" mask="#.##"/>
          <q-input class="col-xs-3 col-sm-2" outlined suffix="%" label="Avg.Gross IRR" stack-label v-model="recordToSubmit.avgSoldGrossIrr" mask="##.##"/>
          <q-input class="col-xs-3 col-sm-2" outlined suffix="x" label="Avg.Net Multiple" stack-label v-model="recordToSubmit.avgSoldNetMultiple" mask="#.##" />
          <q-input class="col-xs-3 col-sm-2" outlined suffix="%" label="Avg.Net IRR" stack-label v-model="recordToSubmit.avgSoldNetIrr" mask="##.##" />
          <q-input class="col-xs-3 col-sm-2" outlined label="DPI" stack-label v-model="recordToSubmit.avgDpi" mask="#.##"/>
          <q-input class="col-xs-3 col-sm-2" outlined suffix="%" label="Avg.Annual Cash Yield" stack-label v-model="recordToSubmit.avgSoldAnnualCashYield" mask="#.##"/>
        </q-item>
        <q-item class="row">
          <!-- GRID. en row-key ponemos la columna del json que sea la id unica de la fila -->
          <q-table
            class="facturas1FormLineas-header-table"
            dense
            virtual-scroll
            :pagination="pagination"
            :rows-per-page-options="[0]"
            :virtual-scroll-sticky-size-start="48"
            row-key="id"
            :rows="registrosSeleccionados"
            :columns="columns"
            table-style="max-height: 50vh; max-width: 93vw"
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
                  <q-btn v-if="col.name==='seleccionado'" dense icon="autorenew" color="primary" @click="marcarTodos"/>
                  {{ col.label }}
                </q-th>
              </q-tr>
            </template>

            <template v-slot:body="props">
              <q-tr :class="(props.row.seleccionado==='1'?'bg-green-1':(`m_${props.row.id}` !== rowId) ? '':'bg-yellow-1')" :props="props" :key="`m_${props.row.id}`" @click="rowId=`m_${props.row.id}`">

                <q-td
                  v-for="col in props.cols"
                  :key="col.name"
                  :props="props"
                >
                  <div :style="col.style" @click="clickColumn(col.name, props.row)">
                    <q-icon v-if="col.name==='nombre'" name="edit" color="secondary"  />
                    {{ col.value }}
                  </div>
                  <q-popup-edit v-if="['seleccionado'].includes(col.name)"
                      v-model="props.row[col.name]"
                      max-height="600px"
                      buttons
                      v-slot="scope"
                      @save="updateRecord(props.row)">
                      <!-- aqui definimos las ediciones especificas para cada columna -->
                      <q-input 
                        v-model="scope.value"
                      />
                    <!--q-select v-if="col.name === 'seleccionado'"
                        class="col-xs-12 col-sm-6"
                        v-model="scope.value"
                        :options="listaSINO"
                        option-value="id"
                        option-label="desc"
                        emit-value
                        map-options
                    -->
                  </q-popup-edit>
                </q-td>
              </q-tr>
            </template>

            <template v-slot:no-data>
              <div>
                No hay registros, pulse el botón + para añadir
              </div>
            </template>
            <template v-slot:bottom>
              <div>
                {{ registrosSeleccionados.length }} Filas
              </div>
            </template>
          </q-table>

        </q-item>
      </q-expansion-item>
   </div>
</template>

<script>
import { date } from 'quasar'
import { mapState, mapActions } from 'vuex'
import alternativosCompFilter from 'components/Alternativos/alternativosCompFilter.vue'
import alternativosPieChartFiltros from 'components/Alternativos/alternativosPieChartFiltros.vue'
import dashboardResumenPatrimonio from 'components/Dashboard/dashboardResumenPatrimonio.vue'
export default {
  props: ['value'], // en 'value' tenemos la tabla de datos del grid
  data () {
    return {
      rowId: '',
      trackRecord: false,
      refreshRec: 0,
      refreshRec1: 0,
      expanded: false,
      nomFormulario: 'Selección de Alternativos',
      filterRecord: {},
      registrosSeleccionados: [],
      registrosAnalisisFondos1: [],
      registrosAnalisisFondos2: [],
      recordToSubmit: {
        totGrossMultiple: 0,
        totGrossIrr: 0,
        totNetMultiple: 0,
        totNetIrr: 0,
        avgSoldGrossMultiple: 0,
        avgSoldGrossIrr: 0,
        avgSoldNetMultiple: 0,
        avgSoldNetIrr: 0,
        avgSoldAnnualCashYield: 0,
        avgDpi: 0
      },
      columns: [
        { name: 'seleccionado', align: 'left', label: 'Selec.', field: 'seleccionado', sortable: true, style: 'width: 50px; whiteSpace: normal' },
        { name: 'nombre', align: 'left', label: 'Fund Name', field: 'nombre', sortable: true, style: 'width: 300px; whiteSpace: normal' },
        { name: 'nombreEntidad', align: 'left', label: 'Entity', field: 'nombreEntidad', sortable: true, style: 'width: 200px; whiteSpace: normal' },
        { name: 'descEstadoActivo', align: 'left', label: 'State', field: 'descEstadoActivo', sortable: true, style: 'width: 100px;' },
        { name: 'launch', align: 'left', label: 'Launch', field: 'launch', sortable: true },
        { name: 'grossMultiple', align: 'left', label: 'Gross Mult', field: 'avgGrossMultiple', sortable: true, format: val => this.$numeral(parseFloat(val)).format('0,0.00') + 'x' },
        { name: 'grossIrr', align: 'left', label: 'Gross IRR', field: 'avgGrossIrr', sortable: true, format: val => this.$numeral(parseFloat(val)).format('0,0.0') },
        { name: 'netMultiple', align: 'left', label: 'Net Multiple', field: 'avgNetMultiple', sortable: true, format: val => this.$numeral(parseFloat(val)).format('0,0.00') + 'x' },
        { name: 'netIrr', align: 'left', label: 'Net IRR', field: 'avgNetIrr', sortable: true, format: val => this.$numeral(parseFloat(val)).format('0,0.00') },
        { name: 'annualCashYield', label: 'Annual Cash Yield', align: 'left', field: 'avgAnnualCashYield', sortable: true, format: val => this.$numeral(parseFloat(val)).format('0,0.00') },
        { name: 'dpi', label: 'DPI', align: 'left', field: 'avgDpi', sortable: true, format: val => this.$numeral(parseFloat(val)).format('0,0.00') },
        { name: 'targetSize', align: 'left', label: 'Size', field: 'targetSize', sortable: true, format: val => this.$numeral(parseFloat(val)).format('0,0') },
        { name: 'minimumTicket', align: 'left', label: 'Min.Tick', field: 'minimumTicket', sortable: true, format: val => this.$numeral(parseFloat(val)).format('0,0') },
        { name: 'duration', align: 'left', label: 'Duration', field: 'duration', sortable: true, style: 'width: 100px;' },
        { name: 'investmentPeriod', align: 'left', label: 'Inv.Per.', field: 'investmentPeriod', sortable: true },
        { name: 'gpCommitment', align: 'left', label: 'GPCom.', field: 'gpCommitment', sortable: true, format: val => this.$numeral(parseFloat(val)).format('0,0') },
        { name: 'decisionDeadline', align: 'left', label: 'Dec.Deadline', field: 'decisionDeadline', sortable: true, format: val => date.formatDate(new Date(val), 'DD-MM-YYYY') },
        { name: 'managementFee', align: 'left', label: 'Man.Fee', field: 'managementFee', sortable: true },
        { name: 'successFee', align: 'left', label: 'Suc.Fee', field: 'successFee', sortable: true },
        { name: 'hurdleRate', align: 'left', label: 'Hurdle', field: 'hurdleRate', sortable: true },
        { name: 'nAssets', align: 'left', label: 'N.Assets', field: 'nAssets', sortable: true },
        { name: 'user', align: 'left', label: 'user', field: 'user', sortable: true },
        { name: 'ts', align: 'left', label: 'ts', field: 'ts', sortable: true }
      ],
      pagination: { rowsPerPage: 0 }
    }
  },
  computed: {
    ...mapState('tablasAux', ['listaSINO', 'listaStatusAlt']),
    ...mapState('login', ['user']),
    ...mapState('tabs', ['dataTabs'])
  },
  methods: {
    ...mapActions('tabs', ['addTab', 'addDataTab']),
    marcarTodos () {
      var marca = '0'
      if (this.registrosSeleccionados.length > 0 && this.registrosSeleccionados[0].seleccionado === '0') marca = '1'
      this.registrosSeleccionados.forEach(r => { r.seleccionado = marca })
      this.updateRecord()
    },
    clickColumn (colName, row) {
      if (colName === 'nombre') {
        // row.id = row.idActivo
        this.addTab(['activosFormMain', 'Activo-' + row.id, row, row.id])
      }
    },
    calcTotales (lineas) { //lineas === this.registrosSeleccionados (datos del grid)
      var numl = 0
      this.recordToSubmit = {
        avgSoldGrossMultiple: 0,
        avgSoldGrossIrr: 0,
        avgSoldNetMultiple: 0,
        avgSoldNetIrr: 0,
        avgSoldAnnualCashYield: 0,
        avgDpi: 0
      }
      //en totSelecc iré acumulando el total asignado a cada fondo (commitment)
      var totSelecc = 0
      lineas.forEach(r => {
        if(r.seleccionado > '0') totSelecc = totSelecc + parseFloat(r.seleccionado)
      })

      lineas.forEach(r => {
        if (r.seleccionado > '0') {
          numl++
          if (this.filterRecord.trackRecord == 'Track Record') {
            this.recordToSubmit.avgSoldGrossMultiple += (r.avgGrossMultiple !== null ? parseFloat(r.avgGrossMultiple) : 0) * (parseFloat(r.seleccionado) / totSelecc)
            this.recordToSubmit.avgSoldGrossIrr += (r.avgGrossIrr !== null ? parseFloat(r.avgGrossIrr) : 0) * (parseFloat(r.seleccionado) / totSelecc)
            this.recordToSubmit.avgSoldNetMultiple += (r.avgNetMultiple !== null ? parseFloat(r.avgNetMultiple) : 0) * (parseFloat(r.seleccionado) / totSelecc)
            this.recordToSubmit.avgSoldNetIrr += (r.avgNetIrr !== null ? parseFloat(r.avgNetIrr) : 0) * (parseFloat(r.seleccionado) / totSelecc)
            this.recordToSubmit.avgSoldAnnualCashYield += (r.avgAnnualCashYield !== null ? parseFloat(r.avgAnnualCashYield) : 0) * (parseFloat(r.seleccionado) / totSelecc)
            this.recordToSubmit.avgDpi += (r.avgDpi !== null ? parseFloat(r.avgDpi) : 0) * (parseFloat(r.seleccionado) / totSelecc)
          } else { //cartera actual
            this.recordToSubmit.avgSoldGrossMultiple += (r.grossmult !== null ? parseFloat(r.grossmult) : 0) * (parseFloat(r.seleccionado) / totSelecc)
            this.recordToSubmit.avgSoldGrossIrr += (r.grossirr !== null ? parseFloat(r.grossirr) : 0) * (parseFloat(r.seleccionado) / totSelecc)
            this.recordToSubmit.avgSoldNetMultiple += (r.netmult !== null ? parseFloat(r.netmult) : 0) * (parseFloat(r.seleccionado) / totSelecc)
            this.recordToSubmit.avgSoldNetIrr += (r.netirr !== null ? parseFloat(r.netirr) : 0) * (parseFloat(r.seleccionado) / totSelecc)
            this.recordToSubmit.avgSoldAnnualCashYield += (r.annualyield !== null ? parseFloat(r.annualyield) : 0) * (parseFloat(r.seleccionado) / totSelecc)
            this.recordToSubmit.avgDpi += (r.dpi !== null ? parseFloat(r.dpi) : 0) * (parseFloat(r.seleccionado) / totSelecc)
          }
        }
      })
      /* antes seleccionado era un 0 o 1, ahora le asignamos valor para trabajar con pesos ponderados
      if (numl > 0) {
        this.recordToSubmit.avgSoldGrossMultiple = Math.round(this.recordToSubmit.avgSoldGrossMultiple * 100.0 / numl) / 100
        this.recordToSubmit.avgSoldGrossIrr = Math.round(this.recordToSubmit.avgSoldGrossIrr * 100 / numl) / 100
        this.recordToSubmit.avgSoldNetMultiple = Math.round(this.recordToSubmit.avgSoldNetMultiple * 100 / numl) / 100
        this.recordToSubmit.avgSoldNetIrr = Math.round(this.recordToSubmit.avgSoldNetIrr * 100 / numl) / 100
        this.recordToSubmit.avgSoldAnnualCashYield = Math.round(this.recordToSubmit.avgSoldAnnualCashYield * 100 / numl) / 100
        this.recordToSubmit.avgDpi = Math.round(this.recordToSubmit.avgDpi * 100 / numl) / 100
      }*/
    },
    getRecords (v) {
      //cuando cierro el filtro seleccion de alternativos, el emit hace que se ejecute este método.
      console.log('componente de filter record es:', v)
      if (v.trackRecord !== 'Track Record') { //cartera actual: 
        var obj;
        obj = this.columns.find(r => r.name=='grossMultiple')
        obj.field = 'grossmult' //cogemos valores de tabla activo
        obj = this.columns.find(r => r.name=='grossIrr')
        obj.field = 'grossirr'
        obj = this.columns.find(r => r.name=='netMultiple')
        obj.field = 'netmult'
        obj = this.columns.find(r => r.name=='netIrr')
        obj.field = 'netirr'
        obj = this.columns.find(r => r.name=='annualCashYield')
        obj.field = 'annualyield'
        obj = this.columns.find(r => r.name=='dpi')
        obj.field = 'dpi'
      } else { // se ha seleccionado Track Record (por defecto)
        obj = this.columns.find(r => r.name=='grossMultiple')
        obj.field = 'avgGrossMultiple'
        obj = this.columns.find(r => r.name=='grossIrr')
        obj.field = 'avgGrossIrr'
        obj = this.columns.find(r => r.name=='netMultiple')
        obj.field = 'avgNetMultiple'
        obj = this.columns.find(r => r.name=='netIrr')
        obj.field = 'avgNetIrr'
        obj = this.columns.find(r => r.name=='annualCashYield')
        obj.field = 'avgAnnualCashYield'
        obj = this.columns.find(r => r.name=='dpi')
        obj.field = 'avgDpi'
      }

      this.expanded = false
      this.filterRecord = v
      var objFilter = Object.assign({}, this.filterRecord)
      objFilter.codEmpresa = this.user.codEmpresa
      objFilter.idEntidad = (objFilter.idEntidad && objFilter.idEntidad !== null ? objFilter.idEntidad.join() : null) // paso de array a concatenacion de strings (join)
      objFilter.tipoActivo = (objFilter.tipoActivo && objFilter.tipoActivo !== null ? objFilter.tipoActivo.join() : null) // paso de array a concatenacion de strings (join)
      objFilter.estadoActivo = (objFilter.estadoActivo && objFilter.estadoActivo !== null ? objFilter.estadoActivo.join() : null) // paso de array a concatenacion de strings (join)
      objFilter.tipoProducto = (objFilter.tipoProducto && objFilter.tipoProducto !== null ? objFilter.tipoProducto.join() : null) // paso de array a concatenacion de strings (join)
      objFilter.codOtraEmpresa = (objFilter.codOtraEmpresa && objFilter.codOtraEmpresa !== null ? objFilter.codOtraEmpresa.join() : null) // paso de array a concatenacion de strings (join)
      console.log('objFilter antes de llamda al back', objFilter)
      return this.$axios.get('activos/bd_activos.php/findActivosActFilter', { params: objFilter })
        .then(response => {
          // var i = 0
          //console.log('Error producido en llamada a findActivosActFilter')
          console.log('response de back', response.data)
          response.data.forEach(row => {
            // row.id = i++
            row.seleccionado = '0'
          })
          //bucle para unicamente meter los de launch del objeto <= launchHasta
          /*console.log('response.data', response.data)
          

          for (var k in response.data) {
            console.log('iteraciones del bucle en response.data[k]', response.data[k])
            if(response.data[k].launch <= this.filterRecord.launchHasta) { // si que tengo que hacer el insert
              this.registrosSeleccionados[k] = response.data[k]
            }
          }*/
          
          this.registrosSeleccionados = response.data
          this.updateRecord()
        })
        .catch(error => {
          this.$q.dialog({ title: 'Error', message: error.message })
        })
    },
    updateRecord (row) {
      var objFilter = {}
      // en this.registrosSeleccionados tenemos todos los datos del grid -> campo seleccionado que mostrará "0" o "1"
      this.$axios.get('activos/bd_activos.php/findAnalisisFondos1/', { params: objFilter })
        .then(response => {
          this.registrosSeleccionados.sort((a, b) => (a.seleccionado === '0' ? 'xx0' : 'xx1') <= (b.seleccionado === '0' ? 'xx0' : 'xx1') ? 1 : -1)
          this.calcTotales(this.registrosSeleccionados)
          this.getAnalisisFondos()
        })
    },
    getAnalisisFondos () {
      var objFilter = {}
      objFilter.idActivo = ''
      objFilter.seleccionado = ''
      this.registrosSeleccionados.forEach(r => {
        if (r.seleccionado > '0') {
          if (objFilter.idActivo.length > 0) objFilter.idActivo += ','
          if (objFilter.seleccionado.length > 0) objFilter.seleccionado += ','
          objFilter.idActivo += r.id
          objFilter.seleccionado += r.seleccionado
        }
      }) //en objFilter ahora tengo un objeto con 2 atributos: idActivo y su commitment (en seleccionado)
  
      // donut analisis fondos moneda
      this.$axios.get('activos/bd_activos.php/findAnalisisFondos1/', { params: objFilter })
        .then(response => {
          this.registrosAnalisisFondos1 = response.data
          this.refreshRec++ // para que refresque el componente
        })
        .catch(error => {
          this.$q.dialog({ title: 'Error', message: error })
        })
        // donut analisis fondos gestor
      this.$axios.get('activos/bd_activos.php/findAnalisisFondos2/', { params: objFilter })
        .then(response => {
          this.registrosAnalisisFondos2 = response.data
          this.registrosAnalisisFondos2.forEach(r => r.serie === null ? r.serie = '.' : '')
          this.refreshRec1++ // para que refresque el componente
        })
        .catch(error => {
          this.$q.dialog({ title: 'Error', message: error })
        })
    }
  },
  mounted () {
    if (this.dataTabs['altGridComp-1'] && this.dataTabs['altGridComp-1'].registrosSeleccionados && Object.keys(this.dataTabs['altGridComp-1'].registrosSeleccionados).length > 0) { // si ya hemos cargado previamente los recargo al volver a este tab
      Object.assign(this.filterRecord, this.dataTabs['altGridComp-1'].filterRecord)
      this.registrosSeleccionados = []
      
      for (var k in this.dataTabs['altGridComp-1'].registrosSeleccionados) {
        this.registrosSeleccionados.push(this.dataTabs['altGridComp-1'].registrosSeleccionados[k])
        if(this.filterRecord.trackRecord=='Cartera Actual') {
          //estoy en cartera actual -  tengo que sustituir los valores del grid, por los de cartera actual (por defecto, se define con track record)
          var obj;
          obj = this.columns.find(r => r.name=='grossMultiple')
          obj.field = 'grossmult'
          obj = this.columns.find(r => r.name=='grossIrr')
          obj.field = 'grossirr'
          obj = this.columns.find(r => r.name=='netMultiple')
          obj.field = 'netmult'
          obj = this.columns.find(r => r.name=='netIrr')
          obj.field = 'netirr'
          obj = this.columns.find(r => r.name=='annualCashYield')
          obj.field = 'annualyield'
          obj = this.columns.find(r => r.name=='dpi')
          obj.field = 'dpi'
        }
      }
      
      
      this.updateRecord()
    } else { // es la primera vez que entro, cargo valores por defecto
      this.filterRecord = {
        idActivo: [],
        idEntidad: [],
        tipoActivo: ['CAP.RIESGO', 'ALTERN.R FIJA'],
        computa: '1',
        launch: (new Date()).getFullYear(),
        //launchHasta: (new Date()).getFullYear(),
        trackRecord: 'Track Record'
      }
      this.getRecords(this.filterRecord)
    }
  },
  unmounted () {
    if (this.registrosSeleccionados.length > 0) {
      var tab = {
        id: 'altGridComp-1',
        filterRecord: Object.assign({}, this.filterRecord),
        registrosSeleccionados: Object.assign({}, this.registrosSeleccionados)
      }
      this.addDataTab(tab)
    }
  },
  components: {
    alternativosCompFilter: alternativosCompFilter,
    alternativosPieChartFiltros: alternativosPieChartFiltros,
    dashboardResumenPatrimonio: dashboardResumenPatrimonio
  }
}
</script>
<style lang="sass">
.facturas1FormLineas-header-table
  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th
    /* bg color is important for th; just specify one */
    background-color: $indigo-1
  thead tr:nth-child(2) th
    /* bg color is important for th; just specify one */
    background-color: $indigo-1

  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0
  thead tr:nth-child(2) th
    top: 0

  td:first-child
    background-color: $orange-1
  td:nth-child(2)
    background-color: $orange-1
  th:first-child
    position: sticky
    left: 0
    z-index: 2
  th:nth-child(2)
    position: sticky
    left: 77px
    z-index: 2
  td:first-child
    position: sticky
    left: 0
    z-index: 1
  td:nth-child(2)
    position: sticky
    left: 77px
    z-index: 1

  /* this is when the loading indicator appears */
  &.q-table--loading thead tr:last-child th
    /* height of all previous header rows */
    top: 48px
</style>
