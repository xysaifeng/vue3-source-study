import { isNumber, isString } from "@vue/shared";
import { createVNode, ShapFlags, Text } from "./createVNode";


export function createRenderer(options) { // 用户可以调用此方法传入对应的渲染选项
  // options 使用用户自己渲染的时候，可以决定有哪些方法

  let {
    createElement: hostCreateElement,
    createTextNode: hostCreateTextNode,
    insert: hostInsert,
    remove: hostRemove,
    querySelector: hostQuerySelector,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    setText: hostSetText,
    setElementText: hostSetElementText,
    patchProp: hostPatchProp,
  } = options


  function normalize(children, i) {
    // 如果child是文本或数字，将其转换为虚拟节点
    if (isString(children[i]) || isNumber(children[i])) {
      children[i] = createVNode(Text, null, children[i])
    }
    return children[i]

  }

  function patchProps(oldProps, newProps, el) {
    if (oldProps == null) oldProps = {}
    if (newProps == null) newProps = {}

    // 循环新的覆盖老的
    for (let key in newProps) {
      hostPatchProp(el, key, oldProps[key], newProps[key])
    }

    // 老的有新的没有要删除
    for (let key in oldProps) {
      if (newProps[key] == null) {
        hostPatchProp(el, key, oldProps[key], null)
      }

    }
  }

  function mountChildren(children, container) {

    for (let i = 0; i < children.length; i++) {
      // const child = children[i] // 不行
      // * child可能是文本，需要把文本变为虚拟节点
      const child = normalize(children, i)
      // 递归渲染子节点
      // 经过处理后的child可能是文本了
      patch(null, child, container)
    }
  }

  function mountElement(vnode, container) {
    let { type, props, children, shapFlag } = vnode
    console.log('type: ', type);
    // 先创建自己再创建儿子

    //  虚拟节点要标识它对应的真实元素，因为后续需要比对虚拟节点的差异更新页面，所以需要保留对应的真实节点
    let el = vnode.el = hostCreateElement(type)

    if (props) { // {a: 1,b : 2} => {c: 3}
      // 更新属性
      patchProps(null, props, el)
    }

    // children 不是数组就是文本
    if (shapFlag & ShapFlags.TEXT_CHILDREN) {
      hostSetElementText(el, children)
    }
    if (shapFlag & ShapFlags.ARRAY_CHILDREN) {
      mountChildren(children, el)
    }

    hostInsert(el, container)
  }

  function processText(n1, n2, container) {
    if (n1 == null) {
      // 创建一个文本节点并插入，因为可能有多个文本
      // n2是一个文本的虚拟节点，把文本虚拟节点的内容创造一个文本出来，
      // 并且做上标记，虚拟节点的el上要存上真实节点
      hostInsert(n2.el = hostCreateTextNode(n2.children), container)
    }
  }

  function processElement(n1, n2, container) {
    if (n1 == null) {
      mountElement(n2, container)
    }
  }

  // n1前一个虚拟节点 n2当前的虚拟节点
  function patch(n1, n2, container) {
    // if (n1 == null) {
    //   // 初次渲染，挂载元素
    //   mountElement(n2, container)
    // } else {
    //   // n1有值 说明要走diff算法
    // }
    // n2要么是元素要么是文本
    const { type, shapFlag } = n2
    switch (type) {
      case Text:
        processText(n1, n2, container)
        break;
      default:
        if (shapFlag & ShapFlags.ELEMENT) {
          processElement(n1, n2, container)
        }
        break;
    }
  }

  const render = (vnode, container) => { // 需要将vnode渲染到container并且调用options中的api
    // console.log('vnode,container: ', vnode, container);
    // 判断是初次渲染还是非初次渲染还是卸载 分三种情况：渲染 更新 卸载
    if (vnode == null) { // 卸载

    } else { // 渲染 更新
      // 要判断是初次渲染还是更新，所以要有条件
      patch(container._vnode || null, vnode, container)
    }

    container._vnode = vnode // 第一次渲染的时候，就将这个vnode保留在了容器上（判断是否初次渲染）
  }
  return {
    render // 返回一个渲染方法render
  }
}