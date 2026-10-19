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
    
    <q-page class="q-ma-md q-pa-xs">
      <div style="height: 500px; width: 100%; border-radius: 12px; overflow: hidden;">
        
        <l-map 
          :key="mapKey"
          ref="map" 
          v-model:zoom="zoom" 
          :center="centroMapa"
        >
          <l-tile-layer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            layer-type="base"
            name="OpenStreetMap"
          ></l-tile-layer>

          <l-marker 
            v-for="inmueble in inmuebles" 
            :key="inmueble.id" 
            :lat-lng="[inmueble.lat, inmueble.lng]"
          >
            <l-popup>
              <div class="text-bold text-indigo q-mb-xs">{{ inmueble.nombre }}</div>
              
              <div v-if="inmueble.imagen" class="q-mb-sm" style="width: 200px; max-height: 120px; overflow: hidden; border-radius: 6px;">
                <q-img 
                  :src="inmueble.imagen" 
                  spinner-color="primary"
                  style="height: 120px; width: 200px"
                  fit="cover"
                  @load="refrescarPopup" 
                />
              </div>

              <div class="text-caption text-grey-8">{{ inmueble.direccion }}</div>
              
              <q-btn 
                size="sm" 
                color="primary" 
                label="Ver ficha" 
                class="q-mt-sm full-width" 
                @click="irAFicha(inmueble.id)"
              />
            </l-popup>
          </l-marker>
        </l-map>
      </div>
    </q-page>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import "leaflet/dist/leaflet.css";
import { LMap, LTileLayer, LMarker, LPopup } from "@vue-leaflet/vue-leaflet";
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default {
  components: { LMap, LTileLayer, LMarker, LPopup },
  data() {
    return {
      zoom: 6,
      centroMapa: [40.4167, -3.7037],
      nomFormulario: 'Inmuebles',
      registrosSeleccionados: [],
      inmuebles: [],
      cargando: true,
      mapKey: 0
    };
  },
  computed: {
    ...mapState('login', ['user'])
  },
  methods: {
    ...mapActions('tabs', ['addTab']),
    getInmuebles() {
      this.cargando = true;
      return this.$axios.get('activos/bd_activos.php/getInmueblesCartera', {
        params: { codEmpresa: this.user.codEmpresa }  // ← filtro por empresa
      })
        .then(response => {
          this.registrosSeleccionados = response.data;

          const listaProcesada = response.data.map(item => {
            let latitud = 40.4167;
            let longitud = -3.7037;
            let direccionLimpia = item.direccion;

            if (item.direccion) {
              const latMatch = item.direccion.match(/lat:\s*([-\d.]+)/);
              const lngMatch = item.direccion.match(/lng:\s*([-\d.]+)/);

              if (latMatch && lngMatch) {
                latitud = parseFloat(latMatch[1]);
                longitud = parseFloat(lngMatch[1]);
              }
              direccionLimpia = item.direccion.split('. lat:')[0].trim();
            }

            return {
              id: item.id,
              nombre: item.nombre || 'Sin nombre',
              direccion: direccionLimpia,
              lat: latitud,
              lng: longitud,
              imagen: item.urlinfo || 'https://vidawm.com/privado/php/activos/images/sin-imagen.jpg'
            };
          });

          this.inmuebles = listaProcesada.filter(inm => inm.lat !== 40.4167 && inm.lng !== -3.7037);

          if (this.inmuebles.length > 0) {
            this.centroMapa = [this.inmuebles[0].lat, this.inmuebles[0].lng];
            this.zoom = 10;
          }

          this.cargando = false;
          this.mapKey++;
        })
        .catch(error => {
          this.cargando = false;
          this.$q.dialog({ title: 'Error', message: error.message || error });
        });
    },
    irAFicha(idActivo) {
      if (!idActivo) return;
      const activoCompleto = this.registrosSeleccionados.find(item => item.id === idActivo);
      if (activoCompleto) {
        this.addTab([
          'activosFormMain',
          'Activo-' + idActivo,
          activoCompleto,
          idActivo
        ]);
      }
    },
    refrescarPopup() {
      if (this.$refs.map && this.$refs.map.leafletObject) {
        const mapaNativo = this.$refs.map.leafletObject;
        mapaNativo.eachLayer((layer) => {
          if (layer.getPopup && layer.isPopupOpen()) {
            layer.getPopup().update();
          }
        });
      }
    }
  },
  mounted() {
    this.getInmuebles();
  }
};
</script>