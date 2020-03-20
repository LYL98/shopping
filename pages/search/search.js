// pages/search/search.js
//获取应用实例
const app = getApp();
import { Constant, Config } from './../../utils/index';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tencentPath: Config.tencentPath,
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
      page_size: Constant.PAGE_SIZE
    },
    loading: false, // 查询商品的状态
    dataItem: {
      items: [],
      num: 0
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
  //点击搜索历史
  labelEvent(e) {
    let { key } = e.target.dataset;
    this.setSearchData(key);
  },
  //完成
  confirm(e) {
    let value = e.detail.value;
    value = value.trim();
    let list = this.data.searchData;
    if (value && list.indexOf(value) == -1) {
      list.unshift(value)
    }
    if (list.length > 10) {
      list.length = 10
    }
    wx.setStorageSync('searchData', list);
    this.setSearchData(value);
  },
  //设置搜索数据
  setSearchData(condition){
    let { query } = this.data;
    query.condition = condition;
    query.page = 1;
    this.setData({
      query: query,
      inputValue: condition,
    }, () => {
      if(condition === ''){
        this.setData({
          dataItem: {
            items: [],
            num: 0
          }
        });
      }else{
        this.itemQuery();
        app.globalData.gio('track', 'searchSuccess', { 
          searchKeywords: condition, 
          searchEntrance: '分类-搜索', 
          storeID: query.store_id
        });
      }
    });
  },
  //获取商品列表
  itemQuery() {
    let that = this;
    let { query, dataItem } = that.data;
    this.setData({ loading: true });
    wx.request({
      url: Config.api.itemQuery,
      header: {
        'content-type': 'application/json',
        'Vesta-Custom-Access-Token': app.globalData.loginUserInfo.access_token
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
          /*===== 埋点 start ======*/
          app.actionRecordAdd({
            action: Constant.ACTION_RECORD.SEARCH,
            content: { store_id: query.store_id, condition: query.condition }
          });
          /*===== 埋点 end ======*/
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

  //点击商品
  clickItem(e){
    let id = e.currentTarget.dataset.id;
    /*===== 埋点 start ======*/
    app.actionRecordAdd({
      action: Constant.ACTION_RECORD.ITEM_DETAIL_SEARCH,
      content: { item_id: id, store_id: this.data.query.store_id }
    });
    /*===== 埋点 end ======*/
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