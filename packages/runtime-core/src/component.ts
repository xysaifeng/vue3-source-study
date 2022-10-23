import { reactive } from '@vue/reactivity';
import { isFunction } from '@vue/shared';


export function createComponentInstance(vnode) {
  let instance = {
    data: null,// 页面组件的数据
    vnode,// 标识实例对应的虚拟节点vnode，双向记忆
    subTree: null,// 组件对应的渲染的虚拟节点
    isMounted: false,// 组件是否挂载
    update: null, // 组件的effect.run方法
    render: null,
  }
  return instance
}


export function setupComponent(instance) {

  // type就是用户传入的属性
  const { type, children, props } = instance.vnode
  const { data, render } = type;

  if (data) {
    if (!isFunction(data)) {
      return console.warn('the data option must be a function.');
    }
    // 给组件实例data赋值
    instance.data = reactive(data.call({}))
  }

  // 给组件实例render赋值
  instance.render = render

}