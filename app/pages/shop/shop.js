// pages/shop/shop.js
//获取应用实例
const app = getApp();
import config from './../../utils/config';
import { Http } from './../../utils/index';
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
    },
    location: {lat:'', lng:''},
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
      wx.setStorageSync('isOrderSelectAddress',true)
      wx.navigateBack();
    }else{
      if(!data.is_freeze) {
        wx.navigateTo({
          url: '/pages/shopDetail/shopDetail?id=' + data.id
        });
      }
    }
  },
  
  // 修改门店geo
  getLocationCB(e) {
    const {lat, lng, itemIndex} = e.detail
    let selectedStore = this.data.dataItem[itemIndex]
    console.log(lat, lng, itemIndex)
    console.log(selectedStore)
    this.data.location = {lat, lng}
    this.updateStoreInfo(selectedStore)
  },

  updateStoreInfo(selectedStore) {
    const {address, id, images, linkman, phone, title, geo={} } = selectedStore
    let newGeo = !!this.datal.location.lat ? {...geo, ...this.data.location} : geo
    Http.post(config.api.editStore, {
      address,
      id,
      images,
      linkman,
      phone,
      title,
      geo:newGeo, //更新geo
    }).then(res => {
      wx.showToast({
        title: '更新定位成功',
        icon: 'none'
      })
    })
  }
})