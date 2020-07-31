// pages/myMessage/myMessage.js

const app = getApp();
import util from "../../utils/util";
import config from "../../utils/config";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    initLoad: true,
    showSkeleton: true,
    query: {
      page: 1,
      page_size: 20
    },
    msgTypes: {
      //优惠券发放
      dis_coupon: {
        icon: './../../assets/img/icon_coupon.png',
        url: '/pages/coupon/coupon'
      },
      //全场满减活动开始
      all_reduction_start: {
        icon: './../../assets/img/icon_promotion.png',
        url: '/pages/itemList/itemList'
      },
      //全场满折活动开始
      all_discount_start: {
        icon: './../../assets/img/icon_promotion.png',
        url: '/pages/itemList/itemList'
      },
      //单品满折活动开始
      single_discount_start: {
        icon: './../../assets/img/icon_promotion.png',
        url: '/pages/itemList/itemList'
      },
      //团购活动创建
      groupbuy_create: {
        icon: './../../assets/img/icon_item_add.png',
        url: '/pages/order/order'
      },
      //团购活动成功
      groupbuy_success: {
        icon: './../../assets/img/icon_success_info.png',
        url: '/pages/order/order'
      }, 
      //团购收益到账
      groupbuy_profit: {
        icon: './../../assets/img/icon_group_earnings.png',
        url: '/pages/account/account'
      }, 
    },
    // 请求到的消息分页数据
    listItem: {
      num: 0,
      items: []
    },

    // 将请求到的列表，进行日期排序，分类为 最新消息列表 和 两周前的消息列表
    // 用户下拉加载时，将查询到的消息，进行判断，如果第一条消息，
    newMessageList: [],
    previousMessageList: []
  },

  /**
   * 生命周期函数
   */
  onLoad: function (options) {
    //判断登录
    app.signIsLogin(() => {
      this.messageQuery();
    });
  },

  onShow: function () {
    
  },

  dateDiff(sDate1, sDate2) {  //sDate1和sDate2是yyyy-MM-dd格式
    return parseInt(Math.abs(new Date(sDate1) - new Date(sDate2)) / 1000 / 60 / 60 / 24); //把相差的毫秒数转换为天数
  },

  messageAssort(listItem) {

    // 获取 yyyy-MM-dd格式的当前时间
    let currentDate = util.returnDateFormat(util.returnDateStr(new Date()), 'yyyy-MM-dd');

    let newMessageList = this.data.newMessageList;
    let previousMessageList = this.data.previousMessageList;

    listItem.items.forEach(item => {
      if (this.dateDiff(util.returnDateFormat(item.created, 'yyyy-MM-dd'), currentDate) <= 14) {
        newMessageList.push(item);
      } else {
        previousMessageList.push(item);
      }
    });

    this.setData({
      newMessageList: newMessageList,
      previousMessageList: previousMessageList
    });

  },

  messageQuery() {
    let that = this;
    let { initLoad, query } = that.data;
    if (initLoad){
      wx.showNavigationBarLoading();
    }
    wx.request({
      url: config.api.messageQuery,
      header: {
        'content-type': 'application/json',
        'Vesta-Custom-Access-Token': app.globalData.loginUserInfo.access_token
      },
      method: 'GET',
      data: query,
      success: function (res) {
        if (res.statusCode == 200 && res.data.code == 0) {
          that.setData({
            listItem: res.data.data
          })
          that.messageAssort(res.data.data);
        } else {
          app.requestResultCode(res); //处理异常
        }
      },
      complete: function (res) {
        that.setData({ initLoad: false, showSkeleton: false });
        wx.hideNavigationBarLoading();
        //判断是否网络超时
        app.requestTimeout(res, () => {
          that.messageQuery();
        });
      }
    });

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let that = this;
    let {query, listItem} = that.data;
    if (listItem.num / query.page_size > query.page) {
      //如果没有到达最后一页，加载数据
      query.page = query.page + 1;
      that.setData({
        query: query
      }, () => {
        that.messageQuery();
      });
    }
  },

})