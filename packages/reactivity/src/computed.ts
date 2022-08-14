import { isFunction } from "@vue/shared";
import { ReactiveEffect } from "./effect";



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
  constructor(getter, public setter) {
    // 拿到effect实例，稍后可以run,让计算属性拥有依赖收集的能力
    // 这个effect默认不执行
    this.effect = new ReactiveEffect(getter, () => {
      console.log(this._dirty, '--------sss');
      if (!this._dirty) {
        this._dirty = true
      }
    })
  }
  get value() {// 当用户取值（.value）的时候，_dirty为脏的时候，才会执行effect
    if (this._dirty) {
      this._dirty = false
      this._value = this.effect.run()
    }
    return this._value
  }
  set value(newValues) {
    console.log('newValues: ', newValues);
    this.setter(newValues)
  }
}