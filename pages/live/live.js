// pages/live/live.js

import { Http } from './../../utils/index';

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  getLiveList: function() {
    Http.post('http://api.weixin.qq.com/wxa/business/getliveinfo?access_token=31_SOe88ZRSDYbliNl2_IyDVelXyWMAVY95B0wSG0NOEhTzPEgPVtXevaZXYZ2nk9MrbG1x_RwfSx-MRSC9bmO7vh9egNrnwFY_W1Yy7NjCrSgvMbtT6RmUjPcXapzmIH80DdfEv5DuuYjVIQH9EXXaABATMM', {
      start: 0,
      limit: 10
    }).then(res => {
      console.log('res: ', res);
    }).catch(err => {
      console.log('err: ', err);
    });
  },

  getLiveDetail: function() {
    Http.post('http://api.weixin.qq.com/wxa/business/getliveinfo?access_token=31_SOe88ZRSDYbliNl2_IyDVelXyWMAVY95B0wSG0NOEhTzPEgPVtXevaZXYZ2nk9MrbG1x_RwfSx-MRSC9bmO7vh9egNrnwFY_W1Yy7NjCrSgvMbtT6RmUjPcXapzmIH80DdfEv5DuuYjVIQH9EXXaABATMM', {
      "action": "get_replay", // 获取回放
      "room_id": 3, // 直播间id
      "start": 0, // 起始拉取视频，start=0表示从第1个视频片段开始拉取
      "limit": 10 // 每次拉取的个数上限，不要设置过大，建议100以内
    }).then(res => {
      console.log('res: ', res);
    }).catch(err => {
      console.log('err: ', err);
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})