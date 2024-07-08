  <!-- componente principal de definicion de formularios. Se apoya en otros 2 componentes: Filter y Grid -->
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
        <accionesFilter
          :model-value="filterRecord"
          @saveChanges="(value) => Object.assign(filterRecord, value)"
          @getRecords="getRecords"
          @hide="expanded = !expanded"
        />
      </q-dialog>

      <!-- formulario tabla de resultados de busqueda -->
      <accionesGrid
        v-model="filterRecord"
        @contadorAcciones="(value)=> this.$emit('contadorAcciones', value)"
        :key="refreshKey"
        />
        <q-btn  flat label="prueba" color="primary" @click="prueba"/>
        <q-dialog v-model="dialog" >
          <q-card style="width: 600px; height: 600px">
            <iframe style="width: 100%; height: 98%; " :srcdoc="htmlDoc"></iframe>
          </q-card>
        </q-dialog>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import { date } from 'quasar'
import accionesFilter from 'components/Acciones/accionesFilter.vue'
import accionesGrid from 'components/Acciones/accionesGrid.vue'
import axios from 'axios'
export default {
  props: [], // se pasan como parametro desde mainTabs. value = { registrosSeleccionados: [], filterRecord: {} }
  data () {
    return {
      dialog: false,
      htmlDoc: '',
      expanded: false,
      refreshKey: 0,
      visible: '',
      filterRecord: {},
      nomFormulario: 'Acciones',
      registrosSeleccionados: []
    }
  },
  computed: {
    ...mapState('tabs', ['tabs']),
    ...mapState('login', ['user']) // importo state.user desde store-login
  },
  methods: {
    getRecords (filter) {
      // hago la busqueda de registros segun condiciones del formulario Filter que ha lanzado el evento getRecords
      Object.assign(this.filterRecord, filter)
      this.refreshKey++
      this.expanded = false
    },
    prueba () {
      const corsAnywhere = 'https://cors-anywhere.herokuapp.com/';
      fetch(corsAnywhere+'www.morningstar.es/es/funds/snapshot/snapshot.aspx?id=F000010L35') 
        .then((response) => {
          response.text() // asincrona
          .then (resp=> {
            var document = new DOMParser().parseFromString(resp, "text/html");
            var tables = document.getElementsByTagName('table'); // busco tablas en la pagina html
            for(var tableIt = 0; tableIt < tables.length; tableIt++) {
              tables[tableIt].setAttribute("border", "1")
              console.log('==TABLA ' + tableIt + ':' + tables[tableIt].className)
              var rows = tables[tableIt].getElementsByTagName('tr');
              for(var rowIt = 0; rowIt < rows.length; rowIt++) {
                tables[tableIt][rowIt] = rows[rowIt];
                var columns = rows[rowIt].getElementsByTagName('td');
                for(var columnIt = 0; columnIt < columns.length; columnIt++) {
                  var column = columns[columnIt];
                  tables[tableIt][rowIt][columnIt] = column.innerText;
                  console.log('==== ROW ' + rowIt + ' =====COLUMN ' + columnIt + ':' + column.innerText);
                }
              }
            }
            this.dialog = true
            console.log('elemento 3:' + JSON.stringify(tables[3][1][2]))
            this.htmlDoc = tables[3].outerHTML
            console.log(this.htmlDoc = tables[3].outerHTML)
          })
        })
    }
  },
  mounted () {
    if (Object.keys(this.tabs['Acciones-1'].meta.value).length > 0) {
      this.getRecords(this.tabs['Acciones-1'].meta.value) // filterRecord que hemos cargado en el unmount
    } else {
      var muser = []
      muser.push(this.user.user.email)
      this.filterRecord = { idUserQuienProx: muser, fechaProxHasta: date.formatDate(date.addToDate(new Date(), { days: 5 }), 'YYYY-MM-DD 00:00:00'), realizada: '0' }
      this.getRecords(this.filterRecord)
    }
  },
  unmounted () {
    this.$emit('changeTab', Object.assign({}, this.filterRecord))
  },
  components: {
    accionesFilter: accionesFilter,
    accionesGrid: accionesGrid
  }
}
</script>
