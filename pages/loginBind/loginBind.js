const app = getApp();
import { Constant } from '../../utils/index';

Page({
  //获取用户信息后
  getUserInfoCallBack(resData){
    let rd = resData.detail;
    app.updateLoginInfo(rd); //系统登录信息
    let id = wx.getStorageSync("loginUserId");
    if(rd.id != id) {
      wx.removeStorageSync("shoppingCartData");
      wx.removeStorageSync('searchData');
      wx.setStorageSync('loginUserId', rd.id);
    }
    
    /*===== 埋点 start ======*/
    /*===== 埋点 end ======*/
    wx.reLaunch({
      url: '/pages/index/index',
    });
  },
})