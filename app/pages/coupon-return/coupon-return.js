// pages/coupon-return/coupon-return.js
import { Config, Constant, Http, Util } from './../../utils/index';

const app = getApp();

Page({

  data: {
    query: {
			page: 1,
			page_size: Constant.PAGE_SIZE
		},
		isFirstIn: true,
		coupons: {
			items: [],
			num: 0
    },
    province_code: '',
  },

  onLoad: function (options) {
    let store = app.getSelectStore()
    this.data.province_code = store.province_code
    this.data.store_id = store.id

    this.getCouponDetailList()
  },


  onShow: function () {
  },

  getCouponDetailList() {
    const { query, coupons, province_code, store_id } = this.data;
    wx.showNavigationBarLoading();
    
    Http.get(Config.api.availableAllCoupon, {
      ...query,
      province_code,
      store_id,
      grant_way: 'auto', //自动发放
    }).then(res => {
      let rd = res.data || {items:[], num: 0 }
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