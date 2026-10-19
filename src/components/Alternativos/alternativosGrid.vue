<template>
  <q-item class="row">
    <!-- GRID. en row-key ponemos la columna del json que sea la id unica de la fila -->
    <q-table
      class="valoracionesGrid-header-table"
      dense
      virtual-scroll
      :pagination="pagination"
      :rows-per-page-options="[0]"
      :virtual-scroll-sticky-size-start="48"
      row-key="id"
      :rows="registrosSeleccionados"
      :columns="columnas"
      table-style="max-height: 66vh; max-width: 93vw"
    >

      <template v-slot:header="props">
        <!-- CABECERA DE LA TABLA -->
        <q-tr :props="props">
          <q-th>
            <!--q-btn icon="more_vert"  class="q-ma-xs" color="primary" dense>
              <q-menu ref="menu1">
                <q-list dense>
                  <q-item
                    v-for="(opcion, index) in listaOpciones"
                    :key="index"
                    clickable
                    @click="ejecutarOpcion(opcion)"
                    >
                    <q-item-section avatar>
                      <q-icon :name="opcion.icon" />
                    </q-item-section>
                    <q-item-section>{{opcion.title}}</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn-->
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
            {{ props.row.descripcion }}
            <q-tooltip v-if="props.row.tooltip"> {{ props.row.tooltip }} </q-tooltip>
          </q-td>

          <q-td
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
          >
            <div :style="props.row['estimado' + col.name.substring(4)] === true ? 'color: blue' :''">{{ col.value }}</div>
          </q-td>
        </q-tr>
      </template>

      <template v-slot:bottom>
        <div>
          {{ registrosSeleccionados.length }} Filas
        </div>
      </template>

    </q-table>
  </q-item>
</template>

