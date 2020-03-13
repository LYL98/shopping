//index.js
//获取应用实例
const app = getApp();
import { Constant, Config } from './../../utils/index';

Page({
  data: {
    tencentPath: Config.tencentPath,
    rightSrc: './../../assets/img/right.png',
    bannerList: [],
    tagsImg: [
      './../../assets/img/tags_icon1.png',
      './../../assets/img/tags_icon2.png',
      './../../assets/img/tags_icon3.png',
      './../../assets/img/tags_icon4.png',
      './../../assets/img/tags_icon5.png',
      './../../assets/img/tags_icon6.png',
      './../../assets/img/tags_icon7.png',
      './../../assets/img/tags_icon8.png'
    ],
    tagsList: (()=>{
      //初始化骨架数据
      let items = [];
      for(let i = 0; i < 6; i++){
        let d = {
          id: i + 1,
          image: '',
          title: '今日主推'
        };
        items.push(d);
      }
      return items;
    })(),
    tagsList2: [{
      id: 'collect',
      title: '收藏商品'
    }, {
      id: 'lately_buy',
      title: '最近购买'
    }],
    query: {
      store_id: 0,
      tag: '今日主推',
      sort: '-tags_edited',
      page: 1,
      page_size: Constant.PAGE_SIZE
    },
    dataItem: {
      items: []
    },
    //瀑布流数据(骨架屏数据)
    dataMap:[[{
      frame_id: '00',
      gross_weight: 0,
      id: 1,
      images: [],
      item_spec: "10g",
      item_stock: 0,
      order_num_max: 0,
      origin_place: "......",
      package_spec: "纸箱",
      price_sale: 2000,
      title: "xxxxxxxxxx"
    }],[{
      frame_id: '00',
      gross_weight: 0,
      id: 2,
      images: [],
      item_spec: "10g",
      item_stock: 0,
      order_num_max: 0,
      origin_place: "......",
      package_spec: "纸箱",
      price_sale: 2000,
      title: "xxxxxxxxxx"
    }]],
    currentSwiper: 0,
    initLoad: true,
    closeStore: true,
    showSkeleton: true,
    userInfo: {}, //当前登录用户
    address: {},
    isShowSelectStore: false
  },
  swiperChange: function(e) {
    this.setData({
      currentSwiper: e.detail.current
    })
  },
  //页面装载时
  onLoad() {
    let that = this;
    let { brand_name, system } = app.globalData;
    if(brand_name){
      wx.setNavigationBarTitle({
        title: brand_name
      });
    }else{
      app.getBrand((rd)=>{
        wx.setNavigationBarTitle({
          title: rd.brand_name
        });
      });
    }
    app.shoppingCartNum();
    that.setData({
      system: system
    })
    
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let that = this;

    //判断登录
    app.signIsLogin((res) => {
      //保存登录用户信息
      that.setData({
        userInfo: res
      });
      let { query, address } = that.data;
      if(address && address.id){
        let ad = app.getSelectStore(); //当前选择的地址
        query.store_id = ad.id;
        if (query.page !== 1) {
          query.page_size = query.page_size * query.page;
          query.page = 1;
          that.setData({
            query: query,
            address: ad
          }, () => {
            that.getTagsList();
            that.itemQuery(true); //获取商品列表 (isInit是否进入页面)
            that.getWorkTime();
            that.getBanner(); //显示ad
          });
        } else {
          that.setData({
            query: query,
            address: ad
          }, () => {
            that.getTagsList();
            that.itemQuery();
            that.getWorkTime();
            that.getBanner(); //显示ad
          });
        }
      }
    });
  },
  //页面隐藏
  onHide(){
    /*===== 埋点 start ======*/
    app.actionRecordAdd({
      action: Constant.ACTION_RECORD.HIDE_HOME,
      content: { store_id: this.data.address.id }
    });
    /*===== 埋点 end ======*/
  },
  //点击搜索
  clickSearch(){
    app.globalData.gio('track', 'searchClick', { 
      searchEntrance: '分类-搜索', 
      storeID: this.data.query.store_id
    });
  },
  //显示选择收货地址
  storeShowHide(e){
    this.setData({
      isShowSelectStore: e.detail
    });
  },
  //选择门店后回调
  selectStoreCallBack(res){
    let that = this;
    let rd = res.detail;
    if(rd && rd.id){
      let { query } = that.data;
      query.page = 1;
      query.page_size = Constant.PAGE_SIZE;
      query.store_id = rd.id;
      that.setData({
        query: query,
        address: rd
      }, ()=>{
        that.getTagsList();
        that.itemQuery();
        that.getBanner(); //显示ad
        that.getWorkTime();
      });
      /*===== 埋点 start ======*/
      app.actionRecordAdd({
        action: Constant.ACTION_RECORD.SHOW_HOME,
        content: { store_id: rd.id }
      });
      /*===== 埋点 end ======*/
    }
  },
  //是否可下单
  getWorkTime() {
    let that = this;
    let { address } = that.data;
    wx.request({
      url: Config.api.isOrderTime,
      header: {
        'content-type': 'application/json',
        'Durian-Custom-Access-Token': app.globalData.loginUserInfo.access_token
      },
      data: {
        province_code: address.province_code
      },
      success: function(res) {
        if (res.statusCode == 200 && res.data.code == 0) {
          let rd = res.data.data;
          that.setData({
            closeStore: rd.is_time_order,
            order_end_time: rd.order_end_time,
            order_start_time: rd.order_start_time
          })
          let iscwp = wx.getStorageSync('is_click_wait_pay')
          if (rd.is_debited && !iscwp) {
            wx.showModal({
              title: '提示',
              content: '您有订单未付款，请先完成付款，否则无法购买商品！',
              confirmColor: '#00AE66',
              success: function(res) {
                if (res.confirm) {
                  wx.navigateTo({
                    url: '/pages/order/order?type=wait_complete'
                  });
                }
              },
              complete(e) {
                wx.setStorageSync('is_click_wait_pay', true)
              }
            })
          }

        } else {
          app.requestResultCode(res); //处理异常
        }
      },
      complete: function(res) {
        //判断是否网络超时
        app.requestTimeout(res, () => {
          that.getWorkTime();
        });
      }
    });
  },
  //获取banner
  getBanner() {
    let that = this;
    let { address } = that.data;
    wx.request({
      url: Config.api.banner,
      header: {
        'content-type': 'application/json',
        'Durian-Custom-Access-Token': app.globalData.loginUserInfo.access_token
      },
      data: {
        province_code: address.province_code
      },
      success: function(res) {
        if (res.statusCode == 200 && res.data.code == 0) {
          let rd = res.data.data;
          that.setData({
            bannerList: rd
          });
        } else {
          app.requestResultCode(res); //处理异常
        }
      },
      complete: function(res) {
        //判断是否网络超时
        app.requestTimeout(res, () => {
          that.getBanner();
        });
      }
    });
  },
  //获取商品标签
  getTagsList(){
    let that = this;
    let { address } = that.data;
    wx.request({
      url: Config.api.itemTagsList,
      header: {
        'content-type': 'application/json',
        'Durian-Custom-Access-Token': app.globalData.loginUserInfo.access_token
      },
      data: {
        province_code: address.province_code
      },
      success: function(res) {
        if (res.statusCode == 200 && res.data.code == 0) {
          let rd = res.data.data;
          let { tencentPath } = that.data;
          if(rd.length > 6) rd.length = 6; //限制最长6个
          let rdTemp = [];
          rd.forEach(item => {
            if(item.image){
              rdTemp.push({
                ...item,
                image: tencentPath + item.image
              });
            }else{
              rdTemp.push(item);
            }
          });
          that.setData({
            tagsList: rdTemp
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
  //获取商品列表
  itemQuery(isInit) {
    let that = this;
    let {
      query,
      dataItem,
      initLoad,
      dataMap
    } = that.data;
    //判断是否第一次加载，或没数据；如果是：显示loading   否则静默更新数据
    if (initLoad || !dataItem.num) {
      wx.showNavigationBarLoading();
    }
    wx.request({
      url: Config.api.itemQuery,
      header: {
        'content-type': 'application/json',
        'Durian-Custom-Access-Token': app.globalData.loginUserInfo.access_token
      },
      data: query,
      success: function(res) {
        if (res.statusCode == 200 && res.data.code == 0) {
          let rd = res.data.data;
          if (query.page === 1) {
            dataMap = [[], []];
            for(let i = 0; i < rd.items.length; i++){
              if(i % 2 === 0){
                dataMap[0].push(rd.items[i]);
              }else{
                dataMap[1].push(rd.items[i]);
              }
            }
            that.setData({
              dataItem: rd,
              dataMap: dataMap,
            });
          } else {
            dataItem.items = dataItem.items.concat(rd.items);
            for (let i = 0; i < rd.items.length; i++) {
              if (i % 2 === 0) {
                dataMap[0] = dataMap[0].concat(rd.items[i]);
              } else {
                dataMap[1] = dataMap[1].concat(rd.items[i]);
              }
            }
            that.setData({
              dataItem: dataItem,
              dataMap: dataMap
            });
          }
        } else {
          app.requestResultCode(res); //处理异常
        }

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

      },
      complete: function(res) {
        that.setData({
          initLoad: false,
          showSkeleton: false
        });
        wx.hideNavigationBarLoading();
        //判断是否网络超时
        app.requestTimeout(res, () => {
          that.itemQuery(isInit);
        });
      }
    });
  },
  //点击banner
  urlJump(e){
    let item = e.target.dataset.item;
    /*===== 埋点 start ======*/
    app.actionRecordAdd({
      action: Constant.ACTION_RECORD.BANNER,
      content: { banner_id: item.id, store_id: this.data.query.store_id }
    });
    /*===== 埋点 end ======*/
    
    let url = e.target.dataset.url;
    if(url !== 'none'){
      let isPage = url.indexOf("/pages") == 0;
      let tab = url.match(/\/\/|(\w+)/g)

      if(isPage) {
        wx.navigateTo({
          url: url
        })
      }else if(tab[0] == 'app'){
        app.globalData.urlJump = tab[3];
        wx.switchTab({
          url: `/pages/itemList/itemList`
        })
      }
    }
  },
  //点击tags
  clickTags(e){
    let tag = e.currentTarget.dataset.tag;
    /*===== 埋点 start ======*/
    app.actionRecordAdd({
      action: Constant.ACTION_RECORD.HOME_TAG,
      content: { tag_id: tag.id, tag_title: tag.title, store_id: this.data.query.store_id }
    });
    /*===== 埋点 end ======*/
  },
  //点击商品
  clickItem(e){
    let id = e.currentTarget.dataset.id;
    /*===== 埋点 start ======*/
    app.actionRecordAdd({
      action: Constant.ACTION_RECORD.ITEM_DETAIL_HOME,
      content: { item_id: id, store_id: this.data.query.store_id }
    });
    /*===== 埋点 end ======*/
  },
  //点击页面底下的tab
  onTabItemTap(e){
    /*===== 埋点 start ======*/
    app.actionRecordAdd({
      action: Constant.ACTION_RECORD.TAB_HOME,
      content: { store_id: this.data.query.store_id }
    });
    /*===== 埋点 end ======*/
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
        // initLoad: true,
        query: query
      }, () => {
        that.itemQuery();
      });
    }
  }
})