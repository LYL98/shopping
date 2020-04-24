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
    downSrc:'./../../assets/img/down.png',
    categoryList: [],
    query: {
      store_id: 0,
      sort: '-other',
      display_class_id: '',
      page: 1,
      page_size: Constant.PAGE_SIZE,
      item_tag_id: '',//运营专区ID
    },
    urlJumpId:0,
    dataItem: {
      items: (()=>{
        //初始化骨架数据
        let items = [];
        for(let i = 0; i < 4; i++){
          let d = {
            code: "123456",
            frame_id: "20",
            gross_weight: 123,
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
    activeIndex: '',//选中运营专区显示的样式
    x: '',//选中运营专区后滑动的距离
    tagsList:[],
    changedown:true,
    // indextagid:'',
    // indextagindex: ''
    flag:false//防止快速点击运营专区
  },
  onLoad(option) {
    this.address = {}; //当前选择的地址
    this.setData({
      system:  app.globalData.system
    });
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this
    this.address = app.getSelectStore(); //当前选择的地址
    let value = app.globalData.urlJump < 10 ? '0' + app.globalData.urlJump : app.globalData.urlJump
    this.setData({
      urlJumpId: value || 0,
    })
     
    //判断登录
    app.signIsLogin(() => {
      let { query } = this.data;
      console.log(that.address.id);
      query.store_id = that.address.id || ''; 
      if(query.page !== 1){
        query.page_size = query.page_size * query.page;
        query.page = 1;
        this.setData({
          query: query
        }, ()=>{
          // if(app.globalData.indexTagId || query.item_tag_id){
          //   console.log(9091);
            
          //   this.getClickTag()
          // }else{
          //   console.log(9092);
            
          //   this.itemListDisplayClass(true);//获取商品列表 (isInit是否进入页面)
          // }
          this.itemListDisplayClass(true);//获取商品列表 (isInit是否进入页面)
        });
      }else{
        //如果搜索页是1
        this.setData({
          query: query
        }, ()=>{
          //如果是从首页点击专区进来
          // console.log(111);
          
          if(app.globalData.indexTagId){
            this.getClickTag()
          }else{
            this.itemListDisplayClass();
          }
        });
      }
      this.displayClassQuery();//获取商品分类
      this.getTagsList()//得到运营专区分类
      
    });
    if(this.data.urlJumpId) {
      this.selectCategory(this.data.urlJumpId, 'auto_select')
    }
  },

  //点击页面底下的tab
  onTabItemTap(e){
    /*===== 埋点 start ======*/
    app.actionRecordAdd({
      action: Constant.ACTION_RECORD.TAB_ITEM,
      content: { store_id: this.address.id }
    });
    /*===== 埋点 end ======*/
  },

  //选择商品分类
  selectCategory(e, type){
    let param = ''; 
    if(type === 'auto_select') {
      param = Number(e);
    }else{
      delete this.data.urlJumpId;
      delete app.globalData.urlJump;
      param = e.target.dataset.category;
    }
    let { query } = this.data;

    query.display_class_id = param;
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

    /*===== 埋点 start ======*/
    app.actionRecordAdd({
      action: Constant.ACTION_RECORD.ITEM_CLASS,
      content: { display_class_id: param, store_id: query.store_id }
    });
    /*===== 埋点 end ======*/

    let keyWords = this.data.categoryList.filter(item => item.id === param);
    if(keyWords.length > 0){
      app.globalData.gio('track', 'searchSuccess', { 
        searchKeywords: keyWords[0].title, 
        searchEntrance: '分类-搜索', 
        storeID: query.store_id
      });
    }
  },

  //点击商品
  clickItem(e){
    let id = e.currentTarget.dataset.id;
    /*===== 埋点 start ======*/
    app.actionRecordAdd({
      action: Constant.ACTION_RECORD.ITEM_DETAIL_LIST,
      content: { item_id: id, store_id: this.data.query.store_id }
    });
    /*===== 埋点 end ======*/
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
    Http.get(Config.api.displayClassQuery, {
      province_code: that.address.province_code
    }).then((res)=>{
      that.setData({
        categoryList: res.data
      });
    }).catch(()=>{

    })
  },

  //获取商品列表
  itemListDisplayClass(isInit) {
    let that = this;
    let { query, dataItem, initLoad } = that.data;

    wx.showNavigationBarLoading();

    wx.request({
      url: Config.api.itemListDisplayClass,
      header: {
        'content-type': 'application/json',
        'Vesta-Custom-Access-Token': app.globalData.loginUserInfo.access_token
      },
      data: query,
      success: function (res) {
        if (res.statusCode == 200 && res.data.code == 0) {
          let rd = res.data.data;
          if (query.page === 1){
            that.setData({
              dataItem: rd,
              showSkeleton: false,
              flag:false
            });
          }else{
            dataItem.items = dataItem.items.concat(rd.items);
            that.setData({
              dataItem: dataItem,
              showSkeleton: false,
              flag:false
            });
          }
        } else {
          app.requestResultCode(res); //处理异常
        }

        //重新恢复数据
        if (isInit){
          if (query.page_size > Constant.PAGE_SIZE) {
            query.page = Math.ceil(query.page_size / Constant.PAGE_SIZE);//向上取整
            query.page_size = Constant.PAGE_SIZE;
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
  },


  //点击运营专区
  clickTag(e){
    
    let that = this;
    that.setData({
      changedown: true

    })
    // console.log(that.data.flag);
    
    if(that.data.flag) return

    // console.log(v,that.data.activeIndex);
    that.setData({
      flag: true
    })
    let v = e.currentTarget.dataset.index 
    let id = e.currentTarget.dataset.tagid
    //判断是否选中运营专区
    if(that.data.activeIndex !== v){
      // console.log(that.data.activeIndex );
      let { query } = this.data;
      query.item_tag_id = id
      query.page = 1
      query.page_size = Constant.PAGE_SIZE
      that.setData({
        query:query,
        activeIndex: v,
      })
      //点击运营标签滑动
      let screenWidth = wx.getSystemInfoSync().windowWidth;
      let itemWidth = screenWidth/4;
      let index = e.currentTarget.dataset.index
      const { tagsList } = that.data;
      let scrollX = itemWidth * index - itemWidth*2;
      let maxScrollX = (tagsList.length+1) * itemWidth;
      if(scrollX<0){
        scrollX = 0;
      } else if (scrollX >= maxScrollX){
        scrollX = maxScrollX;
      }
      this.setData({
        x: scrollX
      },()=>{
        that.itemListDisplayClass()
        that.goTop()
        //
      })
    }else{
      let { query } = this.data;
      query.item_tag_id = ''
      query.page = 1
      query.page_size = Constant.PAGE_SIZE
      that.setData({
        query: query,
        activeIndex: '',
      },()=>{
        that.itemListDisplayClass()
        that.goTop()
      })
    }
    
  },

  //点击下拉按钮
  clickdown(){
    let that = this
    
    // console.log(that.data.changedown);
    
    this.setData({
      changedown: !that.data.changedown
    })
  },
  //获取商品运营专区
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
        //query.province_code
        //that.address.province_code
        province_code: that.address.province_code
      },
      success: function(res) {
        if (res.statusCode == 200 && res.data.code == 0) {
          let rd = res.data.data;
          let { tagsList } = that.data;
          if(rd.length > 16) rd.length = 16 //长度限制16个
          that.setData({
            tagsList: rd
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
  //非点击tarBar栏进入页面时触发事件，如果需要记住之前的状态，需要分从首页点击进来还是从itemDetail后退进来
  getClickTag(){
    let that = this
    let { query } = that.data;
    //当需要保存选择专区时 多了 query.item_tag_id
    // query.item_tag_id = app.globalData.indexTagId || query.item_tag_id
    query.item_tag_id = app.globalData.indexTagId 

      // console.log(app.globalData.indexTagIndex);
    let screenWidth = wx.getSystemInfoSync().windowWidth;
    let itemWidth = screenWidth/4;

    // let index = app.globalData.indexTagId ? app.globalData.indexTagIndex : that.data.activeIndex
    let index = app.globalData.indexTagIndex

    
    const { tagsList } = that.data;
    let scrollX = itemWidth * index - itemWidth*2;
    let maxScrollX = (tagsList.length+1) * itemWidth;
    if(scrollX<0){
      scrollX = 0;
    } else if (scrollX >= maxScrollX){
      scrollX = maxScrollX;
    }
    this.setData({
      x: scrollX
    })
    this.setData({
      //当需要记住选择时
      //activeIndex: app.globalData.indexTagId?app.globalData.indexTagIndex : that.data.activeIndex,
      activeIndex:app.globalData.indexTagIndex,
      query: query,
     },()=>{
      this.itemListDisplayClass()
     })
  },
  //页面隐藏时
  onHide: function(){
    
    let that =this
    let { query } = that.data;
    query.display_class_id = '';
    query.item_tag_id = ''
    query.page = 1
    query.page_size = Constant.PAGE_SIZE
    this.setData({
      activeIndex: '',
      x: '',
      query: query
    })
    app.globalData.indexTagId = null
    app.globalData.indexTagIndex = null
    that.goTop()
  },

   // 回到顶部
  goTop: function (e) { 
  if (wx.pageScrollTo) {
    wx.pageScrollTo({
      scrollTop: 0
    })
  } else {
    wx.showModal({
      title: '提示',
      content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
    })
  }
  }
})