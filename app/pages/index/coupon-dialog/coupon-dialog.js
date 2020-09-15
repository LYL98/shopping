// pages/index/coupon-dialog/coupon-dialog.js
Component({
	properties: {
		coupons: {
			type: Array,
			value: []
		}
	},

	externalClasses: ['custom-class'],

	options: {
		addGlobalClass: true
	},

	data: {},

	methods: {
		closeCouponDialog() {
			this.triggerEvent('closeCouponDilog');
		},

		toMyCouponPage() {
			this.triggerEvent('closeCouponDilog');
			wx.navigateTo({
				url: '/pages/coupon-mine/coupon-mine',
			})
		}
	}
});
