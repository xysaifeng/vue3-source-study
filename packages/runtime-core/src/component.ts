

export function createComponentInstance(vnode) {
  let instance = {
    data: null,// 页面组件的数据
    vnode,// 标识实例对应的虚拟节点vnode，双向记忆
    subTree: null,// 组件对应的渲染的虚拟节点
    isMounted: false,// 组件是否挂载
  }
  return instance
}


export function setupComponent(instance) {

}