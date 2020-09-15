// components/coupon-item/coupon-item.js
Component({

  properties: {
    // 
    status: {
      type: String,
      value: ''
    },
    // 当前所在页面
    currentPage: {
			type: String,
			value: 'coupon-mine'
		},
    itemIndex: {
			type: Number,
			value: 0
		},
    itemData: {
			type: Object,
			value: {}
		},
  },

  options: {
		addGlobalClass: true
  },
  
  externalClasses: ['custom-class'],

  data: {
    isExpand: false,

  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 展开优惠券
    expandHandle() {
			this.setData({
				isExpand: !this.data.isExpand
			});
    },

    // 领取优惠券
    receiveCoupon() {

    },

    // 点击优惠券（选择）
    tapCoupon() {
      const { itemIndex } = this.data
      this.triggerEvent('handleCouponSelect', {
        itemIndex
      });
    },

  }
})
