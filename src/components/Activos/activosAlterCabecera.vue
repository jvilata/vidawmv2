  <!-- componente que se llama desde accionesMain y que presenta el formulario de filtro y el boton de busqueda -->
  <template>
  <q-card class="q-pt-none q-pl-xs q-pr-xs">
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
      <q-expansion-item
      class="q-pt-md q-pl-sm q-pr-xs"
      group="somegroup1"
      dense
      label="Cartera actual"
      default-opened
      header-class="bg-orange-1 text-grey-8"
      >
        <div class="row q-pt-sm">
          <q-input class="col-xs-2 col-sm-1" @blur="updateRec" outlined suffix="m" label="Min.Ticket" stack-label v-model="recordToSubmit.minimumTicket" />
          <q-input class="col-xs-3 col-sm-1" @blur="updateRec" outlined suffix="y" label="Duration" stack-label v-model="recordToSubmit.duration" />
          <q-input class="col-xs-3 col-sm-1" @blur="updateRec" outlined suffix="y" label="Inv.Period" stack-label v-model="recordToSubmit.investmentPeriod" />
          <q-input class="col-xs-4 col-sm-2" @blur="updateRec" outlined suffix="m" label="GP Commitment" stack-label v-model="recordToSubmit.gpCommitment" />
          <q-input class="col-xs-6 col-sm-2" @blur="updateRec" outlined label="Deadline decision" stack-label :model-value="formatDate(recordToSubmit.decisionDeadline)" @update:model-value="val => recordToSubmit.fecha=val" >
            <template v-slot:append>
                <q-icon name="event" class="cursos-pointer">
                  <q-popup-proxy>
                    <wgDate v-model="recordToSubmit.decisionDeadline" />
                  </q-popup-proxy>
                </q-icon>
            </template>
          </q-input>
          <q-input class="col-xs-6 col-sm-2" @blur="updateRec" outlined label="N.Assets" stack-label v-model="recordToSubmit.nAssets" />
          <q-input class="col-xs-3 col-sm-1" @blur="updateRec" outlined suffix="%" label="Manag.fee" stack-label v-model="recordToSubmit.managementFee" />
          <q-input class="col-xs-3 col-sm-1" @blur="updateRec" outlined suffix="%" label="Succ.fee" stack-label v-model="recordToSubmit.successFee" />
          <q-input class="col-xs-6 col-sm-1" @blur="updateRec" outlined suffix="%" label="Hurdle Rate" stack-label v-model="recordToSubmit.hurdleRate" />
        </div>
        <div class="row q-pt-sm">
          <q-input class="col-xs-6 col-sm-1" @blur="updateRec" readonly outlined label="Launch (Vintage)" stack-label v-model="recordToSubmit.launch" />
          <q-input class="col-xs-3 col-sm-1" @blur="updateRec" readonly outlined suffix="m" label="Target Size" stack-label v-model="recordToSubmit.targetSize" />
          <q-select 
            class="col-xs-3 col-sm-2" 
            @blur="updateRec" 
            outlined 
            label="Status" 
            stack-label 
            readonly  
            v-model="recordToSubmit.status"
            :options="listaStatusAlt"
            option-value="codElemento"
            option-label="codElemento"
            emit-value
              />
          <q-input class="col-xs-3 col-sm-1" @blur="updateRec" readonly outlined suffix="%" label="%Committed" stack-label v-model="recordToSubmit.committed" />
          <q-input class="col-xs-3 col-sm-1" @blur="updateRec" readonly outlined suffix="x" label="Gross Mult." stack-label v-model="recordToSubmit.grossmult" />
          <q-input class="col-xs-3 col-sm-1" @blur="updateRec" readonly outlined suffix="%" label="Gross IRR" stack-label v-model="recordToSubmit.grossirr" />
          <q-input class="col-xs-3 col-sm-1" @blur="updateRec" readonly outlined suffix="x" label="Net Mult." stack-label v-model="recordToSubmit.netmult" />
          <q-input class="col-xs-3 col-sm-1" @blur="updateRec" readonly outlined suffix="%" label="Net IRR" stack-label v-model="recordToSubmit.netirr" />
          <q-input class="col-xs-3 col-sm-1" @blur="updateRec" readonly outlined label="DPI" stack-label v-model="recordToSubmit.dpi" />
          <q-input class="col-xs-6 col-sm-2" @blur="updateRec" readonly outlined suffix="%" label="Annual Cash Yield" stack-label v-model="recordToSubmit.annualyield" />
        </div>
      </q-expansion-item>
      <q-expansion-item
          class="q-pt-md q-pl-sm q-pr-xs"
          group="somegroup"
          dense
          label="Track record"
          default-opened
          header-class="bg-orange-1 text-grey-8"
        >
        <div class="row q-pt-sm">
          <q-select 
              class="col-xs-4 col-sm-2" 
              @blur="updateRec"
              outlined 
              clearable
              label="Estrategias" 
              stack-label 
              v-model="recordToSubmit.idEstrategia"
              emit-value
              :options="listaEstrategiasComp"
              option-value="id"
              option-label="nombre"
              map-options
              @filter="filterEstrategias"
              use-input
              hide-selected
              fill-input
          />
          <div class="row q-pa-xs">
             <q-btn 
              outline
              rounded
              @click.stop="addRecords"
              label="Añadir"
              color="primary"
              size="15px">
            </q-btn>
              <q-dialog v-model="expanded"  >
               
                <estrategiasForm 
                  @addRecords="addRecords"
                  @hide="expanded = !expanded"
                />
              </q-dialog>
          </div>
        </div>
        <activosAlterLineas :key="refresh" :model-value="value" @refrescar="getDatos()"/>
      </q-expansion-item>
  </q-card>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { date } from 'quasar'
