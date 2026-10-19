<template>
  <div style="height: calc(100vh - 100px); display: flex; flex-direction: column;">

    <!-- ── Cabecera ──────────────────────────────────────────────────────── -->
    <q-card flat>
      <q-card-section class="q-pa-xs">
        <q-item class="q-pa-xs bg-indigo-1 text-grey-8">
          <q-item-section avatar>
            <q-icon name="today" color="indigo" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-h6">Pipeline — Calendario de Compromisos</q-item-label>
            <q-item-label caption>{{ anios[0] }} – {{ anios[4] }} · Empresa {{ codEmpresa }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn @click="$emit('close')" flat round dense icon="close" />
          </q-item-section>
        </q-item>
      </q-card-section>
    </q-card>

    <!-- ── Leyenda de colores ─────────────────────────────────────────────── -->
    <div class="row q-px-md q-py-xs q-gutter-sm items-center" style="background:#f8f9fa;border-bottom:1px solid #e0e0e0">
      <span class="text-caption text-grey-7">Color:</span>
      <q-chip dense color="blue-2" text-color="blue-10" icon="verified" size="sm">Invertido</q-chip>
      <q-chip dense color="green-2" text-color="green-10" icon="check_circle" size="sm">Confirmado</q-chip>
      <q-chip dense color="orange-2" text-color="orange-10" icon="schedule" size="sm">Pendiente</q-chip>
      <q-chip dense color="red-2"    text-color="red-10"    icon="radar" size="sm">Solo pipeline</q-chip>
      <q-space />
      <q-btn outline dense icon="manage_search" color="teal" label="Fondos vintage" size="sm" @click="abrirVintage" class="q-mr-xs" />
      <q-btn flat dense icon="refresh" color="indigo" label="Recargar" size="sm" @click="cargarDatos" />
    </div>

    <!-- ── Tabla calendario ───────────────────────────────────────────────── -->
    <div style="flex:1; overflow:auto;">
      <table class="pipeline-table">

        <!-- Cabecera de años -->
        <thead>
          <tr>
            <th class="col-label"></th>
            <th v-for="anio in anios" :key="anio" class="col-anio text-white">
              {{ anio }}
            </th>
          </tr>
        </thead>

        <tbody>

          <!-- Back into market — justo debajo de los años -->
          <tr class="back-market-row">
            <td class="col-label text-red-8 text-weight-bold text-caption">Back into market</td>
            <td v-for="anio in anios" :key="'bm-'+anio" class="col-anio">
              <div class="text-caption text-grey-5 text-center">Fondos</div>
              <div class="text-caption text-grey-5 text-center text-weight-bold">€/$</div>
            </td>
          </tr>

          <!-- ══════════════ SECCIÓN FONDOS CARTERA ════════════════════════ -->
          <tr class="seccion-header">
            <td colspan="6" class="text-weight-bold text-grey-8 bg-grey-2">
              <q-icon name="account_balance" class="q-mr-xs" />Fondos Cartera
              <span class="text-caption text-grey-6 q-ml-sm">(re-ups)</span>
            </td>
          </tr>

          <!-- Infrastructure (Cartera) -->
          <tr class="categoria-header">
            <td colspan="6" class="text-caption text-weight-bold text-indigo-8 q-pl-sm bg-indigo-1">
              Infrastructure
            </td>
          </tr>
          <tr>
            <td class="col-label"></td>
            <td v-for="anio in anios" :key="'ci-'+anio" class="col-anio col-fondos">
              <div class="fondos-cell">
                <!-- Fondos existentes -->
                <div
                  v-for="fondo in getFondos('CARTERA','INFRASTRUCTURE',anio)"
                  :key="fondo.id"
                  :class="['fondo-chip', 'bg-' + fondo.color + '-2']"
                  @click="editarFondo(fondo)">
                  <div class="fondo-nombre" :class="'text-' + fondo.color + '-10'">
                    <q-icon v-if="fondo.color === 'blue'" name="verified" size="12px" class="q-mr-xs" />{{ fondo.nombre }}
                  </div>
                  <div class="text-caption text-grey-6 q-mt-xs" v-if="fondo.quarter" style="font-size:10px">Data Room: {{ fondo.quarter }}</div>
                  <div class="row items-center justify-between q-mt-xs">
                    <span v-if="fondo.ticket" :class="['fondo-ticket','text-' + fondo.color + '-9']">{{ fondo.ticket }}M {{ fondo.moneda }}</span>
                    <span v-else class="fondo-ticket text-grey-5">—</span>
                    <q-btn flat round dense icon="delete_outline" size="8px" color="red-4" @click.stop="confirmarBorrar(fondo)" />
                  </div>
                </div>
                <!-- Botón añadir -->
                <q-btn flat round dense icon="add"
                  size="xs" color="indigo-7"
                  class="add-btn"
                  @click="abrirDialogoNuevo('CARTERA','INFRASTRUCTURE',anio)"
                >
                  <q-tooltip>Añadir fondo</q-tooltip>
                </q-btn>
              </div>
            </td>
          </tr>

          <!-- Private Equity (Cartera) -->
          <tr class="categoria-header">
            <td colspan="6" class="text-caption text-weight-bold text-indigo-8 q-pl-sm bg-indigo-1">
              Private Equity
            </td>
          </tr>
          <tr>
            <td class="col-label"></td>
            <td v-for="anio in anios" :key="'cpe-'+anio" class="col-anio col-fondos">
              <div class="fondos-cell">
                <div
                  v-for="fondo in getFondos('CARTERA','PRIVATE_EQUITY',anio)"
                  :key="fondo.id"
                  :class="['fondo-chip', 'bg-' + fondo.color + '-2']"
                  @click="editarFondo(fondo)">
                  <div class="fondo-nombre" :class="'text-' + fondo.color + '-10'">
                    <q-icon v-if="fondo.color === 'blue'" name="verified" size="12px" class="q-mr-xs" />{{ fondo.nombre }}
                  </div>
                  <div class="text-caption text-grey-6 q-mt-xs" v-if="fondo.quarter" style="font-size:10px">Data Room: {{ fondo.quarter }}</div>
                  <div class="row items-center justify-between q-mt-xs">
                    <span v-if="fondo.ticket" :class="['fondo-ticket','text-' + fondo.color + '-9']">{{ fondo.ticket }}M {{ fondo.moneda }}</span>
                    <span v-else class="fondo-ticket text-grey-5">—</span>
                    <q-btn flat round dense icon="delete_outline" size="8px" color="red-4" @click.stop="confirmarBorrar(fondo)" />
                  </div>
                </div>
                <q-btn flat round dense icon="add"
                  size="xs" color="indigo-7"
                  class="add-btn"
                  @click="abrirDialogoNuevo('CARTERA','PRIVATE_EQUITY',anio)"
                >
                  <q-tooltip>Añadir fondo</q-tooltip>
                </q-btn>
              </div>
            </td>
          </tr>

          <!-- Totales Cartera -->
          <tr class="total-row">
            <td class="col-label text-weight-bold text-grey-8 text-caption">Compromisos cartera</td>
            <td v-for="anio in anios" :key="'tc-'+anio" class="col-anio text-center">
              <div class="text-caption text-grey-6">Total {{ anio }}</div>
              <div class="text-weight-bold text-indigo-9" style="font-size:13px">
                {{ formatTotal(getTotalAnio('CARTERA', anio)) }}
              </div>
            </td>
          </tr>

          <!-- Espaciado entre secciones -->
          <tr style="height:12px"><td colspan="6"></td></tr>

          <!-- ══════════════ SECCIÓN FONDOS PIPELINE ════════════════════════ -->
          <tr class="seccion-header">
            <td colspan="6" class="text-weight-bold text-grey-8 bg-grey-2">
              <q-icon name="radar" class="q-mr-xs" />Fondos Pipeline
              <span class="text-caption text-grey-6 q-ml-sm">(nuevos)</span>
            </td>
          </tr>

          <!-- Infrastructure (Pipeline) -->
          <tr class="categoria-header">
            <td colspan="6" class="text-caption text-weight-bold text-indigo-8 q-pl-sm bg-indigo-1">
              Infrastructure
            </td>
          </tr>
          <tr>
            <td class="col-label"></td>
            <td v-for="anio in anios" :key="'pi-'+anio" class="col-anio col-fondos">
              <div class="fondos-cell">
                <div
                  v-for="fondo in getFondos('PIPELINE','INFRASTRUCTURE',anio)"
                  :key="fondo.id"
                  :class="['fondo-chip', 'bg-' + fondo.color + '-2']"
                  @click="editarFondo(fondo)">
                  <div class="fondo-nombre" :class="'text-' + fondo.color + '-10'">
                    <q-icon v-if="fondo.color === 'blue'" name="verified" size="12px" class="q-mr-xs" />{{ fondo.nombre }}
                  </div>
                  <div class="text-caption text-grey-6 q-mt-xs" v-if="fondo.quarter" style="font-size:10px">Data Room: {{ fondo.quarter }}</div>
                  <div class="row items-center justify-between q-mt-xs">
                    <span v-if="fondo.ticket" :class="['fondo-ticket','text-' + fondo.color + '-9']">{{ fondo.ticket }}M {{ fondo.moneda }}</span>
                    <span v-else class="fondo-ticket text-grey-5">—</span>
                    <q-btn flat round dense icon="delete_outline" size="8px" color="red-4" @click.stop="confirmarBorrar(fondo)" />
                  </div>
                </div>
                <q-btn flat round dense icon="add"
                  size="xs" color="indigo-7"
                  class="add-btn"
                  @click="abrirDialogoNuevo('PIPELINE','INFRASTRUCTURE',anio)"
                >
                  <q-tooltip>Añadir fondo pipeline</q-tooltip>
                </q-btn>
              </div>
            </td>
          </tr>

          <!-- Private Equity (Pipeline) -->
          <tr class="categoria-header">
            <td colspan="6" class="text-caption text-weight-bold text-indigo-8 q-pl-sm bg-indigo-1">
              Private Equity
            </td>
          </tr>
          <tr>
            <td class="col-label"></td>
            <td v-for="anio in anios" :key="'ppe-'+anio" class="col-anio col-fondos">
              <div class="fondos-cell">
                <div
                  v-for="fondo in getFondos('PIPELINE','PRIVATE_EQUITY',anio)"
                  :key="fondo.id"
                  :class="['fondo-chip', 'bg-' + fondo.color + '-2']"
                  @click="editarFondo(fondo)">
                  <div class="fondo-nombre" :class="'text-' + fondo.color + '-10'">
                    <q-icon v-if="fondo.color === 'blue'" name="verified" size="12px" class="q-mr-xs" />{{ fondo.nombre }}
                  </div>
                  <div class="text-caption text-grey-6 q-mt-xs" v-if="fondo.quarter" style="font-size:10px">Data Room: {{ fondo.quarter }}</div>
                  <div class="row items-center justify-between q-mt-xs">
                    <span v-if="fondo.ticket" :class="['fondo-ticket','text-' + fondo.color + '-9']">{{ fondo.ticket }}M {{ fondo.moneda }}</span>
                    <span v-else class="fondo-ticket text-grey-5">—</span>
                    <q-btn flat round dense icon="delete_outline" size="8px" color="red-4" @click.stop="confirmarBorrar(fondo)" />
                  </div>
                </div>
                <q-btn flat round dense icon="add"
                  size="xs" color="indigo-7"
                  class="add-btn"
                  @click="abrirDialogoNuevo('PIPELINE','PRIVATE_EQUITY',anio)"
                >
                  <q-tooltip>Añadir fondo pipeline</q-tooltip>
                </q-btn>
              </div>
            </td>
          </tr>

          <!-- Totales Pipeline -->
          <tr class="total-row">
            <td class="col-label text-weight-bold text-grey-8 text-caption">Compromisos pipeline</td>
            <td v-for="anio in anios" :key="'tp-'+anio" class="col-anio text-center">
              <div class="text-caption text-grey-6">Total {{ anio }}</div>
              <div class="text-weight-bold text-indigo-9" style="font-size:13px">
                {{ formatTotal(getTotalAnio('PIPELINE', anio)) }}
              </div>
            </td>
          </tr>

          <!-- ══ Fila total global (cartera + pipeline) ══════════════════ -->
          <tr style="height:4px"><td colspan="6"></td></tr>
          <tr class="total-global-row">
            <td class="col-label text-red-8 text-weight-bold text-caption">Total compromisos</td>
            <td v-for="anio in anios" :key="'tg-'+anio" class="col-anio text-center">
              <div class="text-caption text-grey-6">Total {{ anio }}</div>
              <div class="text-weight-bold text-red-9" style="font-size:13px">
                {{ formatTotal(getTotalAnio('CARTERA', anio) + getTotalAnio('PIPELINE', anio)) }}
              </div>
            </td>
          </tr>

        </tbody>
      </table>
    </div>

    <!-- ── Diálogo fondos vintage ───────────────────────────────────────── -->
    <q-dialog v-model="vintageVisible" >
      <q-card style="min-width:620px">
        <q-card-section class="bg-teal text-white">
          <div class="text-h6">
            <q-icon name="manage_search" class="q-mr-sm" />Fondos candidatos a re-up
          </div>
          <div class="text-caption opacity-75">
            ALTERN.R FIJA y CAP.RIESGO · EN OTRA EMPRESA · vintage últimos 7 años
          </div>
        </q-card-section>

        <q-card-section class="q-pa-none">
          <q-table
            :rows="fondosVintage"
            :columns="columnsVintage"
            row-key="id"
            dense flat
            :loading="vintageLoading"
            hide-bottom
            virtual-scroll
            style="max-height:460px"
            :rows-per-page-options="[0]"
          >
            <template v-slot:body-cell-enCalendario="props">
              <q-td :props="props" class="text-center">
                <q-checkbox
                  dense
                  :model-value="props.row.enCalendario == 1"
                  color="teal"
                  @update:model-value="val => toggleWatch(props.row, val)"
                />
              </q-td>
            </template>
            <template v-slot:no-data>
              <div class="full-width text-center q-pa-md text-grey-6">
                <q-icon name="info" size="sm" class="q-mr-sm" />
                No hay fondos con vintage en los últimos 7 años
              </div>
            </template>
          </q-table>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat label="Cerrar" color="grey" @click="vintageVisible = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ── Diálogo de añadir / editar fondo ──────────────────────────────── -->
    <q-dialog v-model="dialogVisible" persistent>
      <q-card style="min-width:440px">
        <q-card-section class="bg-indigo text-white">
          <div class="text-h6">{{ dialogForm.id ? 'Editar' : 'Añadir' }} fondo</div>
          <div class="text-caption opacity-75">
            {{ seccionLabel(dialogForm.seccion) }} ·
            {{ categoriaLabel(dialogForm.categoria) }} ·
            {{ dialogForm.anio }}
          </div>
        </q-card-section>

        <q-card-section class="q-gutter-sm q-pt-md">
          <!-- Nombre -->
          <q-input
            outlined dense autofocus
            label="Nombre del fondo *"
            v-model="dialogForm.nombre"
            :rules="[v => !!v || 'Requerido']"
          />

          <!-- Ticket + Moneda -->
          <div class="row q-gutter-sm">
            <q-input
              outlined dense
              label="Ticket (millones)"
              v-model.number="dialogForm.ticket"
              type="number" step="0.1" min="0"
              class="col-7"
              prefix="M"
            />
            <q-select
              outlined dense
              label="Moneda"
              v-model="dialogForm.moneda"
              :options="['EUR','USD']"
              class="col"
            />
          </div>

          <!-- Color / estado -->
          <q-select
            outlined dense
            label="Estado / color"
            v-model="dialogForm.color"
            :options="opcionesColor"
            option-value="val"
            option-label="label"
            emit-value map-options
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section avatar>
                  <q-icon :name="scope.opt.icon" :color="scope.opt.iconColor" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
            <template v-slot:prepend>
              <q-icon :name="colorOpt(dialogForm.color).icon" :color="colorOpt(dialogForm.color).iconColor" />
            </template>
          </q-select>

          <!-- Cambiar año / sección / categoría (solo en edición) -->
          <div v-if="dialogForm.id" class="row q-gutter-sm">
            <q-select
              outlined dense
              label="Año"
              v-model.number="dialogForm.anio"
              :options="anios"
              class="col-3"
            />
            <q-select
              outlined dense
              label="Sección"
              v-model="dialogForm.seccion"
              :options="[{label:'Cartera',value:'CARTERA'},{label:'Pipeline',value:'PIPELINE'}]"
              option-value="value" option-label="label" emit-value map-options
              class="col"
            />
            <q-select
              outlined dense
              label="Categoría"
              v-model="dialogForm.categoria"
              :options="[{label:'Infrastructure',value:'INFRASTRUCTURE'},{label:'Private Equity',value:'PRIVATE_EQUITY'}]"
              option-value="value" option-label="label" emit-value map-options
              class="col"
            />
          </div>

          <!-- Quarter apertura data room -->
          <q-select
            outlined dense
            label="Quarter apertura Data Room"
            v-model="dialogForm.quarter"
            :options="['Q1','Q2','Q3','Q4']"
            clearable
          />

          <!-- Notas -->
          <q-input
            outlined dense
            label="Notas (opcional)"
            v-model="dialogForm.notas"
            type="textarea" rows="2"
            counter maxlength="500"
            @keyup.enter.stop
          />
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat label="Cancelar" color="grey" @click="dialogVisible = false" />
          <q-btn unelevated label="Guardar" color="indigo" @click="guardarFondo" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </div>
</template>

<script>
import { mapState } from 'vuex'
import { date } from 'quasar'



const ANIO_ACTUAL = new Date().getFullYear()

export default {
  name: 'pipelineCalendarioMain',
  props: ['id'], // recibe el id del tab desde el sistema de tabs

  data () {
    return {
      fondos: [],           // todos los fondos cargados de BD
      dialogVisible: false,
      dialogForm: {
        id: null,
        codEmpresa: '',
        anio: ANIO_ACTUAL,
        seccion: 'CARTERA',
        categoria: 'INFRASTRUCTURE',
        nombre: '',
        ticket: null,
        moneda: 'EUR',
        color: 'green',
        quarter: null,
        notas: '',
        orden: 0
      },
      vintageVisible: false,
      vintageLoading: false,
      fondosVintageRaw: [],
      columnsVintage: [
        { name: 'nombre',        label: 'Fondo',                align: 'left',   field: 'nombre',        sortable: true, style: 'max-width:220px;white-space:normal' },
        { name: 'nomOtraEmpresa',label: 'Empresa',              align: 'left',   field: 'nomOtraEmpresa',sortable: true, style: 'width:140px;white-space:normal' },
        { name: 'ultimoVintage', label: 'Último vintage',       align: 'center', field: 'ultimoVintage', sortable: true, style: 'width:110px' },
        { name: 'enCalendario',  label: 'Añadido a calendario', align: 'center', field: 'enCalendario',  style: 'width:140px' }
      ],
      opcionesColor: [
        { val: 'blue',   label: 'Invertido',    icon: 'verified',     iconColor: 'blue-8'  },
        { val: 'green',  label: 'Confirmado',   icon: 'check_circle', iconColor: 'green-8' },
        { val: 'orange', label: 'Pendiente',    icon: 'schedule',     iconColor: 'orange-8' },
        { val: 'red',    label: 'Solo pipeline',icon: 'radar',        iconColor: 'red-8' }
      ]
    }
  },

  computed: {
    ...mapState('login', ['user']),

    codEmpresa () {
      return this.user?.codEmpresa || '01'
    },

    anios () {
      return [0, 1, 2, 3, 4].map(i => ANIO_ACTUAL + i)
    },

    // Fondos vintage: sin marcar primero (orden vintage ASC), marcados al final
    fondosVintage () {
      const sinMarcar = this.fondosVintageRaw.filter(f => !f.enCalendario)
      const marcados  = this.fondosVintageRaw.filter(f =>  f.enCalendario)
      return [...sinMarcar, ...marcados]
    }
  },

  methods: {
    // ── Carga de datos ──────────────────────────────────────────────────
    cargarDatos () {
      this.$axios.get('pipeline/bd_pipeline_fondos.php/findFilter', {
        params: { codEmpresa: this.codEmpresa }
      })
        .then(response => {
          this.fondos = response.data
        })
        .catch(error => {
          this.$q.dialog({ title: 'Error', message: String(error) })
        })
    },

    // ── Filtros de datos ────────────────────────────────────────────────
    getFondos (seccion, categoria, anio) {
      return this.fondos.filter(f =>
        f.seccion   === seccion   &&
        f.categoria === categoria &&
        parseInt(f.anio) === parseInt(anio)
      ).sort((a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre))
    },

    getTotalAnio (seccion, anio) {
      return this.fondos
        .filter(f => f.seccion === seccion && parseInt(f.anio) === parseInt(anio) && f.ticket)
        .reduce((acc, f) => acc + parseFloat(f.ticket), 0)
    },

    formatTotal (val) {
      if (!val || val === 0) return '—'
      return val.toFixed(1) + 'M'
    },

    // ── Diálogo nuevo fondo ─────────────────────────────────────────────
    abrirDialogoNuevo (seccion, categoria, anio) {
      this.dialogForm = {
        id: null,
        codEmpresa: this.codEmpresa,
        anio,
        seccion,
        categoria,
        nombre: '',
        ticket: null,
        moneda: 'EUR',
        color: seccion === 'PIPELINE' ? 'orange' : 'green',
        notas: '',
        orden: this.getFondos(seccion, categoria, anio).length
      }
      this.dialogVisible = true
    },

    // ── Diálogo editar ──────────────────────────────────────────────────
    editarFondo (fondo) {
      this.dialogForm = Object.assign({}, fondo, {
        ticket: fondo.ticket !== null ? parseFloat(fondo.ticket) : null,
        anio: parseInt(fondo.anio)
      })
      this.dialogVisible = true
    },

    // ── Guardar (crear o actualizar) ────────────────────────────────────
    guardarFondo () {
      if (!this.dialogForm.nombre.trim()) {
        this.$q.notify({ type: 'warning', message: 'El nombre del fondo es obligatorio' })
        return
      }

      const record = {
        ...this.dialogForm,
        codEmpresa: this.codEmpresa,
        user: this.user?.user?.email || ''
      }

      const formData = new FormData()
      for (const key in record) {
        if (record[key] !== null && record[key] !== undefined) {
          formData.append(key, record[key])
        }
      }

      this.$axios.post('pipeline/bd_pipeline_fondos.php/guardarBD', formData)
        .then(response => {
          this.dialogVisible = false
          const isNew = !this.dialogForm.id
          if (isNew) {
            // Añadir al array local
            this.fondos.push({ ...record, id: response.data.id })
          } else {
            // Actualizar en array local
            const idx = this.fondos.findIndex(f => f.id === record.id)
            if (idx !== -1) this.fondos.splice(idx, 1, { ...record })
          }
          this.$q.notify({ type: 'positive', message: 'Guardado correctamente' })
        })
        .catch(error => {
          const msg = error.response?.data?.error || String(error)
          this.$q.dialog({ title: 'Error al guardar', message: msg })
        })
    },

    // ── Borrar ──────────────────────────────────────────────────────────
    confirmarBorrar (fondo) {
      this.$q.dialog({
        title: 'Confirmar',
        message: `¿Borrar "${fondo.nombre}"?`,
        ok: { label: 'Borrar', color: 'red', flat: true },
        cancel: { label: 'Cancelar', flat: true },
        persistent: true
      }).onOk(() => {
        this.$axios.delete(
          `pipeline/bd_pipeline_fondos.php/guardarBD/${fondo.id}`,
          { params: { codEmpresa: this.codEmpresa } }
        )
          .then(() => {
            this.fondos = this.fondos.filter(f => f.id !== fondo.id)
            this.$q.notify({ type: 'positive', message: 'Eliminado' })
          })
          .catch(error => {
            this.$q.dialog({ title: 'Error', message: String(error) })
          })
      })
    },

    // ── Popup fondos vintage ─────────────────────────────────────────────
    abrirVintage () {
      this.vintageVisible = true
      this.vintageLoading = true
      this.$axios.get('pipeline/bd_pipeline_fondos.php/findFondosVintage', {
        params: { codEmpresa: this.codEmpresa }
      })
        .then(response => {
          this.fondosVintageRaw = response.data
        })
        .catch(error => {
          this.$q.dialog({ title: 'Error', message: String(error) })
        })
        .finally(() => {
          this.vintageLoading = false
        })
    },

    toggleWatch (row, val) {
      // Actualizar en el array raw — el computed reordena automáticamente
      const item = this.fondosVintageRaw.find(f => f.id === row.id)
      if (item) item.enCalendario = val ? 1 : 0
      this.$axios.post('pipeline/bd_pipeline_fondos.php/toggleWatch',
        JSON.stringify({
          codEmpresa:   this.codEmpresa,
          idActivo:     row.id,
          enCalendario: val ? 1 : 0,
          user:         this.user?.user?.email || ''
        }),
        { headers: { 'Content-Type': 'application/json' } }
      ).catch(error => {
        // Revertir si falla
        const item = this.fondosVintageRaw.find(f => f.id === row.id)
        if (item) item.enCalendario = val ? 0 : 1
        this.$q.dialog({ title: 'Error', message: String(error) })
      })
    },

    // ── Helpers de etiquetas ────────────────────────────────────────────
    seccionLabel (s) {
      return s === 'CARTERA' ? 'Fondos Cartera' : 'Fondos Pipeline'
    },
    categoriaLabel (c) {
      return c === 'INFRASTRUCTURE' ? 'Infrastructure' : 'Private Equity'
    },
    colorOpt (val) {
      return this.opcionesColor.find(o => o.val === val) || this.opcionesColor[0]
    }
  },

  mounted () {
    this.cargarDatos()
  }
}
</script>

<style scoped>
/* ── Tabla principal ─────────────────────────────────────────────────── */
.pipeline-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 900px;
  font-size: 13px;
}

