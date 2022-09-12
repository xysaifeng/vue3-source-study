import { isNumber, isString } from "@vue/shared";
import { createVNode, isSameVNode, ShapeFlags, Text } from "./createVNode";
import { getSequence } from "./sequence";


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

  function mountElement(vnode, container, anchor) {
    let { type, props, children, shapeFlag } = vnode
    // 先创建自己再创建儿子

    //  虚拟节点要标识它对应的真实元素，因为后续需要比对虚拟节点的差异更新页面，所以需要保留对应的真实节点
    let el = vnode.el = hostCreateElement(type)

    if (props) { // {a: 1,b : 2} => {c: 3}
      // 更新属性
      patchProps(null, props, el)
    }

    // children 不是数组就是文本
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, children)
    }
    if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el)
    }

    hostInsert(el, container, anchor)
  }

  function processText(n1, n2, container) {
    if (n1 == null) {
      // 创建一个文本节点并插入，因为可能有多个文本
      // n2是一个文本的虚拟节点，把文本虚拟节点的内容创造一个文本出来，
      // 并且做上标记，虚拟节点的el上要存上真实节点
      hostInsert(n2.el = hostCreateTextNode(n2.children), container)
    }
  }

  function unmountChildren(children) {
    children.forEach(child => {
      unmount(child)
    });
  }

  function patchKeyChildren(c1, c2, el) {
    // 比较c1和c2两个数组间的差异，再去更新el
    // 怎么去比较差异？ 采用了On的算法，分别去循环c1和c2，就可以比较哪里发生了变化
    // 优化：尽可能复用节点，而且找到变化的位置

    // 先考虑顺序相同的情况 比如追加和删除

    // a b c d e   f
    // a b c d e q f

    let i = 0;
    let e1 = c1.length - 1
    let e2 = c2.length - 1

    // tips: 比到有一方没有了或者比到不同的时候就比对结束了

    // A、下面两种判断是老的少新的多

    // sync from start
    while (i <= e1 && i <= e2) {
      let n1 = c1[i]
      let n2 = c2[i]
      if (isSameVNode(n1, n2)) { // 如果元素相同还要比较属性和儿子
        patch(n1, n2, el)
      } else {
        // 不相同则比较结束比对
        break
      }
      i++
    }
    // 如果跳出了循环还要处理， 根据i, e1, e2的值再判断是增加还是删除节点

    // sync from end
    while (i <= e1 && i <= e2) {
      let n1 = c1[e1]
      let n2 = c2[e2]
      if (isSameVNode(n1, n2)) { // 如果元素相同还要比较属性和儿子
        patch(n1, n2, el)
      } else {
        // 不相同则比较结束比对
        break
      }
      e1--
      e2--
    }
    // ①从后追加
    // a b c d
    // a b c d e f
    // console.log(i, e1, e2); // i = 4, e1=3 e2=5 通过这几个值，如何计算出是往后面追加？
    // 当i的值大于e1的时候，说明已经将老的值全部比对完了，但是新的还要剩余
    // i到e2之间的内容就是新增的

    // ②从前追加
    //     c d e q
    // a b c d e q
    // i = 0, e1=-1 e2=1  => 也满足从后追加的判断逻辑

    // B、下面两种判断是老的多新的少 => ③④前删除和后删除
    // a b c d e q
    // a b c d
    // i = 4 e1 = 5 e2 = 3
    // console.log(i, e1, e2);

    if (i > e1) {
      if (i <= e2) {
        while (i <= e2) {
          // 判断是否向前向后追加，其实就是看e2是不是末尾项，并找出参照物
          const nextPos = e2 + 1
          // 看一下e2的下一项是否在数组内，如果在数组内容说明有参照物
          const anchor = c2.length <= nextPos ? null : c2[nextPos].el
          patch(null, c2[i], el, anchor) // 插入节点
          i++
        }
      }
    } else if (i > e2) { // 老的多新的少
      if (i <= e1) {
        while (i <= e1) {
          unmount(c1[i])
          i++
        }
      }
    } else {
      // 下面比对乱序，unknow sequence (未知序列) 宗旨:能复用尽量复用节点然后该删删该加加
      // a b [c d e] f g
      // a b [d e q] f g
      // i = 2, e1=4 e2=4  => 也满足从后追加的判断逻辑
      console.log(i, e1, e2);

      let s1 = i // s1 -> e1 老的需要比对的部分
      let s2 = i // s2 -> e2 新的需要比对的部分
      // vue2是用新的在老的里找 vue3是用老的在新的里找
      // 在新的里面做一个key=> idx的映射表

      const toBePatched = e2 - s2 + 1; // 需要操作的次数 => 4-2+1
      const keyToNewIndexMap = new Map()
      for (let i = s2; i <= e2; i++) {
        keyToNewIndexMap.set(c2[i].key, i)
      }

      // +1  [5 3 4 0] => 问题：如果根据这个序列得到索引[1,2]的是不移动的
      //     [4 2 3 0] => 2 3 是最长连续递增的，意味着23不用移动
      // a b [c d e q] f g
      // a b [e c d h] f g

      // 一个映射表，存放新的索引对应老的索引位置
      const seq = new Array(toBePatched).fill(0)

      for (let i = s1; i <= e1; i++) {
        const oldVNode = c1[i]
        const newIndex = keyToNewIndexMap.get(oldVNode.key) // 用老的去找 看看新的里面有没有
        if (newIndex == null) {
          unmount(oldVNode) // 新的里面找不用将老的移除
        } else {
          // 新的老的都有，可以记录下来当前对应的索引，稍后可以判断出哪些元素不需要移动
          // 用新的位置和 老的位置做一个关联
          seq[newIndex - s2] = i + 1 // 需要加1不然和本身位于0位置的有冲突

          patch(oldVNode, c2[newIndex], el) // 如果新老都有，则比较两个节点的差异，再比较他们的儿子
        }
      }

      // console.log(seq);// [5, 3, 4, 0]
      const increase = getSequence(seq)
      // console.log('s: ', increase); // [1,2] 计算出不用移动的序列

      // 此时位置顺序不对和新增的还没显示出来
      // 按照新的位置重新【排列】，将【新增】的元素添加上
      // 如何排序呢？
      // => 我们已知正确的顺序，可以倒序插入(以f为开始锚点) q -> f, e -> q, d -> e 
      // 同时计算要插入多少个 => 3

      // 3 2 1 0
      // increase [1,2]
      let j = increase.length - 1
      for (let i = toBePatched - 1; i >= 0; i--) {
        const currendIdex = s2 + i; // 找到需要处理的最后一个元素（q）的索引
        const child = c2[currendIdex] // q
        const anchor = currendIdex + 1 < c2.length ? c2[currendIdex + 1].el : null
        // 判断要移动（d e）还是新增q
        // 如何知道child是新增的
        // if (!child.el) {
        if (seq[i] === 0) { // 如果等于0说明是新增
          patch(null, child, el, anchor)
        } else {
          // 优化：这里应该尽量减少需要移动的节点： 最长递增子序列算法 来实现

          if (i !== increase[j]) { // 通过序列进行比对，找到需要移动的节点
            // insertBefore调用后，元素如果已存在则只是移动位置
            hostInsert(child.el, el, anchor) // 如果有el说明之前渲染过
          } else {
            j--
          }

        }
      }
    }
  }

  function patchChildren(n1, n2, el) {
    const c1 = n1.children
    const c2 = n2.children

    // 拿到儿子的类型
    const prevShapeFlag = n1.shapeFlag
    const shapeFlag = n2.shapeFlag

    // 比较儿子
    /*  新的    旧的    处理
        文本    数组    删除老儿子，设置文本内容
        文本    文本    更新文本即可
        文本    空      更新文本即可，与上面类似
        数组    数组    diff算法
        数组    文本    清空文本，进行挂载
        数组    空      进行挂载，与上面类似
        空      数组    删除所有儿子
        空      文本    清空文本
        空      空      无须处理
    */

    // 文本    数组 √
    // 文本    文本 √
    // 文本    空 √
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) { //  文本    数组
        unmountChildren(c1)
      }
      if (c1 !== c2) {
        hostSetElementText(el, c2)
      }
    } else {
      // tips: 最新的要么是数组 要么是空

      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) { // 老的是数组
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) { // 新的也是数组 =>  数组    数组    diff算法
          // diff 算法
          patchKeyChildren(c1, c2, el)
        } else {
          // 新的为空  =>  空    数组    删除所有儿子
          console.log(c1,);
          unmountChildren(c1)
        }
      } else {
        // 数组    文本    清空文本，进行挂载
        // 数组    空      进行挂载，与上面类似
        // 空      文本    清空文本
        // 空      空      无须处理
        if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
          hostSetElementText(el, '')
        }
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          mountChildren(c2, el)
        }
      }
    }
  }

  // 比较元素，先比较自己的props,再比较儿子的，接着孙子的
  function patchElement(n1, n2) {
    // 强调：n1和n2能复用说明dom节点就不要删除了
    const el = n2.el = n1.el // 1）节点复用

    const oldProps = n1.props
    const newProps = n2.props
    patchProps(oldProps, newProps, el) // 2)比较属性

    // 3)自己比较完了比较儿子
    patchChildren(n1, n2, el)
  }

  function processElement(n1, n2, container, anchor) {
    if (n1 == null) {
      mountElement(n2, container, anchor)
    } else {
      patchElement(n1, n2,)
    }
  }

  function unmount(n1) {
    hostRemove(n1.el)
  }

  // n1前一个虚拟节点 n2当前的虚拟节点,将虚拟节点渲染为真实节点
  function patch(n1, n2, container, anchor = null) {
    // if (n1 == null) {
    //   // 初次渲染，挂载元素
    //   mountElement(n2, container)
    // } else {
    //   // n1有值 说明要走diff算法
    // }

    if (n1 && !isSameVNode(n1, n2)) {
      // 不是同一个节点，则把之前的节点n1删掉
      unmount(n1)
      n1 = null // 将n1重置为null,下面会走n2的初始化
    }

    // n2要么是元素要么是文本
    const { type, shapeFlag } = n2
    switch (type) {
      case Text:
        processText(n1, n2, container)
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, anchor)
        }
        break;
    }
  }

  const render = (vnode, container) => { // 需要将vnode渲染到container并且调用options中的api
    // console.log('vnode,container: ', vnode, container);
    // 判断是初次渲染还是非初次渲染还是卸载 分三种情况：渲染 更新 卸载
    if (vnode == null) { // 卸载
      console.log('xx');
      if (container._vnode) {
        unmount(container._vnode)
      }
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