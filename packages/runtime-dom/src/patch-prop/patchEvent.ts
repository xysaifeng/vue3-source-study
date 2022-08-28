

function createInvoker(prevValue) {
  const invoker = (e) => invoker.value(e)
  // invoker上可以将fn1改为fn2,所以在invoker上增加一个属性value,
  invoker.value = prevValue // 后续只需要修改value的引用，就可以达到不同的逻辑

  return invoker
}

// 考虑绑定一个的情况
// click事件之前是fn1 现在绑fn2,可以将fn1解绑再重新绑定fn2,但是性能不好
// 所以 可以永远绑定一个事件：() => fn1() -> fn2，事件里可以调用fn1,稍后把fn1变为fn2，绑定函数一直是同一个，调用方不同了，不需要每次重新add和remove 

// 给元素绑定事件
export function patchEvent(el, eventName, nextValue) { // 不需要老的fn(preValue)
  // 1.将事件缓存起来，绑定过了哪些事件，事件里绑定的函数是谁，待会好替换
  // 在元素上自定义一个属性vei（vue event invokers）
  const invokers = el._vei || (el._vei = {})
  const existingInvoker = invokers[eventName]
  if (existingInvoker && nextValue) {
    existingInvoker.value = nextValue
  } else {
    // 分两种情况，不存在invoker和nextValue
    // 不存在nextValue则remove掉
    const eName = eventName.slice(2).toLowerCase() // onClick => click
    if (nextValue) {
      //  不存在缓存的情况, addEventListener('click')
      const invoker = createInvoker(nextValue) // 默认会将第一次的函数绑定到invoker.value上
      invokers[eventName] = invoker// 缓存invoker
      el.addEventListener(eName, invoker)
    } else if (existingInvoker) {
      // 没有新的值，但是之前绑定过，需要删除老的
      el.removeEventListener(eName, existingInvoker)
      invokers[eventName] = null //  缓存清空
    }
  }
}