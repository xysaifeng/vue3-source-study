var VueRuntimeDom = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // packages/runtime-dom/src/index.ts
  var src_exports = {};
  __export(src_exports, {
    Fragment: () => Fragment,
    Text: () => Text,
    computed: () => computed,
    createRenderer: () => createRenderer,
    createVNode: () => createVNode,
    effect: () => effect,
    h: () => h,
    proxyRefs: () => proxyRefs,
    reactive: () => reactive,
    ref: () => ref,
    render: () => render,
    toRef: () => toRef,
    toRefs: () => toRefs,
    watch: () => watch
  });

  // packages/shared/src/index.ts
  var isObject = (value) => {
    return typeof value === "object" && value !== null;
  };
  var isFunction = (value) => {
    return typeof value === "function";
  };
  var isString = (value) => {
    return typeof value === "string";
  };
  var isArray = Array.isArray;
  var isNumber = (value) => {
    return typeof value === "number";
  };

  // packages/runtime-core/src/createVNode.ts
  var Text = Symbol("Text");
  var Fragment = Symbol("Fragment");
  function isVNode(val) {
    return !!val.__v_isVNode;
  }
  function isSameVNode(v1, v2) {
    return v1.type === v2.type && v1.key === v2.key;
  }
  function createVNode(type, props = null, children = null) {
    let shapeFlag = isString(type) ? ShapeFlags.ELEMENT : isObject(type) ? ShapeFlags.STATEFUL_COMPONENT : 0;
    const vnode = {
      __v_isVNode: true,
      type,
      props,
      children,
      key: props && props.key,
      el: null,
      shapeFlag
    };
    if (children) {
      let temp = 0;
      if (isArray(children)) {
        temp = ShapeFlags.ARRAY_CHILDREN;
      } else {
        children = String(children);
        temp = ShapeFlags.TEXT_CHILDREN;
      }
      vnode.shapeFlag |= temp;
    }
    return vnode;
  }
  var ShapeFlags = /* @__PURE__ */ ((ShapeFlags2) => {
    ShapeFlags2[ShapeFlags2["ELEMENT"] = 1] = "ELEMENT";
    ShapeFlags2[ShapeFlags2["FUNCTIONAL_COMPONENT"] = 2] = "FUNCTIONAL_COMPONENT";
    ShapeFlags2[ShapeFlags2["STATEFUL_COMPONENT"] = 4] = "STATEFUL_COMPONENT";
    ShapeFlags2[ShapeFlags2["TEXT_CHILDREN"] = 8] = "TEXT_CHILDREN";
    ShapeFlags2[ShapeFlags2["ARRAY_CHILDREN"] = 16] = "ARRAY_CHILDREN";
    ShapeFlags2[ShapeFlags2["SLOTS_CHILDREN"] = 32] = "SLOTS_CHILDREN";
    ShapeFlags2[ShapeFlags2["TELEPORT"] = 64] = "TELEPORT";
    ShapeFlags2[ShapeFlags2["SUSPENSE"] = 128] = "SUSPENSE";
    ShapeFlags2[ShapeFlags2["COMPONENT_SHOULD_KEEP_ALIVE"] = 256] = "COMPONENT_SHOULD_KEEP_ALIVE";
    ShapeFlags2[ShapeFlags2["COMPONENT_KEEP_ALIVE"] = 512] = "COMPONENT_KEEP_ALIVE";
    ShapeFlags2[ShapeFlags2["COMPONENT"] = 6] = "COMPONENT";
    return ShapeFlags2;
  })(ShapeFlags || {});

  // packages/runtime-core/src/h.ts
  function h(type, propsOrChildren, children) {
    const l = arguments.length;
    if (l === 2) {
      if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
        if (isVNode(propsOrChildren)) {
          return createVNode(type, null, [propsOrChildren]);
        }
        return createVNode(type, propsOrChildren);
      } else {
        return createVNode(type, null, propsOrChildren);
      }
    } else {
      if (l === 3 && isVNode(children)) {
        children = [children];
      } else if (l > 3) {
        children = Array.from(arguments).slice(2);
      }
      return createVNode(type, propsOrChildren, children);
    }
  }

  // packages/reactivity/src/effect.ts
  var activeEffect = void 0;
  function cleanEffect(effect2) {
    let deps = effect2.deps;
    for (let i = 0; i < deps.length; i++) {
      deps[i].delete(effect2);
    }
    effect2.deps.length = 0;
  }
  var ReactiveEffect = class {
    constructor(fn, scheduler) {
      this.fn = fn;
      this.scheduler = scheduler;
      this.active = true;
      this.parent = null;
      this.deps = [];
    }
    run() {
      if (!this.active) {
        return this.fn();
      } else {
        try {
          this.parent = activeEffect;
          activeEffect = this;
          cleanEffect(this);
          return this.fn();
        } finally {
          activeEffect = this.parent;
          this.parent = null;
        }
      }
    }
    stop() {
      if (this.active) {
        this.active = false;
        cleanEffect(this);
      }
    }
  };
  var targetMap = /* @__PURE__ */ new WeakMap();
  function trigger(target, key, value) {
    let depsMap = targetMap.get(target);
    if (!depsMap)
      return;
    let effects = depsMap.get(key);
    triggerEffects(effects);
  }
  function triggerEffects(effects) {
    if (effects) {
      effects = new Set(effects);
      effects.forEach((effect2) => {
        if (effect2 !== activeEffect) {
          if (effect2.scheduler) {
            effect2.scheduler();
          } else {
            effect2.run();
          }
        }
      });
    }
  }
  function track(target, key) {
    if (activeEffect) {
      let depsMap = targetMap.get(target);
      if (!depsMap) {
        targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
      }
      let deps = depsMap.get(key);
      if (!deps) {
        depsMap.set(key, deps = /* @__PURE__ */ new Set());
      }
      trackEffects(deps);
    }
  }
  function trackEffects(deps) {
    let shouldTrack = !deps.has(activeEffect);
    if (shouldTrack) {
      deps.add(activeEffect);
      activeEffect.deps.push(deps);
    }
  }
  function effect(fn, options = {}) {
    const _effect = new ReactiveEffect(fn, options.scheduler);
    _effect.run();
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
  }

  // packages/reactivity/src/baseHandler.ts
  function isReactive(value) {
    return value && value["__v_isReactive" /* IS_REACTIVE */];
  }
  var baseHandler = {
    get(target, key, receiver) {
      if (key === "__v_isReactive" /* IS_REACTIVE */)
        return true;
      track(target, key);
      const res = Reflect.get(target, key, receiver);
      if (isObject(res)) {
        return reactive(res);
      }
      return res;
    },
    set(target, key, value, receiver) {
      let oldValue = target[key];
      if (oldValue !== value) {
        let result = Reflect.set(target, key, value, receiver);
        trigger(target, key, value);
        return result;
      }
    }
  };

  // packages/reactivity/src/reactive.ts
  var reactiveMap = /* @__PURE__ */ new WeakMap();
  function reactive(target) {
    if (!isObject(target))
      return target;
    if (target["__v_isReactive" /* IS_REACTIVE */]) {
      return target;
    }
    const existing = reactiveMap.get(target);
    if (existing)
      return existing;
    const proxy = new Proxy(target, baseHandler);
    reactiveMap.set(target, proxy);
    return proxy;
  }

  // packages/reactivity/src/computed.ts
  function computed(getterOrOptions) {
    const isGetter = isFunction(getterOrOptions);
    let getter;
    let setter;
    const fn = () => {
      console.warn("computed  is readonly");
    };
    if (isGetter) {
      getter = getterOrOptions;
      setter = fn;
    } else {
      getter = getterOrOptions.get;
      setter = getterOrOptions.set || fn;
    }
    return new ComputedRefImpl(getter, setter);
  }
  var ComputedRefImpl = class {
    constructor(getter, setter) {
      this.setter = setter;
      this._dirty = true;
      this.__v_isRef = true;
      this.effect = new ReactiveEffect(getter, () => {
        if (!this._dirty) {
          this._dirty = true;
          triggerEffects(this.deps);
        }
      });
    }
    get value() {
      if (activeEffect) {
        trackEffects(this.deps || (this.deps = /* @__PURE__ */ new Set()));
      }
      if (this._dirty) {
        this._dirty = false;
        this._value = this.effect.run();
      }
      return this._value;
    }
    set value(newValues) {
      this.setter(newValues);
    }
  };

  // packages/reactivity/src/watch.ts
  function traversal(value, set = /* @__PURE__ */ new Set()) {
    if (!isObject(value))
      return value;
    if (set.has(value))
      return value;
    set.add(value);
    for (var key in value) {
      traversal(value[key], set);
    }
    return value;
  }
  function watch(scource, cb) {
    let get;
    let oldValue;
    let newValue;
    if (isReactive(scource)) {
      console.log("\u54CD\u4E00\u58F0\u5BF9\u8C61");
      get = () => traversal(scource);
    } else if (isFunction(scource)) {
      get = scource;
    }
    let cleanup;
    const onCleanup = (fn) => {
      cleanup = fn;
    };
    const job = () => {
      if (cleanup)
        cleanup();
      newValue = effect2.run();
      cb(newValue, oldValue, onCleanup);
      oldValue = newValue;
    };
    let effect2 = new ReactiveEffect(get, job);
    oldValue = effect2.run();
  }

  // packages/reactivity/src/ref.ts
  function ref(value) {
    return new RefImpl(value);
  }
  var ObjectRefImpl = class {
    constructor(object, key) {
      this.object = object;
      this.key = key;
      this.__v_isRef = true;
    }
    get value() {
      return this.object[this.key];
    }
    set value(newValue) {
      this.object[this.key] = newValue;
    }
  };
  function toRef(object, key) {
    return new ObjectRefImpl(object, key);
  }
  function proxyRefs(object) {
    return new Proxy(object, {
      get(target, key, receiver) {
        const r = Reflect.get(target, key, receiver);
        console.log("r: ", r);
        return r.__v_isRef ? r.value : r;
      },
      set(target, key, value, receiver) {
        if (target[key].__v_isRef) {
          target[key].value = value;
          return true;
        }
        return Reflect.set(target, key, value, receiver);
      }
    });
  }
  function toRefs(object) {
    let res = {};
    for (let key in object) {
      res[key] = toRef(object, key);
    }
    console.log(res);
    return res;
  }
  function toReactive(value) {
    return isObject(value) ? reactive(value) : value;
  }
  var RefImpl = class {
    constructor(rawValue) {
      this.rawValue = rawValue;
      this.__v_isRef = true;
      this._value = toReactive(rawValue);
    }
    get value() {
      trackEffects(this.dep || (this.dep = /* @__PURE__ */ new Set()));
      return this._value;
    }
    set value(newValue) {
      if (newValue !== this.rawValue) {
        this._value = toReactive(newValue);
        this.rawValue = newValue;
        triggerEffects(this.dep);
      }
    }
  };

  // packages/runtime-core/src/component.ts
  function createComponentInstance(vnode) {
    let instance = {
      data: null,
      vnode,
      subTree: null,
      isMounted: false,
      update: null,
      render: null
    };
    return instance;
  }
  function setupComponent(instance) {
    const { type, children, props } = instance.vnode;
    const { data, render: render2 } = type;
    if (data) {
      if (!isFunction(data)) {
        return console.warn("the data option must be a function.");
      }
      instance.data = reactive(data.call({}));
    }
    instance.render = render2;
  }

  // packages/runtime-core/src/sequence.ts
  function getSequence(arr) {
    let result = [0];
    let p = new Array(arr).fill(0);
    let len = arr.length;
    let lastIdex = 0;
    let start;
    let end;
    let middle;
    for (let i = 0; i < len; i++) {
      let arrI = arr[i];
      if (arrI !== 0) {
        lastIdex = result[result.length - 1];
        if (arr[lastIdex] < arrI) {
          p[i] = lastIdex;
          result.push(i);
          continue;
        }
        start = 0;
        end = result.length - 1;
        while (start < end) {
          middle = Math.floor((start + end) / 2);
          if (arr[result[middle]] < arrI) {
            start = middle + 1;
          } else {
            end = middle;
          }
        }
        if (arrI < arr[result[end]]) {
          p[i] = result[end - 1];
          result[end] = i;
        }
      }
    }
    let l = result.length;
    let last = result[l - 1];
    while (l-- > 0) {
      result[l] = last;
      last = p[last];
    }
    return result;
  }
  var arrInex = getSequence([2, 3, 1, 5, 6, 8, 7, 9, 4]);

  // packages/runtime-core/src/renderer.ts
  function createRenderer(options) {
    let {
      createElement: hostCreateElement,
      createTextNode: hostCreateTextNode,
      insert: hostInsert,
      remove: hostRemove,
      querySelector: hostQuerySelector,
      parentNode: hostParentNode,
      nextSibling: hostNextSibling,
      setText: hostSetText,
      setElementText: hostSetElementText,
      patchProp: hostPatchProp
    } = options;
    function normalize(children, i) {
      if (isString(children[i]) || isNumber(children[i])) {
        children[i] = createVNode(Text, null, children[i]);
      }
      return children[i];
    }
    function patchProps(oldProps, newProps, el) {
      if (oldProps == null)
        oldProps = {};
      if (newProps == null)
        newProps = {};
      for (let key in newProps) {
        hostPatchProp(el, key, oldProps[key], newProps[key]);
      }
      for (let key in oldProps) {
        if (newProps[key] == null) {
          hostPatchProp(el, key, oldProps[key], null);
        }
      }
    }
    function mountChildren(children, container) {
      for (let i = 0; i < children.length; i++) {
        const child = normalize(children, i);
        patch(null, child, container);
      }
    }
    function mountElement(vnode, container, anchor) {
      let { type, props, children, shapeFlag } = vnode;
      let el = vnode.el = hostCreateElement(type);
      if (props) {
        patchProps(null, props, el);
      }
      if (shapeFlag & 8 /* TEXT_CHILDREN */) {
        hostSetElementText(el, children);
      }
      if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
        mountChildren(children, el);
      }
      hostInsert(el, container, anchor);
    }
    function unmountChildren(children) {
      children.forEach((child) => {
        unmount(child);
      });
    }
    function patchKeyChildren(c1, c2, el) {
      let i = 0;
      let e1 = c1.length - 1;
      let e2 = c2.length - 1;
      while (i <= e1 && i <= e2) {
        let n1 = c1[i];
        let n2 = c2[i];
        if (isSameVNode(n1, n2)) {
          patch(n1, n2, el);
        } else {
          break;
        }
        i++;
      }
      while (i <= e1 && i <= e2) {
        let n1 = c1[e1];
        let n2 = c2[e2];
        if (isSameVNode(n1, n2)) {
          patch(n1, n2, el);
        } else {
          break;
        }
        e1--;
        e2--;
      }
      if (i > e1) {
        if (i <= e2) {
          while (i <= e2) {
            const nextPos = e2 + 1;
            const anchor = c2.length <= nextPos ? null : c2[nextPos].el;
            patch(null, c2[i], el, anchor);
            i++;
          }
        }
      } else if (i > e2) {
        if (i <= e1) {
          while (i <= e1) {
            unmount(c1[i]);
            i++;
          }
        }
      } else {
        console.log(i, e1, e2);
        let s1 = i;
        let s2 = i;
        const toBePatched = e2 - s2 + 1;
        const keyToNewIndexMap = /* @__PURE__ */ new Map();
        for (let i2 = s2; i2 <= e2; i2++) {
          keyToNewIndexMap.set(c2[i2].key, i2);
        }
        const seq = new Array(toBePatched).fill(0);
        for (let i2 = s1; i2 <= e1; i2++) {
          const oldVNode = c1[i2];
          const newIndex = keyToNewIndexMap.get(oldVNode.key);
          if (newIndex == null) {
            unmount(oldVNode);
          } else {
            seq[newIndex - s2] = i2 + 1;
            patch(oldVNode, c2[newIndex], el);
          }
        }
        const increase = getSequence(seq);
        let j = increase.length - 1;
        for (let i2 = toBePatched - 1; i2 >= 0; i2--) {
          const currendIdex = s2 + i2;
          const child = c2[currendIdex];
          const anchor = currendIdex + 1 < c2.length ? c2[currendIdex + 1].el : null;
          if (seq[i2] === 0) {
            patch(null, child, el, anchor);
          } else {
            if (i2 !== increase[j]) {
              hostInsert(child.el, el, anchor);
            } else {
              j--;
            }
          }
        }
      }
    }
    function patchChildren(n1, n2, el) {
      const c1 = n1.children;
      const c2 = n2.children;
      const prevShapeFlag = n1.shapeFlag;
      const shapeFlag = n2.shapeFlag;
      if (shapeFlag & 8 /* TEXT_CHILDREN */) {
        if (prevShapeFlag & 16 /* ARRAY_CHILDREN */) {
          unmountChildren(c1);
        }
        if (c1 !== c2) {
          hostSetElementText(el, c2);
        }
      } else {
        if (prevShapeFlag & 16 /* ARRAY_CHILDREN */) {
          if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
            patchKeyChildren(c1, c2, el);
          } else {
            console.log(c1);
            unmountChildren(c1);
          }
        } else {
          if (prevShapeFlag & 8 /* TEXT_CHILDREN */) {
            hostSetElementText(el, "");
          }
          if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
            mountChildren(c2, el);
          }
        }
      }
    }
    function patchElement(n1, n2) {
      const el = n2.el = n1.el;
      const oldProps = n1.props;
      const newProps = n2.props;
      patchProps(oldProps, newProps, el);
      patchChildren(n1, n2, el);
    }
    function processElement(n1, n2, container, anchor) {
      if (n1 == null) {
        mountElement(n2, container, anchor);
      } else {
        patchElement(n1, n2);
      }
    }
    function processText(n1, n2, container) {
      if (n1 == null) {
        hostInsert(n2.el = hostCreateTextNode(n2.children), container);
      } else {
        const el = n2.el = n1.el;
        const newText = n2.children;
        if (newText !== n1.children) {
          hostSetText(el, newText);
        }
      }
    }
    function processFragment(n1, n2, container) {
      if (n1 == null) {
        mountChildren(n2.children, container);
      } else {
        patchKeyChildren(n1.children, n2.children, container);
      }
    }
    function setupRenderEffect(instance, container, anchor) {
      const componentUpdate = () => {
        const { render: render3, data } = instance;
        if (!instance.isMounted) {
          const subTree = render3.call(data);
          patch(null, subTree, container, anchor);
          instance.subTree = subTree;
          instance.isMounted = true;
        } else {
          const subTree = render3.call(data);
          patch(instance.subTree, subTree, container, anchor);
          instance.subTree = subTree;
        }
      };
      const effect2 = new ReactiveEffect(componentUpdate);
      const update = instance.update = effect2.run.bind(effect2);
      update();
    }
    function mountComponent(vnode, container, anchor) {
      const instance = vnode.component = createComponentInstance(vnode);
      setupComponent(instance);
      setupRenderEffect(instance, container, anchor);
    }
    function processComponent(n1, n2, container, anchor) {
      console.log("n1, n2, container, anchor: ", n1, n2, container, anchor);
      if (n1 == null) {
        mountComponent(n2, container, anchor);
      } else {
      }
    }
    function unmount(n1) {
      if (n1.type === Fragment) {
        return unmountChildren(n1.children);
      }
      hostRemove(n1.el);
    }
    function patch(n1, n2, container, anchor = null) {
      if (n1 && !isSameVNode(n1, n2)) {
        unmount(n1);
        n1 = null;
      }
      const { type, shapeFlag } = n2;
      switch (type) {
        case Text:
          processText(n1, n2, container);
          break;
        case Fragment:
          processFragment(n1, n2, container);
          break;
        default:
          if (shapeFlag & 1 /* ELEMENT */) {
            processElement(n1, n2, container, anchor);
          } else if (shapeFlag & 4 /* STATEFUL_COMPONENT */) {
            processComponent(n1, n2, container, anchor);
          }
          break;
      }
    }
    const render2 = (vnode, container) => {
      if (vnode == null) {
        console.log("xx");
        if (container._vnode) {
          unmount(container._vnode);
        }
      } else {
        patch(container._vnode || null, vnode, container);
      }
      container._vnode = vnode;
    };
    return {
      render: render2
    };
  }

  // packages/runtime-dom/src/nodeOps.ts
  var nodeOps = {
    createElement(tagName) {
      return document.createElement(tagName);
    },
    createTextNode(text) {
      return document.createTextNode(text);
    },
    insert(el, container, anchor = null) {
      container.insertBefore(el, anchor);
    },
    remove(child) {
      const parent = child.parentNode;
      if (parent) {
        parent.removeChild(child);
      }
    },
    querySelector(selectors) {
      return document.querySelector(selectors);
    },
    parentNode(child) {
      return child.parentNode;
    },
    nextSibling(child) {
      return child.nextSibling;
    },
    setText(el, text) {
      el.nodeValue = text;
    },
    setElementText(el, text) {
      el.textContent = text;
    }
  };

  // packages/runtime-dom/src/patch-prop/patchAttr.ts
  function patchAttr(el, key, value) {
    if (value) {
      el.setAttribute(key, value);
    } else {
      el.removeAttribute(key);
    }
  }

  // packages/runtime-dom/src/patch-prop/patchClass.ts
  function patchClass(el, nextValue) {
    if (nextValue == null) {
      el.removeAttribute("class");
    } else {
      el.className = nextValue;
    }
  }

  // packages/runtime-dom/src/patch-prop/patchEvent.ts
  function createInvoker(prevValue) {
    const invoker = (e) => invoker.value(e);
    invoker.value = prevValue;
    return invoker;
  }
  function patchEvent(el, eventName, nextValue) {
    const invokers = el._vei || (el._vei = {});
    const existingInvoker = invokers[eventName];
    if (existingInvoker && nextValue) {
      existingInvoker.value = nextValue;
    } else {
      const eName = eventName.slice(2).toLowerCase();
      if (nextValue) {
        const invoker = createInvoker(nextValue);
        invokers[eventName] = invoker;
        el.addEventListener(eName, invoker);
      } else if (existingInvoker) {
        el.removeEventListener(eName, existingInvoker);
        invokers[eventName] = null;
      }
    }
  }

  // packages/runtime-dom/src/patch-prop/patchStyle.ts
  function patchStyle(el, preValue, nextValue) {
    if (!preValue)
      preValue = {};
    if (!nextValue)
      nextValue = {};
    const style = el.style;
    for (let key in nextValue) {
      style[key] = nextValue[key];
    }
    if (preValue) {
      for (let key in preValue) {
        if (nextValue[key] == null) {
          style[key] = null;
        }
      }
    }
  }

  // packages/runtime-dom/src/patchProp.ts
  var patchProp = (el, key, preValue, nextValue) => {
    if (key === "class") {
      patchClass(el, nextValue);
    } else if (key === "style") {
      patchStyle(el, preValue, nextValue);
    } else if (/on[^a-z]/.test(key)) {
      patchEvent(el, key, nextValue);
    } else {
      patchAttr(el, key, nextValue);
    }
  };

  // packages/runtime-dom/src/index.ts
  var renderOptions = __spreadValues({ patchProp }, nodeOps);
  function render(vnode, container) {
    let { render: render2 } = createRenderer(renderOptions);
    return render2(vnode, container);
  }
  return __toCommonJS(src_exports);
})();
//# sourceMappingURL=runtime-dom.global.js.map
