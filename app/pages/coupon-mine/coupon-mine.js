// pages/coupon-mine/coupon-mine.js
import { Config, Constant, Util } from './../../utils/index';

Page({

  data: {
    activeIndex: 0,
		couponStatusLabels: ['未使用', '已使用', '已失效'],
		couponStatusIndexObj: { 0: 'unused', 1: 'used', 2: 'expired' },
		query: {
			status: 'unused',
			page: 1,
			page_size: Constant.PAGE_SIZE
		},
		coupons: {
			items: [],
			num: 0
		},
		isFirstIn: true
  },

  onLoad: function (options) {

  },


  onShow: function () {

  },


  onPullDownRefresh: function () {

  },

  onReachBottom: function () {

  },

  onShareAppMessage: function () {

  }
})