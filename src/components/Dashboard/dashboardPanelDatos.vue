<template>
  <div style="height: calc(100vh - 300px);" >
    <div class="q-pa-md row items-start q-gutter-md" >
    <q-card class="col-6 col-md my-card">
      <q-card-section align="center">
        <div class="text-subtitle-2 text-grey-8 text-weight-light">Patrim. Neto Enero</div>
        <div class="text-h5 text-green-7 text-weight-light">{{ numeralFormat(parseFloat(registrosPanelDatos.patrimonioNetoInicial), '0,0') }}€</div>
      </q-card-section>
    </q-card>
    <q-card class="col-6 col-md my-card bg-green-1">
      <q-card-section align="center">
        <div class="text-subtitle-2 text-grey-8 text-weight-bold">Patrim.Actual Neto</div>
        <div class="text-h5 text-green-7 text-weight-bold">{{ numeralFormat(parseFloat(registrosPanelDatos.patrimonioNetoMes), '0,0') }}€</div>
      </q-card-section>
    </q-card>
    <q-card class="col-6 col-md my-card bg-green-1">
      <q-card-section align="center">
        <div class="text-subtitle-2 text-grey-8 text-weight-bold">Beneficio</div>
        <div class="text-h5 text-green-7 text-weight-bold">{{ numeralFormat(parseFloat(beneficio), '0,0') }}€</div>
      </q-card-section>
    </q-card>
  </div>
  <div class="q-pa-md row items-start q-gutter-md" >
    <q-card class="col-6 col-md my-card">
      <q-card-section align="center">
        <div class="text-subtitle-2 text-grey-8 text-weight-light">%Rent.Anual Esperada</div>
        <div class="text-h5 text-green-7 text-weight-light">{{ numeralFormat(parseFloat(registrosPanelDatos.rentabilidadEsperadaInicial), '0.00') }}%</div>
      </q-card-section>
    </q-card>
    <q-card class="col-6 col-md my-card bg-green-1">
      <q-card-section align="center">
        <div class="text-subtitle-2 text-grey-8 text-weight-bold">%Rentab.Actual</div>
        <div class="text-h5 text-green-7 text-weight-bold">{{ numeralFormat(parseFloat(registrosPanelDatos.rentabilidadReal), '0.00') }}%</div>
      </q-card-section>
    </q-card>
    <q-card class="col-6 col-md my-card bg-green-1">
      <q-card-section align="center">
        <div class="text-subtitle-2 text-grey-8 text-weight-bold">Patrim.Actual Total</div>
        <div class="text-h5 text-green-7 text-weight-bold">{{ numeralFormat(parseFloat(registrosPanelDatos.patrimonioBrutoMes), '0,0')  }}€</div>
      </q-card-section>
    </q-card>
  </div>
</div>
</template>

<script>
// import numeral from 'numeral'
export default {
  props: ['value'], // en 'value' tenemos la tabla de datos del grid
  data () {
    return {
      registrosPanelDatos: [],
      beneficio: 0.0
    }
  },
  methods: {
    getPanelDatos (objFilter) {
      // cards resumen de rentabilidad y patrimonio actual
      this.$axios.get('movimientos/bd_movimientos.php/findcpanelDatos/', { params: objFilter })
        .then(response => {
          this.registrosPanelDatos = response.data
          this.calcularBeneficio (this.registrosPanelDatos)
        })
        .catch(error => {
          this.$q.dialog({ title: 'Error', message: error })
        })
    },
    calcularBeneficio (regPanel) {
      this.beneficio = regPanel.patrimonioNetoMes - regPanel.patrimonioNetoInicial
    }

  },
  mounted () {
    this.getPanelDatos(this.value) // carga datos de panel datos
  }
}
</script>
