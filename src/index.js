import Report from './report.js'
let KEY = ''
function Monitoring(config) {
  this.breadcrumb = {};
  this.pageStack = [];
  this.systemInfo  = {};
  this.accountInfo = {}
  this.report = new Report(config);
  this.callback = function() {}

  this.getSystemInfo();
  this.rewriteRequest()
  this.rewriteApp();
  this.rewritePage();
  this.rewriteComponent();
}

Monitoring.prototype = {
  pushBreadcrumd(breadcrumb, key) {
    if(!key) return

    KEY = key
    const arr = this.breadcrumb[key]
    if(arr) {
      arr.push(breadcrumb)

      if(arr.length > 20) {
        arr.shift()
      }
    } else {
      this.breadcrumb[key] = [breadcrumb]
    }


  }, 
  clearBreadCrumd(key) {
    this.breadcrumb[key] = []
  },
  getSystemInfo() {
    const accountInfo = wx.getAccountInfoSync();
    this.accountInfo = accountInfo;
    wx.getSystemInfo({
      success: (res) => {
        this.systemInfo = res;
      }
    })
  },
  rewriteRequest() {
    const originRequset = wx.request;
    const self = this;

    wx.rewriteRequest = function(options) {

      const successFn = options.success
      options.success = function(res) {
        const activePage = self.getActivePage();
        const breadcrumb = {
          // type: 'function',
          time: +new Date(),
          belong: 'request',
          method: 'successFn',
          route: activePage.route || 'none',
          httpUrl: options.url,
          // arguments: JSON.stringify(res.data),
        };
        // self.breadcrumb = breadcrumb;
        self.pushBreadcrumd(breadcrumb, activePage.route)
        return successFn && successFn(res)
      }

      return originRequset(options)
    }
  },
  rewriteApp() {
    const originApp = App;
    const self = this;
    App = function (app) {
      const userDefinedonError = app['onError'];
      const userDefinedonLaunch = app['onLaunch'];

      app['onError'] = function (error) {
        self.error({ msg: error, key: KEY });
        return userDefinedonError && userDefinedonError.call(this, error);
      };

      app['onLaunch'] = function(options) {
        const breadcrumb = {
          // type: 'function',
          time: +new Date(),
          belong: 'App',
          method: 'onLaunch',
          route: 'none',
          arguments: 'none',
        };
        // self.breadcrumb = breadcrumb;
        self.pushBreadcrumd(breadcrumb, 'onLaunch')
        return userDefinedonLaunch && userDefinedonLaunch.call(this, options);
      }
      return originApp(app);
    };
  },
  _normalPage(page) {
    if(!page) page = {};

    const pageMethods = Object.keys(page);

    if(pageMethods.indexOf('onLoad') === -1) {
      pageMethods.push('onLoad')
      page['onLoad'] = function() {}
    }

    if(pageMethods.indexOf('onUnload') === -1) {
      pageMethods.push('onUnload')
      page['onUnload'] = function() {}
    }

    return {
      page, 
      pageMethods
    }
  },
  rewritePage() {
    const originPage = Page;
    const self = this;

    Page = function (page) {
      const parmas = self._normalPage(page);
      const pageMethods = parmas.pageMethods;
      page = parmas.page;

      pageMethods.forEach((methodName) => {
        if (typeof page[methodName] === 'function') {
          const userDefinedMethod = page[methodName];

          page[methodName] = function () {
            const activePage = self.getActivePage();

            const breadcrumb = {
              // type: 'function',
              time: +new Date(),
              belong: 'Page',
              method: methodName,
              route: activePage.route || 'none',
              arguments: Object.keys(arguments).length ? JSON.stringify(arguments) : 'none',
            };
            self.pushBreadcrumd(breadcrumb, activePage.route)

            if(methodName === 'onLoad') self.pageStack.push(activePage.route);
            if(methodName === 'onUnload') {
              self.pageStack.splice(-1, 1)
              self.clearBreadCrumd(activePage.route)
            }
            return userDefinedMethod && userDefinedMethod.apply(this, arguments)
          };
        }
      });

      return originPage(page);
    };
  },
  rewriteComponent() {
    const originComponent = Component;
    const self = this;

    Component = function (component) {
      Object.keys(component).forEach((methodName) => {
        if (typeof component[methodName] === 'function') {
          const userDefinedMethod = component[methodName];

          component[methodName] = function () {
            const activePage = self.getActivePage();
            const name = component['name'] ? component['name'] : "undefined component's name";

            const breadcrumb = {
              // type: 'function',
              time: +new Date(),
              belong: `Component:${name}`,
              method: methodName,
              route: activePage.route || 'none',
              arguments: Object.keys(arguments).length ? JSON.stringify(arguments) : 'none',
            };

            // self.breadcrumb = breadcrumb;
            self.pushBreadcrumd(breadcrumb, activePage.route)
            return userDefinedMethod.apply(this, arguments)
          };
        }
      });

	  return originComponent(component)
    };
  },
  error(result) {
    // console.log('收集的错误', msg);
    // console.log(this.breadcrumb, this.pageStack, this.systemInfo);

    this.callback && this.callback({
      msg: result.msg,
      breadcrumb: JSON.parse(JSON.stringify(this.breadcrumb[KEY])),
      pageStack: this.pageStack,
      systemInfo: this.systemInfo,
      accountInfo: this.accountInfo,
      key: KEY
    })
  },
  getActivePage() {
    const curPages = getCurrentPages();
    if (curPages.length) {
      return curPages[curPages.length - 1];
    }
    return {};
  },
};

export default Monitoring;
