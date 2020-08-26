//获取应用实例
const app = getApp();
import { Constant, Config, Http } from './../../utils/index';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tencentPath: Config.tencentPath,
    isShowSearch: true,
    selectTwoCategoryId: '',
    query: {
      store_id: 0,
      sort: '-other',
      display_class_id: ''
    },
    dataItem: {
      categorys: []
    },
    showSkeleton: true,
    activeIndex: '', //选中一级品类显示的样式
    x: '', //选中一级品类后滑动的距离
    changedown: true, //点击下拉按钮的判断
    oneCategoryList: [], //一级品类数据
    twoCategoryList: [],
    showItemIds: {}, //{1: true, 2: false} //为了优化速度
  },
  onLoad(option) {
    this.flag = false; //防止快速点击一级品类
    this.scrollTop = 0;
    this.address = {}; //当前选择的地址
    this.screenWidth = wx.getSystemInfoSync().windowWidth;
    this.screenHeight = wx.getSystemInfoSync().windowHeight;
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
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

  //选择展示二级分类
  selectTwoCategory(e) {
    let id = e.target.dataset.id;
    let index = e.target.dataset.index;
    this.setData({
      selectTwoCategoryId: id
    });
    if(index === 0){
      this.pageScrollTo(0, 500);
      return;
    }
    wx.createSelectorQuery().selectAll(`#category-title${id}`).boundingClientRect(ct => {
      let factor = this.screenWidth / 750;
      let top = this.data.isShowSearch ?
                this.scrollTop + ct[0].top - factor * 74:
                this.scrollTop + ct[0].top - factor * 74 - factor * 100 ;
      this.pageScrollTo(top, 500);
    }).exec();

    /*===== 埋点 start ======*/
    // let con = twoCategoryList.filter(item => item.id === id);
    // app.gioActionRecordAdd('firstBuyEntrance_evar', '商品');
    // app.gioActionRecordAdd('secBuyEntrance_evar', con.length > 0 ? con[0].title : '全部');
    /*===== 埋点 end ======*/
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
      this.itemListDisplayClass();//获取商品列表
    });

    this.pageScrollTo(0, 0);

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
        that.setData({ activeIndex: '' });
        delete app.globalData.urlJump;
      }else{
        query.display_class_id = that.data.query.display_class_id || res.data[0].id; //如果未有选择，默认选择第一
      }
      query.store_id = this.address.id || '';
      that.setData({
        query,
        oneCategoryList: res.data,
      }, () => {
        this.itemListDisplayClass();
      });
    });
  },

  //获取商品列表
  itemListDisplayClass() {
    let that = this;
    let { query, dataItem, showItemIds } = that.data;
    let twoCategoryList = [];
    dataItem.categorys = [];
    wx.showNavigationBarLoading();
    Http.get(Config.api.itemListDisplayClass, query).then(res => {
      wx.hideNavigationBarLoading();
      let rd = res.data;
      dataItem.vip_discount = rd.vip_discount;
      dataItem.vip_level = rd.vip_level;
      dataItem.vip_title = rd.vip_title;
      for(let i = 0; i < 30; i++){
        if(i === 0){
          rd.items.map((item, index) => {
            if(index <= 4){
              showItemIds[`${i}_${item.id}`] = true;
            }
          });
          this.setData({ showItemIds });
        }
        dataItem.categorys.push({
          id: i + 1,
          title: `分类${i + 1}`,
          items: rd.items.map(item => {
            return {
              ...item,
              id: item.id = `${i}_${item.id}`
            }
          })
        });
        twoCategoryList.push({
          id: i + 1,
          title: `分类${i + 1}`
        });
      }
      that.setData({
        dataItem,
        twoCategoryList,
        showSkeleton: false,
        selectTwoCategoryId: twoCategoryList.length > 0 ? twoCategoryList[0].id : ''
      });
      that.flag = false;
    }).catch(error => {
      wx.hideNavigationBarLoading();
      that.flag = false;
    });
  },
  
  //点击一级品类
  clickOneCategory(e) {
    if (this.flag) return;
    this.flag = true;
    let index = e.currentTarget.dataset.index;
    let id = e.currentTarget.dataset.id;
    this.setData({
      activeIndex: index
    }, () => {
      this.handleTags();
      this.itemListDisplayClass();
    });
    this.pageScrollTo(0, 0);
  },

  //点击下拉按钮
  clickdown() {
    this.setData({
      changedown: !this.data.changedown
    }, () => {
      if(this.data.changedown){
        this.handleTags();
      }
    });
  },

  //处理tags位置
  handleTags() {
    let { oneCategoryList, activeIndex } = this.data;
    let scrollX = '';
    if(activeIndex !== ''){
      let itemWidth = this.screenWidth / 4;
      scrollX = itemWidth * activeIndex - itemWidth * 2;
      let maxScrollX = (oneCategoryList.length + 1) * itemWidth;
      if (scrollX < 0) {
        scrollX = 0;
      } else if (scrollX >= maxScrollX) {
        scrollX = maxScrollX;
      }
    }
    this.setData({ x: scrollX });
  },

  toItemDetail(e) {
    const { id }  = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/itemDetail/itemDetail?id=${id}`,
    })
  },

  //页面滚动
  pageScrollTo(scrollTop, duration) {
    if (wx.pageScrollTo) {
      wx.pageScrollTo({
        scrollTop: scrollTop || 0,
        duration: duration || 0
      });
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      });
    }
  },
  /**
   * 页面滚动事件的处理函数
   */
  onPageScroll(e){
    if(e.scrollTop > 100 && this.data.isShowSearch){
      this.setData({ isShowSearch: false });
    }

    if(e.scrollTop <= 100 && !this.data.isShowSearch){
      this.setData({ isShowSearch: true });
    }

    if(this.scrollTime) clearTimeout(this.scrollTime);
    this.scrollTime = setTimeout(() => {
      this.scrollTop = e.scrollTop;
      let showItemIds = {};
      wx.createSelectorQuery().selectAll('.goods-item').boundingClientRect(gis => {
        gis.map(item => {
          if(item.top > -200 && item.top <= this.screenHeight + 200){
            showItemIds[item.dataset.id] = true;
          }
        });
        this.setData({ showItemIds });
      }).exec();
    }, 200);
  }
})