const app = getApp();
import { Constant } from './../../utils/index';

Page({
  //获取手机号后
  getPhoneNumberCallBack(resData){
    let rd = resData.detail;
    if(rd.weapp_openid){
      app.updateLoginInfo(rd); //系统登录信息
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
    }else{
      wx.redirectTo({
        url: '/pages/loginBind/loginBind'
      });
    }
  },
})