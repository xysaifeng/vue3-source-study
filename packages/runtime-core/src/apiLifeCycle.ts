import { instance, setCurrentInstance } from "./component"


export const enum LifeCycle {
  BEFORE_MOUNT = 'bm',
  MOUNTED = 'm',
  UPDATED = 'u'
}

// 借助函数柯里化实现参数的内置
function createInvoker(type) {
  return function (hook, currentInstance = instance) {
    // currentInstance就是当前调用onMounted所在组件的实例，后续instance变化了（被清空了），不会影响currentInstance
    if (currentInstance) {
      const lifeCycles = currentInstance[type] || (currentInstance[type] = [])
      const wrapHook = () => { // wrapHook的作用使用了AOP思想（函数切片）
        setCurrentInstance(currentInstance)
        hook.call(currentInstance) // 这里的instance可以取到，原因是他是闭包里的，可以取到上一层作用域的instacne
        setCurrentInstance(null)
      }
      lifeCycles.push(wrapHook)
    }
  }
}

export const onBeforeMount = createInvoker(LifeCycle.BEFORE_MOUNT)
export const onMounted = createInvoker(LifeCycle.MOUNTED)
export const onUpdated = createInvoker(LifeCycle.UPDATED)