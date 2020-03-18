// pages/loginBind/loginBind.js
//获取应用实例
const app = getApp();
const config = require('./../../utils/config');
import { Http } from './../../utils/index';
const verification = require('./../../utils/verification');
const md5 = require('./../../utils/md5');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: false,
    bindData: {
      weapp_openid: '',
      unionid: ''
    },
    weixinSrc: './../../assets/img/weixin.png',
    login_pass:'./../../assets/img/login_pass.png',
    login_tel:'./../../assets/img/login_tel.png',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: app.globalData.brand_name
    })
    this.data.bindData = {
      weapp_openid: options.weapp_openid,
      unionid: options.unionid
    };
  },

  //输入框事件
  inputChange(e) {
    let fieldkey = e.target.dataset.fieldkey;
    let bindData = this.data.bindData;
    let value = e.detail.value;
    bindData[fieldkey] = value;
    this.setData({
      bindData: bindData
    });
  },

  //登录
  submitLogin(){
    let that = this;
    let { bindData } = that.data;
    if(!bindData.phone){
      wx.showToast({
        title: '手机号不能为空',
        icon: 'none'
      });
      return false;
    }
    if (!verification.checkMobile(bindData.phone)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return false;
    }
    
    if (!bindData.password) {
      wx.showToast({
        title: '密码不能为空',
        icon: 'none'
      });
      return false;
    }

    that.bindPhone();
    
  },
  //绑定用户
  bindPhone(){
    let that = this;
    let { bindData } = that.data;

    if (that.data.loading) return;
    that.setData({ loading: true }, () => {
      Http.post(config.api.signWeappBind, {
        phone: bindData.phone,
        password: md5(bindData.password),
        weapp_openid: bindData.weapp_openid,
        unionid: bindData.unionid
      }).then(res => {
        wx.setStorageSync("loginUserInfo", res.data); //写登录信息
        wx.reLaunch({
          url: '/pages/index/index',
        });
        that.setData({ loading: false });
      }).catch(err => {
        that.setData({ loading: false });
      });

    });

  }
})