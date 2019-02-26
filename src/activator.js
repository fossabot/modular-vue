import Vue from 'vue'

import vuexAlong from './vuex-along'
import router from './router'
import store from './store'

// router.event 白名单
const EVENT_KEYS = Object.freeze({
  beforeEach: true,
  beforeResolve: true,
  afterEach: true,
  onReady: true,
  onError: true
})

export default {

  start (moduleConfig) {
    const application = moduleConfig.getApplication()
    vuexAlong.setKey(`${application.name}-${application.version}`)

    // 处理 vuex.module
    let configs = moduleConfig.getExtension('vuex.module')
    for (let key in configs) {
      store.registerModule(key, configs[key])
    }

    // 处理 vue.plugin
    configs = moduleConfig.getExtension('vue.plugin')
    for (let key in configs) {
      Vue.use(configs[key])
    }
    // 处理 vue.options
    const options = []
    configs = moduleConfig.getExtension('vue.options')
    for (let key in configs) {
      options.push(configs[key])
    }

    // 处理 vue.router
    configs = moduleConfig.getExtension('vue.router')
    for (let key in configs) {
    // 根据 key 组装 router
    // FIXME 临时跑通逻辑
      if (key === '/') {
        router.addRoutes(configs[key])
      }
    }

    // 处理 vue.router.event
    configs = moduleConfig.getExtension('vue.router.event')
    for (let key in configs) {
      const config = configs[key]
      for (let event in config) {
        if (EVENT_KEYS[event]) {
          router[event](config[event])
        }
      }
    }

    // 处理 vue.app
    const app = moduleConfig.getExtension('vue.app')
    const vueOptions = {
      router,
      store,
      mixins: options,
      render: h => h(app.component)
    }

    new Vue(vueOptions).$mount(app.el)
    // start end
  }

}