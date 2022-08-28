// 属性操作

import { patchAttr } from "./patch-prop/patchAttr"
import { patchClass } from "./patch-prop/patchClass"
import { patchEvent } from "./patch-prop/patchEvent"
import { patchStyle } from "./patch-prop/patchStyle"

// 传入某个元素的某个属性的新值和旧值
// 给属性打补丁 {style: {color: 'red'}} =>  {style: {color: 'red', fontSize: '12px'}}
//  preValue 上一次的值 

// 涉及到的属性有:
// 类名
// style（行内样式）
// 事件
// 其他属性 （暂不考虑）


// checked default-value innerHTML 没有特殊处理
export const patchProp = (el, key, preValue, nextValue) => {
  if (key === 'class') {
    patchClass(el, nextValue)
  } else if (key === 'style') {
    patchStyle(el, preValue, nextValue)
  } else if (/on[^a-z]/.test(key)) { // 事件名类似 onClick onMousedown
    patchEvent(el, key, nextValue) // 先不考虑绑定多个事件的情况 数组
  } else { // 其他属性
    patchAttr(el, key, nextValue)
  }
}