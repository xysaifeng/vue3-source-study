import { nodeOps } from './nodeOps'

import { patchProp } from './patchProp'

// export { createVNode } from '@vue/runtime-core'
export * from '@vue/runtime-core'

const renderOptions = { patchProp, ...nodeOps }
console.log('renderOptions: ', renderOptions);