const app = getApp();
import { Constant } from './../../utils/index';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    colors: app.globalData.colors,
    myInfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let myInfo = app.globalData.loginUserInfo;
    this.setData({
      myInfo: myInfo
    }, ()=>{
      this.setNavigationBarTitle();
    });
  },
  //设置标题内容
  setNavigationBarTitle(){
    if(this.data.myInfo.phone){
      wx.setNavigationBarTitle({title: '绑定微信'});
    }else{
      wx.setNavigationBarTitle({title: '授权手机号'});
    }
  },
  //获取手机号成功后
  getPhoneNumberCallBack(resData){
    let rd = resData.detail;
    app.updateLoginInfo(rd); //系统登录信息
    if(rd.weapp_openid){
      this.loginSuccess(rd);
    }else{
      this.setData({
        myInfo: rd
      }, ()=>{
        this.setNavigationBarTitle();
      });
    }
  },
  //获取ouid成功后
  getLoginCallBack(resData){
    let rd = resData.detail;
    app.updateLoginInfo(rd); //系统登录信息
    this.loginSuccess(rd);
  },
  
  //登录成功后
  loginSuccess(rd){
    let id = wx.getStorageSync("loginUserId");
    if(rd.id != id) {
      wx.removeStorageSync("shoppingCartData");
      wx.removeStorageSync('searchData');
      wx.setStorageSync('loginUserId', rd.id);
    }
    
    /*===== 埋点 start ======*/
    app.actionRecordAdd({
      action: Constant.ACTION_RECORD.LOGIN
    });
    /*===== 埋点 end ======*/
    wx.reLaunch({
      url: '/pages/index/index',
    });
  }
})