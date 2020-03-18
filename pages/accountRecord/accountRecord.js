// pages/accountRecord/accountRecord.js
//获取应用实例
const app = getApp();
import config from './../../utils/config';
import constant from './../../utils/constant';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    balanceChange: constant.BALANCE_CHANGE,
    query: {
      page: 1,
      page_size: constant.PAGE_SIZE
    },
    dataItem: {
      items: [{
        title: '下单交订金',
        date: '08-02 14:00',
        price: 66.66
      }]
    },
    loading: false,
    codeClass:{
      order_code: "订单号",
      topup_code: "充值单号",
      aftersale_code: "售后单号",
      gb_order_code: '团购订单号',
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let that = this;
    //判断登录
    app.signIsLogin(() => {
      that.balanceLog();
    });
  },

  //获取余额记录
  balanceLog() {
    let that = this;
    let { query, dataItem } = that.data;

    that.setData({ loading: true });

    wx.request({
      url: config.api.balanceLog,
      header: {
        'content-type': 'application/json',
        'Vesta-Custom-Access-Token': app.globalData.loginUserInfo.access_token
      },
      data: query,
      success: function (res) {
        if (res.statusCode == 200 && res.data.code == 0) {
          let rd = res.data.data;
          if (query.page === 1) {
            that.setData({
              dataItem: rd
            });
          } else {
            dataItem.items = dataItem.items.concat(rd.items);
            that.setData({
              dataItem: dataItem
            });
          }
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

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    let that = this;
    let { query, dataItem } = that.data;
    if (dataItem.num / query.page_size > query.page) {
      query.page = query.page + 1;
      that.setData({
        query: query
      }, () => {
        that.balanceLog();
      });
    }
  }

})