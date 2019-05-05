// pages/itemLabel/itemLabel.js
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
    query: {
      store_id: 0,
      tag: '',
      sort: '',
      page: 1,
      page_size: constant.PAGE_SIZE
    },
    tagsList: [{
      title: '收藏商品'
    }, {
      title: '最近购买'
    }],
    dataItem: {
      items: (() => {
        //初始化骨架数据
        let items = [];
        for (let i = 0; i < 4; i++) {
          let d = {
            code: "123456",
            frame_code: "20",
            gross_weight: 123,
            id: i + 1,
            images: [],
            is_quoted: false,
            item_spec: "123",
            item_stock: 123,
            origin_place: "123",
            package_spec: "123",
            price_sale: 123,
            price_sale_piece: 123,
            sale_unit: "件",
            title: "xxxxxxxx",
          };
          items.push(d);
        }
        return items;
      })()
    },
    searchSrc: './../../assets/img/search_s.png',
    homeSrc: './../../assets/img/home.png',
    goods: './../../assets/img/item.png',
    cart: './../../assets/img/shop_cart.png',
    account: './../../assets/img/my.png',
    collectSSrc: './../../assets/img/collect_s.png',
    collectSrc: './../../assets/img/collect.png',
    isShowUpDown: true,
    showSkeleton: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
    //判断登录
    app.signIsLogin(() => {
      let address = app.getSelectStore(); //当前选择的地址
      let { query } = that.data;
      query.store_id = address.id || '';
      query.sort = options.sort || '';
      query.tag = options.tag || '';

      let num = app.getShoppingCartNum(); //获取购物车数量
      that.setData({
        query: query,
        shoppingCartNum: num,
        system: app.globalData.system,
        isShowUpDown: false
      }, () => {
        that.itemQuery();
      });
      that.getTagsList(); //获取标签
    });
  },
  //页面卸载时触发
  onUnload() {
    app.shoppingCartNum(); //计算购物车数量并显示角标
  },
  //加入购物车
  joinShoppingCart() {
    let that = this;
    let num = app.getShoppingCartNum(); //获取购物车数量
    that.setData({
      shoppingCartNum: num
    });
  },
  //获取商品标签
  getTagsList(){
    let that = this;
    wx.request({
      url: config.api.itemTagsList,
      header: {
        'content-type': 'application/json',
        'Durian-Custom-Access-Token': app.globalData.loginUserInfo.access_token
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
    let value = e.target.dataset.tag;
    query.tag = value;
    query.page = 1;
    this.setData({
      query: query,
      isShowUpDown: false
    }, () => {
      this.itemQuery();//获取商品列表
    });

    wx.pageScrollTo({
      scrollTop: 0,
      duration: 0
    });

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

    wx.request({
      url: config.api.itemCollectionQuery,
      header: {
        'content-type': 'application/json',
        'Durian-Custom-Access-Token': app.globalData.loginUserInfo.access_token
      },
      data: query,
      success: function(res) {
        if (res.statusCode == 200 && res.data.code == 0) {
          let rd = res.data.data;
          if (query.page === 1) {
            that.setData({
              dataItem: rd,
              isShowUpDown: true,
              showSkeleton: false
            });
          } else {
            dataItem.items = dataItem.items.concat(rd.items);
            that.setData({
              dataItem: dataItem,
              isShowUpDown: true,
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
      url: config.api.itemRecoentlyBuy,
      header: {
        'content-type': 'application/json',
        'Durian-Custom-Access-Token': app.globalData.loginUserInfo.access_token
      },
      success: function(res) {
        if (res.statusCode == 200 && res.data.code == 0) {
          let rd = res.data.data;
          that.setData({
            ["dataItem.items"]: rd,
            isShowUpDown: true,
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
      url: config.api.itemQuery,
      header: {
        'content-type': 'application/json',
        'Durian-Custom-Access-Token': app.globalData.loginUserInfo.access_token
      },
      data: query,
      success: function(res) {
        if (res.statusCode == 200 && res.data.code == 0) {
          let rd = res.data.data;
          if (query.page === 1) {
            that.setData({
              dataItem: rd,
              isShowUpDown: true,
              showSkeleton: false
            });
          } else {
            dataItem.items = dataItem.items.concat(rd.items);
            that.setData({
              dataItem: dataItem,
              isShowUpDown: true,
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
        query: query,
        isShowUpDown: false
      }, () => {
        that.itemQuery();
      });
    }
  }
})