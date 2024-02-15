<template>
  <div style="height: calc(100vh - 105px)">
          <q-tab-panels v-model="ltab" animated >
              <q-tab-panel v-for="(tab, index) in menuItems" :key="index" :name="tab.link.name"  class="q-pa-none">
                <router-view @close="$emit('close')"/>
              </q-tab-panel>
          </q-tab-panels>
          <!-- podemos poner tabs en el pie para dispositivos moviles pero quita pantalla y no me gusta bg-primary text-white -->
          <q-tabs v-model="ltab" dense
            class="absolute-bottom bg-primary text-white">
            <q-route-tab v-for="(tab,index) in menuItems"
              no-caps
              :key="index"
              :label="tab.title"
              :name="tab.link.name"
              :to="{ name: tab.link.name, params: { id: id, value: value } }"
              exact>
            </q-route-tab>
          </q-tabs>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
export default {
  props: ['id'], // se pasan como parametro desde mainTabs. value = { registrosSeleccionados: [], filterRecord: {} }
  data () {
    return {
      ltab: '',
      title: 'Facturas',
      menuItems: [
        {
          title: 'Listado',
          link: { name: 'facturasMainGeneral' }
        },
        {
          title: 'Gráficas',
          link: { name: 'facturasGrafico' }
        }
      ]
    }
  },
  computed: {
    ...mapState('login', ['user']),
    ...mapState('tabs', ['tabs'])
  },
  methods: {
    ...mapActions('tabs', ['removeDataTab'])
  },
  mounted () {
    this.value = Object.assign({}, this.tabs[this.id].meta.value)
    this.$router.replace({ name: this.menuItems[0].link.name, params: { id: this.id, value: this.value } }).catch(() => {})
  }
}

</script>

<style>

</style>
