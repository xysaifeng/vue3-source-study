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
    KeepAlive: () => KeepAlive,
    LifeCycle: () => LifeCycle,
    Text: () => Text,
    computed: () => computed,
    createRenderer: () => createRenderer,
    createVNode: () => createVNode,
    defineAsyncComponent: () => defineAsyncComponent,
    effect: () => effect,
    getCurrentInstance: () => getCurrentInstance,
    h: () => h,
    inject: () => inject,
    onBeforeMount: () => onBeforeMount,
    onMounted: () => onMounted,
    onUpdated: () => onUpdated,
    provide: () => provide,
    proxyRefs: () => proxyRefs,
    reactive: () => reactive,
    ref: () => ref,
    render: () => render,
    setCurrentInstance: () => setCurrentInstance,
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
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var hasOwn = (obj, key) => hasOwnProperty.call(obj, key);
  function invokerFns(fns) {
    for (let i = 0; i < fns.length; i++) {
      fns[i]();
    }
  }

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
    if (children !== void 0) {
      let temp = 0;
      if (isArray(children)) {
        temp = ShapeFlags.ARRAY_CHILDREN;
      } else if (isObject(children)) {
        temp = ShapeFlags.SLOTS_CHILDREN;
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
    if (shouldTrack && activeEffect) {
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
  var instance = null;
  var getCurrentInstance = () => {
    return instance;
  };
  var setCurrentInstance = (i) => {
    instance = i;
  };
  function createComponentInstance(vnode, parent2) {
    let instance2 = {
      ctx: {},
      data: null,
      vnode,
      subTree: null,
      isMounted: false,
      update: null,
      render: null,
      propsOptions: vnode.type.props || {},
      props: {},
      attrs: {},
      proxy: null,
      setupState: {},
      slots: {},
      exposed: {},
      parent: parent2,
      provides: parent2 && parent2.provides ? parent2.provides : /* @__PURE__ */ Object.create(null)
    };
    return instance2;
  }
  function initProps(instance2, rawProps) {
    const props = {};
    const attrs = {};
    const options = instance2.propsOptions;
    if (rawProps) {
      for (let key in rawProps) {
        const value = rawProps[key];
        if (key in options) {
          props[key] = value;
        } else {
          attrs[key] = value;
        }
      }
    }
    instance2.props = reactive(props);
    instance2.attrs = attrs;
  }
  var publicProperties = {
    $attrs: (instance2) => instance2.attrs,
    $slots: (instance2) => instance2.slots
  };
  var instanceProxy = {
    get(target, key, receiver) {
      const { data, props, setupState } = target;
      if (data && hasOwn(data, key)) {
        if (hasOwn(props, key)) {
          console.warn(`Data property "${key}" is already defined in Props. `);
        }
        return data[key];
      } else if (setupState && hasOwn(setupState, key)) {
        return setupState[key];
      } else if (props && hasOwn(props, key)) {
        return props[key];
      }
      const getter = publicProperties[key];
      if (getter) {
        return getter(target);
      }
    },
    set(target, key, value, receiver) {
      const { data, props, setupState } = target;
      if (data && hasOwn(data, key)) {
        data[key] = value;
      } else if (setupState && hasOwn(setupState, key)) {
        setupState[key] = value;
      } else if (props && hasOwn(props, key)) {
        console.warn("props not update");
        return false;
      }
      return true;
    }
  };
  function initSlots(instance2, children) {
    if (instance2.vnode.shapeFlag & 32 /* SLOTS_CHILDREN */) {
      instance2.slots = children;
    }
  }
  function setupComponent(instance2) {
    const { type, children, props } = instance2.vnode;
    const { data, render: render2, setup } = type;
    initProps(instance2, props);
    initSlots(instance2, children);
    instance2.proxy = new Proxy(instance2, instanceProxy);
    if (data) {
      if (!isFunction(data)) {
        return console.warn("the data option must be a function.");
      }
      instance2.data = reactive(data.call({}));
    }
    if (setup) {
      const context = {
        emit: (eventName, ...args) => {
          const name = `on${eventName[0].toUpperCase()}${eventName.slice(1)}`;
          const invoker = instance2.vnode.props[name];
          invoker && invoker(...args);
        },
        attrs: instance2.attrs,
        slots: instance2.slots,
        expose: (exposed) => instance2.exposed = exposed || {}
      };
      setCurrentInstance(instance2);
      const setupResult = setup(instance2.props, context);
      setCurrentInstance(null);
      if (isFunction(setupResult)) {
        instance2.render = setupResult;
      } else if (isObject(setupResult)) {
        instance2.setupState = proxyRefs(setupResult);
      }
    }
    if (!instance2.render) {
      if (render2) {
        instance2.render = render2;
      } else {
      }
    }
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

  // packages/runtime-core/src/scheduler.ts
  var queue = [];
  var isFlushing = false;
  var resolvePromise = Promise.resolve();
  function queueJob(job) {
    if (!queue.includes(job)) {
      queue.push(job);
    }
    if (!isFlushing) {
      isFlushing = true;
      resolvePromise.then(() => {
        isFlushing = false;
        const copyQueue = queue.slice(0);
        queue.length = 0;
        let i;
        for (i = 0; i < copyQueue.length; i++) {
          const job2 = copyQueue[i];
          job2();
        }
        copyQueue.length = 0;
      });
    }
  }

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
    function mountChildren(children, container, parent2) {
      for (let i = 0; i < children.length; i++) {
        const child = normalize(children, i);
        patch(null, child, container, parent2);
      }
    }
    function mountElement(vnode, container, anchor, parent2) {
      let { type, props, children, shapeFlag } = vnode;
      let el = vnode.el = hostCreateElement(type);
      if (props) {
        patchProps(null, props, el);
      }
      if (shapeFlag & 8 /* TEXT_CHILDREN */) {
        hostSetElementText(el, children);
      }
      if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
        mountChildren(children, el, parent2);
      }
      hostInsert(el, container, anchor);
    }
    function unmountChildren(children, parent2) {
      children.forEach((child) => {
        unmount(child, parent2);
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
            unmount(c1[i], parent);
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
            unmount(oldVNode, parent);
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
    function patchChildren(n1, n2, el, parent2) {
      const c1 = n1.children;
      const c2 = n2.children;
      const prevShapeFlag = n1.shapeFlag;
      const shapeFlag = n2.shapeFlag;
      if (shapeFlag & 8 /* TEXT_CHILDREN */) {
        if (prevShapeFlag & 16 /* ARRAY_CHILDREN */) {
          unmountChildren(c1, parent2);
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
            unmountChildren(c1, parent2);
          }
        } else {
          if (prevShapeFlag & 8 /* TEXT_CHILDREN */) {
            hostSetElementText(el, "");
          }
          if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
            mountChildren(c2, el, parent2);
          }
        }
      }
    }
    function patchElement(n1, n2, parent2) {
      const el = n2.el = n1.el;
      const oldProps = n1.props;
      const newProps = n2.props;
      patchProps(oldProps, newProps, el);
      patchChildren(n1, n2, el, parent2);
    }
    function processElement(n1, n2, container, anchor, parent2) {
      if (n1 == null) {
        mountElement(n2, container, anchor, parent2);
      } else {
        patchElement(n1, n2, parent2);
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
    function processFragment(n1, n2, container, parent2) {
      if (n1 == null) {
        mountChildren(n2.children, container, parent2);
      } else {
        patchKeyChildren(n1.children, n2.children, container);
      }
    }
    function updateComponentPreRender(instance2, next) {
      instance2.next = null;
      instance2.vnode = next;
      updateProps(instance2, instance2.props, next.props);
      Object.assign(instance2.slots, next.children);
    }
    function setupRenderEffect(instance2, container, anchor) {
      const componentUpdate = () => {
        const { render: render3, data } = instance2;
        if (!instance2.isMounted) {
          const { bm, m } = instance2;
          if (bm) {
            invokerFns(bm);
          }
          const subTree = render3.call(instance2.proxy);
          patch(null, subTree, container, anchor, instance2);
          instance2.subTree = subTree;
          instance2.isMounted = true;
          if (m) {
            invokerFns(m);
          }
        } else {
          let next = instance2.next;
          if (next) {
            updateComponentPreRender(instance2, next);
          }
          const subTree = render3.call(instance2.proxy);
          patch(instance2.subTree, subTree, container, anchor, instance2);
          instance2.subTree = subTree;
          if (instance2.u) {
            invokerFns(instance2.u);
          }
        }
      };
      const effect2 = new ReactiveEffect(componentUpdate, () => queueJob(instance2.update));
      const update = instance2.update = effect2.run.bind(effect2);
      update();
    }
    function mountComponent(vnode, container, anchor, parent2) {
      const instance2 = vnode.component = createComponentInstance(vnode, parent2);
      instance2.ctx.renderer = {
        createElement: hostCreateElement,
        move(vnode2, container2) {
          hostInsert(vnode2.component.subTree.el, container2);
        },
        unmount
      };
      setupComponent(instance2);
      setupRenderEffect(instance2, container, anchor);
    }
    function hasChange(prevProps, nextProps) {
      for (let key in nextProps) {
        if (nextProps[key] != prevProps[key])
          return true;
      }
      return false;
    }
    function updateProps(instance2, prevProps, nextProps) {
      for (let key in nextProps) {
        instance2.props[key] = nextProps[key];
      }
      for (let key in instance2.props) {
        if (!(key in nextProps)) {
          delete instance2.props[key];
        }
      }
    }
    function shouldComponentUpdate(n1, n2) {
      const prevProps = n1.props;
      const nextProps = n2.props;
      if (hasChange(prevProps, nextProps)) {
        return true;
      }
      if (n1.children || n2.children) {
        return true;
      }
      return false;
    }
    function updateComponent(n1, n2) {
      const instance2 = n2.component = n1.component;
      if (shouldComponentUpdate(n1, n2)) {
        instance2.next = n2;
        instance2.update();
      } else {
        instance2.next = n2;
      }
    }
    function processComponent(n1, n2, container, anchor, parent2) {
      if (n1 == null) {
        if (n2.shapeFlag & 512 /* COMPONENT_KEEP_ALIVE */) {
          console.log("norener ");
          parent2.ctx.active(n2, container, anchor);
        } else {
          mountComponent(n2, container, anchor, parent2);
        }
      } else {
        updateComponent(n1, n2);
      }
    }
    function unmount(n1, parent2) {
      let { shapeFlag, component } = n1;
      if (shapeFlag & 256 /* COMPONENT_SHOULD_KEEP_ALIVE */) {
        parent2.ctx.deactivated(n1);
      }
      if (n1.type === Fragment) {
        return unmountChildren(n1.children, parent2);
      } else if (shapeFlag & 6 /* COMPONENT */) {
        return unmount(component.subTree, parent2);
      }
      hostRemove(n1.el);
    }
    function patch(n1, n2, container, anchor = null, parent2 = null) {
      if (n1 && !isSameVNode(n1, n2)) {
        unmount(n1, parent2);
        n1 = null;
      }
      const { type, shapeFlag } = n2;
      switch (type) {
        case Text:
          processText(n1, n2, container);
          break;
        case Fragment:
          processFragment(n1, n2, container, parent2);
          break;
        default:
          if (shapeFlag & 1 /* ELEMENT */) {
            processElement(n1, n2, container, anchor, parent2);
          } else if (shapeFlag & 4 /* STATEFUL_COMPONENT */) {
            processComponent(n1, n2, container, anchor, parent2);
          }
          break;
      }
    }
    const render2 = (vnode, container) => {
      if (vnode == null) {
        console.log("xx");
        if (container._vnode) {
          unmount(container._vnode, null);
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

  // packages/runtime-core/src/apiLifeCycle.ts
  var LifeCycle = /* @__PURE__ */ ((LifeCycle2) => {
    LifeCycle2["BEFORE_MOUNT"] = "bm";
    LifeCycle2["MOUNTED"] = "m";
    LifeCycle2["UPDATED"] = "u";
    return LifeCycle2;
  })(LifeCycle || {});
  function createInvoker(type) {
    return function(hook, currentInstance = instance) {
      if (currentInstance) {
        const lifeCycles = currentInstance[type] || (currentInstance[type] = []);
        const wrapHook = () => {
          setCurrentInstance(currentInstance);
          hook.call(currentInstance);
          setCurrentInstance(null);
        };
        lifeCycles.push(wrapHook);
      }
    };
  }
  var onBeforeMount = createInvoker("bm" /* BEFORE_MOUNT */);
  var onMounted = createInvoker("m" /* MOUNTED */);
  var onUpdated = createInvoker("u" /* UPDATED */);

  // packages/runtime-core/src/apiInject.ts
  function provide(key, value) {
    if (!instance)
      return;
    let parentProvides = instance.parent && instance.parent.provides;
    let currentProvides = instance.provides;
    if (currentProvides === parentProvides) {
      currentProvides = instance.provides = Object.create(parentProvides);
    }
    currentProvides[key] = value;
  }
  function inject(key, defaultVal) {
    var _a;
    if (!instance)
      return;
    const provides = (_a = instance.parent) == null ? void 0 : _a.provides;
    if (provides && key in provides) {
      return provides[key];
    } else {
      return defaultVal;
    }
  }

  // packages/runtime-core/src/defineAsyncComponent.ts
  function defineAsyncComponent(loaderOrOptions) {
    if (typeof loaderOrOptions === "function") {
      loaderOrOptions = {
        loader: loaderOrOptions
      };
    }
    let Component = null;
    return {
      setup() {
        const { loader, timeout, errorComponent, delay, loadingComponent, onError } = loaderOrOptions;
        const loaded = ref(false);
        const error = ref(false);
        const loading = ref(false);
        if (timeout) {
          setTimeout(() => {
            error.value = true;
          }, timeout);
        }
        let timer;
        if (delay) {
          timer = setTimeout(() => {
            loading.value = true;
          }, delay);
        } else {
          loading.value = true;
        }
        let retryCount = 1;
        function load() {
          return loader().catch((err) => {
            if (onError) {
              return new Promise((resolve, reject) => {
                const retry = () => {
                  retryCount++;
                  resolve(load());
                };
                const fail = () => reject();
                onError(err, retry, fail, retryCount);
              });
            } else {
              throw err;
            }
          });
        }
        load().then((component) => {
          loaded.value = true;
          Component = component;
        }).catch((err) => {
          error.value = true;
        }).finally(() => {
          loading.value = false;
          clearTimeout(timer);
          timer = null;
        });
        return () => {
          if (loaded.value) {
            return h(Component);
          } else if (error.value && errorComponent) {
            return h(errorComponent);
          } else if (loading.value && loadingComponent) {
            return h(loadingComponent);
          }
          return h(Fragment, []);
        };
      }
    };
  }

  // packages/runtime-core/src/keepAlive.ts
  function resetFlag(vnode) {
    if (vnode.shapeFlag & 512 /* COMPONENT_KEEP_ALIVE */) {
      vnode.shapeFlag -= 512 /* COMPONENT_KEEP_ALIVE */;
    }
    if (vnode.shapeFlag & 256 /* COMPONENT_SHOULD_KEEP_ALIVE */) {
      vnode.shapeFlag -= 256 /* COMPONENT_SHOULD_KEEP_ALIVE */;
    }
  }
  var KeepAlive = {
    props: {
      max: [String, Number]
    },
    __isKeepAlive: true,
    setup(props, { slots }) {
      const instance2 = getCurrentInstance();
      const { createElement, move, unmount } = instance2.ctx.renderer;
      let storageContainer = createElement("div");
      const keys = /* @__PURE__ */ new Set();
      const cache = /* @__PURE__ */ new Map();
      const pruneCacheEntry = (vnode) => {
        const subTree = cache.get(vnode);
        resetFlag(subTree);
        unmount(subTree);
        cache.delete(vnode);
        keys.delete(vnode);
      };
      instance2.ctx.active = (n2, container, anchor) => {
        move(n2, container, anchor);
      };
      instance2.ctx.deactivated = (n1) => {
        move(n1, storageContainer);
      };
      let pendingCacheKey = null;
      const cacheSubTree = () => {
        cache.set(pendingCacheKey, instance2.subTree);
      };
      onMounted(cacheSubTree);
      onUpdated(cacheSubTree);
      return () => {
        let vnode = slots.default();
        if (!(vnode.shapeFlag & 4 /* STATEFUL_COMPONENT */))
          return vnode;
        let comp = vnode.type;
        const key = vnode.key == null ? comp : vnode.key;
        pendingCacheKey = key;
        let cacheVnode = cache.get(key);
        if (cacheVnode) {
          vnode.component = cacheVnode.component;
          vnode.shapeFlag |= 512 /* COMPONENT_KEEP_ALIVE */;
        } else {
          keys.add(key);
          const { max } = props;
          if (keys.size > max && max) {
            const v = keys.values().next().value;
            pruneCacheEntry(v);
          }
        }
        vnode.shapeFlag |= 256 /* COMPONENT_SHOULD_KEEP_ALIVE */;
        return vnode;
      };
    }
  };

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
      const parent2 = child.parentNode;
      if (parent2) {
        parent2.removeChild(child);
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
  function createInvoker2(prevValue) {
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
        const invoker = createInvoker2(nextValue);
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
