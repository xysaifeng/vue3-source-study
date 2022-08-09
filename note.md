### 1.pnpm 使用特点

- 安装快
- 在使用时候可以快速搭建 monorepo(只需要添加一个 pnpm.workspace.yaml 配置文件，然后在项目（packages）下添加模块就好了)

### 2.生成 tsconfig.json,配置从@vue/shared 引入模块能正确找到

- pnpm tsc --init 生成 tsconfig.json

- ts 别名可以使两个包互相引用

- 若想要在 reactivity 模块中依赖 shared 模块，则在 reactivity 中安装 shared 模块，使用命令`pnpm install @vue/shared@workspace --filter @vue/reactivity`,表示把@vue/shared 模块安装到@vue/reactivity 中，@workspace 表示安装的是自己本地的包不是线上的包，--filter 表示过滤

### 3.如何打包呢？需要一个允许脚本,则新增一个目录 scripts