/* Columna de etiqueta lateral */
.col-label {
  width: 140px;
  min-width: 130px;
  padding: 4px 10px;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  vertical-align: top;
  white-space: nowrap;
}

/* Columnas de años */
.col-anio {
  min-width: 180px;
  border: 1px solid #e8eaf6;
  padding: 4px 6px;
  vertical-align: top;
}

thead th {
  background: #3949ab;
  color: white;
  text-align: center;
  padding: 8px 6px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.5px;
  position: sticky;
  top: 0;
  z-index: 2;
  border: 1px solid #283593;
}

thead th.col-label {
  background: #283593;
}

/* Fila de sección (CARTERA / PIPELINE) */
.seccion-header td {
  padding: 6px 10px;
  border: 1px solid #ddd;
  font-size: 13px;
}

/* Fila "Back into market" */
.back-market-row td {
  border-top: 2px solid #ef5350;
  border-bottom: 1px solid #ffcdd2;
  padding: 3px 6px;
  background: #fff8f8;
}

.back-market-row .col-label {
  background: #ffebee;
}

/* Cabecera de categoría */
.categoria-header td {
  border: 1px solid #e0e0e0;
  padding: 3px 10px;
}

/* Fila de fondos */
.col-fondos {
  background: white;
  min-height: 60px;
}

