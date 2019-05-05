// pages/complain/complain.js
import config from './../../utils/config';
const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    serviceTel: config.serviceTel,
    qrCode: './../../assets/img/service_weixin.png',
  },
  //拨打电话
  makePhoneCall(){
    wx.makePhoneCall({
      phoneNumber: this.data.serviceTel
    });
  },
  onLoad: function() {
    let that = this;
    wx.request({
      url: config.api.sysService,
      header: {
        'content-type': 'application/json',
        'Durian-Custom-Access-Token': app.globalData.loginUserInfo.access_token
      },
      success: function(res) {
        if (res.statusCode == 200 && res.data.code == 0) {
          let rd = res.data.data;
          that.setData({
            serviceTel: rd.complaint_hotline,
            qrCode: config.tencentPath + rd.qr_code
          })
        }
      }
    })
  }
})