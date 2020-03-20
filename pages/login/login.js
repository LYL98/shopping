// pages/login/login.js
//获取应用实例
const app = getApp();
import { Http, Config, Verification, Constant } from './../../utils/index';
const md5 = require('./../../utils/md5');

let loginTime;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    weixinSrc: './../../assets/img/weixin.png',
    login_pass:'./../../assets/img/login_pass.png',
    login_tel:'./../../assets/img/login_tel.png',
    login_wx:'./../../assets/img/login_wx.png',
    loginData: {},
    loginRes: {}
  },
  //页面装载
  onLoad: function(){
    let { brand_name } = app.globalData;
    if(brand_name){
      wx.setNavigationBarTitle({
        title: brand_name
      });
    }else{
      app.getBrand((rd)=>{
        wx.setNavigationBarTitle({
          title: rd.brand_name
        });
      });
    }
  },
  // 页面显示时
  onShow() {
    let that = this;
    let fun = () =>{
      //调用登录接口
      wx.login({
        success: function (loginRes) {
          that.setData({
            loginRes: loginRes
          });
        },
        fail: function (res) {
          wx.showModal({
            title: "提示",
            content: res.errMsg,
            confirmText: "我知道了",
            confirmColor: "#00AE66",
            showCancel: false
          });
        }
      });
    }
    //如果停留在页面上，每隔4分页调一次微信登录取最新code
    loginTime = setInterval(()=>{
      fun();
    }, 240000);
    fun();
  },
  //页面离开时
  onUnload(){
    if(loginTime){
      clearInterval(loginTime);
    }
  },
  //输入框事件
  inputChange(e) {
    let fieldkey = e.target.dataset.fieldkey;
    let loginData = this.data.loginData;
    let value = e.detail.value;
    loginData[fieldkey] = value;
    this.setData({
      loginData: loginData
    });
  },
  /**
   * 获取用户信息
   */
  onGetUserInfo(res) {
    let { loginRes } = this.data;
    /*===== 埋点 start ======*/
    app.actionRecordAdd({
      action: Constant.ACTION_RECORD.LOGIN_AUTH
    });
    /*===== 埋点 end ======*/
    app.loginCallBack(loginRes, res.detail);//登录回调
  },
  //登录
  submitLogin() {
    let that = this;
    let { loginData } = that.data;
    if (!loginData.phone) {
      wx.showToast({
        title: '手机号不能为空',
        icon: 'none'
      });
      return false;
    }
    if (!Verification.checkMobile(loginData.phone)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return false;
    }

    if (!loginData.password) {
      wx.showToast({
        title: '密码不能为空',
        icon: 'none'
      });
      return false;
    }

    that.signLogin();

  },
  //登录
  signLogin() {
    let that = this;
    let { loginData } = that.data;
    if (that.data.loading) return;
    that.setData({ loading: true }, ()=>{
      Http.post(Config.api.signLogin, {
        login_name: loginData.phone,
        password: md5(loginData.password)
      }).then((res)=>{
        let id = wx.getStorageSync("loginUserId");
        if(res.data.id != id) {
          wx.removeStorageSync("shoppingCartData");
          wx.removeStorageSync('searchData');
        } 
        wx.setStorageSync("loginUserInfo", res.data); //写登录信息
        wx.setStorageSync('loginUserId', res.data.id);
        /*===== 埋点 start ======*/
        app.actionRecordAdd({
          action: Constant.ACTION_RECORD.LOGIN
        });
        /*===== 埋点 end ======*/
        that.setData({ loading: false });
        wx.reLaunch({
          url: '/pages/index/index',
        });
      }).catch(()=>{
        that.setData({ loading: false });
      });
    });
  },
})