
export let activeEffect = undefined

// 总结：整个依赖收集的原理
// 依赖收集的原理是借助js是单线程的特点，默认调用effect的时候会去调用proxy的get,
// 此时让属性记住依赖的effect,同理，也让effect记录对应的属性
// 数据结构：weakMap: {key: new Set}
// 稍后数据变化了，找到对应的map,通过属性触发set中的effect


// 清理当前的effect
function cleanEffect(effect) {
  // 需要清理effect中存入属性中的set的effect，找到属性的set,把effect从set中删掉
  // 每次执行前都需要将effect中对应的属性的set集合清理掉
  let deps = effect.deps
  for (let i = 0; i < deps.length; i++) {
    // 把所有属性对应的effect全部清掉
    deps[i].delete(effect)
  }
  effect.deps.length = 0
}

export class ReactiveEffect {
  public active = true
  public parent = null
  // effect中用了哪些属性，后续清理的时候使用，就是说effect清理掉的时候让属性忘记自己记录的effect
  public deps = [] // effect存储属性，存的是属性对应的effect

  constructor(public fn, public scheduler?) { // public fn : 会把fn放到this上面
  }
  run() {
    // 如果是非激活的，不需要进行依赖收集
    // 什么时候是非激活的？ -- effectScope可以实现让所有的effect停止，此时就是false
    if (!this.active) {
      return this.fn()
    } else {
      try {
        // 依赖收集，让属性和effect产生关联
        this.parent = activeEffect
        activeEffect = this
        // fn里的依赖会去proxy上取值,取值的时候，要让当前的属性和effect关联起来，
        // 稍后数据变化后可以重新执行effect函数

        // 每次执行应该把上一次的依赖清空
        cleanEffect(this)
        return this.fn()
      } finally {
        // 取消当前正则运行的effect，避免对不在effect中的依赖取值，也就是说在effect中使用的属性才会进行依赖收集
        // activeEffect = undefined
        activeEffect = this.parent
        this.parent = null
      }
    }
  }
  stop() {
    if (this.active) {
      this.active = false
      cleanEffect(this)
    }
  }
}

// 那怎么去做关联？
// 现在知道那个对象的那个属性对应的那个effect,
// 一个属性可以对应多个effect，所以外层使用一个map
// eg: {object:{name: [effect, effect], age: [effect, effect]}}

const targetMap = new WeakMap()

export function trigger(target, key, value) {
  let depsMap = targetMap.get(target)
  if (!depsMap) return // 说明属性没有依赖任何effect
  let effects = depsMap.get(key)
  // 在执行这个effects之前，先对effects做分离，使得要执行的和要删的不是同一个effect
  triggerEffects(effects)
}

export function triggerEffects(effects) {
  if (effects) {
    effects = new Set(effects)
    effects.forEach(effect => {
      if (effect !== activeEffect) { // 保证要执行的effect不是当前的effect
        if (effect.scheduler) {
          // 提供一个调度函数，数据一变，用户自己实现逻辑
          effect.scheduler()
        } else {
          effect.run() // 数据变化从新执行effect
        }
      }
    });
  }
}

export function track(target, key) {
  // 如果有activeEffect 才做依赖收集
  if (activeEffect) {
    // console.log('target,key: ', target, key, activeEffect);
    let depsMap = targetMap.get(target)
    if (!depsMap) {
      targetMap.set(target, (depsMap = new Map))
    }
    let deps = depsMap.get(key)
    if (!deps) {
      // 统一个属性可以在同一个effect多次使用，所以要去重
      depsMap.set(key, (deps = new Set))
    }
    trackEffects(deps)
  }
  // console.log(activeEffect, targetMap);
  // 让属性记录用到的effect是谁，但是也需要知道那个effect对应了哪些属性，
  // 因为后面有清理操作（清理effect要清理对应的属性）
}

export function trackEffects(deps) {
  let shouldTrack = !deps.has(activeEffect)
  if (shouldTrack) {
    deps.add(activeEffect)
    // activeEffect.deps的作用就是让effect记录用到了哪些属性
    activeEffect.deps.push(deps)
  }
}

export function effect(fn, options = {} as any) {
  // 将用户传递的函数变成响应式的effect
  // ReactiveEffect要做依赖收集，等会依赖变了要重新执行fn
  const _effect = new ReactiveEffect(fn, options.scheduler)
  _effect.run()
  // 更改runner中的this
  const runner = _effect.run.bind(_effect)
  runner.effect = _effect // 暴露effect的实例
  return runner // 用户可以手动调用runner重新执行
}


// v3.2之前使用栈结构 v3.2之后使用属性描述记录effect
// effect(() => { // e1
//   state.name
//   effect(() => {// e2
//     state.age
//     state.name // 一个属性对应多个effect 
//   })
//   effect(() => {
//     state.address
//   })
// })