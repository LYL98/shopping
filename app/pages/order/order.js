// pages/order/order.js
//获取应用实例
const app = getApp();
import { Config, Constant, Http, Util } from './../../utils/index';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tencentPath: Config.tencentPath,
    orderStatus: Constant.ORDER_STATUS,
    query: {
      page: 1,
      page_size: Constant.PAGE_SIZE
    },
    dataItem: {
      items: [],
    },
    statusColor: {
      wait_confirm: '#70ACF0',
      confirmed: '#FFAC18',
      assigned: '#FFAC18',
      wait_delivery: '#FFAC18',
      deliveried: '#8E91E7',
      received: '#20232C',
      order_done: '#20232C',
      order_canceled: '#C7C7C7'
    },
    openMap: {},
    initLoad: true,
    loading: false,
    isShowPay: false, //是否显示支付
    payData: {}, //支付数据
    payCallBack: null, //支付回调
  },//根据参数初始化
  onLoad(options){
    let query = this.data.query;
    query.page = 1;
    if(options.type == 'wait_complete') {
      query.pay_status = options.type || '';
    }else{
      query.status = options.type || '';
    }
    this.setData({
      initLoad: true,
      query: query,
      from : options.from ? options.from :'',
      system:  app.globalData.system
    });

    wx.pageScrollTo({
      scrollTop: 0,
      duration: 0
    });
  },
  //单击菜单
  clickTab(e) {
    let that = this;
    let v = e.target.dataset.index;
    let { query } = that.data;
    query.page = 1;
    if(v == 'wait_complete') {
      delete query.status
      query.pay_status = v
    }else{
      delete query.pay_status
      query.status = v;
    }
    that.setData({
      query: query
    }, ()=>{
      that.getOrderList();
    });

    wx.pageScrollTo({
      scrollTop: 0,
      duration: 0
    });
  },

  //展开更多
  openMore(e){
    let index = e.currentTarget.dataset.index;
    let tempItem = `dataItem.items[${index}].itemsModify`
    let tempIsShowMore = `dataItem.items[${index}].isShowMore`
    console.log('this.data.dataItem.items[index].items: ', this.data.dataItem.items[index].items);
    this.setData({
      [tempItem]: this.data.dataItem.items[index].items,
      [tempIsShowMore]: true
    });
  },

  //隐藏更多
  hideMore(e) {
    let index = e.currentTarget.dataset.index;
    let tempItem = `dataItem.items[${index}].itemsModify`
    let tempIsShowMore = `dataItem.items[${index}].isShowMore`
    this.setData({
      [tempItem]: this.data.dataItem.items[index].items.slice(0,2),
      [tempIsShowMore]: false
    });
  },

  //再次下单
  againOrder(e) {
    let that = this;
    let address = app.getSelectStore();
    wx.showModal({
      title: '提示',
      content: '确定再次下单？订单的商品将自动加入购物车。',
      confirmColor: '#00AE66',
      success: function(res) {
        if (res.confirm) {
          
          Http.post(Config.api.cartOrderAgain, {
            order_id: e.target.dataset.id,
            store_id: address.id || ''
          }, { handleError: false }).then((res) => {
            wx.switchTab({
              url: '/pages/shoppingCart/shoppingCart'
            });
          });
          // let index = e.target.dataset.index;
          // let item = dataItem.items[index];

          // let data = wx.getStorageSync('shoppingCartData') || [];
          // if (data.length > 0) {
          //   for (let i = 0; i < data.length; i++) {
          //     for(let j = 0; j < item.items.length; j++){
          //       if (item.items[j].item_id === data[i].id) {
          //         data.remove(i);
          //         i--;
          //         break;
          //       }
          //       if (j === item.items.length - 1){
          //         data[i].is_select = false;
          //       }
          //     }
          //   }
          // }
          // for (let d = 0; d < item.items.length; d++) {
          //   //不是赠品的
          //   if(!item.items[d].is_gift){
          //     data.unshift({
          //       id: item.items[d].item_id,
          //       is_select: true,
          //       num: item.items[d].count_real
          //     });
          //   }
          // }
          // wx.setStorageSync('shoppingCartData', data);

          // wx.switchTab({
          //   url: '/pages/shoppingCart/shoppingCart'
          // });
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let that = this;
    //判断登录
    app.signIsLogin(() => {
      let { query } = that.data;
      if (query.page !== 1) {
        query.page_size = query.page_size * query.page;
        query.page = 1;
        that.setData({
          query: query
        }, () => {
          that.getOrderList(true);//获取商品列表 (isInit是否进入页面)
        });
      } else {
        that.getOrderList();
      }
    });
  },
  onUnload() {
    if(this.data.from == 'cart') {
      wx.switchTab({
        url: '/pages/shoppingCart/shoppingCart'
      });
    }
  },
  //获取订单列表
  getOrderList(isInit){
    let that = this;
    let { query, dataItem, initLoad } = that.data;
    //判断是否第一次加载，或没数据；如果是：显示loading   否则静默更新数据
    if (initLoad) {
      this.setData({ loading: true });
    }else{
      wx.showNavigationBarLoading()
    }
    wx.request({
      url: Config.api.orderQuery,
      header: {
        'content-type': 'application/json',
        'Vesta-Custom-Access-Token': app.globalData.loginUserInfo.access_token
      },
      data: query,
      success: function (res) {
        if (res.statusCode == 200 && res.data.code == 0) {
          let rd = res.data.data;
          rd.items.forEach(item => {
            item.itemsModify = item.items.slice(0,2)
            item.isShowAll = false
          })
          if (query.page === 1) {
            that.setData({
              dataItem: rd
            });
          } else {
            dataItem.items = dataItem.items.concat(rd.items);
            that.setData({
              dataItem: dataItem
            });
          }
        } else {
          app.requestResultCode(res); //处理异常
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
      },
      complete: function (res) {
        that.setData({ loading: false, initLoad: false });
        wx.hideNavigationBarLoading();
        //判断是否网络超时
        app.requestTimeout(res, () => {
          that.getOrderList(isInit);
        });
      }
    });
  },

  //订单支付
  orderPay(e) {
    let that = this;
    let { dataItem } = that.data;
    let index = e.target.dataset.index;
    let data = dataItem.items[index];
    console.log(data);
    that.setData({
      payData: {
        order_id: data.id,
        price: data.remain_pay
      },
      payCallBack: function(res){
        if(res === 'success'){
          /*===== 埋点 start ======*/
          app.gioActionRecordAdd('payOrderSuccess', {
            orderID_var: data.id, //订单ID
            orderType_var: data.is_presale ? '预售订单' : '正常订单', //订单类型
            productAmount_var: Util.returnPrice(data.item_total_price), //商品金额
            quantity_var: data.item_num, //商品数量
            payAmount_var: Util.returnPrice(data.order_price), //实际支付金额
            coupon_var: `-￥${Util.returnPrice(data.coupon_reduction)}`, //优惠券名称
            couponType_var: `-￥${Util.returnPrice(data.coupon_reduction)}`, //优惠券类型
            promoteRule_var: `-￥${Util.returnPrice(data.coupon_reduction)}`, //促销规则
          });
          data.items.forEach(item => {
            app.gioActionRecordAdd('payProductSuccess', {
              orderID_var: data.id, //订单ID
              productID_var: item.id, //商品ID
              productName: item.title, //商品名称
              primarySort_var: item.item_display_class, //一级类目
              productArea_var: '订单支付', //商品专区
              productSpec_var: item.item_attrs[0], //商品规格
              productAmount_var: Util.returnPrice(item.item_price_sale * item.count_real), //商品金额
              quantity_var: item.count_real, //商品数量
            });
          });
          /*===== 埋点 end ======*/
          that.setData({
            isShowPay: false
          });
          wx.navigateTo({
            url: `/pages/payResult/payResult?id=${data.id}&source=orderList`
          });
        }
        that.setData({
          isShowPay: false
        });
      },
      isShowPay: true
    });
  },

  //支付成功后
  payDone(index){
    let that = this;
    let { dataItem } = that.data;
    dataItem.items[index].pay_status = 'down';
    that.setData({
      dataItem: dataItem,
      isShowPay: false
    });
  },

  // 确认收货
  confirmReceive(e) {

    let that = this;
    let index = e.target.dataset.index;
    let id = that.data.dataItem.items[index].id;

    if (!id) {
      return;
    }

    wx.showModal({
      title: '提示',
      content: '请确认是否收到商品？',
      confirmColor: '#00AE66',
      success: function (res) {
        if (res.confirm) {
          that.setData({ loading: true }, () => {
            Http.post(Config.api.orderConfirmReceive, {id: id})
              .then(res => {
                that.setData({ loading: false });
                that.getOrderList();//重新获取详情
                wx.showToast({
                  title: '订单已确认收货',
                  icon: 'none'
                });
              })
              .catch(err => {
                that.setData({ loading: false });
              });
          });
        }
      }
    });

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    let that = this;
    let { query, dataItem } = that.data;
    if (dataItem.num / query.page_size > query.page) {
      query.page = query.page + 1;
      that.setData({
        // initLoad: true,
        query: query
      }, () => {
        that.getOrderList();
      });
    }
  }
})