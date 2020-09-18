// pages/orderAdd/orderAdd.js
/**
 * 程序顺序
 * 1、获取地址列表
 * 2、获取优惠券信息
 * 3、预生成
 * 3、生成订单
 * 5、支付
 */
//获取应用实例
const app = getApp();
import { Config, Http, Util, Constant } from './../../utils/index';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tencentPath: Config.tencentPath,
    orderLoading: false,
    orderType: 'normal', //订单类型 normal：正常， presale：预订
    deliveryDate: '', //预订配送日期
    address: {},
    payWarning: null,
    dataItem: {
      delivery_fee: 0,
      item_total_price: 0,
      order_price: 0,
      has_ordered: false,
      items: (() => {
        //初始化骨架数据
        let items = [];
        for (let i = 0; i < 2; i++) {
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
            number: 20
          };
          items.push(d);
        }
        return items;
      })()
    },
    rightSrc: './../../assets/img/right.png',
    rightPriceSrc: './../../assets/img/right_price.png',
    orderAddBgSrc: './../../assets/img/order_add_bg.png',
    orderAddData: {
      items: []
    },
    listAddress: '',
    info: '',
    isShowPay: false, //显示支付
    payData: {}, //支付数据
    payCallBack: null, //支付回调
    showSkeleton: true, //骨架屏
    couponGoodsListData: [], //商品优惠券列表
    couponGoodsSelectData: {}, //当前选择商品优惠券
    couponDeliveryListData: [], //运费优惠券列表
    couponDeliverySelectData: {}, //当前选择运费优惠券
    loginUserInfo:{},
    showFreight:false,
    discount:0,
    level:0,
    title:'',
    selfGoods:[], // 自营的商品
    supplierGoods:[], // 供应商那个商品
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      orderType: options.type || 'normal',
      deliveryDate: options.delivery_date || ''
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let that = this;
    //判断登录
    app.signIsLogin(() => {
      let address = app.getSelectStore(); //当前选择的地址
      that.setData({
        address: address
      }, ()=>{
        that.getCoupon(); //获取优惠券
        this.getUserLevel()
      });
    });
    this.setData({
      loginUserInfo:app.globalData.loginUserInfo
    })
  },

   // 获取用户level
   getUserLevel(){
    let that = this;
    Http.get(Config.api.userVipSelf, {
    }, { handleError: false }).then((res) => {
      this.setData({
        discount:res.data.discount,
        level:res.data.level,
        title:res.data.title.substring(0,2)
      })
      console.log('res: ', res);
      
    });
  },

  //选择商品优惠券
  selectGoodsCoupon(){
    let { couponGoodsListData } = this.data;
    if(couponGoodsListData.length  > 0){
      wx.navigateTo({
        url: '/pages/coupon-select/coupon-select?type=goods'
      });
    }
  },
  // 选择运费优惠券
  selectDeliveryCoupon(){
  console.log('选择运费优惠券')
    let { couponDeliveryListData } = this.data;
    if(couponDeliveryListData.length  > 0){
      wx.navigateTo({
        url: '/pages/coupon-select/coupon-select?type=delivery'
      });
    }
  },
  
  //跳转页面
  skipPage(e){
    let page = e.currentTarget.dataset.page;
    wx.navigateTo({
      url: page
    });
  },

  //获取优惠券列表
  getCoupon(){
    let that = this;
    let { orderType, address } = that.data;
    
    //判断是预售或正常订单
    let shoppingCartData = wx.getStorageSync(orderType === 'presale' ? 'shoppingCartPresaleData' : 'shoppingCartData');

    if (shoppingCartData && shoppingCartData.length > 0) {
      let data = [];
      for (let i = 0; i < shoppingCartData.length; i++) {
        if (shoppingCartData[i].is_select) {
          data.push({
            id: shoppingCartData[i].id,
            "number": shoppingCartData[i].num,
            price: shoppingCartData[i].price
          });
        }
      }

      that.setData({
        orderAddData: {
          items: data
        }
      }, () => {
        Http.post(Config.api.orderCouponList, {
          store_id: address.id,
          items: data
        }, { throttle: false }).then((res)=>{
          let couponGoodsStorageSelectData = wx.getStorageSync('orderCouponGoodsSelectData');
          let couponDeliveryStorageSelectData = wx.getStorageSync('orderCouponDeliverySelectData');
          let couponGoodsSelectData = {}; // 选择的商品优惠券
          let couponDeliverySelectData = {}; // 选择的运费优惠券
          let rd = res.data;
          let couponGoodsUseData = rd.filter(item => item.is_usable && item.coupon.coupon_type != 'type_delivery'); //可用
          let couponDeliveryUseData = rd.filter(item => item.is_usable && item.coupon.coupon_type == 'type_delivery'); //可用
          //如果已选择商品优惠券
          if(typeof couponGoodsStorageSelectData === 'object'){
            if(couponGoodsStorageSelectData.id){
              //判断如果选择了优惠券
              if(couponGoodsUseData.filter(item => item.id === couponGoodsStorageSelectData.id).length > 0){
                couponGoodsSelectData = couponGoodsUseData.filter(item => item.id === couponGoodsStorageSelectData.id)[0];
              }else{
                couponGoodsSelectData = couponGoodsUseData.length > 0 ? couponGoodsUseData[0] : {};
              }
            }else{
               //如果选择不使用优惠券
              couponGoodsSelectData = {}
            }
          }else{
            //如刚进页面未有选择，自动选择最最优的
            couponGoodsSelectData = couponGoodsUseData.length > 0 ? couponGoodsUseData[0] : {};
          }

          //如果已选择运费优惠券
          if(typeof couponDeliveryStorageSelectData === 'object'){
            if(couponDeliveryStorageSelectData.id){
              //判断如果选择了优惠券
              if(couponDeliveryUseData.filter(item => item.id === couponDeliveryStorageSelectData.id).length > 0){
                couponDeliverySelectData = couponDeliveryUseData.filter(item => item.id === couponDeliveryStorageSelectData.id)[0];
              }else{
                couponDeliverySelectData = couponDeliveryUseData.length > 0 ? couponDeliveryUseData[0] : {};
              }
            }else{
               //如果选择不使用优惠券
              couponDeliverySelectData = {}
            }
          }else{
            //如刚进页面未有选择，自动选择最最优的
            couponDeliverySelectData = couponDeliveryUseData.length > 0 ? couponDeliveryUseData[0] : {};
          }

          wx.setStorageSync('orderCouponGoodsListData', rd.filter(item => item.coupon.coupon_type != 'type_delivery')); //所有商品优惠券
          wx.setStorageSync('orderCouponDeliveryListData', rd.filter(item => item.coupon.coupon_type == 'type_delivery')); //所有运费优惠券

          that.setData({
            couponGoodsListData: couponGoodsUseData, //只有可用的
            couponGoodsSelectData: couponGoodsSelectData,
            couponDeliveryListData: couponDeliveryUseData, //只有可用的
            couponDeliverySelectData: couponDeliverySelectData
          }, ()=>{
            that.orderPre(); //订单预生成
          });
        });
      });
    } else {
      that.setData({
        dataItem: {
          items: []
        },
        couponGoodsListData: [],
        couponDeliveryListData: [],
      });
    }
  },

  //预生成订单
  orderPre() {
    let that = this;
    let { address, orderType, deliveryDate, couponGoodsSelectData, couponDeliverySelectData,orderAddData } = that.data;
    wx.showNavigationBarLoading();
    wx.request({
      url: Config.api.orderPre,
      header: {
        'content-type': 'application/json',
        'Vesta-Custom-Access-Token': app.globalData.loginUserInfo.access_token
      },
      method: 'POST',
      data: {
        items: orderAddData.items,
        coupon_merchant_id: couponGoodsSelectData.id || '',
        delivery_coupon_id: couponDeliverySelectData.id || '',
        store_id: address.id || '',
        delivery_date: deliveryDate,
        is_presale: orderType === 'presale' ? true : false //是否预售订单
      },
      success: function(res) {
        console.log('res',res.data)
        // if(res.data.code != 0){
        //    wx.showModal({
        //     title:'提示',
        //     content:'商品价格有变动,请重新提交订单',
        //     showCancel:false,
        //     confirmColor: '#FDCA1F',
        //     success(res) {
        //       if (res.confirm) {
        //         wx.navigateBack()
        //       } 
        //     }
        //   });
          
        //   reutrn
        // }
        
        //共用提示
        let msgBox = (str, callback) => {
          wx.showModal({
            title: '提示',
            content: str,
            confirmText: '我知道了',
            confirmColor: '#00AE66',
            showCancel: false,
            success: function() {
              typeof callback === 'function' && callback();
            }
          });
        };

        /**
         * 101：非下单时间
         * 102：商户有欠款
         * 103：商品未报价
         * 104：商品未上架
         * 105：商品库存不足
         * 106：超过最大订货数
         */
        if (res.statusCode == 200 && res.data.code === 0) {
          let rd = res.data.data;
          let selfGoods = rd.items.filter(item => item.sale_type === '自营')
          let supplierGoods = rd.items.filter(item => item.sale_type === '平台')
          that.setData({
            dataItem: rd,
            showSkeleton: false,
            selfGoods,
            supplierGoods
          });
          /*===== 埋点 start ======*/
          app.gioActionRecordAdd('createOrder', {
            orderID_var: 0, //订单ID
            orderType_var: orderType === 'presale' ? '预售订单' : '正常订单', //订单类型
            productAmount_var: Util.returnPrice(rd.item_total_price), //商品金额
            quantity_var: rd.item_num, //商品数量
          });
          rd.items.forEach(item => {
            let tags = '';
            item.tags.forEach(tag => {
              tags = `${tags}${tags ? ',' : ''}[${tag}]`;
            });
            app.gioActionRecordAdd('createProductOrder', {
              orderID_var: rd.id, //订单ID
              productID_var: item.id, //商品ID
              productName: item.title, //商品名称
              primarySort_var: `一级类目ID${item.display_class_id || '0'}`, //一级类目
              productArea_var: tags, //商品专区
              productSpec_var: item.item_spec, //商品规格
              productAmount_var: Util.returnPrice(item.price_sale * item.number), //商品金额
              quantity_var: item.number, //商品数量
            });
          });
          /*===== 埋点 end ======*/
        } else if (res.statusCode == 200 && res.data.code == 101) {
          msgBox('现为非下单时间', ()=>{
            wx.navigateBack();
          });
        } else if (res.statusCode == 200 && res.data.code == 102) {
          msgBox('您商户下有欠款未付清，请付清后再下单', ()=>{
            wx.navigateTo({
              url: '/pages/order/order?type=wait_complete&from=cart'
            });
          });
        } else if (res.statusCode == 200 && res.data.code == 103) {
          msgBox('您所购买的商品有未报价，请在购物车移除或等待报价', ()=>{
            wx.navigateBack();
          });
        } else if (res.statusCode == 200 && res.data.code == 104) {
          msgBox('您所购买的商品有未上架，请在购物车移除', ()=>{
            wx.navigateBack();
          });
        } else if (res.statusCode == 200 && res.data.code == 105) {
          msgBox('您所购买的商品有库存不足，请在购物车修改购买数量', ()=>{
            wx.navigateBack();
          });
        } else if (res.statusCode == 200 && res.data.code == 106) {
          msgBox('您所购买的商品有超过最大订货数，请在购物车修改购买数量', ()=>{
            wx.navigateBack();
          });
        } else if (res.statusCode == 200 && res.data.code == 107) {
          msgBox('您所购买的商品有预售商品，请在购物车移除', ()=>{
            wx.navigateBack();
          });
        } else if (res.statusCode == 200 && res.data.code == 108) {
          msgBox('您所购买的商品有少于最小订货数，请在购物车修改购买数量', ()=>{
            wx.navigateBack();
          });
        } 
        else {
          app.requestResultCode(res); //处理异常
        }
      },
      complete: function(res) {
        wx.hideNavigationBarLoading();
        //判断是否网络超时
        app.requestTimeout(res, () => {
          that.orderPre();
        });
      }
    });
  },

  /**
   * 提交订单
   */
  submitOrder() {
    let that = this;
    let { orderAddData, dataItem, address, orderType, deliveryDate, couponGoodsSelectData,couponDeliverySelectData } = that.data;
    if (!address.id) {
      wx.showToast({
        title: '请选择门店地址',
        icon: 'none'
      });
      return false;
    }
    let d = {
      store_id: address.id,
      coupon_merchant_id: couponGoodsSelectData.id || '',
      delivery_coupon_id: couponDeliverySelectData.id || '',
      ...orderAddData,
      delivery_date: deliveryDate,
      is_presale: orderType === 'presale' ? true : false //是否预售订单
    };

    if (that.data.orderLoading) return;
    that.setData({
      orderLoading: true
    }, ()=>{
      Http.post(Config.api.orderAdd, d).then((res)=>{
        let rd = res.data;
        /*===== 埋点 start ======*/
        app.gioActionRecordAdd('sumitOrder', {
          orderID_var: rd.id, //订单ID
          orderType_var: orderType === 'presale' ? '预售订单' : '正常订单', //订单类型
          productAmount_var: Util.returnPrice(rd.item_total_price), //商品金额
          quantity_var: rd.item_num, //商品数量
        });
        dataItem.items.forEach(item => {
          let tags = '';
          item.tags.forEach(tag => {
            tags = `${tags}${tags ? ',' : ''}[${tag}]`;
          });
          app.gioActionRecordAdd('sumitProductOrder', {
            orderID_var: rd.id, //订单ID
            productID_var: item.id, //商品ID
            productName: item.title, //商品名称
            primarySort_var: `一级类目ID${item.display_class_id || '0'}`, //一级类目
            productArea_var: tags, //商品专区
            productSpec_var: item.item_spec, //商品规格
            productAmount_var: Util.returnPrice(item.price_sale * item.number), //商品金额
            quantity_var: item.number, //商品数量
          });
        });
        /*===== 埋点 end ======*/
        
        //下单成功，待支付。如果为协议客户
        if (rd.is_post_pay){
          // 如果已经超过授信额度
          if (rd.to_be_canceled) {
            that.setData({
              payWarning: ['您未支付的订单累计金额已超授信额度，需支付该订单！', '否则订单将在30分钟后取消']
            })
            that.orderPay(rd); //去支付
          } else {
            // 如果未超过授信额度
            that.clearShoppingCart(); //清除购买的购物车
            wx.redirectTo({
              url: '/pages/orderResult/orderResult?id=' + rd.id,
              complete: () => {
                that.setData({ orderLoading: false });
              }
            });
          }
        }else{
          that.orderPay(rd); //去支付
        }
      }).catch(()=>{
        that.setData({
          orderLoading: false
        });
      });
    });
  },

  //订单支付
  orderPay(rd) {
    let that = this;
    let { dataItem, orderType, couponGoodsSelectData,couponDeliverySelectData } = that.data;
    that.setData({
      payData: {
        order_id: rd.id,
        price: rd.order_price
      },
      isShowPay: true,
      payCallBack: function(res) {
        that.clearShoppingCart(); //清除购买的购物车
        if (res === 'success') {
          /*===== 埋点 start ======*/
          let coupon_var = '', couponType_var = '', promoteRule_var = '';
          if(couponGoodsSelectData.id && couponGoodsSelectData.coupon){
            let ct = Constant.COUPON_TYPE;
            coupon_var = couponGoodsSelectData.coupon.title;
            couponType_var = ct[couponGoodsSelectData.coupon.coupon_type];
            if(couponGoodsSelectData.coupon.coupon_type === 'type_reduction'){
              promoteRule_var = `￥${Util.returnPrice(couponGoodsSelectData.coupon.benefit)}`;
            }else if(couponGoodsSelectData.coupon.coupon_type === 'type_discount'){
              promoteRule_var = `${Util.returnDiscount(couponGoodsSelectData.coupon.benefit)}折`;
            }else{
              promoteRule_var = `送${couponGoodsSelectData.coupon.benefit}件`;
            }
          }
          app.gioActionRecordAdd('payOrderSuccess', {
            orderID_var: rd.id, //订单ID
            orderType_var: orderType === 'presale' ? '预售订单' : '正常订单', //订单类型
            productAmount_var: Util.returnPrice(rd.item_total_price), //商品金额
            quantity_var: rd.item_num, //商品数量
            payAmount_var: Util.returnPrice(rd.order_price), //实际支付金额
            coupon_var: coupon_var, //优惠券名称
            couponType_var: couponType_var, //优惠券类型
            promoteRule_var: promoteRule_var, //促销规则
          });
          dataItem.items.forEach(item => {
            let tags = '';
            item.tags.forEach(tag => {
              tags = `${tags}${tags ? ',' : ''}[${tag}]`;
            });
            app.gioActionRecordAdd('payProductSuccess', {
              orderID_var: rd.id, //订单ID
              productID_var: item.id, //商品ID
              productName: item.title, //商品名称
              primarySort_var: `一级类目ID${item.display_class_id || '0'}`, //一级类目
              productArea_var: tags, //商品专区
              productSpec_var: item.item_spec, //商品规格
              productAmount_var: Util.returnPrice(item.price_sale * item.number), //商品金额
              quantity_var: item.number, //商品数量
            });
          });
          /*===== 埋点 end ======*/
          wx.redirectTo({
            url: `/pages/payResult/payResult?id=${rd.id}&source=orderAdd`,
            complete: () => {
              that.setData({
                isShowPay: false,
                orderLoading: false
              });
            }
          });
        } else {
          wx.redirectTo({
            url: '/pages/orderDetail/orderDetail?id=' + rd.id,
            complete: () => {
              that.setData({
                isShowPay: false,
                orderLoading: false
              });
            }
          });
        }
      },
    });
  },

  //清除购买的购物车
  clearShoppingCart() {
    let { orderType } = this.data;
    if(orderType === 'presale'){
      wx.setStorageSync('shoppingCartPresaleData', []);
    }else{
      let d = wx.getStorageSync('shoppingCartData');
      //更新本地存储
      for (let i = 0; i < d.length; i++) {
        if (d[i].is_select) {
          d.remove(i);
          i--;
        }
      }
      wx.setStorageSync('shoppingCartData', d);
    }
  },

  //页面卸载时
  onUnload: function() {
    wx.removeStorageSync('orderCouponGoodsListData');
    wx.removeStorageSync('orderCouponGoodsSelectData');
    wx.removeStorageSync('orderCouponDeliveryListData');
    wx.removeStorageSync('orderCouponDeliverySelectData');
  },
  showFreight(){
    this.setData({
      showFreight:true
    })
  },
  onFreightClose(){
    this.setData({
      showFreight:false
    })
  }
})
