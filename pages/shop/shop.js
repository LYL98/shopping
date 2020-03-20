// pages/shop/shop.js
//获取应用实例
const app = getApp();
import config from './../../utils/config';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataItem: [],
    loading: false,
    optionType: '',
    query: {
      is_freeze:0
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      optionType: options.option_type || '',
      from : options.name || ''
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    //判断登录
    app.signIsLogin(() => {
      that.merchantStoreList();
    });
  },

  //商户门店列表
  merchantStoreList(){
    let that = this;
    let { query,from } = that.data;
    that.setData({ loading: true });
    wx.request({
      url: config.api.merchantStoreList,
      header: {
        'content-type': 'application/json',
        'Vesta-Custom-Access-Token': app.globalData.loginUserInfo.access_token
      },
      data: from ? "" : query,
      success: function (res) {
        if (res.statusCode == 200 && res.data.code === 0) {
          let rd = res.data.data;
          that.setData({
            dataItem: rd
          });
        } else {
          app.requestResultCode(res); //处理异常
        }
      },
      complete: function (res) {
        that.setData({ loading: false });
        //判断是否网络超时
        app.requestTimeout(res, () => {
          that.merchantStoreList();
        });
      }
    });
  },

  //跳转页面
  skipPage(e){
    let data = e.currentTarget.dataset.item;
    if (this.data.optionType === 'select'){
      wx.setStorageSync('addOrderSelectAddress', data);
      wx.navigateBack();
    }else{
      if(!data.is_freeze) {
        wx.navigateTo({
          url: '/pages/shopDetail/shopDetail?id=' + data.id
        });
      }
    }
  }
})