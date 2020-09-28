// pages/coupon-mine/coupon-mine.js
import { Config, Constant, Http, Util } from './../../utils/index';

const app = getApp();

Page({

  data: {
    activeIndex: 0,
		couponStatusLabels: ['未使用', '已使用', '已失效'],
		couponStatusIndexObj: { 0: 'unused', 1: 'used', 2: 'expired' },
		query: {
      store_id: '',
			status: 'unused',
			page: 1,
      page_size: Constant.PAGE_SIZE,
		},
		coupons: {
			items: [],
			num: 0
		},
		isFirstIn: true
  },

  onLoad: function (options) {
    let nowDateTime = Util.returnDateStr(); //返回今日日期时间
    this.nowDate = Util.returnDateFormat(nowDateTime, 'yyyy-MM-dd'); //今日日期
    
    let store = app.getSelectStore()
    this.data.query.store_id = store.id
    this.getCoupons()
  },
  
  clickTab(e) {
		const { index } = e.detail;
		const { couponStatusIndexObj, query } = this.data;
		query.page = 1;
		query.status = couponStatusIndexObj[index];
		this.setData(
			{
        query,
        coupons: {
          items: [],
          num: 0
        },
        isFirstIn: true
			},
			() => {
				this.getCoupons();
			}
		);
	},

  getCoupons() {
    const { query, coupons } = this.data;
    wx.showNavigationBarLoading();
    Http.get(Config.api.myCoupon, {
      ...query
    }).then(res => {
      let rd = res.data
      // 即将过期处理
      if(query.status == 'unused'){
        (rd.items || []).forEach((item) => {
          let difDate = Util.dateDifference(this.nowDate, item.expire_date);
          if (difDate < 0 || difDate > 2) {
            item.beWillExpired = false;
          } else {
            item.beWillExpired = true;
          }
        });
      }

      if (query.page === 1) {
        this.setData({
          coupons: rd,
          isFirstIn: false
        });
      } else {
        coupons.items = [...coupons.items, ...rd.items];
        this.setData({
          coupons,
          isFirstIn: false
        });
      }
      wx.hideNavigationBarLoading();
    }).catch(err => {
      wx.hideNavigationBarLoading();
    })
  },

  onReachBottom: function () {
		const { query, coupons } = this.data;
		if (coupons.num / query.page_size > query.page) {
			query.page = query.page + 1;
			this.setData(
				{
					query: query
				},
				() => {
					this.getCoupons();
				}
			);
		}
  },

})