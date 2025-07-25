<template>
    <div>
      <q-card flat v-if="value.nombre">
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
    <q-item class="row">
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
            <q-th >
            <q-btn icon="more_vert"  class="q-ma-xs" color="primary" dense>
              <q-menu ref="menu1">
                <q-list dense>
                  <q-item key="new1" clickable v-close-popup @click="exportarExcel" >
                    <q-item-section avatar>
                      <q-icon name="download" />
                    </q-item-section>
                    <q-item-section>Exportar Excel</q-item-section>
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
              <div v-if="props.row.contestacionAEAT !== 'OK'" style="width: 40px" >
              <!--edit icon . Decomentamos si necesitamos accion especifica de edicion -->
            <!--  <q-btn flat v-if="rowId===`m_${props.row.id}`"
                @click.stop="editRecord(props.row, props.row.id)"
                round
                dense
                size="sm"
                color="primary"
                icon="edit">
                <q-tooltip>Editar</q-tooltip>
              </q-btn> -->
              <q-btn flat v-if="rowId===`m_${props.row.id}`"
                round
                dense
                size="sm"
                icon="more_vert">
                <q-tooltip anchor="top middle">Más Opciones</q-tooltip>
                <q-menu>
                  <q-list dense style="min-width: 100px">
                    <q-item clickable @click="enviarRequerimiento(props.row)">
                      <q-item-section avatar>
                        <q-icon name="send" />
                      </q-item-section>
                      <q-item-section>Enviar Requerimiento AEAT</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
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
    </div>
  </template>
  
  <script>
  import { mapState, mapActions } from 'vuex'
  import { headerFormData } from 'boot/axios.js'
  import { date, openURL } from 'quasar'
  import { openBlobFile } from 'components/General/cordova.js'
  
  export default {
    props: ['modelValue', 'id', 'fromFacturasMain'], // en 'value' tenemos el filtro
    data () {
      return {
        rowId: '',
        value: {},
        registrosSeleccionados: [],
        columns: [
          { name: 'id', align: 'left', label: 'id', field: 'id', sortable: true },
          { name: 'RegistroFactura', align: 'left', label: 'Registro Factura', field: 'RegistroFactura', sortable: true },
          { name: 'DestinatarioNombreRazon', align: 'left', label: 'Nombre Cliente', field: 'DestinatarioNombreRazon', sortable: true, style: 'width: 170px; whiteSpace: normal' },
          { name: 'FechaHoraHusoGenRegistro', align: 'left', label: 'Fecha Envío AEAT', field: 'FechaHoraHusoGenRegistro', sortable: true, format: val => date.formatDate(date.extractDate(val, 'YYYY-MM-DD HH:mm:ss'), 'YYYY-MM-DD HH:mm:ss'), style: 'width: 100px;' },
          { name: 'NumSerieFactura', align: 'left', label: 'NºFactura', field: 'NumSerieFactura', sortable: true },
          { name: 'BaseImponible', align: 'left', label: 'Base', field: 'BaseImponible', sortable: true, format: val => this.$numeral(parseFloat(val)).format('0,0.00') },
          { name: 'CuotaTotal', align: 'left', label: 'Total Iva', field: 'CuotaTotal', sortable: true, format: val => this.$numeral(parseFloat(val)).format('0,0.00') },
          { name: 'ImporteTotal', align: 'left', label: 'Total Factura', field: 'ImporteTotal', sortable: true, format: val => this.$numeral(parseFloat(val)).format('0,0.00') },
          { name: 'TipoFactura', align: 'left', label: 'Tipo Factura:', field: 'TipoFactura', sortable: true },
          { name: 'RegistroAnterior_numSerieFactura', align: 'left', label: 'Nº Fac Registro Ant.', field: 'RegistroAnterior_numSerieFactura', sortable: true, style: 'width: 80px' },
          { name: 'contestacionAEAT', align: 'left', label: 'Respuesta AEAT', field: 'contestacionAEAT', sortable: true, style: 'width: 80px' },
          { name: 'NombreRazonEmisor', align: 'left', label: 'Empresa emisora:', field: 'NombreRazonEmisor', sortable: true }
        ],
        pagination: { rowsPerPage: 0 }
      }
    },
    computed: {
      ...mapState('tablasAux', ['listaSINO']),
      ...mapState('entidades', ['entidadSelf', 'entidadAsesor']),
      ...mapState('login', ['user']),
      ...mapState('tabs', ['tabs'])
    },
    methods: {
      ...mapActions('tabs', ['addTab']),
      getRecords () {
        var objFilter = {}
        /*if (this.fromFacturasMainAEAT === undefined) {
          Object.assign(objFilter, { codEmpresa: this.user.codEmpresa, tipoObjeto: (this.value.tipoForm === 'ENTIDADES' ? 'E' : 'A'), idObjeto: this.value.id })
        } else*/ Object.assign(objFilter, this.value) // viene de facturasMain

        return this.$axios.get('facturasAEAT/bd_facturasAEAT.php/findFacturasFilter', { params: objFilter }, headerFormData)
          .then(response => {
            this.registrosSeleccionados = response.data
          })
          .catch(error => {
            this.$q.dialog({ title: 'Error', message: error })
          })
      },
       editRecord (rowChanges, id) { // no lo uso aqui pero lod ejo como demo
        this.addTab(['facturasFormMainAEAT', 'Factura AEAT-' + rowChanges.id, rowChanges, rowChanges.id])
      },
      enviarRequerimiento (selected) {
        // Aquí se tendrá que implementar el codigo para enviar el requerimiento a la AEAT (modificación de datos)

      },
      exportarExcel () {
        //Primero construyo la SQL
        //string que será todo lo que se incluya en el 'WHERE'
        
        var objFilter = {}
        Object.assign(objFilter, this.value) // en objFilter, tengo los datos por los que he filtrado

        // 

        var str = ' id is not null and codEmpresa=\'' + this.user.codEmpresa + '\''
      if (objFilter.idCliente) str += ' and DestinatarioNIF = (select cif from entidades where entidades.id =\'' + objFilter.idCliente + '\')'
      if (objFilter.NumSerieFactura) str += ' and NumSerieFactura = \'' + objFilter.NumSerieFactura + '\''
      if (objFilter.fechainicial) str += ' and (FechaExpedicionFactura  >= \'' + objFilter.fechainicial + '\')'
      if (objFilter.fechafinal) str += ' and (FechaExpedicionFactura  <= \'' + objFilter.fechafinal + '\')'


      var sql = 'select * from facturasaeat where ' + str + ' order by id'
      
      var paramRecord = {
        SQL: sql,
        string_con: '',
        nompdf: 'facturasAEAT.csv'
      }
      var formData = new FormData()
      for (var key in paramRecord) {
        formData.append(key, paramRecord[key])
      }
      this.$axios.post('lib/exportExcel.php', formData, { responseType: 'blob' })
        .then(function (response) {
          var nomFile = 'facturasAEAT_' + date.formatDate(new Date(), 'YYYYMMDDHHmmss') + '.csv'
          if (window.cordova === undefined) { // desktop
            const url = window.URL.createObjectURL(new Blob([response.data], { type: response.data.type }))
            const link = document.createElement('a')
            link.href = url
            link.download = nomFile
            // link.target = '_blank'
            document.body.appendChild(link)
            // window.open('', 'view') // abre nueva ventana para que no sustituya a la actual
            link.click()
            document.body.removeChild(link)
          } else { // estamos en un disp movil            console.log('hola3')
            const blobPdf = response.data // new Blob([response.data], { type: response.data.type })
            openBlobFile(nomFile, blobPdf, response.data.type)
          }
        }).catch(error => {
          this.$q.dialog({ title: 'Error', message: error })
        })
    }



    },
    mounted () {
      this.value = this.modelValue
      if (this.value === undefined) this.value = Object.assign({}, this.tabs[this.id].meta.value)
      this.getRecords()
      /*Object.assign(this.value, this.tabs[this.id].meta.value)
      this.getRecords()*/
    }
  }
</script>
<style lang="sass">
.facturasGrid-header-table
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
  