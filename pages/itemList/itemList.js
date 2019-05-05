// pages/itemList/itemList.js
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
    rankSrc: './../../assets/img/rank.png',
    rankSSrc: './../../assets/img/rank_s.png',
    rankSl: './../../assets/img/rank_l.png',
    screenSrc: './../../assets/img/screen.png',
    categoryList: [],
    query: {
      store_id: 0,
      sort: '-other',
      display_class_code: '',
      page: 1,
      page_size: constant.PAGE_SIZE
    },
    urlJumpId:0,
    dataItem: {
      items: (()=>{
        //初始化骨架数据
        let items = [];
        for(let i = 0; i < 4; i++){
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
    initLoad: true,
    isShowUpDown: false,
    showSkeleton: true
  },
  onLoad() {
    this.setData({
      system:  app.globalData.system
    });
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;

    let value = app.globalData.urlJump < 10 ? '0'+app.globalData.urlJump : app.globalData.urlJump
    this.setData({
      urlJumpId: value || 0,
    })
    //判断登录
    app.signIsLogin(() => {
      let { query } = that.data;
      let address = app.getSelectStore(); //当前选择的地址
      query.store_id = address.id || '';
      if(query.page !== 1){
        query.page_size = query.page_size * query.page;
        query.page = 1;
        that.setData({
          query: query
        }, ()=>{
          that.itemListDisplayClass(true);//获取商品列表 (isInit是否进入页面)
        });
      }else{
        that.setData({
          query: query
        }, ()=>{
          that.itemListDisplayClass();
        });
      }
      that.displayClassQuery();//获取商品分类
    });
    if(this.data.urlJumpId) {
      this.selectCategory(this.data.urlJumpId)
    }
  },

  //选择商品分类
  selectCategory(e){
    let param; 
    if(typeof e == 'string') {
      param = e;
    }else{
      delete this.data.urlJumpId;
      delete app.globalData.urlJump;
    }
    let { query } = this.data;
    let value = param ? param : e.target.dataset.category;

    query.display_class_code = value;
    query.page = 1;
    this.setData({
      query: query
    }, ()=>{
      this.itemListDisplayClass();//获取商品列表
    });

    wx.pageScrollTo({
      scrollTop: 0,
      duration: 0
    });

  },

  //排序
  changeSort(e){
    let { query } = this.data;
    let value = e.currentTarget.dataset.sort;
    query.sort = value;
    query.page = 1;
    this.setData({
      query: query
    }, () => {
      this.itemListDisplayClass();//获取商品列表
    });

    wx.pageScrollTo({
      scrollTop: 0,
      duration: 0
    });

  },

  //获取商品分类
  displayClassQuery(){
    let that = this;
    wx.request({
      url: config.api.displayClassQuery,
      header: {
        'content-type': 'application/json',
        'Durian-Custom-Access-Token': app.globalData.loginUserInfo.access_token
      },
      success: function (res) {
        if (res.statusCode == 200 && res.data.code == 0) {
          let rd = res.data.data;
          that.setData({
            categoryList: rd
          });
        } else {
          app.requestResultCode(res); //处理异常
        }
      },
      complete: function(res){
        //判断是否网络超时
        app.requestTimeout(res, () => {
          that.displayClassQuery();
        });
      }
    });
  },

  //获取商品列表
  itemListDisplayClass(isInit) {
    let that = this;
    let { query, dataItem, initLoad } = that.data;

    that.setData({ isShowUpDown: false });
    wx.showNavigationBarLoading();

    wx.request({
      url: config.api.itemListDisplayClass,
      header: {
        'content-type': 'application/json',
        'Durian-Custom-Access-Token': app.globalData.loginUserInfo.access_token
      },
      data: query,
      success: function (res) {
        if (res.statusCode == 200 && res.data.code == 0) {
          let rd = res.data.data;
          if (query.page === 1){
            that.setData({
              dataItem: rd,
              isShowUpDown: true,
              showSkeleton: false
            });
          }else{
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

        //重新恢复数据
        if (isInit){
          if (query.page_size > constant.PAGE_SIZE) {
            query.page = Math.ceil(query.page_size / constant.PAGE_SIZE);//向上取整
            query.page_size = constant.PAGE_SIZE;
            that.setData({
              query: query
            });
          }
        }

      },
      complete: function(res){
        that.setData({ initLoad: false });
        wx.hideNavigationBarLoading();
        //判断是否网络超时
        app.requestTimeout(res, () => {
          that.itemListDisplayClass(isInit);
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
        // initLoad: true,
        query: query
      }, () => {
        that.itemListDisplayClass();
      });
    }
  }
})