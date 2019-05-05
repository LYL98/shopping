// pages/myDetail/myDetail.js
const config = require('./../../utils/config');
const util = require('./../../utils/util');
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tencentPath: config.tencentPath,
    defaultSrc: './../../assets/img/default_avatar.png',
    detail: {
      avatar: '',
      merchant: {}
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let {detail} = options;
    detail = JSON.parse(decodeURIComponent(detail));
    this.setData({
      detail: Object.assign(this.data.detail, detail)
    })
  },

  clickPic() {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        let tempFilePaths = res.tempFilePaths;
        wx.navigateTo({
          url: `/pages/avatar/index?src=${tempFilePaths[0]}`
        })
      }
    });
  },
})