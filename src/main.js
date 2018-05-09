// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './layouts/default'
import router from './router'

import * as VueGoogleMaps from 'vue2-google-maps'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'

Vue.use(VueGoogleMaps, {
  load: {
    key: process.env.GMAP_TOKEN,
    libraries: 'places'
  }
})

Vue.use(Vuetify, {
  theme: {
    primary: '#0088bf',
    accent: '#ce93d8',
    secondary: '#424242'
  }
})

Vue.config.productionTip = process.env.NODE_ENV !== 'production'

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
