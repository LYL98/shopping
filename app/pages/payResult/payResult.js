// pages/payResult/payResult.js
//获取应用实例
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    beenSoldSrc: './../../assets/img/been_sold.png',
    id: 0,
    source: 'orderAdd'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      id: options.id,
      source: options.source
    });
  },

  //返回首页
  returnHone() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  }
})