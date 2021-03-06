// pages/password/password.js
//获取应用实例
const app = getApp();
import config from './../../utils/config';
import { Http } from './../../utils/index';
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
    if (that.data.loading) return;
    that.setData({ loading: true }, () => {
      Http.post(config.api.profilePasswordModify, {
        password_ori: md5(editData.password_ori),
        password: md5(editData.password)
      }).then(res => {
        wx.navigateBack();
        wx.showToast({
          title: '密码修改成功',
          icon: 'none'
        });
        that.setData({ loading: false });
      }).catch(err => {
        that.setData({ loading: false });
      });
    });

  }
})