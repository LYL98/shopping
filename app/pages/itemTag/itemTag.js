// pages/index1/index1.js

const app = getApp();
import { Http, Constant, Config } from './../../utils/index';
Page({

  data: {
    tencentPath: Config.tencentPath,
    query: {
      store_id: '',
      sort: '-tags_edited',
      page: 1,
      page_size: Constant.PAGE_SIZE,
      item_tag_id: '', //运营专区中今日主推ID

    },
    dataItem: {
      items: [],
      num: 0
    },
    initLoad: true,
    showSkeleton: true
  },

  //页面装载时
  onLoad() {
    // wx.setNavigationBarTitle({
    //   title: '运营专区'
    // });
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    //判断登录
    app.signIsLogin((res) => {
      let { query } = this.data;
      let ad = app.getSelectStore(); //当前选择的地址
      if(ad && ad.id){
        query.store_id = ad.id;
        query.item_tag_id = this.options.id || '';
        if (query.page !== 1) {
          query.page_size = query.page_size * query.page;
          query.page = 1;
          this.setData({ query: query }, () => {
            this.itemQuery(true); //获取商品列表 (isInit是否进入页面)
          });
        } else {
          this.setData({ query: query }, () => {
            this.itemQuery();
          });
        }
      }
    });
   
  },

  //获取商品列表
  itemQuery(isInit) {
    let that = this;
    let { query, dataItem, initLoad } = that.data;
    //判断是否第一次加载，或没数据；如果是：显示loading   否则静默更新数据
    if (initLoad || !dataItem.num) {
      wx.showNavigationBarLoading();
    }
    let fun = ()=> {
      //重新恢复数据
      if (isInit) {
        if (query.page_size > Constant.PAGE_SIZE) {
          query.page = Math.ceil(query.page_size / Constant.PAGE_SIZE); //向上取整
          query.page_size = Constant.PAGE_SIZE;
          that.setData({
            query: query
          });
        }
      }
      that.setData({
        initLoad: false,
        showSkeleton: false
      });
      wx.hideNavigationBarLoading();
    }
    Http.get(Config.api.itemQuery, query).then(res => {
      let rd = res.data;
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
      fun();
    }).catch(error => {
      fun();
    });
  },
  
  //点击商品
  clickItem(e){
    let item = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: `/pages/itemDetail/itemDetail?id=${item.id}`,
    });
  },
  
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    let that = this;
    let {
      query,
      dataItem
    } = that.data;
    if (dataItem.num / query.page_size > query.page) {
      query.page = query.page + 1;
      that.setData({
        query: query
      }, () => {
        that.itemQuery();
      });
    }
  },
})