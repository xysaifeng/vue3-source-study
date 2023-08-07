import { instance } from "./component";


// 实现思路：
// 前置条件：组件实例的provides指向的是parent.provides
// 1）先取出自己父亲的provides,默认和自己的provides相同，于是创建一个新的provides,重新给自己的provides赋值
// 2）在上面添加属性
// 3）再次调用provide的时候，拿父亲的provides,在取出自己的provides，此时不相等了，直接用自己身上的provides并添加属性

export function provide(key, value) { // 注意provide也必须用到setup中，因为要去拿实例
  if (!instance) return // 如果没有实例，则直接返回，说明这个方法（provide）没有在setup中使用

  let parentProvides = instance.parent && instance.parent.provides;// 获取父组件的provides+组件自己的provides，so下一个儿子能拿到所有的provides

  // eg: 父.provides 儿.provides 孙.provides  曾孙在inject的时候，曾孙.provides = { 父.provides，儿.provides，孙.provides }

  // ** 为了不使得子组件修改父.provides 需要将父.provides拷贝 **

  // const provides = instance.provides = Object.create(parentProvides) // 这句代码有bug
  // 【上面这句代码有bug】 比如：父组件中不停的注入provide
  // provide('a',1) 
  // provide('b',2) 
  // provide('c',3) 
  // 会使得上面常量provides赋值3次，因此会将('a',1)、('b',2)搞没了， 
  // 就是说，provide在父组件中多次调用的时候，不能在实例上创建多次provides

  // 【修改】：第一次父组件中调用provide时，创建一个全新的provides,后续就用自己的provides了
  let currentProvides = instance.provides;// 实例自己身上的provide
  if (currentProvides === parentProvides) { // 说明是第一次渲染调用provide
    currentProvides = instance.provides = Object.create(parentProvides) // 这句代码有bug
  }
  // provides[key]= value
  currentProvides[key] = value
}


export function inject(key, defaultVal) {
  if (!instance) return
  const provides = instance.parent?.provides
  if (provides && (key in provides)) {
    return provides[key]
  } else {
    return defaultVal
  }
}