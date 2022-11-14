import { ReactiveEffect } from './../../reactivity/src/effect';
import { isNumber, isString } from "@vue/shared";
import { createComponentInstance, setupComponent } from "./component";
import { createVNode, Fragment, isSameVNode, ShapeFlags, Text } from "./createVNode";
import { getSequence } from "./sequence";
import { queueJob } from './scheduler';


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
  function processText(n1, n2, container) {
    if (n1 == null) {
      // 创建一个文本节点并插入，因为可能有多个文本
      // n2是一个文本的虚拟节点，把文本虚拟节点的内容创造一个文本出来，
      // 并且做上标记，虚拟节点的el上要存上真实节点
      hostInsert(n2.el = hostCreateTextNode(n2.children), container)
    } else {
      // 更新文本不能用 patch 和 patchChildren
      // 应该复用节点bing更新内容
      const el = n2.el = n1.el
      const newText = n2.children
      if (newText !== n1.children) {
        hostSetText(el, newText)
      }
    }
  }
  function processFragment(n1, n2, container) {
    if (n1 == null) {
      mountChildren(n2.children, container)
    } else {
      patchKeyChildren(n1.children, n2.children, container)
    }
  }

  function updateComponentPreRender(instance, next) {
    instance.next = null
    instance.vnode = next // 更新虚拟节点和next属性

    // instance.props => 之前的props
    updateProps(instance, instance.props, next.props)
  }

  function setupRenderEffect(instance, container, anchor) {
    // 1.先创建一个effect

    // 1.1组件渲染函数、数据变化了都调这个函数
    const componentUpdate = () => {
      // 初次渲染
      const { render, data } = instance;
      // console.log('instance: ', instance);
      if (!instance.isMounted) {
        // 组件最终渲染的虚拟节点就是subTree,

        // 这里调用render会做依赖收集，稍后数据变化了，会重新调用update方法

        // 当父组件传入props后，这里不能只传入data了还要传入props
        // 也就是说，render函数中的this,可以取到data,也可以取到props，还可以取到attrs
        // const subTree = render.call(data)
        const subTree = render.call(instance.proxy)
        // 有了subTree,创造真实节点放到容器中
        patch(null, subTree, container, anchor)
        // 实例的subTree赋值，方便下次取值比对
        instance.subTree = subTree
        instance.isMounted = true
      } else {
        // 统一处理更新
        let next = instance.next;// next表示有新的虚拟节点
        if (next) { // 要更新属性或者插槽，再调render
          // 要在组件更新前更新
          updateComponentPreRender(instance, next) // 组件更新前更新属性，不会导致页面重新渲染，因为当前effect正在执行，触发的执行和当前的effect一致，会被屏蔽掉
        }

        // 更新：比较两个subTree的区别，再做更新
        // const subTree = render.call(data)
        const subTree = render.call(instance.proxy)
        patch(instance.subTree, subTree, container, anchor)
        instance.subTree = subTree
      }
    }
    // scheduler暂时不传
    // 20221109 scheduler要传了，不然数据一变就会执行effect，没有实现批处理
    const effect = new ReactiveEffect(componentUpdate, () => queueJob(instance.update))

    // 用户想强制跟新，调update方法
    const update = instance.update = effect.run.bind(effect)
    update()

  }

  function mountComponent(vnode, container, anchor) {
    // 根据虚拟节点n2产生一个实例 new Component => 组件实例

    // 1.组件挂载前需要产生一个组件的实例（就是一个对象），实例上包含了组件的状态、属性、对应的生命周期...
    // 创建的实例放在虚拟节点上,类似 let el = vnode.el = document.createElement()
    // 方便更新的时候拿到组件实例去做更新操作
    const instance = vnode.component = createComponentInstance(vnode)
    // 2.组件内部需要处理的比如：组件的插槽，处理组件的属性...，给组件实例赋值
    // 这个地方主要处理属性和插槽

    setupComponent(instance) // 给组件复制
    // 3.给组件产生一个effect，这样组件数据变化更新后可以重新渲染,当数据变化了可以重新渲染
    setupRenderEffect(instance, container, anchor)

    // 组件的有点？-- 复用，逻辑拆分、方便维护，**vue组件级更新**

  }

  function hasChange(prevProps, nextProps) {
    for (let key in nextProps) {
      if (nextProps[key] != prevProps[key]) return true
    }
    return false
  }
  function updateProps(instance, prevProps, nextProps) {
    // 比较 prevProps,nextProps是否有差异
    // 注意：只需比较外层就好了 因为属性中里面的属性是非响应式的

    // 如果属性个数不一致直接更新（源码）

    // instance.props是个响应式对象
    for (let key in nextProps) {
      // 这里改的属性，不是通过代理对象改的 所以不报错
      // 之前是使用instance.proxy,导致用户不能直接修改props,但是可以通过instance.props来修改
      instance.props[key] = nextProps[key] // 赋值的时候会重新调用update
    }
    // 老的属性多了要删掉
    for (let key in instance.props) {
      if (!(key in nextProps)) {
        delete instance.props[key]
      }
    }
  }

  function shouldComponentUpdate(n1, n2) {
    const prevProps = n1.props
    const nextProps = n2.props
    // 同理，插槽更新了要不要更新，如果要更新，返回true
    return hasChange(prevProps, nextProps) // 如果属性有变化，说明要更新
  }


  function updateComponent(n1, n2) {
    // 比较前后属性是否一致，如果不一致则更新
    const instance = n2.component = n1.component
    // 注意：props里包含了attrs,源码里有个resolvePropValue只处理props的属性，不是组件接收到的props不用关心

    if (shouldComponentUpdate(n1, n2)) {
      // 如果要更新，就把最新的虚拟节点绑到实例上
      instance.next = n2 // 保留最新的虚拟节点
      instance.update() // 让effect重新执行
    } else {
      instance.next = n2 // 保留最新的虚拟节点
    }

    // vue3.0版本就是写了两份更新逻辑
    // const prevProps = n1.props
    // const nextProps = n2.props
    // 1.updateProps(instance, prevProps, nextProps)
    // 2.这里还要看插槽要不要更新
    // 3.应该放到组件的更新逻辑中 不应该再写一份代码了（setupRenderEffect中还有一份更新）
  }

  function processComponent(n1, n2, container, anchor) {
    // console.log('n1, n2, container, anchor: ', n1, n2, container, anchor);
    if (n1 == null) {
      // 组件初始化: 考虑把data数据变成响应式的，然后调render方法，但是不能直接把data变成响应式的 要怎么和render建立关系
      mountComponent(n2, container, anchor)
    } else {
      // 组件的更新 包括插槽的更新和属性的更新
      updateComponent(n1, n2)
    }
  }

  // 20221108总结组件初渲染过程
  // 1.创建实例 这里有一个代理对象，会代理data,props,attrs
  // 2.给组件实例赋值，给instance属性赋值
  // 3.创建一个组件的effect运行
  // 20221108总结组件初更新过程
  // 1.组件的状态发生变化，会触发自己的effect执行
  // 2.父组件属性更新，会执行updateComponent,内部会比较要不要更新，
  // 如果要更新则调用instance.update方法，在调用render执行，更新属性即可

  function unmount(n1) {
    if (n1.type === Fragment) { // Fragment删除所有子节点
      return unmountChildren(n1.children)
    }
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
      case Fragment:
        processFragment(n1, n2, container)
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, anchor)
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, anchor)
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