<template>
    <div style="height: calc(100vh - 105px)">
      <q-item clickable v-ripple class="q-ma-md q-pa-xs bg-blue-grey-1 text-grey-8">
        <!-- cabecera de formulario. Botón de busqueda y cierre de tab -->
        <q-item-section avatar>
          <q-icon name="today" />
        </q-item-section>
        <q-item-section>
          <div class="row">
            <q-item-label class="text-h6">
              {{ nomFormulario }}
            </q-item-label>
          </div>
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

      <!-- formulario tabla de resultados de busqueda -->
       <q-item-section class="q-ma-md q-pa-xs bg-blue-grey-1 text-grey-8">
          <div class="row">
            <q-item-label class="text-h6">
                    {{ nomGrid1 }}
            </q-item-label>
          </div>
        </q-item-section>
      <calendarioGrid 
        :filterRecord="filterRecord"
        :key="refreshKey"
        />

      <q-item-section class="q-ma-md q-pa-xs bg-blue-grey-1 text-grey-8">
          <div class="row">
            <q-item-label class="text-h6">
                    {{ nomGrid2 }}
            </q-item-label>
          </div>
        </q-item-section>
      <calendarioPipelineGrid 
        :filterRecord="filterRecord"
        :key="refreshKey"
        />
     
    </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  props: ['value', 'id', 'keyValue'], // se pasan como parametro desde mainTabs. value = { registrosSeleccionados: [], filterRecord: {} }
  data () {
    return {
      verPorDias: true,
      expanded: false,
      refreshKey: 0,
      visible: '',
      listaMeses: [],
      listaAnyos: [],
      filterRecord: {},
      nomFormulario: 'Planificación Cartera',
      nomGrid1: 'Fondos cartera (back into market)',
      nomGrid2: 'Pipeline',
      registrosSeleccionados: []
    }
  },
  computed: {
    ...mapState('login', ['user']) // importo state.user desde store-login
  },
  methods: {
    gestionarVerPor(value) {
      if (value === "Por días") this.verPorDias = true;
      else this.verPorDias = false;
    },
    cargaMesesAnyos () {
      for (let i = 1; i <= 12; i++) {
        var dateObj = new Date('2021-' + i + '-01')
        this.listaMeses.push({ idmes: i, mes: dateObj.toLocaleString('es-ES', { month: 'long' }) })
      }
      var d = new Date()
      for (let i = d.getFullYear() - 3; i < d.getFullYear() + 3; i++) {
        this.listaAnyos.push(i)
      }
    },
    getRecords () {
      this.filterRecord.verPor = "Por días"
      this.refreshKey++
      this.expanded = false
    }
  },
  mounted () {
    this.filterRecord = { mes: (new Date()).getMonth() + 1, anyo: (new Date()).getFullYear() }
    this.cargaMesesAnyos()
    this.getRecords()
  },
  unmounted () {
    this.$emit('changeTab', Object.assign({}, this.filterRecord))
  },
  components: {
    calendarioGrid: require('components/Calendario/calendarioGrid.vue').default,
    calendarioPipelineGrid: require('components/Calendario/calendarioPipelineGrid.vue').default
  }
}
</script>
