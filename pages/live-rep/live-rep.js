// pages/live-rep/live-rep.js
const app = getApp();
import { Http, Config } from './../../utils/index';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    roomid: '',
    media_url: '',
    items: [],
    index: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    app.signIsLogin(() => {
      const { roomid } = options;
      if (!roomid) return;

      this.setData({
        roomid: Number(roomid)
      }, () => {
        this.liveRep();
      });
    });

  },

  // 页面加载完成后
  onReady: function () {
    this.videoContext = wx.createVideoContext('video');
  },

  liveRep() {
    wx.showNavigationBarLoading();
    Http.get(Config.api.liveRepQuery, { roomid: this.data.roomid })
      .then(res => {
        let rd = res.data || {};
        wx.hideNavigationBarLoading();
        if (rd.num < 1) return;
        if (!Array.isArray(rd.items)) return;

        // let media = rd.items[0]; // 取该房间最近的一次回放记录。
        // if (typeof media !== 'object') return;

        // let media_url = media.media_url;
        this.setData({ items: rd.items, index: 0 });
        
        wx.setNavigationBarTitle({
          title: (media.room && media.room.name) || '直播回放'
        })

      })
      .catch(() => {
        wx.hideNavigationBarLoading();
      });
  },

  onEnded() {
    const { index, items } = this.data;
    if (index < items.length - 1) {
      this.setData({index: index + 1});
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})