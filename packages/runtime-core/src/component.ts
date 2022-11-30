import { proxyRefs, reactive } from '@vue/reactivity';
import { hasOwn, isFunction, isObject } from '@vue/shared';
import { ShapeFlags } from './createVNode';

export let instance = null
export const getCurrentInstance = () => {
  return instance
}
export const setCurrentInstance = (i) => {
  instance = i
}

export function createComponentInstance(vnode) {
  let instance = {
    data: null,// 页面组件的数据
    vnode,// 标识实例对应的虚拟节点vnode，双向记忆
    subTree: null,// 组件对应的渲染的虚拟节点
    isMounted: false,// 组件是否挂载
    update: null, // 组件的effect.run方法
    render: null,
    // vnode.props 组件创建虚拟节点时提供的
    // vnode.type.props 这个是页面上用户写的
    propsOptions: vnode.type.props || {},// 代表用户接收的属性
    props: {},// 代表用户接收的属性
    attrs: {},//代表没有接收的属性
    // instance.proxy.$message
    proxy: null,//代表对象,初始化时候赋值
    setupState: {},// setup返回的如果是对象，则要给该对象赋值
    slots: {}, // 存放组件的所有插槽
    exposed: {}, // 存放要暴露出去的属性
  }
  return instance
}

function initProps(instance, rawProps) {
  const props = {}
  const attrs = {}
  // 用用户定义接收的props和父组件传递的props进行比较
  const options = instance.propsOptions
  if (rawProps) { // rawProps可能不存在
    for (let key in rawProps) {
      const value = rawProps[key]

      // 这里应该校验值的类型是否符合定义
      if (key in options) {
        props[key] = value
      } else {
        attrs[key] = value
      }
    }
  }
  // 稍后更新props应该可以达到重新渲染的效果（父组件改了props）
  // instance.props = shallowReactive(props) // props本是一个浅的响应式对象 shallowReactive
  instance.props = reactive(props) // 这里使用reactive
  instance.attrs = attrs // 默认是非响应式的，（开发环境是响应式的，方便调试，prod下是普通对象）
}

const publicProperties = {
  $attrs: instance => instance.attrs,
  $slots: instance => instance.slots,
}
const instanceProxy = {
  get(target, key, receiver) {
    const { data, props, setupState } = target // attrs的用法是this.$attr
    // v3取值顺序 setup -> data -> props
    if (data && hasOwn(data, key)) {
      if (hasOwn(props, key)) {
        console.warn(`Data property \"${key}\" is already defined in Props. `)
      }
      return data[key]
    } else if (setupState && hasOwn(setupState, key)) {

      return setupState[key]
    } else if (props && hasOwn(props, key)) {

      return props[key]
    }
    const getter = publicProperties[key]
    if (getter) {
      return getter(target)
    }
  },
  set(target, key, value, receiver) {
    const { data, props, setupState } = target
    if (data && hasOwn(data, key)) {
      data[key] = value
    } else if (setupState && hasOwn(setupState, key)) {
      setupState[key] = value
    } else if (props && hasOwn(props, key)) {
      console.warn('props not update')
      return false
    }
    return true
  }
}

function initSlots(instance, children) {
  // 判断虚拟节点的类型是否是插槽
  if (instance.vnode.shapeFlag & ShapeFlags.SLOTS_CHILDREN) {
    instance.slots = children // 将用户的children映射到实例上
  }

}

export function setupComponent(instance) {

  // type就是用户传入的属性
  const { type, children, props } = instance.vnode
  const { data, render, setup } = type;
  // 属性的初始化
  initProps(instance, props)
  // 初始化插槽，处理实例上的属性children,
  initSlots(instance, children)// 
  instance.proxy = new Proxy(instance, instanceProxy)

  if (data) {
    if (!isFunction(data)) {
      return console.warn('the data option must be a function.');
    }
    // 给组件实例data赋值
    instance.data = reactive(data.call({}))
  }

  if (setup) {
    // setup在执行的时候有两个参数，props和context => { attrs, slots, emit, expose }

    const context = {
      emit: (eventName, ...args) => {
        // childUpdate => onChildUpdate
        const name = `on${eventName[0].toUpperCase()}${eventName.slice(1)}`
        // 找到用户传递的props,包括用户传递的属性和事件
        const invoker = instance.vnode.props[name];
        // 调用组件绑定的事件
        invoker && invoker(...args)

      },
      attrs: instance.attrs,
      slots: instance.slots, // 插槽
      expose: exposed => instance.exposed = exposed || {} // 暴露
    }
    setCurrentInstance(instance) // setup启动前暴露出去instance
    const setupResult = setup(instance.props, context)
    setCurrentInstance(null) // setup启动后清空instance
    if (isFunction(setupResult)) {
      // 如果setup返回的是render 则采用这个render
      instance.render = setupResult
    } else if (isObject(setupResult)) {
      // 是数据 要存到状态里
      instance.setupState = proxyRefs(setupResult) // 要解包
    }
  }

  if (!instance.render) {
    if (render) {
      // 给组件实例render赋值
      instance.render = render
    } else {
      // 模板编译
    }
  }
  // 最终一定要获取到对应的render函数
}