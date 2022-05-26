# 小程序错误收集skd

>该skd可以收集到页面，组件，app.js中执行错误的内容，当发生错误的时候，可以拿到`页面栈`，`运行错误的方法`，`执行参数`，`执行时间`，`当前路由`，`系统信息`等

```
如：

Page({
  onLoad: function () {
       this.getName('wangzhenhoa')
  },
  getName(name) {
    console.log(a)
  }
})

可以拿到信息是(摘要)：
{"type": "function","time": 1649834084377,"belong": "Page","method": "getName","route": "pages/index/index","arguments": "{\"0\":\"wangzhenhoa\"}"}
{ msg: 'MiniProgramError\na is not defined\nReferenceError: a is not defined' }
["pages/index/index"]
```

### 使用方法

```
1: app.js里面引入而且执行，注入url, key, tranceId参数拿到monitor对象
const sdk = require('./dist/wx-monitor-sdk')
const monitor = new sdk({
  url: 'http://172.16.0.166:8871',
  key: 'weapp-udream',
  traceId: String(+new Date())
})

2: 重写错误的回调方法
monitor['callback'] = function(res) {
    const parmas = {...}
    monitor.report.request('/api/monitor/report', parmas)
}

错误返回值有：
msg: js执行错误信息
breadcrumb：报错页面的明细：time时间戳，method执行方法，route当前路由，arguuments参数,type类型，belong隶属于（组件，页面，app.js）
pageStack：页面栈
systemInfo： 系统信息
accountInfo：自定义小程序发布信息

{
	"msg": "MiniProgramError\na is not defined\nReferenceError: a is not defined\n    at it.getName (http://127.0.0.1:29128/appservice/pages/index/index.js:12:17)\n    at it.page.<computed> [as getName] (http://127.0.0.1:29128/appservice/dist/wx-monitor-sdk.js:142:61)\n    at it.onLoad (http://127.0.0.1:29128/appservice/pages/index/index.js:9:10)\n    at it.page.<computed> [as onLoad] (http://127.0.0.1:29128/appservice/dist/wx-monitor-sdk.js:142:61)\n    at it.<anonymous> (http://127.0.0.1:29128/appservice/__dev__/WASubContext.js?t=wechat&s=1649818059414&v=2.14.0:2:2136311)\n    at it.l.__callPageLifeTime__ (http://127.0.0.1:29128/appservice/__dev__/WASubContext.js?t=wechat&s=1649818059414&v=2.14.0:2:2136056)\n    at xt (http://127.0.0.1:29128/appservice/__dev__/WASubContext.js?t=wechat&s=1649818059414&v=2.14.0:2:2151715)\n    at http://127.0.0.1:29128/appservice/__dev__/WASubContext.js?t=wechat&s=1649818059414&v=2.14.0:2:2155275\n    at Nt (http://127.0.0.1:29128/appservice/__dev__/WASubContext.js?t=wechat&s=1649818059414&v=2.14.0:2:2155804)\n    at Function.<anonymous> (http://127.0.0.1:29128/appservice/__dev__/WASubContext.js?t=wechat&s=1649818059414&v=2.14.0:2:2165481)",
	"breadcrumb": [{
		"type": "function",
		"time": 1649834084377,
		"belong": "Page",
		"method": "getName",
		"route": "pages/index/index",
		"arguments": "{\"0\":\"wangzhenhoa\"}"
	}],
	"pageStack": ["pages/index/index"],
	"systemInfo": {
		"errMsg": "getSystemInfo:ok",
		"model": "iPhone 6/7/8",
		"pixelRatio": 2,
		"windowWidth": 375,
		"windowHeight": 603,
		"system": "iOS 10.0.1",
		"language": "zh_CN",
		"version": "8.0.5",
		"deviceOrientation": "portrait",
		"screenWidth": 375,
		"screenHeight": 667,
		"SDKVersion": "2.14.0",
		"brand": "devtools",
		"fontSizeSetting": 16,
		"benchmarkLevel": 1,
		"batteryLevel": 100,
		"statusBarHeight": 20,
		"bluetoothEnabled": true,
		"locationEnabled": true,
		"wifiEnabled": true,
		"cameraAuthorized": true,
		"locationAuthorized": true,
		"microphoneAuthorized": true,
		"notificationAuthorized": true,
		"safeArea": {
			"top": 20,
			"left": 0,
			"right": 375,
			"bottom": 667,
			"width": 375,
			"height": 647
		},
		"platform": "devtools",
		"devicePixelRatio": 2
	},
	"accountInfo": {
		"miniProgram": {
			"appId": "wx00e80e8bf05d19c0",
			"envVersion": "develop",
			"version": ""
		}
	}
}


3：回调函数里面上报
monitor.report.request('/api/monitor/report', parmas)

```

### 运行
```

开发调试
npm run dev

构建发行
npm run build

```