// hemos creado este store para que centralice la gestion de los Tab Panels de la app.
// De momento sólo los escribe en consola y los guarda en un una lista en memoria. En el futuro se podría volcar a BD.
// para abrir un formulario en un nuevo tab se llama a: this.addTab([link.name, link.label, {}, 1])
// link.name debe coincidir con un name en router/routes.js y routes ya define el component que debe abrir.
// cada vez que cambiamos de tab se 'destruye' el componente y se pierden los datos y cada vez que entramos
// en una pantalla (componente) se 'monta' de nuevo y se inicializan las variables locales
// por eso en el state.tabs guardamos todos los tabs abiertos con sus datos locales que queramos conservar

// state: accesibles en lectura desde componentes a traves de ...mapState('tabs', ['tabs'])
const state = {
  ltab: '', // tab actual
  tabs: {}, // {name: 'nombre tab', params:{ id:'idtab' }, meta: {keyValue: 1, value: { tab data record } }}
  dataTabs: {} // estructura de datos a medida para algunas pantallas
}
// mutations: solo están accesibles a las actions a traves de commit, p.e., commit('addTab', tab)
const mutations = {
  addTab: (state, tab) => {
    if (!state.tabs[tab.params.id]) { // si no existia ya el tab lo añadimos a tabs
      state.tabs[tab.params.id] = {}
    }
    Object.assign(state.tabs[tab.params.id], tab)
    state.tabs[tab.params.id].meta.idTab = tab.params.id
  },
  updateTabData: (state, [tab, record]) => {
    if (state.tabs[state.ltab]) { // modificamos los datos locales de este tab. ltab se asigna en mainTabs al tab seleccioando
      if ((!record.idTab) || (state.tabs[state.ltab].meta.idTab === record.idTab)) { // params.value.id === record.id hago esta comprobacion porque en maintabs se mezclan eventos input entre tabs
        Object.assign(state.tabs[state.ltab].meta.value, record)
      }
    }
  },
  removeTab: (state, tab) => {
    delete state.tabs[tab.params.id]
  },
  removeAllTabs: (state) => {
    state.tabs = {}
  },
  setltab: (state, value) => {
    state.ltab = value
  },
  // estructura a medida para algunas pantallas
  addDataTab: (state, tab) => {
    state.dataTabs[tab.id] = {}
    Object.assign(state.dataTabs[tab.id], tab)
    Object.assign(state.dataTabs[tab.id].filterRecord, tab.filterRecord)
    Object.assign(state.dataTabs[tab.id].registrosSeleccionados, tab.registrosSeleccionados)
  },
  removeDataTab: (state, id) => {
    delete state.dataTabs[id]
  }
}
// actions: accesibles desde componentes a traves de ...mapActions('tabs', ['addTab'])
const actions = {
  addTab ({ commit }, [ComponentName, label = ComponentName, defaultValue = {}, keyValue = null]) {
    var tab = {
      name: ComponentName,
      label: label,
      params: {
        id: ComponentName + '-' + (keyValue === null ? Object.keys(state.tabs).length : keyValue)
      },
      meta: {
        keyValue: keyValue,
        value: defaultValue
      }
    }
    if (!state.tabs[tab.params.id]) {
      commit('addTab', tab)
    } else {
      this.dispatch('tabs/updateTabData', [tab, defaultValue])
    }
    if (tab.params.id !== this.$router.currentRoute.value.params.id) { //this.$router.app._route.params.id) {
      this.$router.push(state.tabs[tab.params.id])
    }
  },
  updateTabData ({ commit }, [tab, record]) { // updated: { tab, record }
    commit('updateTabData', [tab, record])
  },
  removeTab ({ commit }, tab) {
    const keys = Object.keys(state.tabs)
    let i = keys.findIndex(key => key === tab.params.id) // busco el tab anterior a este
    if (i - 1 < 0) i = 2
    if (keys.length > 1) this.$router.push(state.tabs[keys[i - 1]]) // this.$router.push(state.tabs[keys[0]])
    else this.$router.push('/sinTabs')
    commit('removeTab', tab)
  },
  removeAllTabs ({ commit }) {
    commit('removeAllTabs')
  },
  setltab ({ commit }, value) {
    commit('setltab', value)
  },
  addDataTab ({ commit }, tab) {
    commit('addDataTab', tab)
  },
  removeDataTab ({ commit }, tab) {
    commit('removeDataTab', tab)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
