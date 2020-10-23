// pages/account/account.js
//获取应用实例
const app = getApp();
import config from './../../utils/config';
import verification from './../../utils/verification';
import util from './../../utils/util';
import constant from './../../utils/constant';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    orderSrc: './../../assets/img/order.png',
    accountBg:'./../../assets/img/balance_bg.png',
    arrowRight:'./../../assets/img/right.png',
    loading: false,
    balance: 0,
    topupPrice: '',
    isShowPay: false, //显示支付
    payData: {}, //支付数据
    payCallBack: null, //支付回调
    balanceChange: constant.BALANCE_CHANGE,
    codeClass:{
      order_code: '订单号',
      topup_code: '充值单号',
      aftersale_code: '售后单号',
      gb_order_code: '团购订单号',
    },
    dataItem: {
      items: [{
        title: '下单交订金',
        date: '08-02 14:00',
        price: 66.66
      }]
    },
    query: {
      page: 1,
      page_size: 10
    },
  },

  //输入金额
  inputPrice(e) {
    let that = this;
    let value = e.detail.value;
    let { topupPrice } = that.data;
    if (!verification.isPrice(value) || value.indexOf('00') === 0 || value.indexOf('..') >= 0 || value.indexOf('.') === 0) {
      return topupPrice;
    }
    that.setData({
      topupPrice: value
    });
  },

  balanceLog() {
    let that = this;
    let { query, dataItem } = that.data;

    that.setData({ loading: true });
    let address = app.getSelectStore()

    wx.request({
      url: `${config.api.balanceLog}?store_id=${address.id || ''}`,
      header: {
        'content-type': 'application/json',
        'Vesta-Custom-Access-Token': app.globalData.loginUserInfo.access_token
      },
      data: query,
      success: function (res) {
        if (res.statusCode == 200 && res.data.code == 0) {
          let rd = res.data.data;
            that.setData({
              dataItem: rd
            });
        } else {
          app.requestResultCode(res); //处理异常
        }
      },
      complete: function (res) {
        //判断是否网络超时
        app.requestTimeout(res, () => {
          that.balanceLog();
        });

        that.setData({ loading: false });
      }
    });
  },
  //获取用户信息
  merchantBalance() {
    let that = this;
    that.setData({ loading: true });
    let address = app.getSelectStore()
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
      complete: function(res){
        //判断是否网络超时
        app.requestTimeout(res, () => {
          that.merchantBalance();
        });
        that.setData({ loading: false });
      }
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    //判断登录
    app.signIsLogin(() => {
      that.merchantBalance();
      that.balanceLog();
    });
  },

  //充值支付
  balanceTopup() {
    let that = this;
    let { topupPrice } = that.data;
    if(topupPrice <= 0) return false;
    that.setData({
      payData: {
        order_id: 0,
        price: util.handlePrice(topupPrice)
      },
      payCallBack: function (res) {
        that.setData({
          isShowPay: false
        });
        if (res === 'success') {
          wx.navigateTo({
            url: `/pages/payResult/payResult?id=0&source=balanceTopup`
          });
        }else{
          
        }
      },
      isShowPay: true
    });
  },
  //快速充值
  fastPay(e){
    let that = this;
    let {index} = e.target.dataset;
    that.setData({
      payData: {
        order_id: 0,
        price: util.handlePrice(index)
      },
      payCallBack: function (res) {
        that.setData({
          isShowPay: false
        });
        if (res === 'success') {
          wx.navigateTo({
            url: `/pages/payResult/payResult?id=0&source=balanceTopup`
          });
        }else{
          
        }
      },
      isShowPay: true
    });
  }
})