<template>
  <div>
  <q-btn dense label="+/- Columnas" color="primary" @click="ocultar=!ocultar"/>
  <q-btn dense label="INTERPRETACIÓN" color="primary" @click="mostrarAyuda" style="left: 45vw"/>
  <q-item class="row center" >
    <!-- GRID. en row-key ponemos la columna del json que sea la id unica de la fila -->
    <q-table
      class="col dashboardGridPlanif-header-table"
      dense
      :pagination="pagination"
      :rows-per-page-options="[0]"
      :virtual-scroll-sticky-size-start="48"
      row-key="id"
      :rows="registrosSeleccionados"
      :columns="columns"
      table-style="max-height: 70vh; max-width: 93vw"
      hide-bottom
    >

      <template v-slot:header="props">
        <!-- CABECERA DE LA TABLA -->
        <q-tr :props="props">
          <q-th
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
          >
            <div v-if="!ocultar || ocultar && !['comprometido7_2', 'distribuido', 'comprometido', 'comprometidotot', 'realcomprometido', 'pprevisto', 'pajuste', 'importeAjuste', 'cajaExtra'].includes(col.name.substring(0,col.name.length-2))">
              {{ col.label }}
            </div>
          </q-th>
        </q-tr>
      </template>

      <template v-slot:body="props">
        <q-tr :props="props" :key="`m_${props.row.id}`" @mouseover="rowId=`m_${props.row.id}`">
          <q-td
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
          >
            <div :style="col.style"
              v-if="!ocultar || ocultar && !['comprometido7_2', 'distribuido', 'comprometido', 'comprometidotot', 'realcomprometido', 'pprevisto', 'pajuste', 'importeAjuste', 'cajaExtra'].includes(col.name.substring(0,col.name.length-2))">
              {{ col.value }}
              <q-popup-edit v-if="['pRentTeorica', 'pTeorico'].includes(col.name)"
                v-model="props.row[col.name]"
                max-height="600px"
                buttons
                v-slot="scope"
                @save="updateRecord(props.row)">
                <!-- aqui definimos las ediciones especificas para cada columna -->
                <q-input v-if="['pRentTeorica'].includes(col.name)" v-model="scope.value"
                  autofocus counter />
                <q-input v-if="['pTeorico'].includes(col.name)" v-model="scope.value"
                  autofocus counter />
              </q-popup-edit>
            </div>
          </q-td>
        </q-tr>
      </template>

      <template v-slot:bottom-row>
        <!-- BOTTOM-ROW DE LA TABLA -->
        <q-tr >
          <q-th
            v-for="col in columns"
            :key="col.name"
            :align="col.align"
          >
            <div v-if="['pRentTeorica'].includes(col.name)">{{ numeralFormat(registrosSeleccionados.reduce((a, b) => a + (parseFloat(b.pRentTeorica) * parseFloat(b.pTeorico)/10000 || 0), 0), '0.00%') }}</div>
            <div v-if="['pRentEsperada'].includes(col.name)">{{ numeralFormat(registrosSeleccionados.reduce((a, b) => a + (parseFloat(b.pRentEsperada) * parseFloat(b.prealInicial)/10000 || 0), 0), '0.00%') }}</div>
              <div v-if="['aInvertirY0Mes'].includes(col.name)">{{ numeralFormat(registrosSeleccionados.reduce((a, b) => a + (parseFloat(b.aInvertirY0) / 12), 0), '0,00') }}</div>
            <div v-if="!['pRentTeorica','pRentEsperada','tipoActivo', 'aInvertirY0Mes'].includes(col.name) && (!ocultar || ocultar && !['comprometido7_2', 'distribuido', 'comprometido', 'comprometidotot', 'realcomprometido', 'pprevisto', 'pajuste', 'importeAjuste', 'cajaExtra'].includes(col.name.substring(0,col.name.length-2)))">
              {{ numeralFormat(Math.round(registrosSeleccionados.reduce((a, b) => a + (b[col.name]===undefined?0:parseFloat(b[col.name])), 0) * 100) / 100) }}
            </div>
          </q-th>
        </q-tr>
      </template>

    </q-table>
  </q-item>
  </div>
