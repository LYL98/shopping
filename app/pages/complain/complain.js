// pages/complain/complain.js
import config from './../../utils/config';
const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    serviceTel: '400 825 8522',
    qrCode: '/assets/img/service_weixin.png',
  },
  //拨打电话
  makePhoneCall(){
    wx.makePhoneCall({
      phoneNumber: '4008258522'
    });
  },
  onLoad: function() {
  }
})