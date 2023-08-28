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
      const { loader, timeout, errorComponent, delay, loadingComponent, onError } = loaderOrOptions
      const loaded = ref(false)
      const error = ref(false)
      const loading = ref(false)

      if (timeout) {
        setTimeout(() => {
          error.value = true
        }, timeout);
      }
      let timer
      if (delay) {
        timer = setTimeout(() => {
          loading.value = true
        }, delay);
      } else {
        // 没有延时直接显示loading 
        loading.value = true
      }

      let retryCount = 1
      function load() {
        return loader().catch(err => {
          if (onError) {
            return new Promise((resolve, reject) => {
              const retry = () => {
                retryCount++
                resolve(load())
              }
              const fail = () => reject()
              onError(err, retry, fail, retryCount)
            })
          } else {
            throw err
          }
        })
      }

      load().then(component => {
        loaded.value = true
        Component = component
      }).catch(err => {
        error.value = true
      }).finally(() => {
        loading.value = false
        //bug: 如果写了delay但是loader很快加载完毕了，delay的时间到了 还是会吧loading改为true
        // fix:如果有delay还是要有清空定时器的操作
        clearTimeout(timer)
        timer = null
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