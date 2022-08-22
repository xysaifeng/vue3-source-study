import { isFunction, isObject } from "@vue/shared";
import { isReactive } from "./baseHandler";
import { ReactiveEffect } from "./effect";

// 对value进行迭代访问，稍后执行effect的时候，会默认取值，就会依赖收集
// 对value进行递归取值，但是要防止循环引用，将访问过的属性存起来，下次访问直接返回缓存
function traversal(value, set = new Set()) {// set用来存放迭代过的对象
  if (!isObject(value)) return value; // 终止条件

  if (set.has(value)) return value
  set.add(value)// 此对象已经被迭代过了
  for (var key in value) {
    traversal(value[key], set)
  }
  return value

}

export function watch(scource, cb) {
  let get;
  let oldValue;
  let newValue;

  // 判断当前的scource是一个对象，则判断是否是一个reactive的值，不是的话监控就没意义了
  if (isReactive(scource)) {
    console.log('响一声对象');
    // scource是对象时，将scource包装成一个effect函数，而且让effect收集source中的每一个属性，将source
    // 中的每个属性都取值一遍就收集了
    get = () => traversal(scource)
  } else if (isFunction(scource)) {
    get = scource
  }

  let cleanup;
  const onCleanup = (fn) => {
    cleanup = fn
  }

  const job = () => {
    if (cleanup) cleanup() // 如果cleanup有值，则是上一次赋的值
    // 依赖的数据变化后重新执行run函数，拿到最新的返回值
    newValue = effect.run()
    cb(newValue, oldValue, onCleanup)
    oldValue = newValue
  }
  // effect依赖的数据变了会执行scheduler job,
  let effect = new ReactiveEffect(get, job)
  // 默认调用run方法会执行get函数，此时scource作为了第一次的老值
  oldValue = effect.run() // 默认执行一次get
}