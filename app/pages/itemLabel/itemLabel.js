//获取应用实例
const app = getApp();
import { Constant, Config } from './../../utils/index';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tencentPath: Config.tencentPath,
    query: {
      store_id: 0,
      tag: '',
      sort: '',
      page: 1,
      page_size: Constant.PAGE_SIZE
    },
    tagsList: [{
      id: 'collect',
      title: '收藏商品'
    }, {
      id: 'lately_buy',
      title: '最近购买'
    }],
    dataItem: {
      items: [],
      num: 0
    },
    searchSrc: './../../assets/img/search_s.png',
    homeSrc: './../../assets/img/home.png',
    goods: './../../assets/img/item.png',
    cart: './../../assets/img/shop_cart.png',
    account: './../../assets/img/my.png',
    collectSSrc: './../../assets/img/collect_s.png',
    collectSrc: './../../assets/img/collect.png',
    address:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //判断登录
    app.signIsLogin(() => {
      let address = app.getSelectStore(); //当前选择的地址
      let { query } = this.data;
      query.province_code = address.province_code || '';
      query.store_id = address.id || '';
      query.sort = options.sort || '';
      query.tag = options.tag || '收藏商品';

      this.setData({
        query: query,
        system: app.globalData.system,
        address:address
      }, () => {
        // that.getTagsList(); //获取标签
        this.itemQuery();
      });
    });
  },
  onShow(){
    
  },
  //加入购物车
  joinShoppingCart() {
    let that = this;
  },
  //获取商品标签
  getTagsList(){
    let that = this;
    let { query } = that.data;
    wx.request({
      url: Config.api.itemTagsList,
      header: {
        'content-type': 'application/json',
        'Vesta-Custom-Access-Token': app.globalData.loginUserInfo.access_token
      },
      data: {
        province_code: query.province_code
      },
      success: function(res) {
        if (res.statusCode == 200 && res.data.code == 0) {
          let rd = res.data.data;
          let { tagsList } = that.data;
          that.setData({
            tagsList: rd.concat(tagsList)
          });
        } else {
          app.requestResultCode(res); //处理异常
        }
      },
      complete: function(res) {
        //判断是否网络超时
        app.requestTimeout(res, () => {
          that.getTagsList();
        });
      }
    });
  },
  //选择左边分类
  selectTags(e) {
    let { query } = this.data;
    let tag = e.target.dataset.tag;
    query.tag = tag.title;
    query.page = 1;
    this.setData({
      query: query
    }, () => {
      this.itemQuery();//获取商品列表
    });

    wx.pageScrollTo({
      scrollTop: 0,
      duration: 0
    });
  },

  //点击商品
  clickItem(e){
  },

  //获取商品列表
  itemQuery() {
    let that = this;
    let { query } = that.data;

    wx.setNavigationBarTitle({
      title: query.tag
    });

    wx.showNavigationBarLoading();

    if (query.tag == '最近购买') {
      this.itemRecoentlyBuy();
    } else if (query.tag == '收藏商品') {
      this.collectQuery();
    } else {
      this.otherQuery();
    }
  },
  //获取收藏商品
  collectQuery() {
    let that = this;
    let {
      query,
      dataItem
    } = that.data;
    query.store_id = this.data.address.id
    wx.request({
      url: Config.api.itemCollectionQuery,
      header: {
        'content-type': 'application/json',
        'Vesta-Custom-Access-Token': app.globalData.loginUserInfo.access_token
      },
      data: query,
      success: function(res) {
        if (res.statusCode == 200 && res.data.code == 0) {
          let rd = res.data.data;
          if (query.page === 1) {
            that.setData({
              dataItem: rd,
              showSkeleton: false
            });
          } else {
            dataItem.items = dataItem.items.concat(rd.items);
            that.setData({
              dataItem: dataItem,
              showSkeleton: false
            });
          }
        } else {
          app.requestResultCode(res); //处理异常
        }
      },
      complete: function(res) {
        wx.hideNavigationBarLoading();
        //判断是否网络超时
        app.requestTimeout(res, () => {
          that.collectQuery();
        });
      }
    });
  },
  //最近购买商品列表
  itemRecoentlyBuy() {
    let that = this;
    wx.request({
      url: Config.api.itemRecoentlyBuy,
      header: {
        'content-type': 'application/json',
        'Vesta-Custom-Access-Token': app.globalData.loginUserInfo.access_token
      },
      success: function(res) {
        if (res.statusCode == 200 && res.data.code == 0) {
          let rd = res.data.data;
          that.setData({
            ["dataItem.items"]: rd,
            showSkeleton: false
          });
        } else {
          app.requestResultCode(res); //处理异常
        }
      },
      complete: function(res) {
        wx.hideNavigationBarLoading();
        //判断是否网络超时
        app.requestTimeout(res, () => {
          that.itemRecoentlyBuy();
        });
      }
    });
  },
  //获取商品列表
  otherQuery() {
    let that = this;
    let { query, dataItem } = that.data;

    wx.request({
      url: Config.api.itemQuery,
      header: {
        'content-type': 'application/json',
        'Vesta-Custom-Access-Token': app.globalData.loginUserInfo.access_token
      },
      data: query,
      success: function(res) {
        if (res.statusCode == 200 && res.data.code == 0) {
          let rd = res.data.data;
          if (query.page === 1) {
            that.setData({
              dataItem: rd,
              showSkeleton: false
            });
          } else {
            dataItem.items = dataItem.items.concat(rd.items);
            that.setData({
              dataItem: dataItem,
              showSkeleton: false
            });
          }
        } else {
          app.requestResultCode(res); //处理异常
        }
      },
      complete: function(res) {
        wx.hideNavigationBarLoading();
        //判断是否网络超时
        app.requestTimeout(res, () => {
          that.otherQuery();
        });
      }
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
  }
})