import { boot } from "quasar/wrappers";
import axios from 'axios'
// la libreria AXIOS nos sirve para hacer llamadas HTTP al backend, desde aqui la configuramos
// mientras desarrollamos seguramente tendremos backend en un server y el cliente frontend en máquinas distintas
// esto esta protegido por los navegadores por lo que se llama CORS, es necesario poner en todas las llamadas del cliente axios
// withCredentials para que envíe las cookies que previamente le habrá enviado el backend
// para enviar datos en formato formulario (formData) utilizaremos application/x-www-form-urlencoded
// sin embargo el formato normal de envío será JSON con: application/json
const headerFormData = {
  withCredentials: true,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
}

const axiosInstance = axios.create({
  baseURL: 'http://localhost/vidawm/php/', //  'bbdd local: 'http://localhost/vidawm/php/', produccion: https://vidawm.com/privado/php/ // 
  withCredentials: true,
  headers: {
    Accept: ['application/json', 'text/html', 'application/xhtml+xml', 'application/xml'],
    'Content-Type': 'application/json'
  }
})


export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axiosInstance;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = axiosInstance;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
})

export { axiosInstance, headerFormData }
