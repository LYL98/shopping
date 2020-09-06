// pages/complain/complain.js
import { Config } from './../../utils/index';
const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    serviceTel: '400 825 8522',
    qrCode: Config.tencentPath + '/common/service_weixin.png',
  },
  //拨打电话
  makePhoneCall(){
    wx.makePhoneCall({
      phoneNumber: '4008258522'
    });
  },
  onLoad: function() {
    
  },
  previewImg() {
    const { qrCode } = this.data
    wx.previewImage({
      urls: [qrCode],
    })
  }
})