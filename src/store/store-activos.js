import { axiosInstance } from 'boot/axios.js'
const state = {
  listaActivos: [],
  listaEstrategias: []
}

const mutations = {
  loadListaActivos (state, activos) {
    state.listaActivos = activos
  },
  loadListaEstrategias (state, estrategias) {
    state.listaEstrategias = estrategias
  }
}

const actions = {
  loadActivos ({ commit }, codEmpresa) {
    var objFilter = { codEmpresa: codEmpresa, estadoActivo: '1,4' }
    axiosInstance.get('activos/bd_activos.php/findActivosCombo/', { params: objFilter }, { withCredentials: true })
      .then((response) => {
        if (response.data.length === 0) {
          this.dispatch('mensajeLog/addMensaje', 'loadListaActivos' + 'No existen datos', { root: true })
        } else {
          commit('loadListaActivos', response.data)
        }
      })
      .catch(error => {
        this.dispatch('mensajeLog/addMensaje', 'loadListaActivos' + error, { root: true })
      })
  },
  loadEstrategias ({ commit }, codEmpresa) {
    var objFilter = { codEmpresa: codEmpresa }
    axiosInstance.get('estrategias/bd_estrategias.php/findEstrategiasCombo/', { params: objFilter }, { withCredentials: true })
      .then((response) => {
        if (response.data.length === 0) {
          this.dispatch('mensajeLog/addMensaje', 'loadListaEstrategias' + 'No existen datos', { root: true })
        } else {
          commit('loadListaEstrategias', response.data)
        }
      })
      .catch(error => {
        this.dispatch('mensajeLog/addMensaje', 'loadListaEstrategias' + error, { root: true })
      })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
