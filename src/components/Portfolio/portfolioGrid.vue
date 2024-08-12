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
                {{ col.value }}
              </div>
            <q-popup-edit v-if="this.trackRecord"
                v-model="props.row[col.name]"
                v-slot="scope"
                max-height="600px"
                buttons
                auto-save
                @save="updateRecord(props.row)">
                <q-input v-if="['nombre', 'investedCapital', 'realizedCapital', 'ebitdaIni', 'debtEbitdaIni', 'netMult'].includes(col.name)" v-model="scope.value"/>
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
                <q-input v-if="['fundName'].includes(col.name)" readonly v-model="scope.value"/>
                <wgDate v-if="['fechaInversion'].includes(col.name)"
                v-model="scope.value" />
                <wgDate v-if="['fechaDesinversion'].includes(col.name)"
                v-model="scope.value"/>
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
    </q-item>
  </template>
  
  <script>
  import { mapState, mapActions } from 'vuex'
  import { date } from 'quasar'
  import wgDate from 'components/General/wgDate.vue'
  import { headerFormData } from 'boot/axios.js'
  export default {
    props: ['value', 'trackRecord'], // en 'value' tenemos la tabla de datos del filtro (se lanza desde estrategiasMain, en v-model="filterRecord")
    data () {
      return {
        rowId: '',
        registrosSeleccionados: [],
        columns: [
          { name: 'id', label: 'ID', align: 'left', field: 'id', sortable: true },
          { name: 'nombre', align: 'left', label: 'Portfolio Company Name', field: 'nombre', sortable: true, style: 'width: 200px; whiteSpace: normal' },
          { name: 'fundName', align: 'left', label: 'Fund Name', field: 'fundName', sortable: true, style: 'width: 150px; whiteSpace: normal' },
          { name: 'geografia', label: 'Geografía', align: 'left', field: 'geografia', sortable: true, style: 'width: 150px; whiteSpace: normal' },
          { name: 'sector', label: 'Sector', align: 'left', field: 'sector', sortable: true, style: 'width: 200px; whiteSpace: normal' },
          { name: 'fechaInversion', label: 'Fecha Inversion', align: 'left', field: 'fechaInversion', sortable: true, format: val => (val !== null ? date.formatDate(date.extractDate(val, 'YYYY-MM-DD HH:mm:ss'), 'MM/YYYY') : '') },
          { name: 'fechaDesinversion', label: 'Fecha Desinversion', align: 'left', field: 'fechaDesinversion', sortable: true, format: val => (val !== null ? date.formatDate(date.extractDate(val, 'YYYY-MM-DD HH:mm:ss'), 'MM/YYYY') : '') },
          //falta por definir en bbdd
          { name: 'investedCapital', label: 'Invested Capital', align: 'left', field: 'investedCapital', sortable: true },
          { name: 'realizedCapital', label: 'Realized Capital', align: 'left', field: 'realizedCapital', sortable: true },
          { name: 'ebitdaIni', label: 'Entry EBITDA', align: 'left', field: 'ebitdaIni', sortable: true },
          { name: 'debtEbitdaIni', label: 'Entry Net Debt/EBITDA', align: 'left', field: 'debtEbitdaIni', sortable: true },
          { name: 'netMult', label: 'Net TVPI', align: 'left', field: 'netMult', sortable: true } 
          //A medida que inserto campos los añado también en el metodo addRecord
        ],
        pagination: { rowsPerPage: 0 }
      }
    },
    computed: {
      ...mapState('tablasAux', ['listaSINO', 'listaTiposProducto', 'listaGeografias', 'listaSectores']),
      ...mapState('login', ['user'])
    },
    methods: {
      ...mapActions('tabs', ['addTab']),
      ...mapActions('tablasAux', ['loadGeografias', 'loadSectores']),
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
      addRecord () {
        //ir añadiendo a medida que se añaden en tablas
        var record = {
          id: -1,
          nombre: 'Nueva Portfolio Company',
          codEmpresa: this.user.codEmpresa,
          idEstrategia: this.value.idEstrategia,
          idAct_trackrecord: this.value.idAct_trackrecord,
          geografia: '',
          sector: '',
          fechaInversion: date.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
          fechaDesinversion: '',
          investedCapital: 0,
          realizedCapital: 0,
          ebitdaIni: '',
          debtEbitdaIni: '',
          netMult: ''
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
      }
    },
    mounted () {
      if (Object.keys(this.value).length > 0) this.getRecords(this.value)
      this.loadGeografias(this.user.codEmpresa)
      this.loadSectores(this.user.codEmpresa)
      
    },
    components: {
        wgDate: wgDate
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
  