// pages/orderDetail/orderDetail.js
//获取应用实例
const app = getApp();
import config from './../../utils/config';
import constant from './../../utils/constant';
import util from './../../utils/util';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    tencentPath: config.tencentPath,
    leaveMsgSrc: './../../assets/img/leave_msg.png',
    orderStatus: constant.ORDER_STATUS,
    payType: constant.PAY_TYPE,
    priceChange: constant.PRICE_CHANGE,
    arrow:true,
    iconUpSrc:'./../../assets/img/up.png',
    iconDownSrc:'./../../assets/img/down.png',
    id: 0,
    isShowMoreExpress: false,
    isShowPayRecord: false,
    isShowLogRecord: false,
    detail: {
      items: (() => {
        //初始化骨架数据
        let items = [];
        for (let i = 0; i < 3; i++) {
          let d = {
            code: '123456',
            frame_code: '20',
            gross_weight: 123,
            id: i + 1,
            images: [],
            is_quoted: false,
            item_spec: '123',
            item_stock: 123,
            origin_place: '123',
            package_spec: '123',
            price_sale: 123,
            price_sale_piece: 123,
            sale_unit: '件',
            title: 'xxxxxxxx',
            item_attrs: ['xxx', 'xxx', 'xxx', 'xxx', 'xxx'],
            count_real: 20,
            amount_real: 0,
            amount_pre: 0,

          };
          items.push(d);
        }
        return items;
      })(),
      price_log: [],
      pay_record: [],
      action_log: [],
      address: 'xxxxxxxxxxxxxxx',
      delivery_fee: 0,
      delivery_fee_chg: 0,
      order_price: 0,
      price_at_created: 0,
      amount_pay: 0,
      code: '00000000000000',
      created: '0000-00-00 00:00:00',
      id: 0,
      is_post_pay: true,
      linkman: 'XXX',
      pay_status: 'done',
      phone: '01234567890',
      remain_pay: 0,
      status: 'order_done',
      store_title: 'xxxxxxxxxxxxxxx'
    },
    reasonPrice:{
      short: '缺货',
      weight_up: '实重上升',
      weight_down: '实重下降',
      update_amount: '手动改价',
    },
    imgStatus:{
      wait_confirm:'./../../assets/img/wait_status.png',
      wait_pay:'./../../assets/img/wait_pay.png', 
      confirmed:'./../../assets/img/send_status.png',
        assigned:'./../../assets/img/send_status.png',
      wait_delivery:'./../../assets/img/send_status.png',
      deliveried: './../../assets/img/deliveried.png',
      received:'./../../assets/img/done_status.png',
      order_done:'./../../assets/img/done_status.png',
      order_canceled:'./../../assets/img/cancel_status.png',
    },
    strStatus:{
      wait_confirm: {
        title: '订单待确认',
        content: '订单等待被卖家确认，请您稍等'
      },
      wait_pay: {
        title: '订单待支付',
        content: 'xx秒后订单自动取消'
      },
      confirmed: {
        title: '订单待发货',
        content: '订单等待发货，请您耐心等候'
      },
      assigned: {
        title: '订单待发货',
        content: '订单等待发货，请您耐心等候'
      },
      wait_delivery: {
        title: '订单待发货',
        content: '订单等待发货，请您耐心等候'
      },
      deliveried: {
        title: '订单待收货',
        content: '订单已发货，即将送达您手中'
      },
      received: {
        title: '订单已完成',
        content: '订单已完成，期待您下次购买'
      },
      order_done: {
        title: '订单已完成',
        content: '订单已完成，期待您下次购买'
      },
      order_canceled: {
        title: '订单已取消',
        content: '订单被取消，期待您下次惠顾'
      },
    },
    isShowPay: false, //是否显示支付
    payData: {}, //支付数据
    payCallBack: null, //支付回调
    refund: constant.ORDER_REFUND,
    orderAction:{
      order: '下单',
      pay: '付款',
      confirm: '确认',
      delivery: '发货',
      cancel: '取消',
    },
    countDownStr: '--分--秒后自动取消订单', //倒计时
    showSkeleton: true, //骨架屏
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    //判断登录
    app.signIsLogin(() => {
      let id = that.options.id;
      that.setData({
        id: id,
        system: app.globalData.system
      }, () => {
        that.getOrderDetail();
      });
    });
  },

  //页面卸载时触发
  onUnload() {
    app.shoppingCartNum();//计算购物车数量并显示角标
  },
  showArrow(e) {
    let index = e.currentTarget.dataset.index;
    let {items} = this.data.detail;
    items[index].arrow = !items[index].arrow;
    this.setData({
      detail: this.data.detail
    })
  },
  showHideMoreExpress() {
    this.setData({
      isShowMoreExpress: !this.data.isShowMoreExpress
    })
  },
  //显示或隐藏付款历史
  showHidePayRecord(){
    let d = this.data.isShowPayRecord;
    this.setData({
      isShowPayRecord: !d
    });
  },
  //显示或隐藏退款历史
  showHideLogRecord(){
    let d = this.data.isShowLogRecord;
    this.setData({
      isShowLogRecord: !d
    });
  },
  //再次下单
  againOrder() {
    let that = this;
    wx.showModal({
      title: '提示',
      content: '确定再次下单？订单的商品将自动加入购物车。',
      confirmColor: '#00AE66',
      success: function (res) {
        if (res.confirm) {
          let { detail } = that.data;

          let data = wx.getStorageSync('shoppingCartData') || [];
          if (data.length > 0) {
            for (let i = 0; i < data.length; i++) {
              for (let j = 0; j < detail.items.length; j++) {
                if (detail.items[j].item_id === data[i].id) {
                  data.remove(i);
                  i--;
                  break;
                }
                if (j === detail.items.length - 1) {
                  data[i].is_select = false;
                }
              }
            }
          }
          for (let d = 0; d < detail.items.length; d++) {
            //不是赠品的
            if(!detail.items[d].is_gift){
              data.unshift({
                id: detail.items[d].item_id,
                is_select: true,
                num: detail.items[d].count_real
              });
            }
          }

          wx.setStorageSync('shoppingCartData', data);

          wx.switchTab({
            url: '/pages/shoppingCart/shoppingCart'
          });
          app.shoppingCartNum();//计算购物车数量并显示角标
        }
      }
    })
  },

  //获取订单详情
  getOrderDetail(){
    let that = this;
    let { id } = that.data;
    wx.showNavigationBarLoading();
    wx.request({
      url: config.api.orderDetail,
      header: {
        'content-type': 'application/json',
        'Durian-Custom-Access-Token': app.globalData.loginUserInfo.access_token
      },
      data: {
        id: id
      },
      success: function (res) {
        if (res.statusCode == 200 && res.data.code == 0) {
          let rd = res.data.data;
          rd.items.map( function (ele, index, arr) {
            ele.arrow = true;
          });
          that.setData({
            detail: rd,
            showSkeleton: false
          });
          //如果不是协议客户，且支付为0
          if (rd.status === 'wait_confirm' && (!rd.is_post_pay || rd.to_be_canceled) && rd.amount_pay === 0){
            that.countDown(rd); //倒计时
          }
        } else {
          app.requestResultCode(res); //处理异常
        }
      },
      complete: function (res) {
        wx.hideNavigationBarLoading();
        //判断是否网络超时
        app.requestTimeout(res, () => {
          that.getOrderDetail();
        });
      }
    });
  },
  //倒计时
  countDown(rd){
    let that = this;
    let cTime = rd.created;
    //结束时间
    let endDate = new Date(cTime.replace(/-/g, '/'));
    let d = util.returnDateStr(new Date(endDate.getTime() + 10000 * 60)); //创建10分钟后
    let time = setInterval(()=>{
      let data = util.returnSurplusNum(d); //返回剩余时间
      let minutes = data.minutes; //分
      let seconds = data.seconds; //秒
      if(minutes < 0 || seconds < 0){
        that.setData({
          countDownStr: '即将自动取消订单'
        });
        clearInterval(time);
        that.getOrderDetail(); //重新获取详情
      }else{
        that.setData({
          countDownStr: `${minutes}分${seconds}秒后自动取消订单`
        });
      }
      if (minutes === 0 && seconds === 0){
        clearInterval(time);
        that.getOrderDetail(); //重新获取详情
      }
    }, 1000);
  },
  //取消订单
  cancelOrder(){
    let that = this;
    wx.showModal({
      title: '提示',
      content: '您确定取消订单？',
      confirmColor: '#00AE66',
      success: function (res) {
        if (res.confirm) {
          let { id } = that.data;
          that.setData({ loading: true });
          wx.request({
            url: config.api.orderCancel,
            header: {
              'content-type': 'application/json',
              'Durian-Custom-Access-Token': app.globalData.loginUserInfo.access_token
            },
            method: 'POST',
            data: {
              id: id
            },
            success: function (res) {
              if (res.statusCode == 200 && res.data.code == 0) {
                that.getOrderDetail();//重新获取详情
                wx.showToast({
                  title: '订单已取消',
                  icon: 'none'
                });
              } else {
                app.requestResultCode(res); //处理异常
              }
            },
            complete: function (res) {
              that.setData({ loading: false });
              //判断是否网络超时
              app.requestTimeout(res, () => {
                that.cancelOrder();
              });
            }
          });
        }
      }
    });
  },
  //订单支付
  orderPay() {
    let that = this;
    let { id, detail } = that.data;
    that.setData({
      payData: {
        order_id: id,
        price: detail.remain_pay
      },
      payCallBack: function (res) {
        that.setData({
          isShowPay: false
        });
        if (res === 'success') {
          wx.navigateTo({
            url: `/pages/payResult/payResult?id=${id}&source=orderDetail`
          });
        }
      },
      isShowPay: true
    });
  },

  confirmReceive() {

    let that = this;
    let { id } = that.data.detail;
    if (!id) {
      return;
    }

    wx.showModal({
      title: '提示',
      content: '请确认是否收到商品？',
      confirmColor: '#00AE66',
      success: function (res) {
        if (res.confirm) {
          that.setData({ loading: true });
          wx.request({
            url: config.api.orderConfirmReceive,
            header: {
              'content-type': 'application/json',
              'Durian-Custom-Access-Token': app.globalData.loginUserInfo.access_token
            },
            method: 'POST',
            data: {
              id: id
            },
            success: function (res) {
              if (res.statusCode == 200 && res.data.code == 0) {
                that.getOrderDetail();//重新获取详情
                wx.showToast({
                  title: '订单已确认收货',
                  icon: 'none'
                });
              } else {
                app.requestResultCode(res); //处理异常
              }
            },
            complete: function (res) {
              that.setData({ loading: false });
              //判断是否网络超时
              app.requestTimeout(res, () => {
                that.confirmReceive();
              });
            }
          });
        }
      }
    });

  },

})