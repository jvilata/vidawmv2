<!-- componente que se llama desde accionesMain y que presenta el formulario de filtro y el boton de busqueda -->
  <template>
  <q-card style="width: 400px;" class="q-pr-xs q-gutter-xs">
    <q-card-section class="bg-primary text-white">
      <div class="text-h6">Filtrar por</div>
    </q-card-section>

    <q-form @submit="getRecords" class="q-gutter-y-xs">
      <q-select class="col"
        outlined
        clearable
        label="Tipo Activo"
        stack-label
        v-model="filterR.tipoActivo"
        :options="listaTiposActivo"
        option-value="codElemento"
        option-label="codElemento"
        multiple
        use-chips
        emit-value
      />
      <q-select
        outlined
        clearable
        label="Cod.empresa"
        stack-label
        v-model="filterR.codOtraEmpresa"
        :options="listaEmpresas"
        option-value="codElemento"
        option-label="valor1"
        multiple
        use-chips
        emit-value
        map-options
      />
      <q-select
        outlined
        clearable
        label="Gestor/Arrend"
        stack-label
        v-model="filterR.idEntidad"
        :options="listaEntidadesActivosFilter"
        option-value="id"
        option-label="nombre"
        use-input
        multiple
        use-chips
        emit-value
        @filter="filterEntidadesActivos"
        map-options
      />
      <q-select
        label="Estado Activo"
        stack-label
        outlined
        clearable
        v-model="filterR.estadoActivo"
        multiple
        :options="listaEstadosActivo"
        option-value="codElemento"
        option-label="valor1"
        emit-value
        map-options
        use-chips
      />
      <q-select
        outlined
        clearable
        label="Tipo Producto"
        stack-label
        v-model="filterR.tipoProducto"
        :options="listaTiposProducto"
        option-value="codElemento"
        option-label="codElemento"
        emit-value
        multiple
        use-chips
      />
      <q-select
        label="Computa"
        stack-label
        outlined
        clearable
        v-model="filterR.computa"
        :options="listaSINO"
        option-value="id"
        option-label="desc"
        emit-value
        map-options
      />
      <q-select
        label="Track Record / Cartera Actual"
        stack-label
        outlined
        v-model="filterR.trackRecord"
        :options="listaTrackRecord"
        @update:model-value="cargarDatos"
      />
      <q-input outlined clearable label="Launch Desde" stack-label v-model="filterR.launch" />

      <!-- ── Filtro por tamaño de fondo ── -->
      <q-select
        label="Tamaño fondo (Size)"
        stack-label
        outlined
        clearable
        v-model="filterR.sizeRange"
        :options="listaSizeRangos"
        option-value="value"
        option-label="label"
        emit-value
        map-options
      />

      <q-input outlined clearable label="Avg Gross Mult Desde" stack-label v-model="filterR.avgGrossMult" />
      <q-input outlined clearable label="Avg Gross IRR Desde"  stack-label v-model="filterR.avgGrossIrr" />
      <q-input outlined clearable label="Avg Net Mult Desde"   stack-label v-model="filterR.avgNetMult" />
      <q-input outlined clearable label="Avg Net IRR Desde"    stack-label v-model="filterR.avgNetIrr" />
      <q-input outlined clearable label="Avg Cash Yeld Desde"  stack-label v-model="filterR.avgCashYeld" />

      <q-card-actions align="right">
        <q-btn flat type="submit" label="Buscar" color="primary" @click="getRecords"/>
        <q-btn flat label="Cancel" color="primary" @click="$emit('hide')"/>
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { date } from 'quasar'
export default {
  props: ['value'],
  data () {
    return {
      filterR: {
        trackRecord: 'Track Record'
      },
      listaEntidadesActivosFilter: [],
      listaActivosFilter: [],
      listaTrackRecord: ['Track Record', 'Cartera Actual'],
      listaSizeRangos: [
        { value: '<500',        label: '< 500M' },
        { value: '500-1000',    label: '500M – 1BN' },
        { value: '1000-5000',   label: '1BN – 5BN' },
        { value: '5000-10000',  label: '5BN – 10BN' },
        { value: '10000-20000', label: '10BN – 20BN' },
        { value: '>20000',      label: '> 20BN' }
      ]
    }
  },
  computed: {
    ...mapState('tablasAux', ['listaEmpresas','listaSINO', 'listaUsers', 'listaTipoAcc', 'listaTiposActivo', 'listaMeses', 'listaTiposProducto', 'listaEstadosActivo', 'listaTipoOperacion']),
    ...mapState('entidades', ['listaEntidadesActivos']),
    ...mapState('activos', ['listaActivos']),
    ...mapState('login', ['user'])
  },
  methods: {
    ...mapActions('entidades', ['loadEntidadesActivos']),
    ...mapActions('activos', ['loadActivos']),
    filterActivos (val, update, abort) {
      update(() => {
        const needle = val.toLowerCase()
        this.listaActivosFilter = this.listaActivos.filter(v => v.nombre.toLowerCase().indexOf(needle) > -1)
      })
    },
    filterEntidadesActivos (val, update, abort) {
      update(() => {
        const needle = val.toLowerCase()
        this.listaEntidadesActivosFilter = this.listaEntidadesActivos.filter(v => v.nombre.toLowerCase().indexOf(needle) > -1)
      })
    },
    cargarDatos () {},
    getRecords () {
      this.$emit('getRecords', this.filterR)
    },
    formatDate (pdate) {
      return date.formatDate(pdate, 'DD-MM-YYYY')
    }
  },
  mounted () {
    this.filterR = Object.assign({}, this.value)
    this.loadEntidadesActivos()
    if (this.listaActivos.length <= 0) this.loadActivos(this.user.codEmpresa)
  },
  unmounted () {
    this.$emit('input', this.filterR)
  }
}
</script>