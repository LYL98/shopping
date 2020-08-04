//获取应用实例
const app = getApp();
import { Config, Http, Constant } from './../../utils/index';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    detail: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.gradeDetail();
  },

  gradeDetail() {
    let that = this;
    wx.request({
      url: Config.api.gradeDetail,
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
    });
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

})