const path = require('path');
const rollup = require('rollup');
const resolve = require('rollup-plugin-node-resolve');
const babel = require('rollup-plugin-babel');
const { uglify } = require('rollup-plugin-uglify');
const commonjs = require('rollup-plugin-commonjs');

function rePath (dir) {
  return path.resolve(__dirname, './', dir)
}

const builds = [
  {
    inputOptions: {
      input: rePath('../src/index.js'),
      plugins: [
        commonjs(),
        resolve(),
        babel({
          exclude: 'node_modules/**' // 只编译我们的源代码
        })
      ]
    },
    outputOptions: {
      file: rePath('../dist/wx-monitor-sdk.js'),
      name: 'monitorSdk',
      format: 'umd'
    }
  },
  {
    inputOptions: {
      input: rePath('../src/index.js'),
      plugins: [
        commonjs(),
        uglify(),
        resolve(),
        babel({
          exclude: 'node_modules/**' // 只编译我们的源代码
        })
      ]
    },
    outputOptions: {
      file: rePath('../dist/wx-monitor-sdk.min.js'),
      name: 'monitorSdk',
      format: 'umd'
    }
  }
]
function build (builds) {
  let built = 0;
  const total = builds.length;

  const next = () => {
    buildEntry(builds[built]).then(res => {
      built++

      if (built < total) {
        next();
      }
    })
  }

  next();
}

function buildEntry (config) {
  return rollup.rollup(config.inputOptions).then((bundle) => {
    bundle.generate(config.outputOptions).then(res => {
      return bundle.write(config.outputOptions);
    });


  }).catch(res => {
    console.log(res)
  })
}

build(builds);
// export default {
//   input: 'src/index.js',
//   output: {
//     name: 'ImgLazyLoad',
//     file: 'dist/img-lazy-load.min.js',
//     format: 'umd'
//   },
//   watch: {
//     inlude: 'src/**'
//   },
//   plugins: [
//     uglify(),
//     resolve(),
//     babel({
//       exclude: 'node_modules/**' // 只编译我们的源代码
//     })
//   ]
// }
