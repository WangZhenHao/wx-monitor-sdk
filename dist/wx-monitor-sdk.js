(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global.monitorSdk = factory());
}(this, (function () { 'use strict';

    function report(options) {
      this.config = options;
    }

    report.prototype = {
      request: function request(route, parmas) {
        var _this$config = this.config,
            url = _this$config.url,
            key = _this$config.key;

        if (!key) {
          throw new Error('please set sdk key');
        }

        if (!url) {
          throw new Error('please set sdk url');
        }

        wx.rewriteRequest({
          url: url + route,
          method: 'POST',
          data: parmas
        });
      }
    };

    var KEY = '';

    function Monitoring(config) {
      this.breadcrumb = {};
      this.pageStack = [];
      this.systemInfo = {};
      this.accountInfo = {};
      this.report = new report(config);

      this.callback = function () {};

      this.getSystemInfo();
      this.rewriteRequest();
      this.rewriteApp();
      this.rewritePage();
      this.rewriteComponent();
    }

    Monitoring.prototype = {
      pushBreadcrumd: function pushBreadcrumd(breadcrumb, key) {
        if (!key) return;
        KEY = key;
        var arr = this.breadcrumb[key];

        if (arr) {
          arr.push(breadcrumb);

          if (arr.length > 20) {
            arr.shift();
          }
        } else {
          this.breadcrumb[key] = [breadcrumb];
        }
      },
      clearBreadCrumd: function clearBreadCrumd(key) {
        this.breadcrumb[key] = [];
      },
      getSystemInfo: function getSystemInfo() {
        var _this = this;

        var accountInfo = wx.getAccountInfoSync();
        this.accountInfo = accountInfo;
        wx.getSystemInfo({
          success: function success(res) {
            _this.systemInfo = res;
          }
        });
      },
      rewriteRequest: function rewriteRequest() {
        var originRequset = wx.request;
        var self = this;

        wx.rewriteRequest = function (options) {
          var successFn = options.success;

          options.success = function (res) {
            var activePage = self.getActivePage();
            var breadcrumb = {
              // type: 'function',
              time: +new Date(),
              belong: 'request',
              method: 'successFn',
              route: activePage.route || 'none',
              httpUrl: options.url // arguments: JSON.stringify(res.data),

            }; // self.breadcrumb = breadcrumb;

            self.pushBreadcrumd(breadcrumb, activePage.route);
            return successFn && successFn(res);
          };

          return originRequset(options);
        };
      },
      rewriteApp: function rewriteApp() {
        var originApp = App;
        var self = this;

        App = function App(app) {
          var userDefinedonError = app['onError'];
          var userDefinedonLaunch = app['onLaunch'];

          app['onError'] = function (error) {
            self.error({
              msg: error,
              key: KEY
            });
            return userDefinedonError && userDefinedonError.call(this, error);
          };

          app['onLaunch'] = function (options) {
            var breadcrumb = {
              // type: 'function',
              time: +new Date(),
              belong: 'App',
              method: 'onLaunch',
              route: 'none',
              arguments: 'none'
            }; // self.breadcrumb = breadcrumb;

            self.pushBreadcrumd(breadcrumb, 'onLaunch');
            return userDefinedonLaunch && userDefinedonLaunch.call(this, options);
          };

          return originApp(app);
        };
      },
      _normalPage: function _normalPage(page) {
        if (!page) page = {};
        var pageMethods = Object.keys(page);

        if (pageMethods.indexOf('onLoad') === -1) {
          pageMethods.push('onLoad');

          page['onLoad'] = function () {};
        }

        if (pageMethods.indexOf('onUnload') === -1) {
          pageMethods.push('onUnload');

          page['onUnload'] = function () {};
        }

        return {
          page: page,
          pageMethods: pageMethods
        };
      },
      rewritePage: function rewritePage() {
        var originPage = Page;
        var self = this;

        Page = function Page(page) {
          var parmas = self._normalPage(page);

          var pageMethods = parmas.pageMethods;
          page = parmas.page;
          pageMethods.forEach(function (methodName) {
            if (typeof page[methodName] === 'function') {
              var userDefinedMethod = page[methodName];

              page[methodName] = function () {
                var activePage = self.getActivePage();
                var breadcrumb = {
                  // type: 'function',
                  time: +new Date(),
                  belong: 'Page',
                  method: methodName,
                  route: activePage.route || 'none',
                  arguments: Object.keys(arguments).length ? JSON.stringify(arguments) : 'none'
                };
                self.pushBreadcrumd(breadcrumb, activePage.route);
                if (methodName === 'onLoad') self.pageStack.push(activePage.route);

                if (methodName === 'onUnload') {
                  self.pageStack.splice(-1, 1);
                  self.clearBreadCrumd(activePage.route);
                }

                return userDefinedMethod && userDefinedMethod.apply(this, arguments);
              };
            }
          });
          return originPage(page);
        };
      },
      rewriteComponent: function rewriteComponent() {
        var originComponent = Component;
        var self = this;

        Component = function Component(component) {
          Object.keys(component).forEach(function (methodName) {
            if (typeof component[methodName] === 'function') {
              var userDefinedMethod = component[methodName];

              component[methodName] = function () {
                var activePage = self.getActivePage();
                var name = component['name'] ? component['name'] : "undefined component's name";
                var breadcrumb = {
                  // type: 'function',
                  time: +new Date(),
                  belong: "Component:".concat(name),
                  method: methodName,
                  route: activePage.route || 'none',
                  arguments: Object.keys(arguments).length ? JSON.stringify(arguments) : 'none'
                }; // self.breadcrumb = breadcrumb;

                self.pushBreadcrumd(breadcrumb, activePage.route);
                return userDefinedMethod.apply(this, arguments);
              };
            }
          });
          return originComponent(component);
        };
      },
      error: function error(result) {
        // console.log('收集的错误', msg);
        // console.log(this.breadcrumb, this.pageStack, this.systemInfo);
        this.callback && this.callback({
          msg: result.msg,
          breadcrumb: JSON.parse(JSON.stringify(this.breadcrumb[KEY])),
          pageStack: this.pageStack,
          systemInfo: this.systemInfo,
          accountInfo: this.accountInfo,
          key: KEY
        });
      },
      getActivePage: function getActivePage() {
        var curPages = getCurrentPages();

        if (curPages.length) {
          return curPages[curPages.length - 1] || {};
        }

        return {};
      }
    };

    return Monitoring;

})));
