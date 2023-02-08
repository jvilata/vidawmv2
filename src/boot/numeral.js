//yarn add vue-numerals 'numeral@>=2'


import { boot } from "quasar/wrappers";
import VueNumerals from 'vue-numerals';
import numeral from 'numeral'

numeral.defaultFormat('0,0.00');
const numeralInstance = numeral

export default boot(({ app }) => {
    app.use(VueNumerals, { locale: 'es-es' })
    app.config.globalProperties.$numeral = numeralInstance;
  })
export { numeralInstance }
