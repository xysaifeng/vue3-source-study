import { onMounted, onUpdated } from './apiLifeCycle';
import { getCurrentInstance } from './component';
import { ShapeFlags } from './createVNode';


function resetFlag(vnode) {
  if (vnode.shapeFlag & ShapeFlags.COMPONENT_KEEP_ALIVE) {
    vnode.shapeFlag -= ShapeFlags.COMPONENT_KEEP_ALIVE
  }
  if (vnode.shapeFlag & ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE) {
    vnode.shapeFlag -= ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE
  }
}

export const KeepAlive = {
  props: {
    max: [String, Number]
  },

  __isKeepAlive: true, // 用来标识keep-alive
  setup(props, { slots }) {
    // dom操作的api都在instance的ctx中
    const instance = getCurrentInstance()

    // 思路：当cache缓存完了组件后需要两个方法，一是组件卸载前将其存起来，二是 add on 20230827 12:15 
    // 这两个方法在instance.ctx.renderer中
    const { createElement, move, unmount } = instance.ctx.renderer
    // 1.默认情况下先创建内存区
    let storageContainer = createElement('div')
    // 2.需要两个方法扩展到instance.ctx上, 这两个方法在组件渲染时候和卸载的时候调用

    // 缓存逻辑
    // keepalive第一次渲染的时候，将keepalive渲染的虚拟节点以key-value形势缓存起来，等会儿还要看这个标识key是否缓存过，缓存过了就不再缓存了
    // 源码里就有两个变量，1是存储所有key的，每个组件都有自己的唯一标识key【Set】， 2是将key和对应的 组件关联起来【Map】
    const keys = new Set() // 缓存组件的key, 其实这个key可以有也可以没有 如果没有就把组件本身的类型当作key
    const cache = new Map() // 缓存组件的映射关系

    const pruneCacheEntry = vnode => {
      // 删除缓存,不光是删节点 还要删除添加在vnode上面的标识
      const subTree = cache.get(vnode)
      resetFlag(subTree) // 移除keep-alive标记
      unmount(subTree)
      cache.delete(vnode)
      // set删除key
      keys.delete(vnode)
    }

    // 当（组件）激活的时候
    instance.ctx.active = (n2, container, anchor) => {
      move(n2, container, anchor)
    }

    // 当失活（组件离开）的时候 组件卸载的时候回家虚拟节点对应的真实节点移动到容器中
    instance.ctx.deactivated = (n1) => {
      move(n1, storageContainer)
    }

    // 记录等会儿要缓存的key
    let pendingCacheKey = null

    const cacheSubTree = () => {
      // tips:vnode是虚拟节点，vnode.el是虚拟节点对应的真实dom,vnode.subTree是虚拟节点渲染的子节点
      cache.set(pendingCacheKey, instance.subTree)
    }

    onMounted(cacheSubTree)
    onUpdated(cacheSubTree)

    return () => {
      let vnode = slots.default()
      // 这里拿到了虚拟节点vnode
      // 需要判断keepalive渲染的是否是组件 如果不是组件 则不需要缓存
      if (!(vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT)) return vnode

      // 思考：有了vnode如何拿到vnode的实例？
      // =》在renderer.ts里方法mountComponent中写明白了的，vnode.component就是实例

      // 缓存key的策略：用组件的名字 用组件的key 用组件本身作为key
      // let currentComponent = vnode.type
      // let componentName = currentComponent.name
      // keys.add(componentName)

      let comp = vnode.type
      const key = vnode.key == null ? comp : vnode.key;
      pendingCacheKey = key

      let cacheVnode = cache.get(key)
      if (cacheVnode) {
        // 如果有缓存我需要干什么？
        // 1.不能返回vnode了，因为返回了会重新渲染，会走mountComponent
        // 2.复用之前缓存的dom
        // console.log(cacheVnode);
        vnode.component = cacheVnode.component //  复用组件

        // 加上标识 告诉mountComponent不需要给vnode重新加载comonent了
        // 组件要走缓存 标识组件走缓存的时候不需要初始化
        vnode.shapeFlag |= ShapeFlags.COMPONENT_KEEP_ALIVE

      } else {
        // 在最后面增加key 并且删除keys的第一项(不一定是第一项_(不用管)) 
        keys.add(key)
        const { max } = props
        if (keys.size > max && max) {
          // keys是Set,如何获取到其第一项?
          const v = keys.values().next().value
          pruneCacheEntry(v)
        }
      }
      // 加上标识 组件应该走缓存 用来标识这个vnode在卸载的时候应该缓存起来
      vnode.shapeFlag |= ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE
      // 只要返回了vnode,组件就会重新渲染会走,mountComponent
      return vnode
    }
  }

}


// keep-alive使用了缓存策略 LRU算法 最近的使用的放到最后 很久不用的放到最前面

// 总结 2023-08-27 16:50
// 1、第一次默认渲染keep-alive中插槽的内容，检测插槽是否是组件
// 2、如果是组件就把组件对应的当作key,做成一个映射表 缓存起来
// 3、标记组件卸载的时候 不用真的卸载
// 4、卸载组件 挂载新的组件 此时会命中插槽的更新 卸载老组件的时候 不是真的卸载 而是缓存到dom中。加载新的组件
// 5、下次访问的是已经访问过的组件 那么此时需要复用组件的实例 并且不用再次初始化了
// 6、初始化的时候 会从缓存区dom中移动到页面进行渲染
// 7、缓存策略使用LRU算法 实现删除头部 最近访问的放在尾部