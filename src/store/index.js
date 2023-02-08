import { store } from "quasar/wrappers";
import { createStore } from "vuex";

// todos los stores que queramos usar en la app deben importarse aqui y listarlos abajo en modules
import tasks from './store-tasks'
import login from './store-login'
import tabs from './store-tabs'
import tablasAux from './store-tablasAux'
import entidades from './store-entidades'
import activos from './store-activos'
import personal from './store-personal'
import mensajeLog from './store-log'

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export default store(function (/* { ssrContext } */) {
  const Store = createStore({
    modules: {
      tasks,
      login,
      tabs,
      tablasAux,
      mensajeLog,
      entidades,
      activos,
      personal
    },

    // enable strict mode (adds overhead!)
    // for dev mode and --debug builds only
    strict: process.env.DEBUGGING,
  });

  return Store;
});
