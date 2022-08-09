// 打包开发时的脚本


// 拿到传进来的两个参数(reactivity,global)
// process.argv 能拿到多个参数，前两个不要
// console.log(process.argv.slice(2));

const path = require('path')
const args = require('minimist')(process.argv.slice(2)) // minimist 可以解析命令行参数
// console.log('args: ', args);

// 打包目标
const target = args._[0] || 'reactivity'
// 打包格式
const format = args.f || 'global'

// console.log(target, format);
//接下来去打包

// 找到打包的文件是谁
const entryFile = path.resolve(__dirname, `../packages/${target}/src/index.ts`)
// console.log('entryFile: ', entryFile);

// 包名 -》global用 打包成iife的名字
const globalName = require(path.resolve(__dirname, `../packages/${target}/package.json`)).buildOptions?.name
// console.log('globalName: ', globalName);

// 还要看输出格式是什么
// 一般有三种
// 1.iife 自执行函数 global const vue = (function(){})(),在浏览器中使用的 要增加一个全局变量
// 2.cjs commonjs规范
// 3.esm es6Module
// 4.umd 过时了


// 打包后的格式化
const outputFormat = format.startsWith('global') ? 'iife' : format === 'cjs' ? 'cjs' : 'esm'
// console.log('outputFormat: ', outputFormat);

// 出口文件
const outfile = path.resolve(__dirname, `../packages/${target}/dist/${target}.${format}.js`)
// console.log('outputFile: ', outfile);



// 使用esbuild打包

const { build } = require('esbuild')
build({
  entryPoints: [entryFile], // 打包入口
  outfile, // 输出位置
  bundle: true, // 把所有的包都打包到一起
  sourcemap: true, // 方便调试
  format: outputFormat, // 输出格式
  globalName, // 输出格式
  platform: format === 'cjs' ? 'node' : 'browser', // 输出格式
  watch: { // 监控文件变化
    onRebuild(error) {
      if (error) console.log('rebuilt ~~')
    }
  }
}).then(() => {
  console.log('watching~~');
})