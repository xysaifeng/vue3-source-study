// 节点操作
// dom 的api

// 创建元素、文本节点， 节点的增删查 ， 获取父子关系 ，查询

export const nodeOps = {
  createElement(tagName) {
    document.createElement(tagName)
  },
  createTextNode(text) {
    document.createTextNode(text)
  },
  insert(el, container, anchor = null) {
    container.insertBefore(el, anchor)
  },
  remove(child) {
    const parent = child.parentNode
    if (parent) {
      parent.removeChild(child)
    }
  },
  querySelector(selectors) {
    return document.querySelector(selectors)
  },
  parentNode(child) {// 获取下父节点
    return child.parentNode
  },
  nextSibling(child) { // 获取下一个兄弟元素
    return child.nextSibling
  },
  setText(el, text) { // 给文本节点设置内容
    el.nodeValue = text
  },
  setElementText(el, text) { // 给元素节点设置内容，就不用innerHTML了,有风险
    el.textContent = text
  }

}