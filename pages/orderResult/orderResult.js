// pages/orderResult/orderResult.js
//获取应用实例
const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    beenSoldSrc: './../../assets/img/been_sold.png',
    id: 0
  },

  //页面卸载时触发
  onUnload() {
    app.shoppingCartNum();//计算购物车数量并显示角标
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      id: options.id
    });
  },

  //返回首页
  returnHone(){
    wx.switchTab({
      url: '/pages/index/index'
    });
  }
})