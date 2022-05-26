const resolve =  require('rollup-plugin-node-resolve');
const babel = require('rollup-plugin-babel');
const commonjs = require('rollup-plugin-commonjs')

export default {
  input: 'src/index.js',
  output: {
    name: 'monitorSdk',
    file: 'example/dist/wx-monitor-sdk.js',
    format: 'umd'
  },
  watch: {
    inlude: 'src/**'
  },
  plugins: [
    commonjs(),
    resolve(),
    babel({
      exclude: 'node_modules/**' // 只编译我们的源代码
    })
  ]
}
