<template>
  <div style="height: calc(100vh - 105px)">
  
      <q-item clickable v-ripple @click="expanded = !expanded" class="q-ma-md q-pa-xs bg-indigo-1 text-grey-8">
        <q-item-section avatar>
          <q-icon name="fas fa-filter" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-h6">
            {{ nomFormulario }}
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

      <q-layout view="lHh Lpr lFf">
      <q-page-container>
      <q-page class="q-ma-md q-pa-xs flex flex-center bg-indigo-1">
        <div class="column q-gutter-md">
          
          <div class="text-h5 text-indigo-9 text-weight-bold text-center q-mb-lg">
            Informes de Renta Variable 
          </div>

          <div class="row q-gutter-lg justify-center">
            <!-- Botón 1: Listado Fondos RV -->
            <q-btn 
              push 
              color="indigo-7" 
              text-color="white" 
              size="lg" 
              label="Listado Fondos RV" 
              icon="list"
              @click="ejecutarAccion('listado')"
              class="custom-button"
            />

            <!-- Botón 2: Diversificación RV -->
            <q-btn 
              push 
              color="indigo-9" 
              text-color="white" 
              size="lg" 
              label="Diversificación RV" 
              icon="pie_chart"
              @click="ejecutarAccion('diversificacion')"
              class="custom-button"
            />
          </div>

        </div>
      </q-page>
    </q-page-container>
  </q-layout>
  </div>
</template>

<script>
import { openURL } from 'quasar'
import { mapState } from 'vuex'

export default {
  props: [],
  data () {
    return {
      url: '',
      nomFormulario: 'Renta Variable - Cartera de VidaWM'
    }
  },
  computed: {
    ...mapState('login', ['user']),

    // codEmpresa siempre actualizado desde el store
    codEmpresa () {
      return this.user?.codEmpresa || ''
    }
  },
  methods: {
    ejecutarAccion (accion) {
      const cod = encodeURIComponent(this.codEmpresa)

      if (accion === 'listado') {
        this.url = `https://vidawm.com/privado/php/ia/procesaIAListaISIN-claude.php?codEmpresa=${cod}`
      } else if (accion === 'diversificacion') {
        // Lee de caché (rv_cache) — no hace llamadas a internet
        this.url = `https://vidawm.com/privado/php/ia/procesaIAAgrupadoRV-prueba.php?codEmpresa=${cod}`
      }

      this.openWindow(this.url)
    },
    openWindow (strUrl) {
      if (window.cordova === undefined) {
        openURL(strUrl)
      } else {
        window.cordova.InAppBrowser.open(strUrl, '_system')
      }
    }
  }
}
</script>

<style scoped>
.custom-button {
  min-width: 280px;
  height: 80px;
  border-radius: 12px;
  transition: transform 0.2s;
}

.custom-button:hover {
  transform: scale(1.03);
}
</style>