<script>
export default {
  props: ['filter'],
  data () {
    return {
      rowId: '',
      registrosSeleccionados: [],
      columnas: [],
      pagination: { rowsPerPage: 0 },
      selectedRowID: {},
      itemId: null,
      listaOpciones: [
        { name: 'exportarExcel', title: 'Exportar Excel', icon: 'table_view', function: 'exportarExcel' }
      ]
    }
  },
  methods: {

    /*
    * Calcula o Valor Presente Líquido para
    * um período constante sem inversão de sinal
    *
    * @taxa => taxa de desconto
    * @montantes => vetor com os valores com os recebimentos ou pagamentos
    * -100,30,30,10,10,10,10
    */
    vpl (taxa, montantes) {
      var ret = montantes[0]

      for (var i = 1; i < montantes.length; i++) {
        ret += montantes[i] / Math.pow((1.0 + taxa), i)
      }
      return ret
    },

    tir (montantes) {
      // var ret = -1000000000.0
      var jurosInicial = -1
      var jurosMedio = 0.0
      var jurosFinal = 1.0
      var vplInicial = 0.0
      var vplFinal = 0.0
      var vplMedio = 0.0
      var erro = 1e-5

      for (var i = 0; i < 100; i++) {
        vplInicial = this.vpl(jurosInicial, montantes)
        vplFinal = this.vpl(jurosFinal, montantes)
        if (this.sinal(vplInicial) !== this.sinal(vplFinal)) break
        jurosInicial -= 1.0
        jurosFinal += 1.0
      }
      var count = 0
      while (count < 100) {
        // Busca por Bisseção
        jurosMedio = (jurosInicial + jurosFinal) / 2.0
        vplMedio = this.vpl(jurosMedio, montantes)
        if (Math.abs(vplMedio) <= erro) {
          // Resultado foi encontrado
          break // return jurosMedio * 100.0
        }
        if (this.sinal(vplInicial) === this.sinal(vplMedio)) {
          jurosInicial = jurosMedio
          vplInicial = this.vpl(jurosMedio, montantes)
        } else {
          jurosFinal = jurosMedio
          vplFinal = this.vpl(jurosMedio, montantes)
        }
        count++
      }
      return jurosMedio * 100.0 // ret
    },

    sinal (x) {
      return x < 0.0 ? -1 : 1
    },

    generarArbolBueno () {
      var arr = []
      var obj = {}
      this.columnas = []
      var acumDistrib = 0
      var acumComprom = 0
      var numEjer = 0
      var valAntFinAnyo = 0
      var distribFuturas = 0
      var flujos = [0.0]
      var strEjer = ''

      obj = {
        id: Math.floor((Math.random() * 999999) + 999999),
        tipoRegistro: 1, // 1: fila detalle, 2: fila cabecera
        descripcion: 'Compro.Inic.',
        tooltip:'Cantidad inicialmente comprometida'
      }
      arr.push(obj) // 0

      obj = {
        id: Math.floor((Math.random() * 999999) + 999999),
        tipoRegistro: 1, // 1: fila detalle, 2: fila cabecera
        descripcion: 'Imp.Comp.Enero'
      }
      arr.push(obj) // 1 - lo comento ya no está

      obj = {
        id: Math.floor((Math.random() * 999999) + 999999),
        tipoRegistro: 1, // 1: fila detalle, 2: fila cabecera
        descripcion: 'Comprometido',
        tooltip:'Compras + Comprometido Est.'
      }
      arr.push(obj) // 1

      obj = {
        id: Math.floor((Math.random() * 999999) + 999999),
        tipoRegistro: 1, // 1: fila detalle, 2: fila cabecera
        descripcion: 'Comp.Acum.',
        tooltip:'Acumulado: (Compras + Comprometido Est.)'
      }
      arr.push(obj) // 2

      obj = {
        id: Math.floor((Math.random() * 999999) + 999999),
        tipoRegistro: 1, // 1: fila detalle, 2: fila cabecera
        descripcion: 'Distribuido',
        tooltip:'Ventas + Cobros + Distribuciones Est.'
      }
      arr.push(obj) // 3

      obj = {
        id: Math.floor((Math.random() * 999999) + 999999),
        tipoRegistro: 1, // 1: fila detalle, 2: fila cabecera
        descripcion: 'Distrib.Acum.',
        tooltip:'Acumulado: (Ventas + Cobros + Distribuciones Est.)'
      }
      arr.push(obj) // 4

      obj = {
        id: Math.floor((Math.random() * 999999) + 999999),
        tipoRegistro: 1, // 1: fila detalle, 2: fila cabecera
        descripcion: 'Importe 31/12',
        tooltip:'Valoración al final de año. Para los años futuros (azul) es estimación de la valoración: Valoración ant. + comprometido - distribuido. Cuando es 0 es porque las distribuciones > desembolsos'
      }
      arr.push(obj) // 5

      obj = {
        id: Math.floor((Math.random() * 999999) + 999999),
        tipoRegistro: 1, // 1: fila detalle, 2: fila cabecera
        descripcion: 'Múltiplo 31/12',
        tooltip:'En la finalización del activo: Total distribuido / Total desembolsado'
      }
      arr.push(obj) // 6


      obj = {
        id: Math.floor((Math.random() * 999999) + 999999),
        tipoRegistro: 1, // 1: fila detalle, 2: fila cabecera
        descripcion: 'TIR 31/12'
      }
      arr.push(obj) // 7

      obj = {
        id: Math.floor((Math.random() * 999999) + 999999),
        tipoRegistro: 1, // 1: fila detalle, 2: fila cabecera
        descripcion: 'Saldo Vivo',
        tooltip:'Salvo vivo: Desembolsado - Distribuciones [al final se verá la plusvalía generada]'
      }
      arr.push(obj) // 8

      obj = {
        id: Math.floor((Math.random() * 999999) + 999999),
        tipoRegistro: 1, // 1: fila detalle, 2: fila cabecera
        descripcion: 'Capital at Risk',
        tooltip:'Capital desembolsado - Distribuciones + Próximos desembolsos'
      }
      arr.push(obj) // 9

      obj = {
        id: Math.floor((Math.random() * 999999) + 999999),
        tipoRegistro: 1, // 1: fila detalle, 2: fila cabecera
        descripcion: 'Valoración Act'
      }
      arr.push(obj) // 10 - lo comento ya no está

      obj = {
        id: Math.floor((Math.random() * 999999) + 999999),
        tipoRegistro: 1, // 1: fila detalle, 2: fila cabecera
        descripcion: 'Comp/Vent Año',
        tooltip:'Compras - Ventas, es decir, reflejamos las ventas en negativo'
      }
      arr.push(obj) // 10

      obj = {
        id: Math.floor((Math.random() * 999999) + 999999),
        tipoRegistro: 1, // 1: fila detalle, 2: fila cabecera
        descripcion: 'Fact/Cobr',
        tooltip:'Reflejamos los cobros en negativo'
      }
      arr.push(obj) // 11

      obj = {
        id: Math.floor((Math.random() * 999999) + 999999),
        tipoRegistro: 1, // 1: fila detalle, 2: fila cabecera
        descripcion: 'Rentab Año'
      }
      arr.push(obj) // 12

      this.registrosSeleccionados.forEach(row => {
        // para cada registro del año , insertamos registros con columnas por años: valoracion enero, comprometidos, distribuciones,valoracion31_12, multiplo,TIR,
        // acumulamos: un registro suma de todo lo anterior
        numEjer++
        strEjer = row.ejercicio
        this.columnas.push({ name: 'ejer' + row.ejercicio, align: 'left', label: row.ejercicio, field: 'ejer' + row.ejercicio, format: val => this.$numeral(val).format('0,0.00') })
        row.valoracion = parseFloat(row.valoracion)
        row.compra = (row.compra === undefined ? 0 : parseFloat(row.compra))
        row.comprometido = parseFloat(row.comprometido) + row.compra
        row.venta = (row.venta === undefined ? 0 : parseFloat(row.venta))
        row.cobro = parseFloat(row.cobro)
        row.distribucion = parseFloat(row.distribucion) + row.venta + row.cobro
        flujos.push(row.distribucion - row.comprometido)

        if (numEjer > 1 && row.valoracion === 0) {
          row.valoracion = valAntFinAnyo // si no tenemos la valoracion real tomamos la del año anterior y marcamos como estimada
          arr[6]['estimado' + row.ejercicio] = true // valor estimada
        } else {
          arr[6]['estimado' + row.ejercicio] = false
        }

        if (numEjer > 1) { // a partir del 2o ejercicio
          if (row.valoracion !== 0) {
            arr[6]['ejer' + (parseInt(row.ejercicio) - 1)] = row.valoracion // valoracion 31/12 anyo anterior es la de enero
            if ((parseInt(row.ejercicio) - 1) !== (new Date()).getFullYear()) {
              arr[1]['ejer' + (parseInt(row.ejercicio) - 1)] = row.valoracion // valoracion 31/12 anyo anterior es la de enero
              arr[11]['ejer' + (parseInt(row.ejercicio) - 1)] = row.valoracion
              arr[14]['ejer' + (parseInt(row.ejercicio) - 1)] = (arr[11]['ejer' + (parseInt(row.ejercicio) - 1)] + arr[13]['ejer' + (parseInt(row.ejercicio) - 1)] - (arr[11]['ejer' + (parseInt(row.ejercicio) - 2)] + arr[12]['ejer' + (parseInt(row.ejercicio) - 1)])) * 100 / (arr[11]['ejer' + (parseInt(row.ejercicio) - 2)] + arr[12]['ejer' + (parseInt(row.ejercicio) - 1)]) // rentab

              // (row.valoracion - acumComprom) * 100 / acumComprom // rentab
            }
          }
          if (acumComprom === 0) arr[6]['ejer' + row.ejercicio] = 0 // multiplo a 31/12
          else if ((parseInt(row.ejercicio) - 1) !== (new Date()).getFullYear()) {
            arr[7]['ejer' + (parseInt(row.ejercicio) - 1)] = (arr[11]['ejer' + (parseInt(row.ejercicio) - 1)] + acumDistrib) / acumComprom // (row.valoracion + row.comprometido + acumDistrib) / acumComprom
          }
        }
        arr[1]['ejer' + row.ejercicio] = acumComprom // comprometidos hasta la fecha
        arr[2]['ejer' + row.ejercicio] = row.comprometido // comprometidos del ejercicio
        arr[4]['ejer' + row.ejercicio] = row.distribucion // distribuciones del ejercicio
        arr[6]['ejer' + row.ejercicio] = row.valoracion + row.comprometido - row.distribucion // valoracion a 31/12, para el 1o ejercicio y estimadas
        if (arr[6]['ejer' + row.ejercicio] < 0) arr[6]['ejer' + row.ejercicio] = 0
        valAntFinAnyo = arr[6]['ejer' + row.ejercicio]
        acumDistrib += row.distribucion
        acumComprom += row.comprometido
        arr[3]['ejer' + row.ejercicio] = acumComprom // acum comprometido incluido ejercicio actual
        arr[5]['ejer' + row.ejercicio] = acumDistrib // acum distribuido incluido ejercicio actual
        arr[8]['ejer' + row.ejercicio] = this.tir(flujos) // TIR
        arr[9]['ejer' + row.ejercicio] = acumComprom - acumDistrib // saldo vivo
        distribFuturas = this.registrosSeleccionados.reduce((total, row1) => { return total + (row1.ejercicio > row.ejercicio ? (parseFloat(row1.comprometido) > 0 ? parseFloat(row1.comprometido) : parseFloat(row1.compra)) : 0) }, 0)
    // arr[10]['ejer' + row.ejercicio] = arr[8]['ejer' + row.ejercicio] + distribFuturas // capital at risk
        arr[0]['ejer' + row.ejercicio] = parseFloat(row.compromisoInicial) // comprom inici
        if (parseInt(row.ejercicio) === (new Date()).getFullYear()) {
          arr[11]['ejer' + row.ejercicio] = parseFloat(row.valoracionAct) // valoracion
          arr[14]['ejer' + row.ejercicio] = (parseFloat(row.valoracionAct) + parseFloat(row.cobro) - (parseFloat(row.valoracion) + parseFloat(row.compra) - parseFloat(row.venta))) * 100 / (parseFloat(row.valoracion) + parseFloat(row.compra)) // rentab
          arr[7]['ejer' + row.ejercicio] = (arr[11]['ejer' + row.ejercicio] + acumDistrib - row.distribucion + row.venta + row.cobro) / (acumComprom - row.comprometido + row.compra)// (row.valoracion + row.comprometido + acumDistrib) / acumComprom
        }
        arr[12]['ejer' + row.ejercicio] = parseFloat(row.compra) - parseFloat(row.venta) // compra
        arr[13]['ejer' + row.ejercicio] = parseFloat(row.cobro) // cobro
      })
      
      //CAPITAL AL RISK: Capital desembolsado - Distribuciones + Próximos desembolsos, ES DECIR: Total capital comprometido - Distribuciones acum.
      // mini bucle para recorrer de nuevo las distribuciones y que se calcule el capital al risk, ya tenemos el total comprometido en acumComprom
      numEjer=0
      acumDistrib=0
      var distribucionRow=0
      var ventaRow = 0
      var cobroRow = 0
      this.registrosSeleccionados.forEach(row => {
        numEjer++
        distribucionRow = parseFloat(row.distribucion) //+ ventaRow + cobroRow
        acumDistrib +=  distribucionRow // row.distribucion
        arr[10]['ejer' + row.ejercicio] = acumComprom - acumDistrib // capital at risk
      })

      // ultima columna
      arr[6]['ejer' + strEjer] = 0 // valoracion 31/12 ultimo año debe ser 0 porque hemos liquidado el fondo
      if (acumComprom === 0) arr[7]['ejer' + strEjer] = 0 // multiplo 31/12
      else arr[7]['ejer' + strEjer] = (arr[6]['ejer' + strEjer] + acumDistrib) / acumComprom // (row.valoracion + row.comprometido + acumDistrib) / acumComprom
      this.registrosSeleccionados = arr
    },


    
//Hemos quitado columnas Compr Enero, y Valoración Actual. El que tiene el codigo original es generarArbolBueno
    generarArbol () {
      var arr = []
      var obj = {}
      this.columnas = []
      var acumDistrib = 0
      var acumComprom = 0
      var numEjer = 0
      var valAntFinAnyo = 0
      var distribFuturas = 0
      var flujos = [0.0]
      var strEjer = ''

      obj = {
        id: Math.floor((Math.random() * 999999) + 999999),
        tipoRegistro: 1, // 1: fila detalle, 2: fila cabecera
        descripcion: 'Compro.Inic.',
        tooltip:'Cantidad inicialmente comprometida'
      }
      arr.push(obj) // 0

      obj = {
        id: Math.floor((Math.random() * 999999) + 999999),
        tipoRegistro: 1, // 1: fila detalle, 2: fila cabecera
        descripcion: 'Imp.Comp.Enero'
      }
      // arr.push(obj) // 1 - lo comento ya no está

      obj = {
        id: Math.floor((Math.random() * 999999) + 999999),
        tipoRegistro: 1, // 1: fila detalle, 2: fila cabecera
        descripcion: 'Comprometido',
        tooltip:'Compras + Comprometido Est.'
      }
      arr.push(obj) // 1

      obj = {
        id: Math.floor((Math.random() * 999999) + 999999),
        tipoRegistro: 1, // 1: fila detalle, 2: fila cabecera
        descripcion: 'Comp.Acum.',
        tooltip:'Acumulado: (Compras + Comprometido Est.)'
      }
      arr.push(obj) // 2

      obj = {
        id: Math.floor((Math.random() * 999999) + 999999),
        tipoRegistro: 1, // 1: fila detalle, 2: fila cabecera
        descripcion: 'Distribuido',
        tooltip:'Ventas + Cobros + Distribuciones Est.'
      }
      arr.push(obj) // 3

      obj = {
        id: Math.floor((Math.random() * 999999) + 999999),
        tipoRegistro: 1, // 1: fila detalle, 2: fila cabecera
        descripcion: 'Distrib.Acum.',
        tooltip:'Acumulado: (Ventas + Cobros + Distribuciones Est.)'
      }
      arr.push(obj) // 4

      obj = {
        id: Math.floor((Math.random() * 999999) + 999999),
        tipoRegistro: 1, // 1: fila detalle, 2: fila cabecera
        descripcion: 'Importe 31/12',
        tooltip:'Valoración al final de año. Para los años futuros (azul) es estimación de la valoración: Valoración ant. + comprometido - distribuido. Cuando es 0 es porque las distribuciones > desembolsos'
      }
      arr.push(obj) // 5

      obj = {
        id: Math.floor((Math.random() * 999999) + 999999),
        tipoRegistro: 1, // 1: fila detalle, 2: fila cabecera
        descripcion: 'Múltiplo 31/12',
        tooltip:'En la finalización del activo: Total distribuido / Total desembolsado'
      }
      arr.push(obj) // 6


      obj = {
        id: Math.floor((Math.random() * 999999) + 999999),
        tipoRegistro: 1, // 1: fila detalle, 2: fila cabecera
        descripcion: 'TIR 31/12'
      }
      arr.push(obj) // 7

      obj = {
        id: Math.floor((Math.random() * 999999) + 999999),
        tipoRegistro: 1, // 1: fila detalle, 2: fila cabecera
        descripcion: 'Saldo Vivo',
        tooltip:'Salvo vivo: Desembolsado - Distribuciones [al final se verá la plusvalía generada]'
      }
      arr.push(obj) // 8

      obj = {
        id: Math.floor((Math.random() * 999999) + 999999),
        tipoRegistro: 1, // 1: fila detalle, 2: fila cabecera
        descripcion: 'Capital at Risk',
        tooltip:'Capital desembolsado - Distribuciones + Próximos desembolsos'
      }
      arr.push(obj) // 9

      obj = {
        id: Math.floor((Math.random() * 999999) + 999999),
        tipoRegistro: 1, // 1: fila detalle, 2: fila cabecera
        descripcion: 'Valoración Act'
      }
      //arr.push(obj) // 10 - lo comento ya no está

      obj = {
        id: Math.floor((Math.random() * 999999) + 999999),
        tipoRegistro: 1, // 1: fila detalle, 2: fila cabecera
        descripcion: 'Comp/Vent Año',
        tooltip:'Compras - Ventas, es decir, reflejamos las ventas en negativo'
      }
      arr.push(obj) // 10

      obj = {
        id: Math.floor((Math.random() * 999999) + 999999),
        tipoRegistro: 1, // 1: fila detalle, 2: fila cabecera
        descripcion: 'Fact/Cobr',
        tooltip:'Reflejamos los cobros en negativo'
      }
      arr.push(obj) // 11

      obj = {
        id: Math.floor((Math.random() * 999999) + 999999),
        tipoRegistro: 1, // 1: fila detalle, 2: fila cabecera
        descripcion: 'Rentab Año'
      }
      arr.push(obj) // 12
      
      console.log('registros selecc filter', this.registrosSeleccionados)

      this.registrosSeleccionados.forEach(row => {
        // para cada registro del año , insertamos registros con columnas por años: valoracion enero, comprometidos, distribuciones,valoracion31_12, multiplo,TIR,
        // acumulamos: un registro suma de todo lo anterior
        numEjer++
        strEjer = row.ejercicio
        this.columnas.push({ name: 'ejer' + row.ejercicio, align: 'left', label: row.ejercicio, field: 'ejer' + row.ejercicio, format: val => this.$numeral(val).format('0,0.00') })
        row.valoracion = parseFloat(row.valoracion)
        row.compra = (row.compra === undefined ? 0 : parseFloat(row.compra))
        row.comprometido = parseFloat(row.comprometido) + row.compra
        row.venta = (row.venta === undefined ? 0 : parseFloat(row.venta))
        row.cobro = parseFloat(row.cobro)
        row.distribucion = parseFloat(row.distribucion) + row.venta + row.cobro
        flujos.push(row.distribucion - row.comprometido)

        if (numEjer > 1 && row.valoracion === 0) {
          row.valoracion = valAntFinAnyo // si no tenemos la valoracion real tomamos la del año anterior y marcamos como estimada
          arr[5]['estimado' + row.ejercicio] = true // valor estimada
        } else {
          arr[5]['estimado' + row.ejercicio] = false
        }

        if (numEjer > 1) { // a partir del 2o ejercicio
          if (row.valoracion !== 0) {
            arr[5]['ejer' + (parseInt(row.ejercicio) - 1)] = row.valoracion // valoracion 31/12 anyo anterior es la de enero
            if ((parseInt(row.ejercicio) - 1) !== (new Date()).getFullYear()) {
              //arr[1]['ejer' + (parseInt(row.ejercicio) - 1)] = row.valoracion // valoracion 31/12 anyo anterior es la de enero
              //arr[11]['ejer' + (parseInt(row.ejercicio) - 1)] = row.valoracion
              arr[12]['ejer' + (parseInt(row.ejercicio) - 1)] = (arr[5]['ejer' + (parseInt(row.ejercicio) - 1)] + arr[11]['ejer' + (parseInt(row.ejercicio) - 1)] - (arr[5]['ejer' + (parseInt(row.ejercicio) - 2)] + arr[10]['ejer' + (parseInt(row.ejercicio) - 1)])) * 100 / (arr[5]['ejer' + (parseInt(row.ejercicio) - 2)] + arr[10]['ejer' + (parseInt(row.ejercicio) - 1)]) // rentab

              // (row.valoracion - acumComprom) * 100 / acumComprom // rentab
            }
          }
          if (acumComprom === 0) arr[5]['ejer' + row.ejercicio] = 0 // multiplo a 31/12
          else if ((parseInt(row.ejercicio) - 1) !== (new Date()).getFullYear()) {
            arr[6]['ejer' + (parseInt(row.ejercicio) - 1)] = (arr[5]['ejer' + (parseInt(row.ejercicio) - 1)] + acumDistrib) / acumComprom // (row.valoracion + row.comprometido + acumDistrib) / acumComprom
          }
        }
        //arr[1]['ejer' + row.ejercicio] = acumComprom // comprometidos hasta la fecha
        arr[1]['ejer' + row.ejercicio] = row.comprometido // comprometidos del ejercicio
        arr[3]['ejer' + row.ejercicio] = row.distribucion // distribuciones del ejercicio
        arr[5]['ejer' + row.ejercicio] = row.valoracion + row.comprometido - row.distribucion // valoracion a 31/12, para el 1o ejercicio y estimadas
        if (arr[5]['ejer' + row.ejercicio] < 0) arr[5]['ejer' + row.ejercicio] = 0
        valAntFinAnyo = arr[5]['ejer' + row.ejercicio]
        acumDistrib += row.distribucion
        acumComprom += row.comprometido
        arr[2]['ejer' + row.ejercicio] = acumComprom // acum comprometido incluido ejercicio actual
        arr[4]['ejer' + row.ejercicio] = acumDistrib // acum distribuido incluido ejercicio actual
        arr[7]['ejer' + row.ejercicio] = this.tir(flujos) // TIR
        arr[8]['ejer' + row.ejercicio] = acumComprom - acumDistrib // saldo vivo
        distribFuturas = this.registrosSeleccionados.reduce((total, row1) => { return total + (row1.ejercicio > row.ejercicio ? (parseFloat(row1.comprometido) > 0 ? parseFloat(row1.comprometido) : parseFloat(row1.compra)) : 0) }, 0)
    // arr[10]['ejer' + row.ejercicio] = arr[8]['ejer' + row.ejercicio] + distribFuturas // capital at risk
        arr[0]['ejer' + row.ejercicio] = parseFloat(row.compromisoInicial) // comprom inici
        if (parseInt(row.ejercicio) === (new Date()).getFullYear()) {
          //arr[11]['ejer' + row.ejercicio] = parseFloat(row.valoracionAct) // valoracion
          arr[12]['ejer' + row.ejercicio] = (parseFloat(row.valoracionAct) + parseFloat(row.cobro) - (parseFloat(row.valoracion) + parseFloat(row.compra) - parseFloat(row.venta))) * 100 / (parseFloat(row.valoracion) + parseFloat(row.compra)) // rentab
          arr[6]['ejer' + row.ejercicio] = (arr[5]['ejer' + row.ejercicio] + acumDistrib - row.distribucion + row.venta + row.cobro) / (acumComprom - row.comprometido + row.compra)// (row.valoracion + row.comprometido + acumDistrib) / acumComprom
        }
        arr[10]['ejer' + row.ejercicio] = parseFloat(row.compra) - parseFloat(row.venta) // compra
        arr[11]['ejer' + row.ejercicio] = -parseFloat(row.cobro) // cobro
      })
      
      //CAPITAL AL RISK: Capital desembolsado - Distribuciones + Próximos desembolsos, ES DECIR: Total capital comprometido - Distribuciones acum.
      // mini bucle para recorrer de nuevo las distribuciones y que se calcule el capital al risk, ya tenemos el total comprometido en acumComprom
      numEjer=0
      acumDistrib=0
      var distribucionRow=0
      var ventaRow = 0
      var cobroRow = 0
      this.registrosSeleccionados.forEach(row => {
        numEjer++
        distribucionRow = parseFloat(row.distribucion) //+ ventaRow + cobroRow
        acumDistrib +=  distribucionRow // row.distribucion
        arr[9]['ejer' + row.ejercicio] = acumComprom - acumDistrib // capital at risk
      })

      // ultima columna
      arr[5]['ejer' + strEjer] = 0 // valoracion 31/12 ultimo año debe ser 0 porque hemos liquidado el fondo
      if (acumComprom === 0) arr[6]['ejer' + strEjer] = 0 // multiplo 31/12
      else arr[6]['ejer' + strEjer] = (arr[5]['ejer' + strEjer] + acumDistrib) / acumComprom // (row.valoracion + row.comprometido + acumDistrib) / acumComprom
      this.registrosSeleccionados = arr
    },

    getRecords (filter) {
      // hago la busqueda de registros segun condiciones del formulario Filter que ha lanzado el evento getRecords
      
      var objFilter = Object.assign({}, filter)
      objFilter.idActivo = (objFilter.idActivo && objFilter.idActivo !== null ? objFilter.idActivo.join() : null) // paso de array a concatenacion de strings (join)
      objFilter.codOtraEmpresa = (objFilter.codOtraEmpresa && objFilter.codOtraEmpresa !== null ? objFilter.codOtraEmpresa.join() : null) // paso de array a concatenacion de strings (join)
      objFilter.tipoActivo = (objFilter.tipoActivo && objFilter.tipoActivo !== null ? objFilter.tipoActivo.join() : null) // paso de array a concatenacion de strings (join)
      objFilter.estadoActivo = (objFilter.estadoActivo && objFilter.estadoActivo !== null ? objFilter.estadoActivo.join() : null) // paso de array a concatenacion de strings (join)
      objFilter.tipoProducto = (objFilter.tipoProducto && objFilter.tipoProducto !== null ? objFilter.tipoProducto.join() : null) // paso de array a concatenacion de strings (join)
      
      
      return this.$axios.get('movimientos/bd_alternativos.php/findcProyeccionAlternativos', { params: objFilter })
        .then(response => {

          return this.$axios.get('movimientos/bd_alternativos.php/findcProyeccionAlternativos', { params: objFilter })
            .then(response => {

              this.registrosSeleccionados = response.data
              // this.registrosSeleccionados.splice(0, 0, { id: -1, tipoActivo: 'CAP.RIESGO', nombre: '' })
              this.generarArbol(this.registrosSeleccionados)

           })
            .catch(error => {
              this.$q.dialog({ title: 'Error', message: error })
            })
        })
        .catch(error => {
          this.$q.dialog({ title: 'Error', message: error })
        })
    },
    ejecutarOpcion (opcion) {
      this[opcion.function](this.selectedRowID)
      this.$refs.menu1.hide()
    },
    exportarExcel () {
      this.$emit('exportarExcel')
    }
  },
  mounted () {
    if (this.filter.codEmpresa !== undefined) this.getRecords(this.filter)
  }
}
</script>
<style lang="sass">
.valoracionesGrid-header-table
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
