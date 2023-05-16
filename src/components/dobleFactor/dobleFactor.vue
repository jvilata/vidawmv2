<template>
  <q-page padding class="row justify-center">
    <!-- definimos una pagina de LOGIN que tiene un logo arriba y un formulario de empresa, usu y pass abajo -->
    <div class="gutter-sm col-xs-12 col-sm-4" >
      <div class="row justify-center q-pa-lg">
        <q-img src="~assets/VIDA_color.jpg" style="width: 40vh"/>
      </div>
      <q-card>
        <div class="text-subtitle2 q-pt-md q-pl-md">Autenticación Reforzada</div>
        <form class="q-pa-md" @submit.prevent="loginSubmit">
            <q-select readonly label="Empresa"
              v-model="user1.codEmpresa"
              :options="listaEmpresas"
              option-value="codElemento"
              option-label="valor1"
              emit-value
              map-options
            />
            <q-input readonly v-model="user1.email" type="email" label="E-Mail" />
            <div class="row">
              <q-input v-model="user1.code"  label="Código Verificación" class="col-xs-6 col-sm-8"/>
              <q-btn flat color="primary" class="col-xs-6 col-sm-4" label="Solicitar por SMS" @click="enviarCodigo"/>
            </div>
            <!--q-input readonly v-model="user1.result"  label="Código Verificación" /-->
            <div class="row justify-center q-pa-md">
              <q-btn type="submit" rounded color="primary" class="full-width" label="Sign In"/>
            </div>
            <p v-if="loginError">{{ loginError }}</p>
          </form>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { axiosInstance, headerFormData } from 'boot/axios.js'
export default {
  data () {
    return {
      loginError: '',
      tmpUser: {},
      user1: {
        codEmpresa: '01',
        email: '',
        code: ''
      }
    }
  },
  computed: {
    // accedo a VUEX al store/store-login a estos states y aqui los puedo usar como si fueran variables locales
    ...mapState('login', ['user']),
    ...mapState('tablasAux', ['listaEmpresas'])
  },
  methods: {
    ...mapActions('tablasAux', ['loadEmpresas']),
    ...mapActions('login', ['desconectarLogin', 'setUser']),
    loginSubmit () {
      var formData = new FormData()
      formData.set('dobleFactorSecret', this.tmpUser.pers.dobleFactorSecret)
      formData.set('code', this.user1.code)
      return this.$axios.post('personal/bd_dobleFactor.php/verifyCode', formData, headerFormData)
        .then(response => {
          // this.user1.result = response.data
          if (response.data !== true) {
            this.loginError = 'El código de validación no es correcto. Vuélvalo a intentar'
          } else {
            this.setUser(this.tmpUser)
            this.$router.push('/sinTabs')
          }
        })
        .catch(error => {
          this.$q.dialog({ title: 'Error', message: error })
        })      
    },
    enviarCodigo() {
      var formData = new FormData()
      formData.set('dobleFactorSecret', this.tmpUser.pers.dobleFactorSecret)
      return this.$axios.post('personal/bd_dobleFactor.php/getCode', formData, headerFormData)
        .then(response => {
          formData = new FormData()
          formData.set('movil', this.tmpUser.pers.telefono)
          formData.set('code', response.data)
          return this.$axios.post('personal/bd_smsInstaset.php', formData, headerFormData)
            .then(response => {
              // console.log(response.data)
            })
        })
        .catch(error => {
          this.$q.dialog({ title: 'Error', message: error })
        })            
    }
  },
  mounted () {
    // inicializar datos de stores
    this.loadEmpresas()
    this.user1.codEmpresa = this.user.codEmpresa
    this.user1.email = this.user.pers.email
    Object.assign(this.tmpUser, this.user) // lo guardo en tmp para recuperarlo tras el login ok
    this.setUser(null) // limpiar user
  }
}
</script>
