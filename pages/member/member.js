// pages/member/member.js
//获取应用实例
const app = getApp();
import config from './../../utils/config';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    rightSrc: './../../assets/img/right.png',
    loading: false,
    myInfo: {},
    otherList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    //判断登录
    app.signIsLogin(() => {
      that.profile();//获取用户信息
      that.getMemberList();
    });
  },
  //登出
  logout(){
    wx.request({
      url: config.api.logout,
      header: {
        'content-type': 'application/json',
        'Durian-Custom-Access-Token': app.globalData.loginUserInfo.access_token
      },
      success: function (res) {
        if (res.statusCode == 200 && res.data.code == 0) {
          let loginUserId = wx.getStorageSync("loginUserId");
          let shoppingCartData = wx.getStorageSync('shoppingCartData');
          let searchData = wx.getStorageSync('searchData');
          wx.clearStorageSync();
          if (loginUserId) {
            wx.setStorageSync('loginUserId', loginUserId);
          }
          if (shoppingCartData) {
            wx.setStorageSync('shoppingCartData', shoppingCartData);
          }
          if (searchData) {
            wx.setStorageSync('searchData', searchData);
          }
          wx.reLaunch({
            url: '/pages/login/login',
          });
        } else {
          app.requestResultCode(res); //处理异常
        }
      },
      complete: function(res){
        //判断是否网络超时
        app.requestTimeout(res, () => {
          that.logout();
        });
      }
    });
    
  },
  //获取用户信息
  profile() {
    let that = this;
    that.setData({ loading: true });
    wx.request({
      url: config.api.profile,
      header: {
        'content-type': 'application/json',
        'Durian-Custom-Access-Token': app.globalData.loginUserInfo.access_token
      },
      success: function (res) {
        if (res.statusCode == 200 && res.data.code == 0) {
          let rd = res.data.data;
          that.setData({
            myInfo: rd
          });
        } else {
          app.requestResultCode(res); //处理异常
        }
      },
      complete: function (res) {
        that.setData({ loading: false });
        //判断是否网络超时
        app.requestTimeout(res, () => {
          that.profile();
        });
      }
    });
  },
  //获取用户列表
  getMemberList() {
    let that = this;
    wx.request({
      url: config.api.memberList,
      header: {
        'content-type': 'application/json',
        'Durian-Custom-Access-Token': app.globalData.loginUserInfo.access_token
      },
      success: function (res) {
        if (res.statusCode == 200 && res.data.code == 0) {
          let rd = res.data.data;
          that.setData({
            otherList: rd
          });
        } else {
          app.requestResultCode(res); //处理异常
        }
      },
      complete: function (res) {
        that.setData({ loading: false });
        //判断是否网络超时
        app.requestTimeout(res, () => {
          that.getMemberList();
        });
      }
    });
  }
})