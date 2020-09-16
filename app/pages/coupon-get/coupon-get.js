// pages/coupon-get/coupon-get.js
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

    api: Config.api.availableAllCoupon,
    goods_id: '',
    store_id: '',
    province_code: '',
  },

  onLoad: function (options) {

    let store = app.getSelectStore()
    this.data.store_id = store.id
    this.data.province_code = store.province_code

    if(options.goods_id) {
      this.data.goods_id = goods_id;
      this.data.api = Config.api.availableCoupon
    }

    this.getCoupons()

  },

  getCoupons() {
    const { query, coupons, api, goods_id, store_id, province_code } = this.data;
    wx.showNavigationBarLoading();
    let goodsQueryParams = goods_id ? {
        item_id: goods_id,
        store_id: store_id,
      } : {};

    Http.get(api, {
      ...query,
      ...goodsQueryParams,
      province_code: province_code
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

	// 处理立即领取回调
	handleReceiveCouponCB(e) {
		const { id, is_receive, itemIndex } = e.detail;
		let tempKey = `coupons.items[${itemIndex}].is_receive`;
		this.setData({
			[tempKey]: is_receive
		});
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})