</template>

<script>
import { openURL } from 'quasar'
export default {
  props: ['value'], // en 'value' tenemos la tabla de datos del grid
  data () {
    return {
      rowId: '',
      ocultar: false,
      registrosSeleccionados: [],
      proyCompRFija: [],
      proyCompCapRiesgo: [],
      proyCompInmuebles: [],
      proyCompParticipacion: [],
      registrosPanelDatos: [],
      totRealCompY0: 0,
      totPatrimonioY0: 0,
      totRealCompY1: 0,
      totPatrimonioY1: 0,
      totRealCompY2: 0,
      totPatrimonioY2: 0,
      totRealCompY3: 0,
      totPatrimonioY3: 0,
      totRealCompY4: 0,
      totPatrimonioY4: 0,
      totRealCompY5: 0,
      totPatrimonioY5: 0,
      columns: [
        { name: 'tipoActivo', required: true, label: 'Tipo Activo', align: 'right', field: 'tipoActivo' },
        { name: 'pRentTeorica', required: true, label: 'Rent.Libros', align: 'right', field: 'pRentTeorica' },
        { name: 'pRentEsperada', required: true, label: 'Rent.Esper', align: 'right', field: 'pRentEsperada', format: val => parseFloat(val).toFixed(2) },
        { name: 'pTeorico', required: true, label: '%Part.Ideal', align: 'right', field: 'pTeorico' },
        { name: 'dividendos', required: true, label: 'Dividendos', align: 'right', field: 'dividendos', format: val => this.$numeral(parseFloat(val)).format('0,0.00') },
        { name: 'patrimonio', required: true, label: 'patrimonioY-1', align: 'right', field: 'patrimonio', format: val => this.$numeral(parseFloat(val)).format('0,0.00') },
        { name: 'preal', required: true, label: '%RealY-1', align: 'right', field: 'preal', format: val => parseFloat(val).toFixed(2) },
        { name: 'comprometido6m', required: true, label: 'comprom.+6m', align: 'right', field: 'comprometido6m', format: val => this.$numeral(parseFloat(val)).format('0,0.00') },
        { name: 'comprometido7_24m', required: true, label: 'comprom.7-24m', align: 'right', field: 'comprometido7_24m', format: val => this.$numeral(parseFloat(val)).format('0,0.00') },
        { name: 'comprometidoY0', required: true, label: 'comprometidoY0', align: 'right', field: 'comprometidoY0', format: val => this.$numeral(parseFloat(val)).format('0,0.00') },
        { name: 'distribuidoY0', required: true, label: 'distribuidoY0', align: 'right', field: 'distribuidoY0', format: val => this.$numeral(parseFloat(val)).format('0,0.00') },
        { name: 'comprometidototY0', required: true, label: 'comprometidototY0', align: 'right', field: 'comprometidototY0', format: val => this.$numeral(parseFloat(val)).format('0,0.00') },
        { name: 'realcomprometidoY0', required: true, label: 'realcomprometidoY0', align: 'right', field: 'realcomprometidoY0', format: val => this.$numeral(parseFloat(val)).format('0,0.00') },
        { name: 'pprevistoY0', required: true, label: '%PrevistoY0', align: 'right', field: 'pprevistoY0', format: val => parseFloat(val).toFixed(2) },
        { name: 'pajusteY0', required: true, label: '%AjusteY0', align: 'right', field: 'pajusteY0', format: val => parseFloat(val).toFixed(2) },
        { name: 'importeAjusteY0', required: true, label: 'Imp.Ajuste0', align: 'right', field: 'importeAjusteY0', format: val => this.$numeral(parseFloat(val)).format('0,0.00') },
        { name: 'aInvertirY0', required: true, label: 'aInvertirY0', align: 'right', field: 'aInvertirY0', format: val => this.$numeral(parseFloat(val)).format('0,0.00') },
        { name: 'aInvertirY0Mes', required: true, label: 'aInv.MesY0', align: 'right', field: b => parseFloat(b.aInvertirY0) / 12, format: val => this.$numeral(parseFloat(val)).format('0,0.00') },
        { name: 'cajaExtraY0', required: true, label: 'cajaExtraY0', align: 'right', field: 'cajaExtraY0', format: val => this.$numeral(parseFloat(val)).format('0,0.00') },
        { name: 'patrimonioY0', required: true, label: 'patrimonioY0', align: 'right', field: 'patrimonioY0', format: val => this.$numeral(parseFloat(val)).format('0,0.00') },
        { name: 'prealY0', required: true, label: '%RealY0', align: 'right', field: 'prealY0', format: val => parseFloat(val).toFixed(2) },
        { name: 'comprometidoY1', required: true, label: 'comprometidoY1', align: 'right', field: 'comprometidoY1', format: val => this.$numeral(parseFloat(val)).format('0,0.00') },
        { name: 'distribuidoY1', required: true, label: 'distribuidoY1', align: 'right', field: 'distribuidoY1', format: val => this.$numeral(parseFloat(val)).format('0,0.00') },
        { name: 'comprometidototY1', required: true, label: 'comprometidototY1', align: 'right', field: 'comprometidototY1', format: val => this.$numeral(parseFloat(val)).format('0,0.00') },
        { name: 'realcomprometidoY1', required: true, label: 'realcomprometidoY1', align: 'right', field: 'realcomprometidoY1', format: val => this.$numeral(parseFloat(val)).format('0,0.00') },
        { name: 'pprevistoY1', required: true, label: '%PrevistoY1', align: 'right', field: 'pprevistoY1', format: val => parseFloat(val).toFixed(2) },
        { name: 'pajusteY1', required: true, label: '%AjusteY1', align: 'right', field: 'pajusteY1', format: val => parseFloat(val).toFixed(2) },
        { name: 'importeAjusteY1', required: true, label: 'Imp.AjusteY1', align: 'right', field: 'importeAjusteY1', format: val => this.$numeral(parseFloat(val)).format('0,0.00') },
        { name: 'aInvertirY1', required: true, label: 'aInvertirY1', align: 'right', field: 'aInvertirY1', format: val => this.$numeral(parseFloat(val)).format('0,0.00') },
        { name: 'cajaExtraY1', required: true, label: 'cajaExtraY1', align: 'right', field: 'cajaExtraY1', format: val => this.$numeral(parseFloat(val)).format('0,0.00') },
        { name: 'patrimonioY1', required: true, label: 'patrimonioY1', align: 'right', field: 'patrimonioY1', format: val => this.$numeral(parseFloat(val)).format('0,0.00') },
        { name: 'prealY1', required: true, label: '%RealY1', align: 'right', field: 'prealY1', format: val => parseFloat(val).toFixed(2) }
     ],
      pagination: { rowsPerPage: 0 }
    }
  },
  methods: {
    mostrarAyuda () {
      var strUrl = 'https://vidawm.com/ayuda-gestion-activos/#interpretacion_evolucion'
        if (window.cordova === undefined) { // desktop
          openURL(strUrl)
        } else { // estamos en un disp movil
          window.cordova.InAppBrowser.open(strUrl, '_system') // openURL
        }
    },
    updateRecord (record) {
      return this.$axios.put(`activos/bd_activos.php/cActivosInversion/${record.id}`, JSON.stringify(record))
        .then(response => {
          return this.$axios.put(`activos/bd_activos.php/cActivosInversion/${record.id}`, JSON.stringify(record))
            .then()
        })
        .catch(error => {
          this.$q.dialog({ title: 'Error', message: error })
        })
    },
    acumulaTotales (ejercicioY0, element, rfija) {
      element.comprometidototY0 += parseFloat(rfija.comprometido) // + parseFloat(rfija.compra)
      element.comprometidototY1 += parseFloat(rfija.comprometido) // + parseFloat(rfija.compra)
      if (parseInt(rfija.ejercicio) === (parseInt(ejercicioY0))) {
        element.comprometidoY0 = parseFloat(rfija.comprometido) // + parseFloat(rfija.compra)
        element.distribuidoY0 = parseFloat(rfija.distribucion)
        element.comprometidototY0 -= 0
      } else if (parseInt(rfija.ejercicio) === (parseInt(ejercicioY0) + 1)) {
        element.comprometidoY1 = parseFloat(rfija.comprometido) //  + parseFloat(rfija.compra)
        element.distribuidoY1 = parseFloat(rfija.distribucion)
        element.comprometidototY1 -= (element.comprometidoY0)
      }
    },
    getActivosInversion (objFilter) {
      var ejercicioY0 = objFilter.mes.substring(3)
      var obj1 = {}
      Object.assign(obj1, objFilter)
      // obj1.mes = '01' + objFilter.mes.substring(2)
      obj1.mes = objFilter.mes
      // grid por tipos de activos inversion
      this.$axios.get('activos/bd_activos.php/cActivosInversion/', { params: obj1 })
        .then(response => {
          this.registrosSeleccionados = response.data
          Object.assign(obj1, {
            anyoDesde: ejercicioY0,
            estadoActivo: '1,4',
            computa: 1,
            tipoActivo: 'ALTERN.R FIJA'
          })
          this.$axios.get('https://vidawm.com/privado/php/movimientos/bd_alternativos.php/findcProyeccionAlternativos', { params: obj1 })
            .then(response => {
              this.proyCompRFija = response.data
              obj1.tipoActivo = 'CAP.RIESGO'
              this.$axios.get('https://vidawm.com/privado/php/movimientos/bd_alternativos.php/findcProyeccionAlternativos', { params: obj1 })
                .then(response => {
                  this.proyCompCapRiesgo = response.data
                  obj1.tipoActivo = 'INM.EN CONSTR'
                  this.$axios.get('https://vidawm.com/privado/php/movimientos/bd_alternativos.php/findcProyeccionAlternativos', { params: obj1 })
                    .then(response => {
                      this.proyCompInmuebles = response.data
                      obj1.tipoActivo = 'PARTICIPACION'
                      this.$axios.get('https://vidawm.com/privado/php/movimientos/bd_alternativos.php/findcProyeccionAlternativos', { params: obj1 })
                        .then(response => {
                          this.proyCompParticipacion = response.data
                          // PONER CODIGO AQUI -----------------
                          this.registrosSeleccionados.forEach(element => {
                            element.comprometidototY0 = 0
                            element.comprometidototY1 = 0
                            if (element.comprometidoY0 === undefined) element.comprometidoY0 = 0
                            if (element.comprometidoY1 === undefined) element.comprometidoY1 = 0
                            if (element.tipoActivo === 'ALTERN.R FIJA') {
                              this.proyCompRFija.forEach(rfija => {
                                this.acumulaTotales(ejercicioY0, element, rfija)
                              })
                            } else if (element.tipoActivo === 'CAP.RIESGO') {
                              this.proyCompCapRiesgo.forEach(rfija => {
                                this.acumulaTotales(ejercicioY0, element, rfija)
                              })
                            } else if (element.tipoActivo === 'INM.EN CONSTR') {
                              this.proyCompInmuebles.forEach(rfija => {
                                this.acumulaTotales(ejercicioY0, element, rfija)
                              })
                            } else if (element.tipoActivo === 'PARTICIPACION') {
                              this.proyCompParticipacion.forEach(rfija => {
                                this.acumulaTotales(ejercicioY0, element, rfija)
                              })
                            } else if (['RENTA FIJA', 'RENTA VBLE'].includes(element.tipoActivo)) {
                                var inversionAnual = (parseFloat(element.InversionAnual) )/ 5
                                var proyCompRentaVble = [
                                  { ejercicio: ejercicioY0, comprometido: inversionAnual, distribucion: 0, compra: 0},
                                  { ejercicio: parseInt(ejercicioY0) + 1, comprometido: inversionAnual, distribucion: 0, compra: 0},
                                  { ejercicio: parseInt(ejercicioY0) + 2, comprometido: inversionAnual, distribucion: 0, compra: 0},
                                  { ejercicio: parseInt(ejercicioY0) + 3, comprometido: inversionAnual, distribucion: 0, compra: 0},
                                  { ejercicio: parseInt(ejercicioY0) + 4, comprometido: inversionAnual, distribucion: 0, compra: 0}
                                ]
                                proyCompRentaVble.forEach(rfija => {
                                  this.acumulaTotales(ejercicioY0, element, rfija)
                                })
                            }
                            element.realcomprometidoY0 = parseFloat(element.patrimonio) + element.comprometidototY0
                            this.totRealCompY0 += element.realcomprometidoY0
                          })
                          // ejercicio Y0
                          const cCompAltFija = 0.20 // 20% anual durante 5 años
                          const cCompAltCRiesgo = 0.20
                          var altFija = 0
                          var altCapRiesgo = 0

                          // CAJA
                          var element = this.registrosSeleccionados.find(r => r.tipoActivo === 'CAJA') // no ha pasado todavía por este elemento en el bucle
                          element.distribuidoY0 = 0
                          this.totRealCompY0 = this.totRealCompY0 - element.realcomprometidoY0
                          var totComprometidoY0 = this.registrosSeleccionados.reduce((a, b) => a + (b.tipoActivo!=='RENTA FIJA' && b.tipoActivo!=='RENTA VBLE' ? parseFloat(b.comprometidoY0) : 0), 0)
                          element.realcomprometidoY0 = parseFloat(element.patrimonio) + parseFloat(element.comprometidoY0) 
                          this.totRealCompY0 = this.totRealCompY0 + element.realcomprometidoY0
                          element.pprevistoY0 = element.realcomprometidoY0 * 100 / this.totRealCompY0
                          element.pajusteY0 = (parseFloat(element.pTeorico) - element.pprevistoY0)
                          element.importeAjusteY0 = this.totRealCompY0 * element.pajusteY0 / 100
                          element.aInvertirY0 = parseFloat(element.dividendos) + element.importeAjusteY0
                          // patrimonioY0 se calcula al final de Y0

                          this.registrosSeleccionados.forEach(element => {
                            element.cajaExtraY0 = (element.distribuidoY0 === undefined ? 0 : parseFloat(element.distribuidoY0) * 0.50) // conservador, solo 50% de distribuido esperado
                            element.pprevistoY0 = element.realcomprometidoY0 * 100 / this.totRealCompY0
                            element.pajusteY0 = (parseFloat(element.pTeorico) - element.pprevistoY0)
                            element.importeAjusteY0 = this.totRealCompY0 * element.pajusteY0 / 100
                            if (['ALTERN.R FIJA'].includes(element.tipoActivo)) {
                              altFija = parseFloat(element.dividendos) + element.importeAjusteY0
                              element.aInvertirY0 = altFija
                              element.cajaExtraY0 += (1 - cCompAltFija) * altFija
                              element.patrimonioY0 = parseFloat(element.patrimonio) + (element.comprometidoY0 === undefined ? 0 : element.comprometidoY0) +
                                cCompAltFija * altFija
                              element.comprometidoY1 += cCompAltFija * altFija // 20%
                              element.comprometidototY1 = element.comprometidototY0 - (element.comprometidoY0 === undefined ? 0 : element.comprometidoY0)
                                + (1 - cCompAltFija) * altFija
                            } else if (['CAP.RIESGO'].includes(element.tipoActivo)) {
                              altCapRiesgo = parseFloat(element.dividendos) + element.importeAjusteY0
                              element.aInvertirY0 = altCapRiesgo
                              element.cajaExtraY0 += (1 - cCompAltCRiesgo) * altCapRiesgo
                              element.comprometidoY1 += cCompAltCRiesgo * altCapRiesgo // 20%
                              element.patrimonioY0 = parseFloat(element.patrimonio) + (element.comprometidoY0 === undefined ? 0 : element.comprometidoY0) +
                                cCompAltCRiesgo * altCapRiesgo
                              element.comprometidototY1 = element.comprometidototY0 - (element.comprometidoY0 === undefined ? 0 : element.comprometidoY0) +
                                (1 - cCompAltCRiesgo) * altCapRiesgo
                            } else if (['RENTA FIJA', 'RENTA VBLE'].includes(element.tipoActivo)) {
                              element.aInvertirY0 = parseFloat(element.dividendos) + element.importeAjusteY0 // element.comprometidoY0
                              element.comprometidoY0 = 0
                              element.patrimonioY0 = parseFloat(element.patrimonio) + (element.comprometidoY0 === undefined ? 0 : element.comprometidoY0) +
                                element.aInvertirY0
                            } else if (element.tipoActivo!=='CAJA') {
                                element.aInvertirY0 = parseFloat(element.dividendos) + element.importeAjusteY0
                                element.patrimonioY0 = parseFloat(element.patrimonio) + (element.comprometidoY0 === undefined ? 0 : element.comprometidoY0) +
                                  element.aInvertirY0
                            }
                          })
                          // CAJA post-proceso
                          var element = this.registrosSeleccionados.find(r => r.tipoActivo === 'CAJA') // no ha pasado todavía por este elemento en el bucle
                          element.cajaExtraY0 = - totComprometidoY0
                          var totCajaExtraY0 = this.registrosSeleccionados.reduce((a, b) => a + parseFloat(b.cajaExtraY0), 0)
                          element.patrimonioY0 = element.realcomprometidoY0 + element.aInvertirY0 + totCajaExtraY0

                          // calcular totales Y
                          this.totPatrimonioY0 = 0
                          this.registrosSeleccionados.forEach(element => {
                            this.totPatrimonioY0 += element.patrimonioY0
                            element.realcomprometidoY1 = element.patrimonioY0 + element.comprometidototY1
                            this.totRealCompY1 += element.realcomprometidoY1
                          })

                          //======= ejercicio Y1
                          // CAJA
                          var element = this.registrosSeleccionados.find(r => r.tipoActivo === 'CAJA') // no ha pasado todavía por este elemento en el bucle
                          element.distribuidoY1 = 0
                          this.totRealCompY1 = this.totRealCompY1 - element.realcomprometidoY1
                          var totComprometidoY1 = this.registrosSeleccionados.reduce((a, b) => a + (b.tipoActivo!=='RENTA FIJA' && b.tipoActivo!=='RENTA VBLE' ? parseFloat(b.comprometidoY1) : 0), 0)
                          element.realcomprometidoY1 = parseFloat(element.patrimonioY0) + parseFloat(element.comprometidoY1) 
                          this.totRealCompY1 = this.totRealCompY1 + element.realcomprometidoY1
                          element.pprevistoY1 = element.realcomprometidoY1 * 100 / this.totRealCompY1
                          element.pajusteY1 = (parseFloat(element.pTeorico) - element.pprevistoY1)
                          element.importeAjusteY1 = this.totRealCompY1 * element.pajusteY1 / 100
                          element.aInvertirY1 = parseFloat(element.dividendos) + element.importeAjusteY1
                          // patrimonioY0 se calcula al final de Y1

                          altFija = 0
                          altCapRiesgo = 0
                          this.registrosSeleccionados.forEach(element => {
                            element.cajaExtraY1 = (element.distribuidoY1 === undefined ? 0 : parseFloat(element.distribuidoY1) * 0.50) // conservador, solo 50% de distribuido esperado
                            element.pprevistoY1 = element.realcomprometidoY1 * 100 / this.totRealCompY1
                            element.pajusteY1 = parseFloat(element.pTeorico) - element.pprevistoY1
                            element.importeAjusteY1 = this.totRealCompY1 * element.pajusteY1 / 100
                            if (['ALTERN.R FIJA'].includes(element.tipoActivo)) {
                              altFija = parseFloat(element.dividendos) + element.importeAjusteY1
                              element.aInvertirY1 = altFija
                              element.cajaExtraY1 += (1 - cCompAltFija) * altFija
                              element.patrimonioY1 = parseFloat(element.patrimonioY0) + (element.comprometidoY1 === undefined ? 0 : element.comprometidoY1) +
                                cCompAltFija * altFija
                            } else if (['CAP.RIESGO'].includes(element.tipoActivo)) {
                              altCapRiesgo = parseFloat(element.dividendos) + element.importeAjusteY1
                              element.aInvertirY1 = altCapRiesgo
                              element.cajaExtraY1 += (1 - cCompAltCRiesgo) * altCapRiesgo
                              element.patrimonioY1 = parseFloat(element.patrimonioY0) + (element.comprometidoY1 === undefined ? 0 : element.comprometidoY1) +
                                cCompAltCRiesgo * altCapRiesgo
                            } else if (['RENTA FIJA', 'RENTA VBLE'].includes(element.tipoActivo)) {
                              element.aInvertirY1 = parseFloat(element.dividendos) + element.importeAjusteY1 // element.comprometidoY0
                              element.comprometidoY1 = 0
                              element.patrimonioY1 = parseFloat(element.patrimonioY0) + (element.comprometidoY1 === undefined ? 0 : element.comprometidoY1) +
                                element.aInvertirY1
                            } else {
                              element.aInvertirY1 = parseFloat(element.dividendos) + element.importeAjusteY1
                              element.patrimonioY1 = parseFloat(element.patrimonioY0) + (element.comprometidoY1 === undefined ? 0 : element.comprometidoY1) +
                                element.aInvertirY1
                            }
                          })
                          // CAJA post-proceso
                          var element = this.registrosSeleccionados.find(r => r.tipoActivo === 'CAJA') // no ha pasado todavía por este elemento en el bucle
                          element.cajaExtraY1 = - totComprometidoY1
                          var totCajaExtraY1 = this.registrosSeleccionados.reduce((a, b) => a + parseFloat(b.cajaExtraY1), 0)
                          element.patrimonioY1 = element.realcomprometidoY1 + element.aInvertirY1 + totCajaExtraY1
                          // calcular totales Y
                          this.totPatrimonioY1 = 0
                          this.registrosSeleccionados.forEach(element => {
                            this.totPatrimonioY1 += element.patrimonioY1
                          })

                          //===== TOTALES =====
                          this.registrosSeleccionados.forEach(element => {
                            element.prealY0 = element.patrimonioY0 * 100 / this.totPatrimonioY0
                            element.prealY1 = element.patrimonioY1 * 100 / this.totPatrimonioY1
                          })
                          var tmp = this.registrosSeleccionados
                          this.registrosSeleccionados = []
                          this.registrosSeleccionados = tmp
                        })
                    })
                })
            })
        })
        .catch(error => {
          this.$q.dialog({ title: 'Error', message: error })
        })
    },
    getPanelDatos (objFilter) { // lo duplico de dashboardPanelDatos, me hace falta para los totales del grid
      var obj1 = {}
      Object.assign(obj1, objFilter)
      obj1.mes = '01' + objFilter.mes.substring(2)
      // cards resumen de rentabilidad y patrimonio actual
      this.$axios.get('movimientos/bd_movimientos.php/findcpanelDatos/', { params: obj1 })
        .then(response => {
          this.registrosPanelDatos = response.data
        })
        .catch(error => {
          this.$q.dialog({ title: 'Error', message: error })
        })
    }
  },
  mounted () {
    this.getActivosInversion(this.value) // carga grid de activos Inversion
    this.getPanelDatos(this.value) // carga panel de datos, me hace falta para totales grid
  }
}
</script>
<style lang="sass">
.dashboardGridPlanif-header-table
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
