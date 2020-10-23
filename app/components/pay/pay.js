
// components/loading/loading.js
//获取应用实例
const app = getApp();
import config from './../../utils/config';

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    payData: {
      type: Object,
      value: {}
    },
    warning: {
      type: Array,
      value: null
    },
    callback: {
      type: Function,
      value: null
    },
    //判断是余额充值还是订单支付
    useType: {
      type: String,
      value: 'order'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    rightSrc: './../../assets/img/right.png',
    closeSrc: './../../assets/img/close2.png',
    backSrc: './../../assets/img/back.png',
    loadingSrc: './../../assets/img/loading.gif',
    successSrc: './../../assets/img/success.png',
    affirmSrc: './../../assets/img/affirm.png',
    balance: 0,
    loading: false,
    isBalance: false, //是否用余额支付
    showPayResult: false //显示支付结果
  },
  //组件生命周期函数，在组件实例进入页面节点树时执行
  attached() {
    this.merchantBalance();//获取用户余额
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //获取用户余额信息
    merchantBalance() {
      let address = app.getSelectStore()
      let that = this;
      that.setData({ loading: true });
      wx.request({
        url: `${config.api.merchantBalance}?store_id=${address.id || ''}`,
        header: {
          'content-type': 'application/json',
          'Vesta-Custom-Access-Token': app.globalData.loginUserInfo.access_token
        },
        success: function (res) {
          if (res.statusCode == 200 && res.data.code === 0) {
            let rd = res.data.data;
            that.setData({
              balance: rd.balance
            });
          } else {
            app.requestResultCode(res); //处理异常
          }
        },
        complete: function(){
          that.setData({ loading: false });
        }
      });
    },
    //改变使用余额
    changeUseBalance(e){
      let v = e.detail.value;
      this.setData({
        isBalance: v
      });
    },
    //确认支付
    submitOrderPay() {
      let that = this;
      if (that.data.loading) return;
      let { useType } = that.data;
      that.setData({ loading: true }, () => {
        //获取oepnid
        app.codeGetOpenId((openid) => {
          if (openid === 0){
            that.setData({ loading: false });
          }else{
            if (useType === 'balanceTopup'){
              //余额充值
              that.balanceTopup(openid);
            }else{
              //订单支付
              that.orderPay(openid);
            }
          }
        });
      });

    },
    //订单支付
    orderPay(openid) {
      let that = this;
      let { payData, isBalance, callback } = that.data;
      that.setData({ loading: true });
      wx.request({
        url: config.api.orderPay,
        header: {
          'content-type': 'application/json',
          'Vesta-Custom-Access-Token': app.globalData.loginUserInfo.access_token
        },
        method: 'POST',
        data: {
          openid: openid,
          order_id: payData.order_id,
          is_use_balance: isBalance ? true : false
        },
        success: function (res) {
          if (res.statusCode == 200 && res.data.code === 0) {
            let rd = res.data.data;
            if (rd && rd.config && rd.config.timeStamp) {
              //需要微信支付
              wx.requestPayment({
                'timeStamp': rd.config.timeStamp,
                'nonceStr': rd.config.nonceStr,
                'package': rd.config.package,
                'signType': rd.config.signType || 'MD5',
                'paySign': rd.config.paySign,
                'success': function (res) {
                  that.orderPayConfirm(rd.pay_code);
                },
                'fail': function (res) {
                  typeof callback === 'function' && callback('fail');
                  that.setData({ loading: false });
                }
              });
            } else {
              that.setData({ loading: false });
              //余额100%支付
              typeof callback === 'function' && callback('success');
            }
          } else {
            that.setData({ loading: false });
            app.requestResultCode(res); //处理异常
          }
        },
        fail: function () {
          that.setData({ loading: false });
        }
      });
    },

    //余额充值支付
    balanceTopup(openid) {
      let that = this;
      let { payData, callback } = that.data;
      wx.request({
        url: config.api.balanceTopup,
        header: {
          'content-type': 'application/json',
          'Vesta-Custom-Access-Token': app.globalData.loginUserInfo.access_token
        },
        method: 'POST',
        data: {
          openid: openid,
          amount: payData.price
        },
        success: function (res) {
          if (res.statusCode == 200 && res.data.code === 0) {
            let rd = res.data.data;
            //需要微信支付
            wx.requestPayment({
              'timeStamp': rd.config.timeStamp,
              'nonceStr': rd.config.nonceStr,
              'package': rd.config.package,
              'signType': rd.config.signType || 'MD5',
              'paySign': rd.config.paySign,
              'fail': function (res) {
                typeof callback === 'function' && callback('fail');
                that.setData({ loading: false });
              },
              'success': function (res) {
                that.balanceTopupConfirm(rd.pay_code);
              }
            });
          } else {
            that.setData({ loading: false });
            app.requestResultCode(res); //处理异常
          }
        },
        fail: function () {
          that.setData({ loading: false });
        }
      });
    },

    //支付确认
    orderPayConfirm(payCode) {
      let that = this;
      let { callback } = that.data;
      wx.request({
        url: config.api.orderPayConfirm,
        header: {
          'content-type': 'application/json',
          'Vesta-Custom-Access-Token': app.globalData.loginUserInfo.access_token
        },
        method: 'POST',
        data: {
          pay_code: payCode
        },
        success: function (res) {
          that.setData({ loading: false });
          //百分百支付成功
          if (res.statusCode == 200 && res.data.code === 0) {
            typeof callback === 'function' && callback('success');
          } else {
            //客户支付成功，服务器没回调
            that.payResult(); //支付结果
          }
        },
        fail: function(){
          that.setData({ loading: false });
          //客户支付成功，服务器没回调
          typeof callback === 'function' && callback('success');
        }
      });
    },

    //支付确认
    balanceTopupConfirm(payCode) {
      let that = this;
      let { callback } = that.data;
      wx.request({
        url: config.api.balanceTopupConfirm,
        header: {
          'content-type': 'application/json',
          'Vesta-Custom-Access-Token': app.globalData.loginUserInfo.access_token
        },
        method: 'POST',
        data: {
          pay_code: payCode
        },
        success: function (res) {
          that.setData({ loading: false });
          //百分百支付成功
          if (res.statusCode == 200 && res.data.code === 0) {
            typeof callback === 'function' && callback('success');
          } else {
            //客户支付成功，服务器没回调
            that.payResult(); //支付结果
          }
        },
        fail: function () {
          that.setData({ loading: false });
          //客户支付成功，服务器没回调
          typeof callback === 'function' && callback('success');
        }
      });
    },

    //取消支付
    cancelPay(){
      let that = this;
      that.setData({ loading: false });
      let { callback } = that.data;
      typeof callback === 'function' && callback('cancel');
    },

    //支付结果
    payResult(){
      let that = this;
      let { callback } = that.data;

      that.setData({
        showPayResult: true
      }, () => {
        setTimeout(() => {
          that.setData({
            showPayResult: false
          }, () => {
            typeof callback === 'function' && callback('success');
          });
        }, 5000);
      });
    }
  }
})
