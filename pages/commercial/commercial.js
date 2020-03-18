// pages/commercial/commercial.js
//获取应用实例
const app = getApp();
import config from './../../utils/config';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: false,
    detail: {}
  },

  //获取商户详情
  merchantDetail(){
    let that = this;
    this.setData({ loading: true });
    wx.request({
      url: config.api.merchantDetail,
      header: {
        'content-type': 'application/json',
        'Vesta-Custom-Access-Token': app.globalData.loginUserInfo.access_token
      },
      success: function (res) {
        if (res.statusCode == 200 && res.data.code == 0) {
          let rd = res.data.data;
          that.setData({
            detail: rd
          });
        } else {
          app.requestResultCode(res); //处理异常
        }
      },
      complete: function (res) {
        that.setData({ loading: false });
        //判断是否网络超时
        app.requestTimeout(res, () => {
          that.merchantDetail();
        });
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
      that.merchantDetail();//获取商户详情
    });
  },

})