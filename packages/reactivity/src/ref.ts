import { isObject } from '@vue/shared';
import { trackEffects, triggerEffects } from './effect';
import { reactive } from './reactive';

export function ref(value) {
  return new RefImpl(value)
}

class ObjectRefImpl {
  private __v_isRef = true;
  constructor(public object, public key) { }
  get value() { return this.object[this.key]; }

  set value(newValue) {
    this.object[this.key] = newValue;
  }
}

export function toRef(object, key) {
  return new ObjectRefImpl(object, key)
}


export function proxyRefs(object) {
  return new Proxy(object, {
    get(target, key, receiver) {
      const r = Reflect.get(target, key, receiver);
      console.log('r: ', r);
      return r.__v_isRef ? r.value : r
    },
    set(target, key, value, receiver) {
      if (target[key].__v_isRef) {
        target[key].value = value;
        return true
      }
      return Reflect.set(target, key, value, receiver);
    }
  })

}

export function toRefs(object) {
  // object 先不考虑数组
  let res = {}
  for (let key in object) {
    res[key] = toRef(object, key)
  }
  console.log(res);
  return res
}

export function toReactive(value) {
  return isObject(value) ? reactive(value) : value
}

class RefImpl {
  private _value;
  private dep;
  private __v_isRef = true;
  constructor(public rawValue) {
    //  rawValue可能是一个对象，需要转换成响应式对象
    this._value = toReactive(rawValue)
  }

  get value() {
    // 当取值的时候需要依赖收集
    trackEffects(this.dep || (this.dep = new Set()))
    return this._value
  }

  set value(newValue) {
    if (newValue !== this.rawValue) {
      this._value = toReactive(newValue)
      this.rawValue = newValue
      triggerEffects(this.dep)
    }

  }
}