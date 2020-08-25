//app.js
import { Config, Http } from './utils/index';

let gio = require("utils/gio-minp/index.js").default;
gio('setConfig', Config.gioConfig);

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
    loginUserInfo: {}, //系统登录信息
    system: null,
    gioIsSetUserId: false,
    gioIsSetUser: false,
  },

  /**
   * 获取登录用户的 token_key 和 access_token
   */
  getTokenKey() {
    return this.globalData.loginUserInfo.token_key || wx.getStorageSync('loginUserInfo').token_key;
  },

  getAccessToken() {
    return this.globalData.loginUserInfo.access_token || wx.getStorageSync('loginUserInfo').access_token;
  },

  //判断是否登录(登录成功后回调)
  signIsLogin(callBack) {
    let that = this;
    let resData = wx.getStorageSync('loginUserInfo');
    
    //如本地已有access_token
    if(resData && resData.access_token && resData.weapp_openid !== null) {
      wx.request({
        url: Config.api.signIsLogin,
        header: {
          'content-type': 'application/json',
          'Vesta-Custom-Access-Token': resData.access_token
        },
        success: function (res) {
          if (res.statusCode == 200 && res.data.code == 0) {
            let rd = res.data.data;
            that.updateLoginInfo(rd); //系统登录信息
            //gio设置userid
            if(!that.globalData.gioIsSetUserId){
              that.gioActionRecordAdd('setUserId', rd.id);
              that.globalData.gioIsSetUserId = true;
            }
            if(!that.globalData.gioIsSetUser){
              that.gioSetUser(rd.store_id);
            }
            typeof callBack == "function" && callBack(rd);
          } else {
            that.updateLoginInfo({});
            wx.reLaunch({
              url: '/pages/loginGuide/loginGuide'
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
      that.updateLoginInfo({});
      wx.reLaunch({
        url: '/pages/loginGuide/loginGuide'
      });
    }
  },

  //更新登录信息
  updateLoginInfo(data){
    this.globalData.loginUserInfo = data;
    wx.setStorageSync("loginUserInfo", data);
  },

  //gio设置用户变量
  gioSetUser(storeId){
    let that = this;
    let { loginUserInfo } = that.globalData;
    Http.get(Config.api.getStoreTags, {
      id: storeId
    }, {
      handleError: false
    }).then(res => {
      let rd = res.data;
      let tags = '';
      rd.tags.forEach(item => {
        tags = `${tags}${tags ? ',' : ''}[${item}]`;
      });
      that.gioActionRecordAdd('setUser', {
        id: loginUserInfo.id,
        loginUserStoreId: rd.id,
        loginUserStoreTitle: rd.title,
        loginUserStoreTags: tags,
        loginUserRealname: loginUserInfo.realname,

        memberId_ppl: rd.id, //登录用户ID（取门店id）
        storeArea_ppl: '', //门店面积
        storePosition_ppl: '', //门店位置
        ownerCharacter_ppl: '', //店主性格
        ownerStyle_ppl: '', //店主风格
        customerPriceType_ppl: '', //客户价格类型
        buyTime_ppl: '' //购买次数
      });
      that.globalData.gioIsSetUser = true;
    });
  },

  //网络请求异常处理方法
  requestResultCode(res) {
    let that = this;
    if (res.statusCode >= 500){
      wx.showModal({
        title: "提示",
        content: "服务器异常，请重试",
        confirmText: "我知道了",
        confirmColor: "#FDCA1F",
        showCancel: false
      });
    } else if (res.statusCode >= 400) {
      wx.showModal({
        title: '提示',
        content: '请求出错啦',
        confirmText: '我知道了',
        confirmColor: '#FDCA1F',
        showCancel: false
      });
    } else if (res.data.code == 200 || res.data.code == 201) {
      //200 登录失效、201 重新绑定
      wx.showModal({
        title: "提示",
        content: res.data.message,
        confirmText: "重新登录",
        confirmColor: "#FDCA1F",
        showCancel: false,
        success: function (resData) {
          if (resData.confirm) {
            that.updateLoginInfo({}); //系统登录信息
            wx.reLaunch({
              url: '/pages/loginGuide/loginGuide'
            });
          }
        }
      });
    } else {
      wx.showModal({
        title: "提示",
        content: res.data.message,
        confirmText: "我知道了",
        confirmColor: "#FDCA1F",
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
                confirmColor: "#FDCA1F",
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
          confirmColor: "#FDCA1F",
          showCancel: false
        });
      }
    });
  },

  //网络超时
  requestTimeout(res, callback){
    if (res.errMsg.indexOf('timeout') >= 0) {
      wx.showModal({
        title: '提示',
        content: '网络超时，请重试',
        confirmText: '重试',
        confirmColor: '#FDCA1F',
        success: function(res){
          if (res.confirm) {
            typeof callback === 'function' && callback('timeout');
          }else{
            //typeof callback === 'function' && callback('cancel');
          }
        }
      });
    }else if(res.errMsg.indexOf('fail') >= 0){
      wx.showModal({
        title: '提示',
        content: '请求出错啦,请检查网络是否可用',
        confirmText: '重试',
        confirmColor: '#FDCA1F',
        success: function(res){
          if (res.confirm) {
            typeof callback === 'function' && callback('netFail');
          }else{
            //typeof callback === 'function' && callback('cancel');
          }
        }
      });
    }else{
      //typeof callback === 'function' && callback('fail');
    }
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
        index: 3,
        text: num.toString()
      });
    }else{
      wx.removeTabBarBadge({
        index: 3
      });
    }
  },

  //小程序初始化完成时触发，全局只触发一次。
  onLaunch() {
    this.screenSize();//获取屏宽高
    this.getBrand();
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
              confirmColor: "#FDCA1F",
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
              confirmColor: "#FDCA1F",
            })
          })
        }
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法自动更新，请升级到最新微信版本后重试。',
        confirmColor: "#FDCA1F",
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
  //gio数据埋点(event事件，data数据)
  gioActionRecordAdd(event, data){
    if(Config.comm !== 'pro') return; //不是生产环境，不埋点上传
    let events = {
      'setUserId': { type: '', data: data },
      'setUser': { type: '', data: data },
      'setPage': { type: '', data: data },
      
      'registSuccess': { type: 'track', data: data }, // 注册成功
      'positionClick': { type: 'track', data: data }, // 流量位点击
      'positionView': { type: 'track', data: data }, // 流量位曝光
      'searchSuccess': { type: 'track', data: data }, // 搜索成功
      'searchResultClick': { type: 'track', data: data }, // 搜索结果点击
      'productDetailPageView': { type: 'track', data: data }, // 浏览商品详情页
      'addToCart': { type: 'track', data: data }, // 加入购物车
      'createOrder': { type: 'track', data: data }, // 生成订单
      'createProductOrder': { type: 'track', data: data }, // 生成商品订单
      'sumitOrder': { type: 'track', data: data }, // 提交订单
      'sumitProductOrder': { type: 'track', data: data }, // 提交商品订单
      'payOrderSuccess': { type: 'track', data: data }, // 订单支付成功
      'payProductSuccess': { type: 'track', data: data }, // 商品支付成功
      'collectClick': { type: 'track', data: data }, // 收藏按钮点击
      'tabbar': { type: 'track', data: data }, // 底部导航栏
      'selectSort': { type: 'track', data: data }, // 商品排序

      'searchWord_evar': { type: 'setEvar', data: data }, // 搜索效果评估(搜索词（转化变量）)
      'firstBuyEntrance_evar': { type: 'setEvar', data: data }, // 核心购买转化(一级购买入口（转化变量）)
      'secBuyEntrance_evar': { type: 'setEvar', data: data }, // 核心购买转化(二级购买大入口（转化变量）)
    };
    if(events[event].type === 'track'){
      gio('track', event, events[event].data);
    }else if(events[event].type === 'setEvar'){
      gio('setEvar', { [event]: events[event].data });
    }else{
      gio(event, events[event].data);
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