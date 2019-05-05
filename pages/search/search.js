// pages/search/search.js
//获取应用实例
const app = getApp();
import config from './../../utils/config';
import constant from './../../utils/constant';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tencentPath: config.tencentPath,
    searchSrc: './../../assets/img/search_s.png',
    homeSrc: './../../assets/img/home.png',
    goods: './../../assets/img/item.png',
    cart: './../../assets/img/shop_cart.png',
    account: './../../assets/img/my.png',
    inputValue: '',
    query: {
      store_id: 0,
      condition: '',
      tag: '',
      sort: '-rank',
      page: 1,
      page_size: constant.PAGE_SIZE
    },
    isSearch: false,
    loading: false, // 查询商品的状态
    dataItem: {
      items: []
    },
    searchData: []
  },
  onLoad: function (options) {
    this.setData({
      ["query.tag"]: options.tag || '',
      searchData: wx.getStorageSync('searchData') || []
    });
    if (this.data.searchData.length > 0) {
      //todo
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //判断登录
    let that = this;
    app.signIsLogin(() => {
      let num = app.getShoppingCartNum();//获取购物车数量
      let address = app.getSelectStore(); //当前选择的地址
      let { query } = that.data;
      query.store_id = address.id || '';
      that.setData({
        shoppingCartNum: num,
        query: query,
        searchData: wx.getStorageSync('searchData') || []
      });
    });
  },

  //页面卸载时触发
  onUnload() {
    app.shoppingCartNum();//计算购物车数量并显示角标
  },
  joinShoppingCart() {
    let that = this;
    let num = app.getShoppingCartNum();//获取购物车数量
    that.setData({ shoppingCartNum: num });
  },
  clearHistory() {
    wx.removeStorageSync('searchData')
    this.setData({
      searchData: [],
    })
  },
  labelEvent(e) {
    let { query } = this.data;
    let { key } = e.target.dataset;
    query.condition = key;
    query.page = 1;

    this.setData({
      query: query,
      inputValue: key,
      isSearch: true
    }, () => {
      this.itemQuery();
    });

  },
  //输入搜索
  inputSearch(e) {
    let that = this;
    let { query } = that.data;
    let value = e.detail.value;
    value = value.trim();

    query.condition = value;
    query.page = 1;
    that.setData({
      query: query,
      inputValue: value,
      isSearch: value.length > 0 ? true : false
    }, () => {
      if (value) {
        that.itemQuery();
      } else {
        that.setData({
          dataItem: {
            items: []
          },
        });
      }
    });

  },
  //完成
  confirm(e) {
    let value = e.detail.value || this.data.inputValue;
    value = value.trim();
    let list = this.data.searchData;
    if (value && list.indexOf(value) == -1) {
      list.unshift(value)
    }
    if (list.length > 10) {
      list.length = 10
    }

    wx.setStorageSync('searchData', list)
  },
  //获取商品列表
  itemQuery() {
    let that = this;
    let { query, dataItem } = that.data;
    this.setData({ loading: true });
    wx.request({
      url: config.api.itemQuery,
      header: {
        'content-type': 'application/json',
        'Durian-Custom-Access-Token': app.globalData.loginUserInfo.access_token
      },
      data: query,
      success: function (res) {
        if (res.statusCode == 200 && res.data.code == 0) {
          let rd = res.data.data;
          if (query.page === 1) {
            that.setData({
              dataItem: rd
            });
          } else {
            dataItem.items = dataItem.items.concat(rd.items);
            that.setData({
              dataItem: dataItem
            });
          }
        } else {
          app.requestResultCode(res); //处理异常
        }
      },
      complete: function (res) {
        that.setData({ loading: false });
        //判断是否网络超时
        app.requestTimeout(res, () => {
          that.itemQuery();
        });
      }
    });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let that = this;
    let { query, dataItem } = that.data;
    if (dataItem.num / query.page_size > query.page) {
      query.page = query.page + 1;
      that.setData({
        query: query
      }, () => {
        that.itemQuery();
      });
    }
  }
})