import { ref } from "@vue/reactivity"
import { Fragment } from "./createVNode"
import { h } from "./h"




export function defineAsyncComponent(loaderOrOptions) {

  if (typeof loaderOrOptions === 'function') {
    loaderOrOptions = {
      loader: loaderOrOptions
    }
  }

  // 开始默认加载一个空 之后加载对应的组件
  let Component = null
  return {
    setup() {
      const { loader, timeout, errorComponent, delay, loadingComponent } = loaderOrOptions
      const loaded = ref(false)
      const error = ref(false)
      const loading = ref(false)

      if (timeout) {
        setTimeout(() => {
          error.value = true
        }, timeout);
      }
      if (delay) {
        setTimeout(() => {
          loading.value = true
        }, delay);
      } else {
        loading.value = true
      }

      loader().then(component => {
        loaded.value = true
        Component = component
      }).catch(err => {
        error.value = true
      }).finally(() => {
        loading.value = false
      })

      return () => {
        if (loaded.value) {
          return h(Component)
        } else if (error.value && errorComponent) {
          return h(errorComponent)
        } else if (loading.value && loadingComponent) {
          return h(loadingComponent)
        }
        // bug 此处报错是因为：刚开始渲染的是错误组件，后面渲染正确组件 =>将错误组件卸载后挂载正确组件
        return h(Fragment, [])
      }
    }
  }

}