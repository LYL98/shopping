// pages/my/my.js
//获取应用实例
const app = getApp();
import { Config, Http, Constant } from './../../utils/index';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tencentPath: Config.tencentPath,
    defaultSrc: './../../assets/img/default_avatar.png',
    myMessageSrc: './../../assets/img/my_message.png',
    myBalanceSrc: './../../assets/img/my_balance.png',
    myCouponSrc: './../../assets/img/my_coupon.png',
    optionSrc: [
      './../../assets/img/order.png',
      './../../assets/img/info.png',
      './../../assets/img/merchant.png',
      './../../assets/img/address.png',
      './../../assets/img/after_sale.png',
      './../../assets/img/customer_manager.png',
      './../../assets/img/complain.png',
      './../../assets/img/group_buy.png',
      './../../assets/img/tags_icon7.png',
      './../../assets/img/icon_suggestions.png',
      './../../assets/img/return_qrcode.png'
    ],
    has_unread:'',
    initLoad: true,
    arrow:'./../../assets/img/right.png',
    myInfo: {
      realname: '用户姓名',
      merchant: {
        title: '商户名称',
        is_post_pay: true,
        outer_tags: ['诚信','可靠','结算快'],
        grade: {}
      }
    },
    myOrderList:[
      {
        img:'./../../assets/img/account_unpay.png',
        title:'未付清',
        url:'/pages/order/order?type=wait_complete'
      },
      {
        img:'./../../assets/img/account_unaffirm.png',
        title:'待确定',
        url:'/pages/order/order?type=wait_confirm'
      },
      {
        img:'./../../assets/img/account_unsend.png',
        title:'待发货',
        url:'/pages/order/order?type=wait_delivery'
      },
      {
        img:'./../../assets/img/account_deliveried.png',
        title:'待收货',
        url:'/pages/order/order?type=deliveried'
      },
      {
        img:'./../../assets/img/account_resolve.png',
        title:'已完成',
        url:'/pages/order/order?type=order_done'
      }
    ],
    detail: {
      images: ''
    },
    showSkeleton: true,
    messageUnreadNum: 0, // 消息未读数量
    loginInfo: {}, //登录用户信息
    version: Config.version, //app版本
  },
  onLoad(option) {
    this.address = {}; //当前选择地址
    let { avatar } = option
    if (avatar) {
      this.setData({
        ["detail.images"]: avatar
      })
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.shoppingCartNum();
    this.address = app.getSelectStore(); //当前选择地址
    //判断登录
    app.signIsLogin((res) => {
      this.setData({
        loginInfo: res
      });
      this.profile();//获取用户信息
      this.afterMsg();
      this.messageInfo(); // 获取未读消息数量
    });
  },
  //点击页面底下的tab
  onTabItemTap(e){
    /*===== 埋点 start ======*/
    app.gioActionRecordAdd('tabbar', { tabType_var: '我的' });
    /*===== 埋点 end ======*/
  },
  //点击我的收藏
  clickMyCollect(){
    /*===== 埋点 start ======*/
    app.gioActionRecordAdd('firstBuyEntrance_evar', '我的');
    app.gioActionRecordAdd('secBuyEntrance_evar', '我的收藏');
    /*===== 埋点 end ======*/
  },
  //获取是否有售后信息
  afterMsg: function() {
    let that = this;
    wx.request({
      url: Config.api.afterMsg,
      header: {
        'content-type': 'application/json',
        'Vesta-Custom-Access-Token': app.globalData.loginUserInfo.access_token
      },
      success: function (res) {
        if (res.statusCode == 200 && res.data.code == 0) {
          let rd = res.data.data;
          that.setData({
            has_unread: rd
          });
        } else {
          app.requestResultCode(res); //处理异常
        }
      },
      complete: function (res) {
        //判断是否网络超时
        app.requestTimeout(res, () => {
          that.afterMsg();
        });
      }
    });
  },
  clickPic() {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        let tempFilePaths = res.tempFilePaths;
        wx.navigateTo({
          url: `/pages/avatar/index?src=${tempFilePaths[0]}`
        })
      }
    });
  },

  clickInfo() {
    let detail = JSON.stringify(this.data.myInfo);
    wx.navigateTo({
      url: "/pages/myDetail/myDetail"
          + "?detail=" + encodeURIComponent(detail)
    })
  },
 
  //获取用户信息
  profile(){
    let that = this;
    let { initLoad } = that.data;
    if (initLoad){
      wx.showNavigationBarLoading();
    }
    wx.request({
      url: Config.api.profile,
      header: {
        'content-type': 'application/json',
        'Vesta-Custom-Access-Token': app.globalData.loginUserInfo.access_token
      },
      data: {
        store_id: this.address.id
      },
      success: function (res) {
        if (res.statusCode == 200 && res.data.code == 0) {
          let rd = res.data.data;
          that.setData({
            myInfo: rd
          });
        } else {
          app.requestResultCode(res); //处理异常
        }
      },
      complete: function (res) {
        that.setData({ initLoad: false, showSkeleton: false });
        wx.hideNavigationBarLoading();
        //判断是否网络超时
        app.requestTimeout(res, () => {
          that.profile();
        });
      }
    });
  },

  messageInfo() {
    let that = this;
    wx.request({
      url: Config.api.messageInfo,
      header: {
        'content-type': 'application/json',
        'Vesta-Custom-Access-Token': app.globalData.loginUserInfo.access_token
      },
      success: function (res) {
        if (res.statusCode == 200 && res.data.code == 0) {
          let rd = res.data.data;
          that.setData({
            messageUnreadNum: rd.unread_num
          }, () => {

          });
        } else {
          app.requestResultCode(res); //处理异常
        }
      },
      complete: function (res) {
        //判断是否网络超时
        app.requestTimeout(res, () => {
          that.messageInfo();
        });
      }
    });
  },

  // 打开消息列表
  showMessage() {
    wx.navigateTo({
      url: '/pages/myMessage/myMessage'
    })
  },

  //打开门店助手
  openMiniApp(){
    const { access_token } = this.data.loginInfo
    wx.navigateToMiniProgram({
      appId: Config.weiXinAppIds[1],
      path: '/pages/index/index',
      envVersion: 'trial'
    });
  }
})