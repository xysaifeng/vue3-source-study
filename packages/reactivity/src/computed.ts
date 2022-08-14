import { isFunction } from "@vue/shared";
import { activeEffect, ReactiveEffect, trackEffects, triggerEffects } from "./effect";



export function computed(getterOrOptions) {
  const isGetter = isFunction(getterOrOptions)

  let getter
  let setter
  const fn = () => {
    console.warn('computed  is readonly')
  }
  if (isGetter) {
    getter = getterOrOptions
    setter = fn
  } else {
    getter = getterOrOptions.get
    setter = getterOrOptions.set || fn
  }
  // console.log(getter, setter);
  return new ComputedRefImpl(getter, setter)
}

// 计算属性本身就是一个effect
class ComputedRefImpl {
  private _value;
  private _dirty = true
  public effect
  public deps // 给每个计算属性专门收集effect用的
  constructor(getter, public setter) {
    // 拿到effect实例，稍后可以run,让计算属性拥有依赖收集的能力
    // 这个effect默认不执行
    this.effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true
        // 依赖的数据变化了，通知自己（当前计算属性）收集的effect执行
        triggerEffects(this.deps)
      }
    })
  }
  get value() {// 当用户取值（.value）的时候，_dirty为脏的时候，才会执行effect
    // 如果计算属性在取值的时候后effect，要将这个effect收集起来，否则不会更新
    if (activeEffect) {
      // 让计算属性做依赖收集，本可以使用track，但是track有些浪费性能，一track，就会初始化track流程，
      // 所以，记住value这个属性它对应的effect是谁就行了，根本不关心计算属性是谁
      // 所以干脆存一个Set类型的变量把effect存起来就好了，为啥使用Set?
      // value -> effect -> Set[effect] 
      trackEffects(this.deps || (this.deps = new Set))

    }

    if (this._dirty) {
      this._dirty = false
      this._value = this.effect.run()

    }
    return this._value
  }
  set value(newValues) {
    this.setter(newValues)
  }
}