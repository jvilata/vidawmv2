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
        title: 'Portfolio Companies',
        idAct_trackrecord: '',
        menuItems: [
          {
            title: 'Portfolio',
            link: { name: 'portfolioForm' }
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

      if (!this.tabs[this.id]) console.log('estamos en portfolio form main', this.id)
      else Object.assign(this.value, this.tabs[this.id].meta.value)
       
      if(this.tabs[this.id].name == 'activosFormMain') { //accedo desde activo
        //llamada back para recuperar dato idAct_trackrecord por si viene del tab ppal del activo.
      
        var objFilter = { 
          idActivo: this.value.id,
          idEstrategia: this.value.idEstrategia
        }
        return this.$axios.get('activos/bd_portfolio_companies.php/findActTrackRecord', { params: objFilter })
          .then(response => {
            //recuperamos id track record 
            if (response.data.length > 0) { 
              
              this.idAct_trackrecord = response.data[0].idAct_trackrecord     
              this.$router.replace({ name: 'portfolioFormMain1', params: { id: this.idAct_trackrecord } }).catch(() => {})
            }
          })
          .catch(error => {
            this.$q.dialog({ title: 'Error', message: error })
          })
          
      } else if (this.tabs[this.id].name == 'portfolioFormMain1') {
        
        this.$router.replace({ name: this.menuItems[0].link.name, params: { id: this.id } }).catch(() => {})
      }
      
    }
  }
  </script>
  
  <style>
  
  </style>
  