// pages/complain/complain.js
const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    dataItem: {
      frames: []
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let p = app.getPage('pages/orderAdd/orderAdd');
    console.log(p);
    if(p){
      this.setData({
        dataItem: p.data.dataItem
      });
    }
  },
})