  <!-- componente que se llama desde accionesMain y que presenta el formulario de filtro y el boton de busqueda -->
  <template>
  <div>
    <q-card flat>
      <q-card-section   class="q-pa-xs">
        <q-item class="q-pa-xs bg-indigo-1 text-grey-8">
          <!-- cabecera de formulario. Botón de busqueda y cierre de tab -->
          <q-item-section avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-h6">
              {{ recordToSubmit.nombre }}
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
    <q-scroll-area style="height: calc(100vh - 210px); ">
      <q-card flat>
        <q-card-section  class="q-pt-none q-pl-xs q-pr-xs">
          <q-input outlined v-model="recordToSubmit.dobleFactorSecret" label="Secret" class="q-mb-sm" />
          <q-input autofocus outlined clearable v-model="recordToSubmit.code" label="Code" class="q-mb-sm"/>
          <q-input autofocus outlined clearable v-model="recordToSubmit.result" label="Resultado Verificación" class="q-mb-sm"/>
          <q-img style=" max-width: 300px" :src="QRImage"/>
        </q-card-section>
        <q-btn flat @click="generarSecreto" label="Generar Secreto"/>
        <q-btn flat @click="getQRCode" label="Get QR"/>
        <q-btn flat @click="getCode" label="Get Code"/>
        <q-btn flat @click="verifyCode" label="Verify Code"/>
      </q-card>
    </q-scroll-area>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { axiosInstance, headerFormData } from 'boot/axios.js'
export default {
  props: ['id'], // value es el objeto con los campos de filtro que le pasa accionesMain con v-model
  data () {
    return {
      recordToSubmit: {},
      QRImage: ''
    }
  },
  computed: {
    ...mapState('tablasAux', ['listaSINO']),
    ...mapState('tabs', ['tabs'])
  },
  methods: {
    getRecords () {
      this.$emit('getRecords', this.filterR) // lo captura accionesMain
    },
    getCode() {
      var formData = new FormData()
      formData.set('dobleFactorSecret', this.recordToSubmit.dobleFactorSecret)
      return this.$axios.post('personal/bd_dobleFactor.php/getCode', formData, headerFormData)
        .then(response => {
          this.recordToSubmit.code = response.data
        })
        .catch(error => {
          this.$q.dialog({ title: 'Error', message: error })
        })
    },
    verifyCode() {
      var formData = new FormData()
      formData.set('dobleFactorSecret', this.recordToSubmit.dobleFactorSecret)
      formData.set('code', this.recordToSubmit.code)
      return this.$axios.post('personal/bd_dobleFactor.php/verifyCode', formData, headerFormData)
        .then(response => {
          this.recordToSubmit.result = response.data
        })
        .catch(error => {
          this.$q.dialog({ title: 'Error', message: error })
        })
    },
    generarSecreto() {
      var formData = new FormData()
      for (var key in this.recordToSubmit) {
        formData.append(key, this.recordToSubmit[key])
      }
      return this.$axios.post('personal/bd_dobleFactor.php/createSecret', formData, headerFormData)
        .then(response => {
          this.recordToSubmit.dobleFactorSecret = response.data
          formData.set('dobleFactorSecret', response.data)
          return this.$axios.post('personal/bd_personal.php/guardarBD', formData, headerFormData)
            .then()
        })
        .catch(error => {
          this.$q.dialog({ title: 'Error', message: error })
        })
    },
    getQRCode() {
      var formData = new FormData()
      formData.set('dobleFactorSecret', this.recordToSubmit.dobleFactorSecret)
      return this.$axios.post('personal/bd_dobleFactor.php/getQRCode', formData, headerFormData)
        .then(response => {
          this.QRImage = response.data
        })
        .catch(error => {
          this.$q.dialog({ title: 'Error', message: error })
        })
    }
  },
  mounted () {
    Object.assign(this.recordToSubmit, this.tabs[this.id].meta.value)
    var objFilter = {
      id: this.recordToSubmit.id
    }
    this.$axios.get(`personal/bd_personal.php/findPersonalFilter/${this.recordToSubmit.id}`, { params: objFilter })
      .then(response => {
        Object.assign(this.recordToSubmit, response.data[0])
      })
  }
}
</script>
