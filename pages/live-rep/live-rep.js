// pages/live-rep/live-rep.js
const app = getApp();
import { Http, Config } from './../../utils/index';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    roomid: '',
    media_url: ''
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

        let media = rd.items[0]; // 取该房间最近的一次回放记录。
        if (typeof media !== 'object') return;

        let media_url = media.media_url;
        this.setData({ media_url: media_url });
        
        wx.setNavigationBarTitle({
          title: (media.room && media.room.name) || '直播回放'
        })

      })
      .catch(() => {
        wx.hideNavigationBarLoading();
      });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})