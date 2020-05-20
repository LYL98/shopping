const app = getApp();
import { Constant } from './../../utils/index';

Page({
  //获取手机号后
  getPhoneNumberCallBack(resData){
    let rd = resData.detail;
    if(rd.weapp_openid){
      console.log(111);
      
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
    }else{
      app.globalData.loginUserInfo = rd; //系统登录信息（特殊情况，不能存Storage，只存globalData）
      wx.redirectTo({
        url: '/pages/loginBind/loginBind'
      });
    }
  },
})