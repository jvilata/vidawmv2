  <!-- componente que se llama desde accionesMain y que presenta el formulario de filtro y el boton de busqueda -->
  <template>
  <q-card style="width: 400px;" class="q-pr-xs q-gutter-xs">
    <q-card-section class="bg-primary text-white">
      <div class="text-h6">Borrar Valoraciones</div>
    </q-card-section>

    <q-form @submit="borrarValoraciones" class="q-gutter-y-xs">
      <q-input outlined clearable :rules="[val => !!val || 'Canpo obligatorio']" label="Fecha que se borra" stack-label :model-value="formatDate(filterR.fecha)" @update:model-value="val => filterR.fecha=val" >
        <template v-slot:append>
            <q-icon name="event" class="cursos-pointer">
              <q-popup-proxy ref="fecha">
                <wgDate v-model="filterR.fecha" @input="$refs.fecha.hide()"/>
              </q-popup-proxy>
            </q-icon>
        </template>
      </q-input>
      <q-select
        outlined
        clearable
        label="Gestor/Arrend"
        stack-label
        v-model="filterR.idEntidad"
        :options="listaEntidadesFilter"
        option-value="id"
        option-label="nombre"
        emit-value
        map-options
        @filter="filterEntidades"
        use-input
        hide-selected
        fill-input
        input-debounce="0"
      />
      <q-card-actions align="right">
        <q-btn  flat type="submit" label="Borrar" color="primary"/>
        <q-btn  flat label="Cancel" color="primary" @click="$emit('close')"/><!-- lo captura accionesMain -->
      </q-card-actions>
  </q-form>
  </q-card>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { date } from 'quasar'
import wgDate from 'components/General/wgDate.vue'
export default {
  props: ['modelValue'], // value es el objeto con los campos de filtro que le pasa accionesMain con v-model
  data () {
    return {
      filterR: {},
      listaEntidadesFilter: []
    }
  },
  computed: {
    ...mapState('tablasAux', ['listaMeses']),
    ...mapState('entidades', ['listaEntidades'])
  },
  methods: {
    ...mapActions('entidades', ['loadEntidades']),
    filterEntidades (val, update, abort) {
      update(() => {
        const needle = val.toLowerCase()
        this.listaEntidadesFilter = this.listaEntidades.filter(v => v.nombre.toLowerCase().indexOf(needle) > -1)
      })
    },
    borrarValoraciones () {
      this.$emit('borrarValoraciones', this.filterR) // lo captura accionesMain
    },
    formatDate (pdate) {
      return date.formatDate(pdate, 'DD-MM-YYYY')
    }
  },
  mounted () {
    this.filterR = Object.assign({}, this.modelValue) // asignamos valor del parametro por si viene de otro tab
    if (this.listaEntidades.length === 0) this.loadEntidades()
  },
  components: {
    wgDate: wgDate
  }
}
</script>
