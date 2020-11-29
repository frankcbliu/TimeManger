import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'menu-bar',
      component: require('@/components/MenuBar').default
    },
    {
      path: '/setting',
      name: 'setting',
      component: require('@/components/Setting.vue').default
    },
    {
      path: '/complete',
      name: 'complete',
      component: require('@/components/Complete.vue').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
