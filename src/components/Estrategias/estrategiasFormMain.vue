<template>
    <div style="height: calc(100vh - 105px)">
            <q-tab-panels v-model="ltab" animated >
                <q-tab-panel v-for="(tab, index) in menuItems" :key="index" :name="tab.link.name"  class="q-pa-none">
                  <router-view @close="$emit('close')" />
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
  import { mapState } from 'vuex'
  export default {
    props: ['id'], // se pasan como parametro desde mainTabs. value = { registrosSeleccionados: [], filterRecord: {} }
    data () {
      return {
        ltab: '',
        value: {}, // el valor del registro padre (entidad)
        title: 'Estrategias',
        menuItems: [
          {
            title: 'Estrategia',
            link: { name: 'estrategiasForm' }
          }
        ]
      }
    },
    computed: {
      ...mapState('login', ['user']),
      ...mapState('tabs', ['tabs'])
    },
    methods: {
      
    },
    mounted () {
      Object.assign(this.value, this.tabs[this.id].meta.value)
      this.$router.replace({ name: this.menuItems[0].link.name, params: { id: this.id } }).catch(() => {})
    }
  }
  </script>
  
  <style>
  
  </style>
  