.fondos-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 2px;
  min-height: 40px;
}

/* Chip de fondo */
.fondo-chip {
  border-radius: 6px;
  padding: 5px 8px;
  cursor: pointer;
  transition: filter 0.15s;
  border-left: 3px solid currentColor;
}

.fondo-chip:hover {
  filter: brightness(0.95);
}

.fondo-nombre {
  font-size: 11px;
  font-weight: 600;
  line-height: 1.3;
  word-break: break-word;
}

.fondo-ticket {
  font-size: 11px;
  font-weight: 700;
}

/* Botón añadir */
.add-btn {
  opacity: 0.55;
  transition: opacity 0.2s, transform 0.15s;
  align-self: flex-start;
  background: #e8eaf6 !important;
  border-radius: 50% !important;
}

.fondos-cell:hover .add-btn {
  opacity: 1;
  transform: scale(1.15);
  background: #c5cae9 !important;
}

/* Fila de totales */
.total-row td {
  border-top: 2px solid #3949ab;
  border-bottom: 1px solid #e0e0e0;
  padding: 6px 8px;
  background: #e8eaf6;
}

.total-row .col-label {
  background: #c5cae9;
}

/* Fila total global — mismo estilo que back into market */
.total-global-row td {
  border-top: 2px solid #ef5350;
  border-bottom: 1px solid #ffcdd2;
  padding: 6px 8px;
  background: #fff8f8;
}

.total-global-row .col-label {
  background: #ffebee;
}
</style>