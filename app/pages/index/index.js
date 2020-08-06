// pages/index1/index1.js

const app = getApp();
import { Http,Constant, Config } from './../../utils/index';
Page({

  data: {
    noticeList:[
      // {
      //   store_title:'门店名称',
      //   item_title:'商品名称',      
      //   item_id:1
      // }
    ],
    socketData:null,
    socketOpen: false, 
    socketTimeout:null,
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
      './../../assets/img/tags_icon8.png',
    ],
    tagsList: (()=>{
      //初始化骨架数据
      let items = [];
      for(let i = 0; i < 9; i++){
        let d = {
          id: i + 1,
          image: '',
          title: '今日主推'
        };
        items.push(d);
      }
      return items;
    })(),
    query: {
      store_id: 0,
      // tag: '今日主推',
      sort: '-tags_edited',
      page: 1,
      page_size: Constant.PAGE_SIZE,
      item_tag_id: '', //运营专区中今日主推ID
      // item_tag_id: this.data.tagsList[0].id //运营专区中今日主推ID

    },
    dataItem: {
      items: [
        {
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
        },{
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
        }
      ]
    },
    //瀑布流数据(骨架屏数据)

    currentSwiper: 0,
    initLoad: true,
    closeStore: true,
    showSkeleton: true,
    userInfo: {}, //当前登录用户
    address: {},
    isShowSelect: false,
    navBarLoding: false,
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
    that.setData({
      system: system
    });


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
        userInfo: res,
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
            that.getTagsList(true);//里面包含获取商品列表
            // that.itemQuery(true); //获取商品列表 (isInit是否进入页面)
            that.getWorkTime();
            that.getBanner(); //显示ad
          });
        } else {
          that.setData({
            query: query,
            address: ad
          }, () => {
            that.getTagsList()//里面包含获取商品列表
            // that.itemQuery();
            that.getWorkTime();
            that.getBanner(); //显示ad
            this.getNoticeList()
          });
        }
        app.shoppingCartNum();
      }
    });

    // this.connectSocket()
    // this.setData({
    //   noticeList:wx.getStorageSync('noticeList')
    // })
  },
  // 获取订单通高
  getNoticeList(){
    let address = app.getSelectStore(); 
    Http.get(Config.api.noticeList, {
      province_code: address.province_code
    }).then((res) => {
      if(res.code === 0){
        this.setData({
          noticeList:res.data
        })
      }
      console.log('res: ', res);
      
    });
  },
  onHide(){
    console.log('页面隐藏',this.data.socketOpen)
    clearInterval(this.socketTimeout)
    
    if(this.data.socketOpen){
      console.log('websocket')
      wx.closeSocket({
        success: () => {
          console.log('websocket关闭')
        }
      })
    }
  },

  //点击搜索
  clickSearch(){
    /*===== 埋点 start ======*/
    app.gioActionRecordAdd('firstBuyEntrance_evar', '首页');
    app.gioActionRecordAdd('secBuyEntrance_evar', '搜索');
    /*===== 埋点 end ======*/
    wx.navigateTo({
      url: '/pages/search/search',
    })
  },
  //显示选择收货地址、新人优惠券时，锁列表不能滑动
  showHideToggle(e){
    this.setData({
      isShowSelect: e.detail
    });
  },

  //选择门店后回调
  selectStoreCallBack(res){
    app.shoppingCartNum();
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
        // that.itemQuery();
        that.getBanner(); //显示ad
        that.getWorkTime();
      });
      /*===== 埋点 start ======*/
      app.gioSetUser(rd.id);
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
        'Vesta-Custom-Access-Token': app.globalData.loginUserInfo.access_token
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
        'Vesta-Custom-Access-Token': app.globalData.loginUserInfo.access_token
      },
      data: {
        province_code: address.province_code
      },
      success: function(res) {
        if (res.statusCode == 200 && res.data.code == 0) {
          let rd = res.data.data;
          /*===== 埋点 start ======*/
          for(let i = 0; i < rd.length; i++){
            let item = rd[i];
            let productName = '', tab = item.url.match(/\/\/|(\w+)/g);
            if(item.url.indexOf('itemDetail') >= 0){
              productName = `商品ID${tab[4]}`;
            }else if(item.url.indexOf('itemLabel') >= 0){
              tab = item.url.match(/([^\=]+)$/g);
              productName = `跳转商品标签-标签-${tab[0]}`;
            }else if(item.url.indexOf('itemList') >= 0){
              productName = `跳转商品列表-分类-${tab[3]}`;
            }else{
              productName = '没有链接';
            }
            app.gioActionRecordAdd('positionView', {
              moduleTitle_var: '首页banner', //楼层
              position_var: i + 1, //坑位
              positonName_var: `bannerID${item.id}`, //流量位名称(暂取banner_id)
              productName: productName, //商品名称
            });
          }
          /*===== 埋点 end ======*/
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
  getTagsList(isInit){
    let that = this;
    let { query,address } = that.data;
    wx.request({
      url: Config.api.itemTagsList,
      header: {
        'content-type': 'application/json',
        'Vesta-Custom-Access-Token': app.globalData.loginUserInfo.access_token
      },
      data: {
        province_code: address.province_code
      },
      success: function(res) {
        if (res.statusCode == 200 && res.data.code == 0) {
          let rd = res.data.data;
          let { tencentPath } = that.data;
          
          if(rd.length > 9) rd.length = 9; //限制最长8个,但是第一个不显示
          let rdTemp = [];
          rd.forEach((item, index) => {
            if(item.image){
              rdTemp.push({
                ...item,
                image: tencentPath + item.image
              });
            }else{
              rdTemp.push(item);
            }
            /*===== 埋点 start ======*/
            if(index > 0){
              app.gioActionRecordAdd('positionView', {
                moduleTitle_var: 'icon区', //楼层
                position_var: index + 1, //坑位
                positonName_var: item.title, //流量位名称
                productName: `跳转商品列表-展示分类-${item.title}`, //商品名称
              });
            }
            /*===== 埋点 end ======*/
          });
          //默认选择运营专区第一个
          query.item_tag_id = rdTemp[0].id;
          that.setData({
            tagsList: rdTemp,
            query:query
          });
         //先取得item_tag_id,再请求获得商品 
          that.itemQuery(isInit);
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
    } = that.data;
    //判断是否第一次加载，或没数据；如果是：显示loading   否则静默更新数据
    if (initLoad || !dataItem.num) {
      wx.showNavigationBarLoading();
    }
    wx.request({
      url: Config.api.itemQuery,
      header: {
        'content-type': 'application/json',
        'Vesta-Custom-Access-Token': app.globalData.loginUserInfo.access_token
      },
      data: query,
      success: function(res) {
        if (res.statusCode == 200 && res.data.code == 0) {
          /*===== 埋点 start ======*/
          let dotFun = (item, index) => {
            app.gioActionRecordAdd('positionView', {
              moduleTitle_var: '今日主推', //楼层
              position_var: index + 1, //坑位
              positonName_var: item.title, //流量位名称
              productName: item.title, //商品名称
            });
          }
          /*===== 埋点 end ======*/
          let rd = res.data.data;
          if (query.page === 1) {
            that.setData({
              dataItem: rd,
            });
          } else {
            dataItem.items = dataItem.items.concat(rd.items);
            that.setData({
              dataItem: dataItem,
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
    let index = e.target.dataset.index;
    let tab = [];
    
    if(item.url !== '' && item.url !== 'none' && item.url !== null){
      let isPage = item.url.indexOf("/pages") == 0;
      tab = item.url.match(/\/\/|(\w+)/g);
      if(isPage) {
        wx.navigateTo({
          url: item.url
        })
      }else if(tab[0] == 'app'){
        app.globalData.urlJump = tab[3];
        wx.switchTab({
          url: `/pages/itemList/itemList`
        })
      }
    }
  
    /*===== 埋点 start ======*/
    let productName = '';
    if(item.url.indexOf('itemDetail') >= 0){
      productName = `商品ID${tab[4]}`;
    }else if(item.url.indexOf('itemLabel') >= 0){
      tab = item.url.match(/([^\=]+)$/g);
      productName = `跳转商品标签-标签-${tab[0]}`;
    }else if(item.url.indexOf('itemList') >= 0){
      productName = `跳转商品列表-分类-${tab[3]}`;
    }else{
      productName = '没有链接';
    }
    app.gioActionRecordAdd('positionClick', {
      moduleTitle_var: '首页banner', //楼层
      position_var: index + 1, //坑位
      positonName_var: `bannerID${item.id}`, //流量位名称(暂取banner_id)
      productName: productName, //商品名称
    });

    app.gioActionRecordAdd('firstBuyEntrance_evar', '首页');
    app.gioActionRecordAdd('secBuyEntrance_evar', '首页banner');
    /*===== 埋点 end ======*/
  },
  //点击tags
  clickTags(e){
    let item = e.currentTarget.dataset.item;
    let index = e.currentTarget.dataset.index;
    app.globalData.indexTagId = item.id; //保存itemList页面要用到，
    app.globalData.indexTagIndex = index; //保存itemList页面要用到
    wx.switchTab({
      url: '/pages/itemList/itemList',
    })

    /*===== 埋点 start ======*/
    app.gioActionRecordAdd('positionClick', {
      moduleTitle_var: 'icon区', //楼层
      position_var: index, //坑位
      positonName_var: item.title, //流量位名称
      productName: `跳转商品列表-展示分类-${item.title}`, //商品名称
    });

    app.gioActionRecordAdd('firstBuyEntrance_evar', '首页');
    app.gioActionRecordAdd('secBuyEntrance_evar', 'icon');
    /*===== 埋点 end ======*/
  },
  //点击商品
  clickItem(e){
    let item = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: `/pages/itemDetail/itemDetail?id=${item.id}`,
    })
    
    /*===== 埋点 start ======*/
    let index = 0;
    let { dataItem } = this.data;
    for(let i = 0; i < dataItem.items.length; i++){
      if(dataItem.items[i].id === item.id){
        index = i + 1;
        break;
      }
    }
    app.gioActionRecordAdd('positionClick', {
      moduleTitle_var: '今日主推', //楼层
      position_var: index, //坑位
      positonName_var: item.title, //流量位名称
      productName: item.title, //商品名称
    });
    app.gioActionRecordAdd('firstBuyEntrance_evar', '首页');
    app.gioActionRecordAdd('secBuyEntrance_evar', '今日主推');
    /*===== 埋点 end ======*/
  },
  //点击页面底下的tab
  onTabItemTap(e){
    /*===== 埋点 start ======*/
    app.gioActionRecordAdd('tabbar', { tabType_var: '首页' });
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
  },


  toDetail(e){
    const dataset = e.currentTarget.dataset;
    wx.navigateTo({
			url: `/pages/itemDetail/itemDetail?id=${dataset.id}`
		});
  },
  // TODO 获取登录的token，生产环境wss需要配置
  // 跑马灯websocket
  connectSocket(){
    if(!app.globalData.loginUserInfo.cent_token){
      return
    }
    const that = this;
    let connect_auth_msg = `{"params":{"token": ${app.globalData.loginUserInfo.cent_token}},"id":1}`;
   
    wx.connectSocket({
      url: Config.requestWs,
      header:{
        'content-type': 'application/json',
      },
      // protocols: ['protocol1']
    })
    wx.onSocketOpen(function(res){
      console.log('WebSocket连接已打开！');
      that.setData({
        socketOpen : true,
        socketMsgQueue:[]
      })
      wx.sendSocketMessage({
        data: connect_auth_msg
      })
      let sub_channel_msg = '{"method":1,"params":{"channel":"news"},"id":523}'; // id的值可以随意指定，只要是int就行
      setTimeout(() => {
        wx.sendSocketMessage({
          data: sub_channel_msg
        })
        that.sendSocketMessage()

      },1000)
    })
    wx.onSocketMessage(function(res){
      console.log('接受服务器websocket',res.data)
      let data = JSON.parse(res.data)
      if(data.result && data.result.data){
        let parseData = JSON.parse(JSON.stringify(data.result.data))
        let secondParseData = JSON.parse(parseData.data)
        if(secondParseData.p_type === 'vesta'){
          that.setNoticeList(secondParseData.data)
        }
      }
    })
  },
  sendSocketMessage(msg){
    this.socketTimeout = setInterval(() => {
      let params = {method:7,id:1};
    console.log('发送消息')
    if (this.data.socketOpen) {
      wx.sendSocketMessage({
        data: JSON.stringify(params)
      })
    }
    },25000)
    
  },
  setNoticeList(data){
    let noticeList = this.data.noticeList
    noticeList.push(data)
    if(noticeList.length > 10){
      noticeList.splice(noticeList.length -1 ,1)
    }
    this.setData({
      noticeList
    })
    wx.setStorageSync('noticeList',noticeList)
    
  },
})