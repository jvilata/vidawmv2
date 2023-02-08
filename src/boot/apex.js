/***************
 *  APEX-CHARTS
 * *
 * * hay que instalar el paquetes apex-chart
 * yarn add apexcharts
 * yarn add vue3-apexcharts (para la versión 3 de Vue))
 *
 */
import { boot } from "quasar/wrappers";
import VueApexCharts from "vue3-apexcharts";

// The app.use(VueApexCharts) will make <apexchart> component available everywhere.
export default boot(({ app }) => {
    app.use(VueApexCharts)
  })
