import { activeEffect } from './effect';

// const s = scope.run(() => ref(2))
// console.log('s: ', s); // refImpl


export let activeEffectScope

export function recordEffectScope(effect) {
  if (activeEffectScope && activeEffectScope.active) {
    activeEffectScope.effects.push(effect)
  }
}

// EffectScope具备收集子scope的能力
class EffectScope {

  public effects = [] // 存放所有effect
  public parent = null // 处理嵌套effect
  public active = true
  public scopes = [] // 用来存scope
  constructor(detached) {
    if (!detached && activeEffectScope) { // 不是独立的并且有父scope才收集子scope
      activeEffectScope.scopes.push(this)
    }
  }

  run(fn) {
    if (this.active) {
      try {
        // fn执行就是effect执行，那要如何收集该effect？让EffectScope变成全局的effect就可以收集里面的依赖（effect）=> 定义一个全局的effectScope来收集里面的effect
        this.parent = activeEffectScope
        activeEffectScope = this
        return fn() // 返回用户调用run时回调函数的返回值
      } finally {
        activeEffectScope = this.parent
        this.parent = null
      }
    }
  }

  stop() {
    if (this.active) {
      this.active = false
      this.effects.forEach(effect => effect.stop())
    }
    if (this.scopes.length) {
      this.scopes.forEach(scopeEffect => scopeEffect.stop())
    }
  }
}

export function effectScope(detached) { // detached是否独立
  return new EffectScope(detached);
}