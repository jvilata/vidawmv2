<template>
    <q-item class="row">
      <!-- GRID. en row-key ponemos la columna del json que sea la id unica de la fila -->
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
    
            <template v-slot:header="props">
              <!-- CABECERA DE LA TABLA -->
              
              
              <q-tr :props="props">
              <!-- <q-th ></q-th>-->
              <q-th v-if="this.trackRecord"></q-th>
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
                <q-td v-if="this.trackRecord">
                    <!-- columna de acciones: editar, borrar, etc -->
                    <div style="max-width: 10px">
                    
                        <q-btn flat v-if="rowId===`m_${props.row.id}`"
                        @click.stop="deleteRecord(props.row.id)"
                        round
                        dense
                        size="sm"
                        color="red"
                        icon="delete">
                            <q-tooltip>Borrar</q-tooltip>
                        </q-btn>
                    </div>
              </q-td>
              
            <q-td
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
            >
                <div :style="col.style">
                  <div v-if="['fundName', 'nombre'].includes(col.name) && !this.trackRecord" @click="clickColumn(col.name, props.row)">{{ col.value }} </div>
                  <div v-if="['fundName', 'nombre'].includes(col.name) && this.trackRecord">{{ col.value }} </div>
                  <div v-if="['ebitdaCurrentAbs'].includes(col.name)" :style="((parseFloat(props.row['ebitdaCurrentAbs']) >= parseFloat(props.row['ebitdaIniAbs'])) ? ((props.row['ebitdaCurrentAbs'] == props.row['ebitdaIniAbs']) ? 'background-color: orange; color: white' : 'background-color: green; color: white') : 'background-color: red; color: white')">{{ col.value }}</div>
                  <div v-if="['revenueCurrent' ].includes(col.name)" :style="((parseFloat(props.row['revenueCurrent']) >= parseFloat(props.row['revenueIni'])) ? ((props.row['revenueCurrent'] == props.row['revenueIni']) ?  'background-color: orange; color: white' : 'background-color: green; color: white') : 'background-color: red; color: white')">{{ col.value }}</div>
                  <div v-if="!['ebitdaCurrentAbs','revenueCurrent', 'fundName', 'nombre' ].includes(col.name)">{{ col.value }}</div>
                </div>
                <div :style="col.style" v-if="['verDoc'].includes(col.name) && props.row['url'] ">
                    <q-btn icon="open_in_browser" color="primary" style='width:50px' @click="verDocumento(props.row)"/>
                </div>
                <q-popup-edit v-if="this.trackRecord && !['fundName', 'verDoc'].includes(col.name)"
                    v-model="props.row[col.name]"
                    v-slot="scope"
                    max-height="600px"
                    buttons
                    auto-save
                    @save="updateRecord(props.row)">

                    <q-input v-if="['fundName'].includes(col.name)" readonly v-model="scope.value"></q-input>
                    <q-input v-if="['nombre', 'ownership', 'ebitdaCurrent','ebitdaCurrentAbs', 'revenueCurrent', 'debtCurrent','grossmult', 'investedCapital', 'revenueIni', 'ebitdaIniAbs', 'ebitdaIni', 'debtEbitdaIni'].includes(col.name)" v-model="scope.value"/>
                    
                      <q-input v-if="['comentario'].includes(col.name)"
                        type="textarea"
                        v-model="scope.value"
                        autogrow/>

                        <q-input v-if="['url'].includes(col.name)"
                        type="textarea"
                        v-model="scope.value"
                        autogrow/>
                  
                    <q-select v-if="['geografia'].includes(col.name)"
                        outlined
                        clearable
                        label="Geografía"
                        stack-label
                        v-model="scope.value"
                        :options="listaGeografias"
                        option-value="codElemento"
                        option-label="codElemento"
                        emit-value
                        />
                        
                        <q-select v-if="['sector'].includes(col.name)"
                        outlined
                        clearable
                        label="Sector"
                        stack-label
                        v-model="scope.value"
                        :options="listaSectores"
                        option-value="codElemento"
                        option-label="codElemento"
                        emit-value
                        />

                      <q-select v-if="['subsector'].includes(col.name)"
                          outlined
                          clearable
                          label="Sub-Sector"
                          stack-label
                          v-model="scope.value"
                          :options="listaSubSectores"
                          option-value="codElemento"
                          option-label="codElemento"
                          emit-value
                        />

                        <q-select v-if="['divisa'].includes(col.name)"
                          label="Currency"
                          stack-label
                          outlined
                          clearable
                          v-model="scope.value"
                          :options="listaDivisasPortfolio"
                          option-value="codElemento"
                          option-label="codElemento"
                          emit-value
                      />
                    <q-select
                      v-if="['crossTransaction'].includes(col.name)"
                      class="col-xs-6 col-sm-2"
                      label="Cross-Transaction"
                      v-model="scope.value"
                      :options="listaSINO"
                      option-value="id"
                      option-label="desc"
                      emit-value
                      map-options
                    />
                    <wgDate v-if="['fechaInversion'].includes(col.name)"
                      v-model="scope.value"
                      clearable />
                    <wgDate v-if="['fechaDesinversion'].includes(col.name)"
                    v-model="scope.value"
                    clearable/>
                </q-popup-edit>
                
                </q-td>
              </q-tr>
            </template>
      
            
            <template v-if="this.trackRecord" v-slot:no-data>
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
            <div v-if="this.trackRecord" class="absolute-bottom text-center q-mb-sm">
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
      </div>
    </q-item>
  </template>
  
  <script>
  import { mapState, mapActions } from 'vuex'
  import { date, openURL } from 'quasar'
  import wgDate from 'components/General/wgDate.vue'
  import { headerFormData } from 'boot/axios.js'
  export default {
    props: ['id', 'value', 'trackRecord'], // en 'value' tenemos la tabla de datos del filtro (se lanza desde estrategiasMain, en v-model="filterRecord")
    data () {
      return {
        rowId: '',
        trackRecordR: '',
        listaMonedasFilter: [],
        registrosSeleccionados: [],
        columns: [
          //{ name: 'id', label: 'ID', align: 'left', field: 'id', sortable: true },
          { name: 'nombre', align: 'left', label: 'Portfolio Company Name', field: 'nombre', fixed: 'left', sortable: true,  style: 'width: 200px; whiteSpace: normal' },
          { name: 'verDoc', align: 'left', label: 'WEB', field: 'verDoc', style: 'min-width: 50px;' },
          { name: 'fundName', align: 'left', label: 'Fund Name', field: 'fundName', sortable: true, style: 'width: 150px; whiteSpace: normal' },
          { name: 'geografia', label: 'Geografía', align: 'left', field: 'geografia', sortable: true, style: 'width: 150px; whiteSpace: normal' },
          { name: 'sector', label: 'General Sector', align: 'left', field: 'sector', sortable: true, style: 'width: 150px' },
          { name: 'subsector', label: 'Sub-Sector', align: 'left', field: 'subsector', sortable: true, style: 'width: 150px' },
          { name: 'divisa', label: 'Currency', align: 'left', field: 'divisa', sortable: true, style: 'width: 70px' },
          { name: 'ownership', label: 'Ownership (%)', align: 'left', field: 'ownership', sortable: true },
          //{ name: 'ownershipType', label: 'Ownership Type', align: 'left', field: 'ownershipType', sortable: true },
          { name: 'fechaInversion', label: 'Investment Date', align: 'left', field: 'fechaInversion', sortable: true, format: val => (val !== null ? date.formatDate(date.extractDate(val, 'YYYY-MM-DD HH:mm:ss'), 'MM/YYYY') : '') },
          //current data
          { name: 'revenueCurrent', label: 'LTM Revenue (abs)', align: 'left', field: 'revenueCurrent', sortable: true },
          { name: 'ebitdaCurrentAbs', label: 'LTM EBITDA (abs)', align: 'left', field: 'ebitdaCurrentAbs', sortable: true },
          { name: 'ebitdaCurrent', label: 'LTM EV/EBITDA', align: 'left', field: 'ebitdaCurrent', sortable: true },
          { name: 'debtCurrent', label: 'LTM Debt/EBITDA', align: 'left', field: 'debtCurrent', sortable: true },
          { name: 'grossmult', label: 'Gross mult.', align: 'left', field: 'grossmult', sortable: true },
          //entry data
          { name: 'investedCapital', label: 'Invested Capital', align: 'left', field: 'investedCapital', sortable: true },
          { name: 'revenueIni', label: 'ENTRY Revenue (abs)', align: 'left', field: 'revenueIni', sortable: true },
          { name: 'ebitdaIniAbs', label: 'ENTRY EBITDA (abs)', align: 'left', field: 'ebitdaIniAbs', sortable: true },
          { name: 'ebitdaIni', label: 'ENTRY EV/EBITDA', align: 'left', field: 'ebitdaIni', sortable: true },
          { name: 'debtEbitdaIni', label: 'ENTRY Debt/EBITDA', align: 'left', field: 'debtEbitdaIni', sortable: true },
          { name: 'fechaDesinversion', label: 'Divestment Date', align: 'left', field: 'fechaDesinversion', sortable: true, format: val => ((val !== null) ? ((val !== '0000-00-00 00:00:00' ) ? date.formatDate(date.extractDate(val, 'YYYY-MM-DD HH:mm:ss'), 'MM/YYYY') : '') : '') },
          { name: 'crossTransaction', label: 'CrossTransaction', align: 'left', field: 'crossTransaction', sortable: true,
            format: val => {
              var obj = this.listaSINO.find(x => x.id == val) // mapea el valor 0 , 1 en la listaSINO a string SI , NO
              return (obj !== undefined ? obj.desc : val)
            }
           },
          { name: 'comentario', label: 'Observations', align: 'left', field: 'comentario', sortable: true, style: 'min-width: 200px; max-width: 500px; white-space: normal; word-break: break-word;', headerStyle: 'max-width: 500px;' },
          { name: 'url', label: 'URL', align: 'left', field: 'url', sortable: true, style: 'min-width: 200px; max-width: 500px; white-space: normal', headerStyle: 'max-width: 500px;' },
          //A medida que inserto campos los añado también en el metodo addRecord
        ],
        pagination: { rowsPerPage: 0 }
      }
    },
    computed: {
      ...mapState('tablasAux', ['listaSINO', 'listaTiposProducto', 'listaGeografias', 'listaSectores', 'listaSubSectores', 'listaMonedas', 'listaDivisasPortfolio']),
      ...mapState('login', ['user'])
    },
    methods: {
      ...mapActions('tabs', ['addTab']),
      ...mapActions('tablasAux', ['loadGeografias', 'loadSectores', 'loadSubSectores']),

      getRecords (filter) { //filter es lo que recojo de modelValue
        // hago la busqueda de registros segun condiciones del formulario Filter que ha lanzado el evento getRecords
        var objFilter = Object.assign({}, filter)
        

        // objFilter.estadoActivo = (objFilter.estadoActivo !== null ? objFilter.estadoActivo.join() : null) // paso de array a concatenacion de strings (join)
        return this.$axios.get('activos/bd_portfolio_companies.php/findPortfolioCompaniesFilter', { params: objFilter })
          .then(response => {
            this.registrosSeleccionados = response.data
            
          })
          .catch(error => {
            this.$q.dialog({ title: 'Error', message: error })
          })
      },
      clickColumn (colName, row) {
        
        var copia = {}
        var copiaRow = {}
        copia.idAct_trackrecord = row.idAct_trackrecord
          if (colName === ('fundName' || 'nombre')) {
          //llamada al back para recuperar su idActivo   
          
            return this.$axios.get('activos/bd_portfolio_companies.php/getActivoFromPortComp', { params: copia })
            .then(response => {
              
              copiaRow = response.data[0]
              this.addTab(['activosFormMain', 'Activo-' + copiaRow.id, copiaRow, copiaRow.id])
            })
            .catch(error => {
              this.$q.dialog({ title: 'Error', message: error })
            })
            //

          }
      },
      addRecord () {
        //ir añadiendo a medida que se añaden en tablas
        var record = {
          id: -1,
          nombre: 'New Company',
          codEmpresa: this.user.codEmpresa,
          idEstrategia: this.value.idEstrategia,
          idAct_trackrecord: this.value.idAct_trackrecord,
          geografia: '',
          sector: '',
          subsector: '',
          ownership: '',
          fechaInversion: date.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
          fechaDesinversion: null,
          revenueCurrent: '',
          ebitdaCurrentAbs: '',
          ebitdaCurrent: '',
          debtCurrent: '',
          grossmult: '',
          investedCapital: 0,
          revenueIni: 0,
          ebitdaIniAbs: '',
          debtEbitdaIni: '',
          crossTransaction: '0',
          url: ''
        }
       
        var formData = new FormData()
        for (var key in record) {
          formData.append(key, record[key])
        }
        
        return this.$axios.post('activos/bd_portfolio_companies.php/guardarBD', formData, headerFormData)
          .then(response => {
            record.id = response.data.id
            record.fundName = this.value.fundName
            this.registrosSeleccionados.push(record)
            //this.getRecords(record)
            
          })
          .catch(error => {
            this.$q.dialog({ title: 'Error', message: error })
          })
      },
      updateRecord (record) {
      var tmp = {}
      Object.assign(tmp, record)
      delete tmp.fundName
      delete tmp.estrategiaNombre

      // comparo valores EBITDA y SALES
      if (tmp)


      return this.$axios.put(`activos/bd_portfolio_companies.php/guardarBD/${record.id}`, JSON.stringify(tmp))
        .then(response => {
          Object.assign(tmp, record)
          delete tmp.fundName
          delete tmp.estrategiaNombre
          return this.$axios.put(`activos/bd_portfolio_companies.php/guardarBD//${record.id}`, JSON.stringify(tmp))
            .then() // lo hago 2 veces porque hay problemas de sincronismo
        })
        .catch(error => {
          this.$q.dialog({ title: 'Error', message: error })
        })
      },
      deleteRecord (id) {
        this.$q.dialog({
          title: 'Confirmar',
          message: '¿ Desea borrar esta Compañía ?',
          ok: true,
          cancel: true,
          persistent: true
        }).onOk(() => {
          return this.$axios.delete(`activos/bd_portfolio_companies.php/findPortfolioCompaniesFilter/${id}`)
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
      this.trackRecordR = this.trackRecord
      if (Object.keys(this.value).length > 0) this.getRecords(this.value)
      this.loadGeografias(this.user.codEmpresa)
      this.loadSectores(this.user.codEmpresa)
      this.loadSubSectores(this.user.codEmpresa)
      
    },
    components: {
        wgDate: wgDate
    }
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
  