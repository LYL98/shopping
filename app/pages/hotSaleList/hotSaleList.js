import { Constant, Config, Http } from './../../utils/index';
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tencentPath: Config.tencentPath,
    goods: []
  },

  onShow: function (options) {
    this.getHotSaleList()
  },

  clickItem(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/itemDetail/itemDetail?id=${id}`,
    })
  },

  getHotSaleList() {
    let store = app.getSelectStore()
    wx.showNavigationBarLoading();
    Http.get(Config.api.hotSaleItems, {
      store_id: store.id
    }).then(res => {
      wx.hideNavigationBarLoading();
      this.setData({
        goods: res.data || []
      })
    }).catch(error => {
      wx.hideNavigationBarLoading();
    })
  },


  onReady: function () {

  },


})