import Vue from 'vue'
import Router from 'vue-router'
import OrderTrack from '@/pages/order/_token'
import Home from '@/pages/home'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: Home
    },
    {
      path: '/order/:token',
      name: 'order',
      component: OrderTrack
    }
  ]
})
