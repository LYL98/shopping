// pages/member/member.js
//获取应用实例
const app = getApp();
import { Config, Http } from './../../utils/index';

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
    Http.get(Config.api.logout, {}).then((res)=>{
      let loginUserId = wx.getStorageSync("loginUserId");
      let shoppingCartData = wx.getStorageSync('shoppingCartData');
      let searchData = wx.getStorageSync('searchData');
      app.updateLoginInfo({}); //系统登录信息
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
        url: '/pages/loginGuide/loginGuide',
      });
    });    
  },
  //获取用户信息
  profile() {
    let that = this;
    that.setData({ loading: true });
    Http.get(Config.api.profile, {}).then((res)=>{
      that.setData({
        myInfo: res.data,
        loading: false
      });
    }).catch(()=>{
      that.setData({ loading: false });
    });
  },
  //获取用户列表
  getMemberList() {
    let that = this;
    Http.get(Config.api.memberList, {}).then((res)=>{
      that.setData({
        otherList: res.data
      });
    });
  },
  //解除微信绑定
  signUnBindWechat(){
    let that = this;
    wx.showModal({
      title: '提示',
      content: '确定解除绑定？',
      confirmColor: "#00AE66",
      success(res) {
        if (res.confirm) {
          Http.get(Config.api.signUnBindWechat, {}).then((res)=>{
            wx.showToast({
              title: '已解除绑定',
              icon: 'none'
            });
            that.profile();
          });
        }
      }
    });
  }
})