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
    detail: {
      topic_image_header: [],
      topic_image_detail: []
    },
    dataItem: {
      items: [],
      num: 0
    },
    loading: false,
    showSkeleton: true
  },

  //页面装载时
  onLoad() {
    // wx.setNavigationBarTitle({
    //   title: '运营专区'
    // });
    //判断登录
    app.signIsLogin((res) => {
      let { query } = this.data;
      let ad = app.getSelectStore(); //当前选择的地址
      if(ad && ad.id){
        let num = app.getShoppingCartNum();//获取购物车数量
        query.store_id = ad.id;
        query.item_tag_id = this.options.id;
        this.setData({ query: query, shoppingCartNum: num, }, () => {
          this.itemQuery();
          this.itemTagsDetail();
        });
      }
    });
  },

  joinShoppingCart() {
    let that = this;
    let num = app.getShoppingCartNum();//获取购物车数量
    that.setData({ shoppingCartNum: num });
  },

  itemTagsDetail(){
    let that = this;
    Http.get(Config.api.itemTagsDetail, {
      id: that.data.query.item_tag_id
    }).then(res => {
      that.setData({ detail: res.data });
    });
  },

  //获取商品列表
  itemQuery() {
    let that = this;
    let { query, dataItem } = that.data;
    wx.showNavigationBarLoading();
    that.setData({ loading: true }, () => {
      Http.get(Config.api.itemQuery, query).then(res => {
        wx.hideNavigationBarLoading();
        let rd = res.data;
        if (query.page === 1) {
          that.setData({
            dataItem: rd,
            loading: false,
            showSkeleton: false
          });
        } else {
          dataItem.items = dataItem.items.concat(rd.items);
          that.setData({
            dataItem: dataItem,
            loading: false,
            showSkeleton: false
          });
        }
      }).catch(error => {
        wx.hideNavigationBarLoading();
        that.setData({
          'query.page': that.data.query.page - 1,
          loading: false
        });
      });
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
   * 加载更多
   */
  loadMore() {
    let that = this;
    let { query, dataItem, loading } = that.data;
    if(loading) return;
    if (dataItem.num / query.page_size > query.page) {
      that.setData({
        'query.page': query.page + 1
      }, () => {
        that.itemQuery();
      });
    }
  },
})