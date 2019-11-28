//app.js
import { Config, Http, Constant } from './utils/index';

/**
 * 初始化删除数组；删除数组重组数组
 * 用法：数组.remove(元素下标)
 */
Array.prototype.remove = function (dx) {
  if (isNaN(dx) || dx > this.length) {
    return false;
  }
  for (var i = 0, n = 0; i < this.length; i++) {
    if (this[i] != this[dx]) {
      this[n++] = this[i];
    }
  }
  this.length -= 1;
}

/**
 * 初始化查询数组；
 * 用法：数组.inArray('')
 */
Array.prototype.inArray = function (data) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] === data) {
      return true;
    }
  }
  return false;
}

App({
  globalData: {
    windowWidth: wx.getSystemInfoSync().windowWidth,
    userInfo: null, //微信用户信息
    loginUserInfo: {}, //系统登录信息
    isLoginCallBack: null, //判断登录回调
    system: null
  },
  //登录页面回调（临时改动，可登录别的用户）
  loginCallBack(loginData, data) {
    let that = this;
    if (loginData.code && data.encryptedData && data.iv) {
      that.globalData.userInfo = data;
      that.signWeappAuth(loginData.code, data.encryptedData, data.iv); //登录系统
    }else{
      wx.showModal({
        title: "提示",
        content: '授权失败，请重新授权',
        confirmText: "我知道了",
        confirmColor: "#00AE66",
        showCancel: false
      });
    }
  },
  //判断是否登录(登录成功后回调)
  signIsLogin(callBack) {
    let that = this;
    let resData = wx.getStorageSync('loginUserInfo');
    
    //如本地已有access_token
    if(resData && resData.access_token && typeof resData.is_head === 'boolean'){
      that.globalData.loginUserInfo = resData;
      typeof callBack == "function" && callBack(resData);
    }else if (resData) {
      wx.request({
        url: Config.api.signIsLogin,
        header: {
          'content-type': 'application/json',
          'Durian-Custom-Access-Token': resData.access_token
        },
        success: function (res) {
          if (res.statusCode == 200 && res.data.code == 0) {
            let rd = res.data.data;
            wx.setStorageSync("loginUserInfo", rd);
            that.globalData.loginUserInfo = rd;
            typeof callBack == "function" && callBack(rd);
          } else {
            wx.reLaunch({
              url: '/pages/login/login'
            });
          }
        },
        complete: function (res) {
          that.requestTimeout(res, ()=>{
            that.signIsLogin(callBack);
          });
        }

      });
    } else {
      wx.reLaunch({
        url: '/pages/login/login'
      });
    }
  },
  //网络请求异常处理方法
  requestResultCode(res) {
    let that = this;
    if (res.statusCode >= 500){
      wx.showModal({
        title: "提示",
        content: "服务器异常，请重试",
        confirmText: "我知道了",
        confirmColor: "#00AE66",
        showCancel: false
      });
    }else if(res.data.code == 201) {
      wx.showModal({
        title: "提示",
        content: res.data.message,
        confirmText: "重新绑定",
        confirmColor: "#00AE66",
        showCancel: false,
        success: function (resData) {
          if (resData.confirm) {
            wx.removeStorageSync('loginUserInfo');
            that.globalData.userInfo = null; //微信用户信息
            that.globalData.loginUserInfo = {}; //系统登录信息
            wx.navigateTo({
              url: '/pages/loginBind/loginBind'
            });
          }
        }
      });
    }else if (res.data.code == 200) {
      wx.showModal({
        title: "提示",
        content: res.data.message,
        confirmText: "重新登录",
        confirmColor: "#00AE66",
        showCancel: false,
        success: function (resData) {
          if (resData.confirm) {
            wx.removeStorageSync('loginUserInfo');
            that.globalData.userInfo = null; //微信用户信息
            that.globalData.loginUserInfo = {}; //系统登录信息
            wx.reLaunch({
              url: '/pages/login/login'
            });
          }
        }
      });
    } else {
      wx.showModal({
        title: "提示",
        content: res.data.message,
        confirmText: "我知道了",
        confirmColor: "#00AE66",
        showCancel: false
      });
    }
  },

  //通过code取openid
  codeGetOpenId(callBack){
    //调用登录接口
    wx.login({
      success: function (res) {
        wx.request({
          url: Config.api.weappGetOpenId,
          header: {
            'content-type': 'application/json'
          },
          data: {
            code: res.code
          },
          success: function (res) {
            if (res.statusCode == 200 && res.data.code == 0) {
              let openid = res.data.data;
              typeof callBack === 'function' && callBack(openid);
            } else {
              typeof callBack === 'function' && callBack(0); //失败
              wx.showModal({
                title: "提示",
                content: "授权失败，请重试",
                confirmText: "我知道了",
                confirmColor: "#00AE66",
                showCancel: false
              });
            }
          }
        });
      },
      fail: function () {
        typeof callBack === 'function' && callBack(0);//失败
        wx.showModal({
          title: "提示",
          content: "授权失败，请重试",
          confirmText: "我知道了",
          confirmColor: "#00AE66",
          showCancel: false
        });
      }
    });
  },

  //网络超时
  requestTimeout(res, callback){
    if (res.errMsg.indexOf('timeout') >= 0) {
      wx.showModal({
        title: "提示",
        content: "网络超时，请重试",
        confirmText: "重试",
        confirmColor: "#00AE66",
        success: function(res){
          if (res.confirm) {
            typeof callback === 'function' && callback();
          }
        }
      });
    }
  },

  //登录服务器
  signWeappAuth(code, encryptedData, iv) {
    let that = this;
    wx.showLoading({
      title: '登录中...',
      mask: true,
      success: function () {
        wx.request({
          url: Config.api.signWeappAuth,
          header: {
            'content-type': 'application/json'
          },
          data: {
            code: code,
            encryptedData: encryptedData,
            iv: iv
          },
          success: function (res) {
            if (res.statusCode == 200 && res.data.code === 0) {

              // let d = wx.getStorageSync("loginUserInfo")
              // if(rd.id !=d.id) {
              //   wx.removeStorageSync("shoppingCartData")
              //   wx.removeStorageSync('searchData')
              // }
              // wx.setStorageSync("loginUserInfo", rd);

              let id = wx.getStorageSync("loginUserId");
              if(res.data.data.id != id) {
                wx.removeStorageSync("shoppingCartData");
                wx.removeStorageSync('searchData');
              }
              wx.setStorageSync("loginUserInfo", res.data.data); //写登录信息
              wx.setStorageSync('loginUserId', res.data.data.id);

              that.globalData.loginUserInfo = res.data.data;
              wx.reLaunch({
                url: '/pages/index/index',
              });
            } else if (res.statusCode == 200 && res.data.code === 1){
              let rd = res.data.data;
              wx.navigateTo({
                url: '/pages/loginBind/loginBind?weapp_openid=' + rd.weapp_openid + '&unionid=' + rd.unionid
              });
            } else {
              that.requestResultCode(res);
            }
          },
          complete: function (res) {
            wx.hideLoading();
            that.requestTimeout(res, ()=>{
              that.signWeappAuth(code, encryptedData, iv);
            });
          }
        })
      }
    });
  },
  //获取购物车数量
  getShoppingCartNum(){
    let num = 0;
    let d = wx.getStorageSync('shoppingCartData');
    if (d && d.length > 0) {
      for (let i = 0; i < d.length; i++) {
        num = num + d[i].num;
      }
    } else {
      num = 0;
    }
    return num;
  },

  //计算购物车数量
  shoppingCartNum(){
    let num = this.getShoppingCartNum();

    if(num){
      wx.setTabBarBadge({
        index: 2,
        text: num.toString()
      });
    }else{
      wx.removeTabBarBadge({
        index: 2
      });
    }
  },

  //小程序初始化完成时触发，全局只触发一次。
  onLaunch() {
    this.screenSize();//获取屏宽高
    this.getBrand();
    //埋点
    this.actionRecordAdd({
      action: Constant.ACTION_RECORD.LOGIN
    });

    //监听网络
    /*wx.onNetworkStatusChange(function (res) {
      if(!res.isConnected){
        wx.showToast({
          title: '网络不见了~',
          duration: 20000000,
          icon: 'none'
        });
      }else{
        wx.showToast({
          title: '网络已恢复',
          duration: 1500,
          icon: 'none'
        });
      }
    });*/
  },

  //全局显示时
  onShow(){
    this.updateApp(); //更新小程序
    this.shoppingCartNum();//计算购物车数量
  },

  //更新应用
  updateApp(){
    // 获取小程序更新机制兼容
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate(function (res) {
        // 请求完新版本信息的回调
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function () {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              confirmColor: "#00AE66",
              success: function (res) {
                if (res.confirm) {
                  // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                  updateManager.applyUpdate()
                }
              }
            })
          })
          updateManager.onUpdateFailed(function () {
            // 新的版本下载失败
            wx.showModal({
              title: '已经有新版本了哟~',
              content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~',
              confirmColor: "#00AE66",
            })
          })
        }
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法自动更新，请升级到最新微信版本后重试。',
        confirmColor: "#00AE66",
      })
    }
  },

  //获取屏宽高
  screenSize: function () {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        var ww = res.windowWidth;
        var hh = res.windowHeight;
        that.globalData.ww = ww;
        that.globalData.hh = hh;
        res.system.indexOf('iOS')> -1 ? that.globalData.system = 'ios' : that.globalData.system = 'android'
      }
    })
  },
  //获取品牌
  getBrand: function(callBack) {
    let that = this;
    wx.request({
        url: Config.api.sysBrand,
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          if (res.statusCode == 200 && res.data.code == 0) {
            let d = res.data.data;
            that.globalData.brand_icon = d.brand_icon;
            that.globalData.brand_name = d.brand_name;
            typeof callBack === 'function' && callBack(d);
          }
        }
    });
  },
  //获取系统信息
  getSystemInfo(){
    const sysInfo = wx.getSystemInfoSync();
    const screenWidth = sysInfo.screenWidth;
    let factor = screenWidth / 750;       // 获取比例
    const toPx = (rpx) => Math.round(rpx * factor);   // rpx转px
    const toRpx = (px) => Math.round(px / factor);    // px转rpx
    return {
      ...sysInfo,
      factor: factor,
      toPx: toPx,
      toRpx: toRpx,
      custom_version: 'V2.11.3'
    }
  },
  //获取页面（页面路由）
  getPage(route){
    if(!route) return null;
    //获取页面的数据===
    let pages = getCurrentPages();
    pages = pages.filter(item => item.route === route);
    return pages.length > 0 ? pages[0] : null;
    //===============
  },
  //获取页面组件（页面，组件id）
  getPageComponent(page, comId){
    if(!page || !comId) return null;
    let com = page.selectComponent('#' + comId); //获取页面的组件，在页面上给组件设置id
    return com ? com : null;
  },
  //获取当前选择的门店
  getSelectStore(){
    let data = wx.getStorageSync('addOrderSelectAddress');
    let address = {};
    //如果本地已有地址
    if (data && data.id){
      address = data;
    }
    return address;
  },
  //埋点请求数据（map数据）
  actionRecordAdd(data){
    let member = this.globalData.loginUserInfo;
    let memberSto = wx.getStorageSync('loginUserInfo');
    let sys = this.getSystemInfo();
    if((member && member.id) || (memberSto && memberSto.id)){
      Http.post(Config.api.actionRecordAdd, {
        member_id: member.id || memberSto.id || '',
        ...data,
        is_no_prompt: true
      })
    }
  },
  //贝塞尔曲线
  bezier: function (anchorpoints, pointsAmount) {
    var points = [];
    for (var i = 0; i <= pointsAmount; i++) {
      var point = MultiPointBezier(anchorpoints, i / pointsAmount);
      points.push(point);
    }

    function MultiPointBezier(points, t) {
      var len = points.length;
      var x = 0, y = 0;
      var erxiangshi = function (start, end) {
        var cs = 1, bcs = 1;
        while (end > 0) {
          cs *= start;
          bcs *= end;
          start--;
          end--;
        }
        return (cs / bcs);
      };
      for (var i = 0; i < len; i++) {
        var point = points[i];
        x += point.x * Math.pow((1 - t), (len - 1 - i)) * Math.pow(t, i) * (erxiangshi(len - 1, i));
        y += point.y * Math.pow((1 - t), (len - 1 - i)) * Math.pow(t, i) * (erxiangshi(len - 1, i));
      }
      return { x: x, y: y };
    }
    return {
      'bezier_points': points
    };
  },
})