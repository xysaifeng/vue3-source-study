import { createRenderer } from '@vue/runtime-core'
import { nodeOps } from './nodeOps'

import { patchProp } from './patchProp'

const renderOptions = { patchProp, ...nodeOps }
// console.log('renderOptions: ', renderOptions);

export function render(vnode, container) { // 用户可以调用此方法传入对应的渲染选项
  let { render } = createRenderer(renderOptions)
  return render(vnode, container)
}

// export { createVNode } from '@vue/runtime-core'
export * from '@vue/runtime-core'