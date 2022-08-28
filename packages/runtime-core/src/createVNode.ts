import { isArray, isString } from "@vue/shared"


export function createVNode(type, props = null, children = null) {
  // 在这里就要创造虚拟节点了

  // 需要知道当前虚拟节点是什么类型，儿子是什么类型
  // 后续可判断更多的虚拟节点类型
  let shapFlag = isString(type) ? ShapFlags.ELEMENT : 0; // 标记出了自己是什么类型

  // 将当前的虚拟节点和自己儿子的虚拟节点映射起来 涉及到问题是权限组合 位运算
  const vnode = { // vnode要对应真实的节点
    type,
    props,
    children,
    key: props && props.key, // 标识虚拟节点的唯一性，方便做diff算法用
    el: null, // 真实节点，当做了初始渲染后，就把虚拟节点对应的真实节点做一个映射
    shapFlag
    // 打个标记， 标记当前虚拟节点的儿子的类型是什么
  }
  // 渲染的时候有个特点 -- shapFlags：位运算的概念
  // 比如渲染的时候 如何知道这个虚拟节点的儿子是数组、文本、元素？

  if (children) {
    let temp = 0
    if (isArray(children)) { // children要么是数组要么文本，h中会处理
      temp = ShapFlags.ARRAY_CHILDREN
    } else {
      children = String(children)
      temp = ShapFlags.TEXT_CHILDREN
    }
    vnode.shapFlag |= temp
  }

  console.log(vnode.shapFlag & ShapFlags.FUNCTIONAL_COMPONENT, '===v');
  return vnode
}

// vue3的形状标识
// 通过组合可以描述虚拟节点的类型
export const enum ShapFlags {
  ELEMENT = 1,
  FUNCTIONAL_COMPONENT = 1 << 1, // 2 = 1 * 2^1
  STATEFUL_COMPONENT = 1 << 2, // 4 = 1 * 2^2
  TEXT_CHILDREN = 1 << 3, // 8 = 1 * 2^3
  ARRAY_CHILDREN = 1 << 4, // 16 = 1 * 2^4
  SLOTS_CHILDREN = 1 << 5,
  TELEPORT = 1 << 6,
  SUSPENSE = 1 << 7,
  COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8,
  COMPONENT_KEEP_ALIVE = 1 << 9,
  COMPONENT = ShapFlags.STATEFUL_COMPONENT | ShapFlags.FUNCTIONAL_COMPONENT,
}

// | 或运算：只要有一个是1就是1
// & 与运算：两个都是1才是1

// 这种方式可以做权限的组合
// const flags =  ELEMENT | ARRAY_CHILDREN
// 0000000001
// 0000001000 
// 0000001001 => 1* 2^(4-1)+1* 2^(1-1) = 9(表示当前虚拟节点是个元素儿子是个数组)

// 判断的时候
// falg & ELEMENT
// 0000001001
// 0000000001
// 0000000001 => 1 > 0 （说明包含这个类型【ELEMENT】）



// 1 << 1 :表示二进制往前移动一位
// 0000000001 // 1
// 0000000010 // 1 << 1
// 0000000100 // 1 << 2

// 二进制的算法：当前所在位的值 * 进制^(当前所在位 - 1)
// eg: 0000000001 => 1 * 2^(1-1) = 1
// eg: 0000000010 => 1 * 2^(2-1) = 2
// eg: 0000000100 => 1 * 2^(3-1) = 4
// 上面三个值相加
// eg: 0000000111 => 1 * 2^(3-1) + 1 * 2^(2-1) + 1 * 2^(1-1) = 7