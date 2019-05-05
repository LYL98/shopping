// pages/password/password.js
//获取应用实例
const app = getApp();
import config from './../../utils/config';
import md5 from './../../utils/md5';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    editData: {},
    loading: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //判断登录
    app.signIsLogin();
  },

  //输入框事件
  inputChange(e) {
    let fieldkey = e.target.dataset.fieldkey;
    let editData = this.data.editData;
    let value = e.detail.value;
    editData[fieldkey] = value;
    this.setData({
      editData: editData
    });
  },

  //确定
  submit(){
    let that = this;
    let { editData } = that.data;
    if (!editData.password_ori) {
      wx.showToast({
        title: '请输入原密码',
        icon: 'none'
      });
      return false;
    }
    if (!editData.password) {
      wx.showToast({
        title: '请输入新的密码',
        icon: 'none'
      });
      return false;
    }
    if (editData.affirm_password !== editData.password) {
      wx.showToast({
        title: '两次输入的密码不匹配',
        icon: 'none'
      });
      return false;
    }
    that.setData({ loading: true });
    wx.request({
      url: config.api.profilePasswordModify,
      header: {
        'content-type': 'application/json',
        'Durian-Custom-Access-Token': app.globalData.loginUserInfo.access_token
      },
      method: 'POST',
      data: {
        password_ori: md5(editData.password_ori),
        password: md5(editData.password)
      },
      success: function (res) {
        if (res.statusCode == 200 && res.data.code == 0) {
          wx.navigateBack();
          wx.showToast({
            title: '密码修改成功',
            icon: 'none'
          });
        } else {
          app.requestResultCode(res); //处理异常
        }
      },
      complete: function (res) {
        that.setData({ loading: false });
        //判断是否网络超时
        app.requestTimeout(res, () => {
          that.submit();
        });
      }
    });
  }
})