import { headerFormData } from 'boot/axios.js'
import wgDate from 'components/General/wgDate.vue'
import activosAlterLineas from 'components/Activos/activosAlterLineas.vue'
import estrategiasForm from 'src/components/Estrategias/estrategiasForm.vue'
export default {
  props: ['id'], // value es el objeto con los campos de filtro que le pasa accionesMain con v-model
  data () {
    return {
      refresh: 0,
      value: {},
      listaEstrategiasFilter: [],
      recordToSubmit: {
        minimumTicket: 0,
        duration: 0,
        investmentPeriod: 0,
        targetSize: 0,
        gpCommitment: 0,
        launch: 0,
        decisionDeadline: '',
        managementFee: 0,
        successFee: 0,
        hurdleRate: 0,
        nAssets: 0,
        status: '',
        committed: 0,
        grossmult: 0,
        grossirr: 0,
        netmult: 0,
        netirr: 0,
        dpi: 0,
        annualyield: 0,
        idEstrategia:''
      },
      recordEstrategia: {
        idEstrategia: '',
        idActivo: ''
      }
    }
  },
  computed: {
    ...mapState('login', ['user']),
    ...mapState('tabs', ['tabs']),
    ...mapState('tablasAux', ['listaStatusAlt']),
    ...mapState('activos', ['listaEstrategias']),
    listaEstrategiasComp () {
      if (this.listaEstrategiasFilter.length <= 0) return this.listaEstrategias
      else return this.listaEstrategiasFilter
    }
  },
  methods: {
    ...mapActions('activos', ['loadEstrategias']),
    ...mapActions('tabs', ['addTab']),
    formatDate (pdate) {
      return date.formatDate(pdate, 'DD-MM-YYYY')
    },
    filterEstrategias (val, update, abort) {
      update(() => {
        const needle = val.toLowerCase()
        this.listaEstrategiasFilter = this.listaEstrategias.filter(v => v.nombre.toLowerCase().indexOf(needle) > -1)
      })
    },
    updateRec () {
      var formData = new FormData()
      for (var key in this.recordToSubmit) {
        formData.append(key, this.recordToSubmit[key])
      }
      return this.$axios.post('activos/bd_activos.php/guardarBD', formData, headerFormData)
        .then(response => {
          //refrescar tablón
          this.refresh += 1;
          Object.assign(this.value, this.recordToSubmit)
          })
        .catch(error => {
          this.$q.dialog({ title: 'Error', message: error })
        })
    },
    editRecord (rowChanges, id) { // no lo uso aqui pero lod ejo como demo
        this.addTab(['estrategiasFormMain', 'Estrategias-' + rowChanges.id, rowChanges, rowChanges.id])
      },
    getDatos() {
      var objFilter = {
        id: this.value.id
      }
      this.$axios.get('activos/bd_activos.php/findActivosFilter', { params: objFilter })
      .then(response => {
        Object.assign(this.recordToSubmit, response.data[0])
        Object.assign(this.value, response.data[0])
       
        //llamada a act_trackrecord
        this.$axios.get('activos/bd_activos.php/findActivosTrack', { params: objFilter })
        .then(response => {
          if (response.data.length > 0) {
            this.recordToSubmit.targetSize = response.data[0].size 
            this.recordToSubmit.launch= response.data[0].vintage
            this.recordToSubmit.status= response.data[0].status
            this.recordToSubmit.committed= response.data[0].pCommitted
            this.recordToSubmit.grossmult= response.data[0].grossMultiple
            this.recordToSubmit.grossirr= response.data[0].grossIrr
            this.recordToSubmit.netmult= response.data[0].netMultiple
            this.recordToSubmit.netirr= response.data[0].netIrr
            this.recordToSubmit.dpi= response.data[0].dpi
            this.recordToSubmit.annualyield= response.data[0].annualCashYield
            this.refresh += 1;
          } else {
            this.recordToSubmit.targetSize = 0 
            this.recordToSubmit.launch= ''
            this.recordToSubmit.status= ''
            this.recordToSubmit.committed= 0
            this.recordToSubmit.grossmult= 0
            this.recordToSubmit.grossirr= 0
            this.recordToSubmit.netmult= 0
            this.recordToSubmit.netirr= 0
            this.recordToSubmit.dpi= 0
            this.recordToSubmit.annualyield= 0
            this.refresh += 1;
          }
          
        })
        .catch(error => {
          this.$q.dialog({ title: 'Error', message: error })
        })

      })
      .catch(error => {
        this.$q.dialog({ title: 'Error', message: error })
      })
    },
    addRecords () {
        this.$q.dialog({
        title: 'Añadir Estrategia',
        message: 'Desea añadir una nueva estrategia?',
        ok: {
          push: true
        },
        cancel: {
          push: true,
          color: 'negative'
        },
        persistent: true
      }).onOk(() => {
        //usuario pulsa OK
        var record = {
          id: -1,
          nombre: 'Nueva Estrategia',
          idEntidad: '',
          codEmpresa: this.user.codEmpresa,
          tipoActivo: 'CAP.RIESGO',
          descripcion: '',
          user: this.user.user.email,
          ts: date.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss')
        }
        var formData = new FormData()
        for (var key in record) {
          formData.append(key, record[key])
        }
        
        return this.$axios.post('estrategias/bd_estrategias.php/guardarBD', formData, headerFormData)
          .then(response => {
            record.id = response.data.id
            // this.registrosSeleccionados.push(record)
            this.editRecord(record, record.id)
          })
          .catch(error => {
            this.$q.dialog({ title: 'Error', message: error })
          })

      }).onCancel(() => {
         console.log('>>>> Cancel')
      }).onDismiss(() => {
        // console.log('I am triggered on both OK and Cancel')
      })
    }
  },
  components: {
    wgDate: wgDate,
    activosAlterLineas: activosAlterLineas,
    estrategiasForm : estrategiasForm
  },
  mounted () {
    this.loadEstrategias(this.user.codEmpresa)
    Object.assign(this.value, this.tabs[this.id].meta.value)
    Object.assign(this.recordToSubmit, this.value)
    this.refresh++ // para  que refresque las líneas
    
    this.getDatos()
    
  }
}
</script>
