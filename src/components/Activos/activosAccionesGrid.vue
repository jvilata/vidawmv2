  <!-- componente principal de definicion de formularios. Se apoya en otros 2 componentes: Filter y Grid -->
  <template>
    <div style="height: 100vh">
      <!-- formulario tabla de resultados de busqueda -->
      <q-card>
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
    </q-card>
      <accionesGrid
        v-model="filterRecord"
        :idActivo="value.id"
        :key="refreshKey"
        />
    </div>
</template>

<script>
import { mapState } from 'vuex'
import accionesGrid from 'components/Acciones/accionesGrid.vue'
export default {
  props: ['id'],
  data () {
    return {
      value: {},
      refreshKey: 0,
      filterRecord: {}
    }
  },
  computed: {
    ...mapState('tabs', ['tabs']),
    ...mapState('login', ['user']) // importo state.user desde store-login
  },
  methods: {
    getRecords () {
      this.filterRecord = { tipoObjeto: 'A', idObjeto: this.value.id }
      this.refreshKey++
    }
  },
  mounted () {
    this.value = this.tabs[this.id].meta.value
    this.getRecords()
  },
  components: {
    accionesGrid: accionesGrid
  }
}
</script>
