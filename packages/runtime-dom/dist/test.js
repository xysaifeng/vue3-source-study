
export default {
  render: () => {
    return h('div', 234)
  },
}

export function errorCom() {
  return {
    render: () => {
      return h('div', '404')
    }
  }
}