### 1.pnpm 使用特点

- 安装快
- 在使用时候可以快速搭建 monorepo(只需要添加一个 pnpm.workspace.yaml 配置文件，然后在项目（packages）下添加模块就好了)

### 2.生成 tsconfig.json,配置从@vue/shared 引入模块能正确找到

- pnpm tsc --init 生成 tsconfig.json

- ts 别名可以使两个包互相引用

- 若想要在 reactivity 模块中依赖 shared 模块，则在 reactivity 中安装 shared 模块，使用命令`pnpm install @vue/shared@workspace --filter @vue/reactivity`,表示把@vue/shared 模块安装到@vue/reactivity 中，@workspace 表示安装的是自己本地的包不是线上的包，--filter 表示过滤

### 3.如何打包呢？需要一个允许脚本,则新增一个目录 scripts

### 4.在 ts 中使用 code runner 运行代码需要全局安装：`sudo npm i ts-node -g `,然后可以选中代码运行查看结果 - 2022-08-10 11:50

### 5.vue 的设计点（202208241228）

- 拆分模块（渲染也是，分为两块）
- runtime-dom (为了浏览器操作的，eg:提供一些常用的节点操作 api, setAttribute,...)
- runtime-core (不关心用什么来渲染，比如在浏览器里跑还是小程序或是在 app 里跑,内部主要是虚拟 dom,优点内部可以做 diff 算法，可以跨平台)，通过 vue 的 runtime-core 可以实现自己的渲染逻辑

- vue
  - runtime-dom - runtime-core(用户需要编写虚拟 dom) - reactivity
  - compiler-dom - compiler-core

> v3 核心模块的依赖关系（202208281328）

- vue 有两部分组成

- 编译时：将模板编译成 render 函数，靠的 compiler-dom，将浏览器的 dom 转换成 ast 语法树进行编译，为了区分不同平台，使用了 compiler-core,返回的依旧是虚拟节点

- 运行时：将虚拟节点变成真实节点(可能是 dom 元素，可能是 cavas,可能是小程序对象)，靠的是 runtime-dom(提供 dom api) -> runtime-core（虚拟节点,核心代码不依赖于 dom api 的，需要将 dom api 传递给虚拟节点，runtime-core 拿到 domapi 将虚拟节点创建为真实节点）

- runtime-core 基于 reactivity,内部用的是响应式原理
