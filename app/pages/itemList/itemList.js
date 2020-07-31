//获取应用实例
const app = getApp();
import { Constant, Config, Http } from './../../utils/index';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tencentPath: Config.tencentPath,
    rankSrc: './../../assets/img/rank.png',
    rankSSrc: './../../assets/img/rank_s.png',
    rankSl: './../../assets/img/rank_l.png',
    screenSrc: './../../assets/img/screen.png',
    downSrc: './../../assets/img/down.png',
    categoryList: [],
    query: {
      store_id: 0,
      sort: '-other',
      display_class_id: '',
      page: 1,
      page_size: Constant.PAGE_SIZE,
      item_tag_id: '',//运营专区ID
    },
    dataItem: {
      items: (() => {
        //初始化骨架数据
        let items = [];
        for (let i = 0; i < 4; i++) {
          let d = {
            code: "123456",
            frame_id: "20",
            gross_weight: 0,
            id: i + 1,
            images: [],
            is_quoted: false,
            item_spec: "123",
            item_stock: 123,
            origin_place: "123",
            package_spec: "123",
            price_sale: 123,
            title: "xxxxxxxx",
          };
          items.push(d);
        }
        return items;
      })()
    },
    initLoad: true,
    showSkeleton: true,
    activeIndex: '', //选中运营专区显示的样式
    x: '', //选中运营专区后滑动的距离
    tagsList: [], //运营专区数据
    changedown: true, //点击下拉按钮的判断
  },
  onLoad(option) {
    this.flag = false; //防止快速点击运营专区
    this.address = {}; //当前选择的地址
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.shoppingCartNum();
    let that = this;
    this.address = app.getSelectStore(); //当前选择的地址
    //判断登录
    app.signIsLogin(() => {
      let { query } = this.data;
      //如果是从首页的banner进来
      if(app.globalData.urlJump){
        query.display_class_id = Number(app.globalData.urlJump);
        query.item_tag_id = '';
        this.setData({ activeIndex: '' });
        delete app.globalData.urlJump;
      }
      //如果是从首页icon区进来
      if(app.globalData.indexTagId){
        query.item_tag_id = app.globalData.indexTagId;
        query.display_class_id = '';
        this.setData({ activeIndex: app.globalData.indexTagIndex });
        delete app.globalData.indexTagId;
        delete app.globalData.indexTagIndex;
      }
      query.store_id = that.address.id || '';
      that.displayClassQuery();//获取商品分类
      that.getTagsList()//得到运营专区分类
      if (query.page !== 1) {
        query.page_size = query.page_size * query.page;
        query.page = 1;
        that.setData({
          query: query
        }, () => {
          that.itemListDisplayClass(true);//获取商品列表 (isInit是否进入页面)
        });
      } else {
        //如果搜索页是1
        that.setData({
          query: query
        }, () => {
          that.itemListDisplayClass();
        });
      }
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

  //选择商品分类
  selectCategory(e) {
    let { query, categoryList } = this.data;
    let param = e.target.dataset.category;
    query.display_class_id = param;
    query.item_tag_id = '';
    query.page = 1;
    this.setData({
      query: query,
      activeIndex: '',
      x: ''
    }, () => {
      this.itemListDisplayClass();//获取商品列表
    });

    this.goTop();

    /*===== 埋点 start ======*/
    let con = categoryList.filter(item => item.id === param);
    app.gioActionRecordAdd('firstBuyEntrance_evar', '商品');
    app.gioActionRecordAdd('secBuyEntrance_evar', con.length > 0 ? con[0].title : '全部');
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

    this.goTop();

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
    Http.get(Config.api.displayClassQuery, {
      province_code: that.address.province_code
    }).then((res) => {
      that.setData({
        categoryList: res.data
      });
    }).catch(() => {

    });
  },

  //获取商品列表
  itemListDisplayClass(isInit) {
    let that = this;
    let { query, dataItem } = that.data;
    wx.showNavigationBarLoading();
    Http.get(Config.api.itemListDisplayClass, query).then(res => {
      wx.hideNavigationBarLoading();
      let rd = res.data;
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
      //重新恢复数据
      if (isInit) {
        if (query.page_size > Constant.PAGE_SIZE) {
          query.page = Math.ceil(query.page_size / Constant.PAGE_SIZE);//向上取整
          query.page_size = Constant.PAGE_SIZE;
          that.setData({
            query: query
          });
        }
      }
      that.setData({ initLoad: false });
      that.flag = false;
    }).catch(error => {
      wx.hideNavigationBarLoading();
      that.flag = false;
    });
  },

  //获取商品运营专区
  getTagsList() {
    let that = this;
    Http.get(Config.api.itemTagsList, {
      province_code: that.address.province_code
    }).then(res => {
      let rd = res.data;
      if (rd.length > 16) rd.length = 16 //长度限制16个
      that.setData({
        tagsList: rd
      }, () => {
        that.handleTags();
      });
    });
  },
  
  //点击运营专区
  clickTag(e) {
    if (this.flag) return;
    this.flag = true;

    let v = e.currentTarget.dataset.index;
    let id = e.currentTarget.dataset.tagid;
    let { query, activeIndex } = this.data;
    //判断是否选中运营专区
    if (activeIndex !== v) {
      query.item_tag_id = id;
    } else {
      query.item_tag_id = '';
    }
    query.page = 1;
    this.setData({
      query: query,
      activeIndex: v,
    }, () => {
      changedown: true,
      this.handleTags();
      this.itemListDisplayClass();
    });
    this.goTop();
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
    let { tagsList, activeIndex } = this.data;
    let scrollX = '';
    if(activeIndex !== ''){
      let screenWidth = wx.getSystemInfoSync().windowWidth;
      let itemWidth = screenWidth / 4;
      scrollX = itemWidth * activeIndex - itemWidth * 2;
      let maxScrollX = (tagsList.length + 1) * itemWidth;
      if (scrollX < 0) {
        scrollX = 0;
      } else if (scrollX >= maxScrollX) {
        scrollX = maxScrollX;
      }
    }
    this.setData({ x: scrollX })
  },

  // 回到顶部
  goTop() {
    if (wx.pageScrollTo) {
      wx.pageScrollTo({
        scrollTop: 0,
        duration: 0
      });
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      });
    }
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
        that.itemListDisplayClass();
      });
    }
  },
})