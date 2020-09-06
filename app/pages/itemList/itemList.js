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
    this.address = {}; //当前选择的地址
    this.windowWidth = wx.getSystemInfoSync().windowWidth;
    this.windowHeight = wx.getSystemInfoSync().windowHeight;
    this.factor = this.windowWidth / 750;
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
      this.itemListDisplayClassNew({
        type: 'top', //滚到顶
        id: 0
      });
    });

    /*===== 埋点 start ======*/
    let con = this.data.oneCategoryList.filter(item => item.id === id);
    app.gioActionRecordAdd('firstBuyEntrance_evar', '商品');
    app.gioActionRecordAdd('secBuyEntrance_evar', con.length > 0 ? con[0].title : '全部');
    /*===== 埋点 end ======*/
  },

  //选择展示二级分类
  selectTwoCategory(e) {
    if(this.scrollInterval){
      clearInterval(this.scrollInterval);
      this.scrollInterval = undefined;
    }
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
      this.itemListDisplayClassNew({
        type: 'not', //不滚动
        id: 0
      });
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
    let { query } = that.data;
    Http.get(Config.api.displayClassQuery, {
      province_code: that.address.province_code
    }).then((res) => {
      let rd = res.data;
      //如果没有一级分类
      if(rd.length === 0){
        that.setData({
          showSkeleton: false,
          dataItem: []
        });
        return;
      }

      //否则
      let rollTo = {type: '', id: 0}; //滚动到位置
      //如果是从首页的banner进来
      if(app.globalData.urlJump){
        let urlJump = app.globalData.urlJump.split('_');
        if(urlJump.length >= 2){
          query.display_class_id = Number(urlJump[0]);
          rollTo = {
            type: 'known', //滚动到已知位置
            id: Number(urlJump[1])
          };
        }
        delete app.globalData.urlJump;
      }else{
        //判断当前选择的一级分类是否在返回列表中，否则默认选择第一个
        let con = rd.filter(item => item.id === query.display_class_id);
        if(con.length > 0){
          query.display_class_id = con[0].id;
          rollTo = {
            type: 'not', //不滚动
            id: 0
          };
        }else{
          query.display_class_id = rd[0].id;
          rollTo = {
            type: 'top', //滚到顶
            id: 0
          };
        }
      }
      query.store_id = this.address.id || '';
      that.setData({
        query,
        oneCategoryList: res.data,
      }, () => {
        this.itemListDisplayClassNew(rollTo);
      });
    });
  },

  //获取商品列表(rollTo: { id: 0, type: '' })
  /*
   * 商品列表场景
   * 1、第一次进来【跳到顶部】
   * 2、banner进来【跳到二级相应位置】
   * 3、点一级品类【跳到顶部】
   * 4、点二级品类【跳到二级相应位置】
   * 5、点排序【不动】
   * 6、别的tab进来【不动】
   * 7、从详情、搜索返回【不动】
   * 8、新增商品后，重新进入
   */
  itemListDisplayClassNew(rollTo) {
    let that = this;
    wx.showNavigationBarLoading();
    Http.get(Config.api.itemListDisplayClassNew, that.data.query).then(res => {
      wx.hideNavigationBarLoading();
      let rd = res.data;
      //重新滚动定位
      if(rollTo){
        switch(rollTo.type){
          //滚到已知位置
          case 'known':
            that.setData({
              selectTwoCategoryId: rollTo.id,
              selectLeftCategoryId: rollTo.id,
              dataItem: rd,
              showSkeleton: false
            }, () => {
              this.handleShowItem();
            });
            break;
          //滚动顶
          case 'top':
            that.setData({
              selectTwoCategoryId: rd.items.length > 0 ? rd.items[0].id : '',
              selectLeftCategoryId: rd.items.length > 0 ? rd.items[0].id : '',
              dataItem: rd,
              showSkeleton: false
            }, () => {
              this.handleShowItem();
            });
            break;
          //不滚动
          case 'not':
            that.setData({
              dataItem: rd,
              showSkeleton: false
            }, () => {
              this.handleShowItem();
            });
            break;
          //默认(不滚动)
          default:
            that.setData({
              dataItem: rd,
              showSkeleton: false
            }, () => {
              this.handleShowItem();
            });
        }
      }else{
        that.setData({
          dataItem: rd,
          showSkeleton: false
        }, () => {
          this.handleShowItem();
        });
      }
      
      that.flag = false;
    }).catch(error => {
      wx.hideNavigationBarLoading();
      that.flag = false;
    });
  },

  //跳转详情
  toItemDetail(e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/itemDetail/itemDetail?id=${id}`,
    });
  },

  //强制显示商品
  showItem(e){
    this.handleShowItem();
  },

  //页面滚动
  scrollItem(e){
    if(this.scrollInterval) return;

    this.scrollInterval = setInterval(() => {
      this.handleSelectLeftMenu(e); //选择左边菜单
      this.handleShowItem(); //显示商品
      if(this.scrollInterval){
        clearInterval(this.scrollInterval);
        this.scrollInterval = undefined;
      }
    }, 200);
  },

  //选择左边菜单
  handleSelectLeftMenu(e){
    //获取所商品列的标题
    wx.createSelectorQuery().selectAll('.category-title').boundingClientRect(cts => {
      let selectTwoCategoryId = null;
      let top = 375; //100 + 88 + 84 + 3 + 占位100 rpx
      let wh = this.windowHeight / this.factor - top + 200;
      let t = e.detail.scrollTop / this.factor;
      let h = e.detail.scrollHeight / this.factor;
      //如果滚到顶
      if(e.detail.scrollTop <= 0){
        selectTwoCategoryId = cts[0].dataset.id;
      }
      //如果滚动底
      else if(t >= h - wh){
        selectTwoCategoryId = cts[cts.length - 1].dataset.id;
      }
      //否则
      else{
        cts.map(item => {
          if(item.top / this.factor <= top){
            selectTwoCategoryId = item.dataset.id;
          }
        });
      }
      
      if(this.data.selectLeftCategoryId !== selectTwoCategoryId){
        this.setData({ selectLeftCategoryId: selectTwoCategoryId });
      }
    }).exec();
  },

  //显示商品
  handleShowItem(){
    //获取所有商品列
    let showItemIds = {};
    wx.createSelectorQuery().selectAll('.goods-item').boundingClientRect(gis => {
      gis.map(item => {
        if(item.top > -1000 && item.top < this.windowHeight + 1000 && Object.keys(showItemIds).length <= 15){
          showItemIds[item.dataset.id] = true;
        }
      });
      //console.log('获取滚动情况', e.detail.scrollTop);
      this.setData({ showItemIds });

      /*==== 开发测试环境 测试性能+1 start ====*/
      if(Config.conn === 'dev' || Config.conn === 'test'){
        if(!this.testIndex) this.testIndex = 0;
        this.testIndex = this.testIndex + 1;
        wx.setNavigationBarTitle({
          title: `商品列表【${this.testIndex}】`
        });
      }
      /*==== 开发测试环境 测试性能+1 end ====*/
    }).exec();
  }
})