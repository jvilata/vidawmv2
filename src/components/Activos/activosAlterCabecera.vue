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
          <q-input class="col-xs-6 col-sm-1" @blur="updateRec" outlined label="Launch (Vintage)" stack-label v-model="recordToSubmit.launch" />
          <q-input class="col-xs-3 col-sm-1" @blur="updateRec" outlined suffix="m" label="Target Size" stack-label v-model="recordToSubmit.targetSize" />
          <q-select 
            class="col-xs-3 col-sm-2" 
            @blur="updateRec" 
            outlined 
            label="Satus" 
            stack-label 
            clearable 
            v-model="recordToSubmit.status"
            :options="listaStatusAlt"
            option-value="codElemento"
            option-label="codElemento"
            emit-value
              />
          <q-input class="col-xs-3 col-sm-1" @blur="updateRec" outlined suffix="%" label="%Committed" stack-label v-model="recordToSubmit.committed" />
          <q-input class="col-xs-3 col-sm-1" @blur="updateRec" outlined suffix="x" label="Gross Mult." stack-label v-model="recordToSubmit.grossmult" />
          <q-input class="col-xs-3 col-sm-1" @blur="updateRec" outlined suffix="%" label="Gross IRR" stack-label v-model="recordToSubmit.grossirr" />
          <q-input class="col-xs-3 col-sm-1" @blur="updateRec" outlined suffix="x" label="Net Mult." stack-label v-model="recordToSubmit.netmult" />
          <q-input class="col-xs-3 col-sm-1" @blur="updateRec" outlined suffix="%" label="Net IRR" stack-label v-model="recordToSubmit.netirr" />
          <q-input class="col-xs-3 col-sm-1" @blur="updateRec" outlined label="DPI" stack-label v-model="recordToSubmit.dpi" />
          <q-input class="col-xs-6 col-sm-2" @blur="updateRec" outlined suffix="%" label="Annual Cash Yield" stack-label v-model="recordToSubmit.annualyield" />
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
        <activosAlterLineas :key="refresh" :model-value="value"/>
      </q-expansion-item>
  </q-card>
</template>

<script>
import { mapState } from 'vuex'
import { date } from 'quasar'
import { headerFormData } from 'boot/axios.js'
import wgDate from 'components/General/wgDate.vue'
import activosAlterLineas from 'components/Activos/activosAlterLineas.vue'
export default {
  props: ['id'], // value es el objeto con los campos de filtro que le pasa accionesMain con v-model
  data () {
    return {
      refresh: 0,
      value: {},
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
        annualyield: 0
      }
    }
  },
  computed: {
    ...mapState('login', ['user']),
    ...mapState('tabs', ['tabs']),
    ...mapState('tablasAux', ['listaStatusAlt']),
  },
  methods: {
    formatDate (pdate) {
      return date.formatDate(pdate, 'DD-MM-YYYY')
    },
    updateRec () {
      var formData = new FormData()
      for (var key in this.recordToSubmit) {
        formData.append(key, this.recordToSubmit[key])
      }
      return this.$axios.post('activos/bd_activos.php/guardarBD', formData, headerFormData)
        .then(response => {
        })
        .catch(error => {
          this.$q.dialog({ title: 'Error', message: error })
        })
    }
  },
  components: {
    wgDate: wgDate,
    activosAlterLineas: activosAlterLineas    
  },
  mounted () {
    Object.assign(this.value, this.tabs[this.id].meta.value)
    Object.assign(this.recordToSubmit, this.value)
    var objFilter = {
      id: this.value.id
    }
    this.refresh++ // para  que refresque las líneas
    this.$axios.get('activos/bd_activos.php/findActivosFilter', { params: objFilter })
      .then(response => {
        Object.assign(this.recordToSubmit, response.data[0])
      })
      .catch(error => {
        this.$q.dialog({ title: 'Error', message: error })
      })
  }
}
</script>
