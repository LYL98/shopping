// pages/myCsm/myCsm.js
//获取应用实例
const app = getApp();
import config from './../../utils/config';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tencentPath: config.tencentPath,
    defaultSrc: './../../assets/img/default_avatar.png',
    dataItem: [{
      avatar: '',
      citys: [{
        code: '',
        title: '县'
      }, {
        code: '010101',
        title: '县'
      }],
      phone: '1234567890123',
      realname: '客户经理',
      zone_title: ''
    }],
    showSkeleton: true
  },
  //拨打电话
  makePhoneCall(e) {
    let phone = e.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone
    });
  },
  onLoad(option) {
    let that = this;
    //判断登录
    app.signIsLogin(() => {
      that.getMyCsm();
    });
  },
  //获取我的客户经理
  getMyCsm(){
    let that = this;
    wx.showNavigationBarLoading();
    wx.request({
      url: config.api.myCsm,
      header: {
        'content-type': 'application/json',
        'Durian-Custom-Access-Token': app.globalData.loginUserInfo.access_token
      },
      success: function (res) {
        if (res.statusCode == 200 && res.data.code == 0) {
          let rd = res.data.data;
          that.setData({
            dataItem: rd
          });
        } else {
          app.requestResultCode(res); //处理异常
        }
      },
      complete: function (res) {
        that.setData({ showSkeleton: false });
        wx.hideNavigationBarLoading();
        //判断是否网络超时
        app.requestTimeout(res, () => {
          that.getMyCsm();
        });
      }
    });
  }
})