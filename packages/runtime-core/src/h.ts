

// h方法有个特点：重载（根据参数不同，决定不不同的功能）
// 1.元素 内容
// 2.元素 属性 内容
// 3.元素 属性 多个儿子
// 4.元素 儿子
// 5.元素 元素
// 6.元素 空属性 多个儿子

import { isArray, isObject } from "@vue/shared"
import { createVNode, isVNode } from "./createVNode"

export function h(type, propsOrChildren, children) {
  // 1.参数为两个 1）元素+属性 2）元素+儿子

  // h(类型，元素对象)
  // h(类型，[''])
  // h(类型，{})

  const l = arguments.length

  if (l === 2) {
    // 区分元素对象还是属性{}
    if (isObject(propsOrChildren) && !isArray(propsOrChildren)) { // h(type, 属性或元素对象)
      // 要么是元素对象要么是属性
      if (isVNode(propsOrChildren)) { // h(type, 元素对象)
        return createVNode(type, null, [propsOrChildren])
      }
      return createVNode(type, propsOrChildren) // h(type, 属性)

    } else {
      // 否则就是 属性 + 儿子 儿子是数组或字符串
      return createVNode(type, null, propsOrChildren)  // h(type, ['']) |  h(type, '文本') 
    }

  } else {
    if (l === 3 && isVNode(children)) { // 参是三个   // h(type, 属性, 儿子)
      children = [children]
    } else if (l > 3) {
      children = Array.from(arguments).slice(2) // h(type, 属性, 儿子数组)
    }
    return createVNode(type, propsOrChildren, children)
  }

}