
const sdk = require('./dist/wx-monitor-sdk')
const monitor = new sdk({
  url: 'http://172.16.0.166:8871',
  key: 'weapp-udream',
  traceId: String(+new Date())
})

const checkOs = function(info) {
  const system = info.system.toLowerCase();
  let  type = 'none'
  
  if(system.indexOf('window') > -1) {
    type = 2
  } else if(system.indexOf('android') > -1) {
    type = 1;
  } else if(system.indexOf('ios')) {
    type = 0
  }
  
  return type
}

monitor['callback'] = function(result) {
  const {
    systemInfo,
    breadcrumb,
    pageStack,
    msg,
    accountInfo: { miniProgram },
    key
  } = result
  // debugger
  console.log(result)
  
  
  
}


// console.log(app)
App({
  onLaunch: function () {
    // 展示本地存储能力
    // console.log(app)
  },
  globalData: {
    userInfo: null
  },
  // onError(error) {
  //   debugger
  // }
})