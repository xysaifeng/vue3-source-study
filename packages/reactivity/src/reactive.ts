import { baseHandler, ReactiveFlag } from './baseHandler';
import { activeEffect, track } from './effect';
import { isObject } from "@vue/shared";

// 1.缓存代理结果
const reactiveMap = new WeakMap(); // key必须是对象，弱引用
// v8垃圾回收机制  标记📌删除  引用计数

export function reactive(target) {
  if (!isObject(target)) return target

  if (target[ReactiveFlag.IS_REACTIVE]) {
    return target
  }

  const existing = reactiveMap.get(target)
  if (existing) return existing

  const proxy = new Proxy(target, baseHandler)
  reactiveMap.set(target, proxy)
  return proxy
}

// 注意📢：使用proxy要搭配使用Reflect,=>保证this指向是正确✅的
/*
const person = {
  name: 'tom',
  get aliasName() {
    return this.name + ' gos'
  }
}
const proxy = new Proxy(person, {
  get(target, key, receiver) {
    console.log('get2', key);
    // return target[key] // 不行、、
    return Reflect.get(target, key, receiver)
  },
  set(target, key, value, receiver) {
    console.log('set2', key);
    // target[key] = value
    return Reflect.set(target, key, value, receiver)
  }
})
// console.log('proxy.name: ', proxy.name);
// console.log('proxy.aliasName: ', proxy.aliasName);

// 问题是：proxy.aliasName 访问proxy的get，get里`key`是aliasName，而不会取name属性（因为aliasName依赖于name）
// 原因是我去proxy上取aliasName，这时候会执行get方法，但是aliasName是基于
// name属性的，原则上应该去name上取值，然而this.name并未触发proxy的get,也就意味着待会儿修改name属性的时候
// 不会导致页面重新渲染
// 根本原因是aliasName里的this指的是person而不是proxy
// 解决办法：不使用`target[key]`而是`Reflect.get(t,k,r)`
proxy.aliasName
*/