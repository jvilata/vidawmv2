<!-- componente que se llama desde accionesMain y que presenta el formulario de registro de jornada -->
<template>
  <q-card style="width: 400px;" class="q-pr-xs q-gutter-xs">
    <q-card-section class="bg-primary text-white">
      <div class="text-h6">Registro jornada</div>
    </q-card-section>

    <q-form @submit="saveRecord" class="q-gutter-y-xs">
      <q-select
        :readonly="this.user.pers.userRol != '1'"
        outlined
        clearable
        label="Persona"
        stack-label
        v-model="filterR.idpersonal"
        :options="listaPersonal"
        option-value="id"
        option-label="nombre"
        emit-value
        map-options
      />
      <q-select
        outlined
        clearable
        label="Tipo Jornada"
        @update:model-value="onTipoJornadaChange"
        stack-label
        v-model="filterR.tipoJornada"
        :options="listaTiposJornada"
        option-value="codElemento"
        option-label="codElemento"
        emit-value
      />

      <!-- FECHA INICIO / HORA INICIO -->
      <q-input outlined clearable label="Fecha Inicio" stack-label type="date"
        :model-value="getFecha('fechaInicio')"
        @update:model-value="val => setFecha('fechaInicio', val)" />

      <q-input class="col-xs-6 col-sm-6" outlined label="Hora Inicio" stack-label mask="time"
        :model-value="getHora('fechaInicio')"
        @update:model-value="val => { if (val && val.length === 5) setHora('fechaInicio', val) }">
        <template v-slot:append>
          <q-icon name="access_time" class="cursor-pointer">
            <q-popup-proxy>
              <q-time
                :model-value="getHora('fechaInicio')"
                @update:model-value="val => setHora('fechaInicio', val)"
                :hour-options="hourOptions"
                :minute-options="minuteOptions"
                mask="HH:mm"
                format24h
              >
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Aceptar" color="primary" flat />
                </div>
              </q-time>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

      <!-- FECHA FIN / HORA FIN -->
      <q-input outlined clearable label="Fecha Fin" stack-label type="date"
        :model-value="getFecha('fechaFin')"
        @update:model-value="val => setFecha('fechaFin', val)" />

      <q-input class="col-xs-6 col-sm-6" outlined label="Hora Fin" stack-label mask="time"
        :model-value="getHora('fechaFin')"
        @update:model-value="val => { if (val && val.length === 5) setHora('fechaFin', val) }">
        <template v-slot:append>
          <q-icon name="access_time" class="cursor-pointer">
            <q-popup-proxy>
              <q-time
                :model-value="getHora('fechaFin')"
                @update:model-value="val => setHora('fechaFin', val)"
                :hour-options="hourOptions"
                :minute-options="minuteOptions"
                mask="HH:mm"
                format24h
              >
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Aceptar" color="primary" flat />
                </div>
              </q-time>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

      <q-select
        :readonly="this.user.pers.userRol !== '1'"
        outlined
        clearable
        label="Estados Jornada"
        stack-label
        v-model="filterR.estado"
        :options="listaEstadosJornada"
        option-value="codElemento"
        option-label="codElemento"
        emit-value
      />
      <q-card-actions align="right">
        <q-btn  type="submit" :label="(filterR.id !== -1 ?'Modificar':'Registrar')" color="primary"/>
        <q-btn v-if="filterR.id !== -1" label="Borrar" color="negative" @click="borrarRegistro"/>
        <q-btn  label="Cancelar" color="primary" @click="$emit('hide')"/><!-- lo captura accionesMain -->
      </q-card-actions>
  </q-form>
  </q-card>
</template>

<script>
import { mapState } from 'vuex'
import { date } from 'quasar'
export default {
  props: ['value'], // value es el objeto con los campos de filtro que le pasa accionesMain con v-model
  data () {
    return {
      filterR: {
        fechaInicio: ''
      },
      listaEntidadesFilter: [],
      hourOptions: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
      minuteOptions: [0, 30],
      secondOptions: [0, 10, 20, 30, 40, 50]
    }
  },
  computed: {
    ...mapState('tablasAux', ['listaTiposJornada', 'listaEstadosJornada']),
    ...mapState('personal', ['listaPersonal']),
    ...mapState('login', ['user'])
  },
  methods: {
    // fechaInicio / fechaFin guardan 'YYYY-MM-DD HH:mm'. Estos helpers leen/escriben solo una parte conservando la otra.
    getFecha (campo) {
      const v = this.filterR[campo]
      return v ? v.substring(0, 10) : ''
    },
    getHora (campo) {
      const v = this.filterR[campo]
      return v && v.length >= 16 ? v.substring(11, 16) : '00:00'
    },
    setFecha (campo, val) {
      this.filterR[campo] = val ? val + ' ' + this.getHora(campo) : ''
    },
    setHora (campo, val) {
      const f = this.getFecha(campo) || date.formatDate(new Date(), 'YYYY-MM-DD')
      this.filterR[campo] = f + ' ' + val
    },
    onTipoJornadaChange (val) {
      if (val && val !== 'ORDINARIA') {
        this.filterR.estado = 'PENDIENTE'
        this.setHora('fechaInicio', '00:00')
        this.setHora('fechaFin', '00:00')
      }
    },
    crearRegistro () { // crear nuevo registro
      var horaInicio1 = this.user.pers.horaInicio1
      if (horaInicio1 === '' || horaInicio1 === null) horaInicio1 = '09:00'
      var horaFin1 = this.user.pers.horaFin1
      if (horaFin1 === '' || horaFin1 === null) horaFin1 = '14:00'
      var horaInicio2 = this.user.pers.horaInicio2
      if (horaInicio2 === '' || horaInicio2 === null) horaInicio2 = '15:00'
      var horaFin2 = this.user.pers.horaFin2
      if (horaFin2 === '' || horaFin2 === null) horaFin2 = '18:00'

      this.filterR = {
        id: -1,
        idpersonal: this.user.pers.id,
        tipoJornada: 'ORDINARIA',
        fechaInicio: date.formatDate(new Date(), 'YYYY-MM-DD'),
        fechaFin: date.formatDate(new Date(), 'YYYY-MM-DD'),
        estado: 'APROBADO'
      }
      // en this.value tengo el ultmo fichaje
      if (this.value.fechaInicio && this.value.fechaInicio.substring(0, 10) === this.filterR.fechaInicio.substring(0, 10) && // misma fecha
        this.value.fechaInicio.substring(11, 16) === horaInicio1) { // primera hora de fichaje, falta la segunda
        this.filterR.fechaInicio += ' ' + horaInicio2 // falta fichar la segunda parte
        this.filterR.fechaFin += ' ' + horaFin2
      } else {
        this.filterR.fechaInicio += ' ' + horaInicio1
        this.filterR.fechaFin += ' ' + horaFin1
      }
    },
    borrarRegistro () {
      this.$q.dialog({
        title: 'Confirmar',
        message: '¿ Borrar este registro ?',
        ok: true,
        cancel: true,
        persistent: true
      }).onOk(() => {
        this.$emit('deleteRecord', this.filterR)
      })
    },
    saveRecord () {
      if (this.filterR.fechaInicio.length < 18) this.filterR.fechaInicio += ':00' // añado segundos
      if (this.filterR.fechaFin.length < 18) this.filterR.fechaFin += ':00' // añado segundos
      this.$emit('saveRecord', this.filterR) // lo captura accionesMain
    }
  },
  mounted () {
    this.filterR = Object.assign({}, this.value)
    if (this.value.registroNuevo === true) this.crearRegistro()
  }
}
</script>