//获取应用实例
const app = getApp();
import { Config, Http } from './../../utils/index';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tencentPath: Config.tencentPath,
    selectTwoCategoryId: '',
    selectLeftCategoryId: '',
    query: {
      store_id: 0,
      sort: '-other',
      display_class_id: ''
    },
    dataItem: {
      items: []
    },
    showSkeleton: true,
    oneCategoryList: [], //一级品类数据
    showItemIds: {}, //{1: true, 2: false} //为了优化速度
  },
  onLoad(option) {
    this.flag = false; //防止快速点击一级品类
    this.scrollTop = 0;
    this.address = {}; //当前选择的地址
    this.screenWidth = wx.getSystemInfoSync().windowWidth;
    this.screenHeight = wx.getSystemInfoSync().windowHeight;
    this.factor = this.screenWidth / 750;
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    app.shoppingCartNum();
    this.address = app.getSelectStore(); //当前选择的地址
    //判断登录
    app.signIsLogin(() => {
      this.displayClassQuery();//获取商品分类
    });
  },

  //点击搜索
  clickSearch() {
    /*===== 埋点 start ======*/
    app.gioActionRecordAdd('firstBuyEntrance_evar', '商品');
    app.gioActionRecordAdd('secBuyEntrance_evar', '搜索');
    /*===== 埋点 end ======*/
  },

  //点击页面底下的tab
  onTabItemTap(e) {
    /*===== 埋点 start ======*/
    app.gioActionRecordAdd('tabbar', { tabType_var: '商品' });
    /*===== 埋点 end ======*/
  },

  //点击一级品类
  clickOneCategory(e) {
    if (this.flag) return;
    this.flag = true;
    let id = e.currentTarget.dataset.id;
    this.setData({
      'query.display_class_id': id
    }, () => {
      this.itemListDisplayClassNew();
    });
    this.setData({ y: 0 });

    /*===== 埋点 start ======*/
    let con = this.data.oneCategoryList.filter(item => item.id === id);
    app.gioActionRecordAdd('firstBuyEntrance_evar', '商品');
    app.gioActionRecordAdd('secBuyEntrance_evar', con.length > 0 ? con[0].title : '全部');
    /*===== 埋点 end ======*/
  },

  //选择展示二级分类
  selectTwoCategory(e) {
    let id = e.target.dataset.id;
    this.setData({
      selectTwoCategoryId: id,
      selectLeftCategoryId: id
    });
  },

  //排序
  changeSort(e) {
    let { query } = this.data;
    let value = e.currentTarget.dataset.sort;
    query.sort = value;
    query.page = 1;
    this.setData({
      query: query
    }, () => {
      this.itemListDisplayClassNew();//获取商品列表
    });

    /*===== 埋点 start ======*/
    let sorts = {
      other: '综合',
      price: '单价',
      count: '销售'
    };
    app.gioActionRecordAdd('selectSort', {
      sortType_var: sorts[query.sort]
    });
    /*===== 埋点 end ======*/

  },

  //获取商品分类
  displayClassQuery() {
    let that = this;
    let { query } = this.data;
    Http.get(Config.api.displayClassQuery, {
      province_code: that.address.province_code
    }).then((res) => {
      //如果是从首页的banner进来
      if(app.globalData.urlJump){
        query.display_class_id = Number(app.globalData.urlJump);
        delete app.globalData.urlJump;
      }else{
        query.display_class_id = that.data.query.display_class_id || res.data[0].id; //如果未有选择，默认选择第一
      }
      query.store_id = this.address.id || '';
      that.setData({
        query,
        oneCategoryList: res.data,
      }, () => {
        this.itemListDisplayClassNew();
      });
    });
  },

  //获取商品列表
  itemListDisplayClassNew() {
    let that = this;
    let { query } = that.data;
    wx.showNavigationBarLoading();
    Http.get(Config.api.itemListDisplayClassNew, query).then(res => {
      wx.hideNavigationBarLoading();
      let rd = res.data, showItemIds = {};
      //把没有商品的二级分类剔除
      rd = {
        vip_discount: rd.vip_discount,
        vip_level: rd.vip_level,
        vip_title: rd.vip_title,
        items: rd.items.filter(item => item.items.length > 0)
      };

      //处理当前显示商品
      for(let i = 0; i < rd.items.length; i++){
        if(Object.keys(showItemIds).length > 10){
          break;
        }
        for(let j = 0; j < rd.items[i].items.length; j++){
          if(Object.keys(showItemIds).length > 10){
            break;
          }
          showItemIds[rd.items[i].items[j].id] = true;
        }
      }

      that.setData({
        showItemIds,
        dataItem: rd,
        showSkeleton: false,
        selectTwoCategoryId: rd.items.length > 0 ? rd.items[0].id : ''
      });
      that.flag = false;
    }).catch(error => {
      wx.hideNavigationBarLoading();
      that.flag = false;
    });
  },

  //跳转详情
  toItemDetail(e) {
    const { id }  = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/itemDetail/itemDetail?id=${id}`,
    })
  },

  scrollItem(e){
    this.scrollTop = e.detail.scrollTop;
    if(this.scrollInterval) return;

    this.scrollInterval = setInterval(() => {
      //获取所商品列的标题
      wx.createSelectorQuery().selectAll('.category-title').boundingClientRect(cts => {
        let selectTwoCategoryId = null;
        let top = this.factor * 275; //100 + 88 + 84 + 3
        cts.map(item => {
          if(item.top <= top){
            selectTwoCategoryId = item.dataset.id;
          }
        });
        if(this.data.selectLeftCategoryId !== selectTwoCategoryId){
          this.setData({ selectLeftCategoryId: selectTwoCategoryId });
        }
      }).exec();
      
      //获取所有商品列
      let showItemIds = {};
      wx.createSelectorQuery().selectAll('.goods-item').boundingClientRect(gis => {
        gis.map(item => {
          if(item.top > -1000 && item.top <= this.screenHeight + 1000){
            showItemIds[item.dataset.id] = true;
          }
        });
        // console.log('获取滚动情况', showItemIds);
        this.setData({ showItemIds });
      }).exec();
      if(this.scrollInterval) clearInterval(this.scrollInterval);
      this.scrollInterval = undefined;
    }, 500);
  },
})