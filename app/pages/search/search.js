// pages/search/search.js
//获取应用实例
const app = getApp();
import { Constant, Config, Http } from './../../utils/index';

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
    searchData: [],
    shoppingCartNum:0,
    isFirst:true
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
      that.getShoppingCartNum()
      let address = app.getSelectStore(); //当前选择的地址
      let { query } = that.data;
      query.store_id = address.id || '';
      console.log('that.data.isFirst',that.data.isFirst)
      if(!that.data.isFirst){
      that.getReabckQuery()
      }
      that.setData({
        query: query,
        searchData: wx.getStorageSync('searchData') || []
      });
    that.data.isFirst = false

    });
  },
  getReabckQuery(){
    let that = this;
    let queryParmas = JSON.parse(JSON.stringify(that.data.query));
    queryParmas.page = 1;
    queryParmas.page_size =  that.data.query.page * that.data.query.page_size
    that.setData({ loading: true }, ()=>{
      Http.get(Config.api.itemQuery, queryParmas).then(res => {
        let rd = res.data;
          that.setData({
            dataItem: rd,
            loading: false
          });
          /*===== 埋点 start ======*/
          app.gioActionRecordAdd('searchSuccess', { 
            searchWord_var: query.condition, //搜索词
            ifSearchResult_var: rd.num > 0 ? '是' : '否', //搜索词是否有结果
            searchSource_var: that.searchSource_var //搜索词来源
          });
          app.gioActionRecordAdd('searchWord_evar', query.condition);
          /*===== 埋点 end ======*/
      }).catch(error => {
        that.setData({ loading: false });
      });
    });
  },
  
  getShoppingCartNum(){
    const that = this
    let address = app.getSelectStore()
    Http.get(Config.api.itemCartTotalNum, {
      store_id: address.id || ''
    }).then((res) => {
      let rd = res.data;
      that.setData({
        shoppingCartNum:rd.total_num
      })
    }).catch(() => {
    });
  },
  joinShoppingCart() {
    let that = this;
    let num = app.getShoppingCartNum();//获取购物车数量
    that.setData({ shoppingCartNum: num });
  },
  notifyParent(e){
    console.log('e',e.detail)
    this.setData({
      shoppingCartNum:e.detail.cart_num
    })
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
    this.searchSource_var = '历史搜索词'; //埋点用
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
    this.searchSource_var = '手动搜索词'; //埋点用
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
      }
    });
  },
  //获取商品列表
  itemQuery() {
    let that = this;
    let { query, dataItem } = that.data;
    that.setData({ loading: true }, ()=>{
      Http.get(Config.api.itemQuery, query).then(res => {
        let rd = res.data;
        if (query.page === 1) {
          that.setData({
            dataItem: rd,
            loading: false
          });
          /*===== 埋点 start ======*/
          app.gioActionRecordAdd('searchSuccess', { 
            searchWord_var: query.condition, //搜索词
            ifSearchResult_var: rd.num > 0 ? '是' : '否', //搜索词是否有结果
            searchSource_var: that.searchSource_var //搜索词来源
          });
          app.gioActionRecordAdd('searchWord_evar', query.condition);
          /*===== 埋点 end ======*/
        } else {
          dataItem.items = dataItem.items.concat(rd.items);
          that.setData({
            dataItem: dataItem,
            loading: false
          });
        }
      }).catch(error => {
        that.setData({ loading: false });
      });
    });
  },

  //点击商品
  clickItem(e){
    let item = e.currentTarget.dataset.item;
    let { query } = this.data;
    /*===== 埋点 start ======*/
    app.gioActionRecordAdd('searchResultClick', { 
      searchWord_var: query.condition, //搜索词
      searchSource_var: this.searchSource_var, //搜索词来源
      productID_var: item.id, //商品ID
      productName: item.title, //商品ID
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