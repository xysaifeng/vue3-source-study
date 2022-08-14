import { isObject } from './../../shared/src/index';
import { track, trigger } from "./effect";
import { reactive } from './reactive';

// 2.一个对象代理过了就不要再代理了
// 第一次传入obj => proxy
// 下次传入proxy了，此时我去proxy上取值会命中get方法
export const enum ReactiveFlag {
  IS_REACTIVE = '__v_isReactive'
}

export const baseHandler = {
  get(target, key, receiver) {
    // console.log('get', key);
    if (key === ReactiveFlag.IS_REACTIVE) return true
    // **对proxy取值的时候要创建和effect的关联
    // 让当前的key和effect关联起来
    // 依赖收集的方法，收集属性key和当前的acctiveEffect
    // 因为属性key不唯一，可以是多个，所以最好把target放进去，activeEffect可以不放，待会儿用的时候导入即可
    // track(key, activeEffect)
    // 也就是说，某个对象的某个属性它收集的effect是谁
    track(target, key)
    const res = Reflect.get(target, key, receiver)
    // 如果属性对应的还是对象，继续代理
    if (isObject(res)) {
      return reactive(res)
    }

    return res
  },
  set(target, key, value, receiver) {
    // console.log('set', key);
    // 数据变化后，要根据属性找到对应的effect列表，让其依次执行
    // 也要看是否值有变化
    let oldValue = target[key]
    // console.log('oldValue: ', oldValue, value);
    if (oldValue !== value) {
      let result = Reflect.set(target, key, value, receiver)
      trigger(target, key, value)
      return result
    }

  }
}