

export function patchStyle(el, preValue, nextValue) { // 如何比较两个对象的差异
  // 比较两个对象 需要同时遍历新的和老的对象
  // 新的有老的没有直接覆盖
  // 新的没有老的有，删除新的
  if (!preValue) preValue = {}
  if (!nextValue) nextValue = {}

  const style = el.style
  for (let key in nextValue) {
    style[key] = nextValue[key]
  }

  if (preValue) {
    for (let key in preValue) {
      if (nextValue[key] == null) {
        // 老的有 新的没有
        style[key] = null
      }
    }
  }
}