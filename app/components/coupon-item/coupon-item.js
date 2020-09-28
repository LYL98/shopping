// components/coupon-item/coupon-item.js
import { Config, Constant, Http, Util  } from './../../utils/index';

const app = getApp()

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
      const { activity_id, id } = this.data.itemData;
      const { itemIndex } = this.data;
      let that = this;
      Http.post(Config.api.getCoupon, {
        id: activity_id,
        store_id: app.getSelectStore().id
      }).then(function (res) {
        const { is_receive } = res.data || {};
				wx.showToast({
					title: '领取成功',
					icon: 'none'
				});
				// 箭头函数内 会导致 分函数无法被编译器识别
				that.triggerEvent('handleReceiveCoupon', {
					id,
					itemIndex,
					is_receive
				});
      })
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
