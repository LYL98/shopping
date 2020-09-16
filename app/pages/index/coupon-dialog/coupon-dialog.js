// pages/index/coupon-dialog/coupon-dialog.js
import { Http, Config } from './../../../utils/index';
const app = getApp();

Component({

	externalClasses: ['custom-class'],

	options: {
		addGlobalClass: true
	},

	properties: {
		storeId: {
			type: String | Number,
			value: ''
		},
		provinceCode: {
			type: String | Number,
			value: ''
		}
	},

	
	data: {
		isShow: false,
		coupons: [],
	},

	// 监听
	observers: {
    //数据
    storeId(a){
      if(this.storeId !== a){
        this.getNewCoupon();
        this.storeId = a;
      }
    }
  },

	lifetimes: {
    // attached(){
    //   this.storeId = '';
    // },
	},
	pageLifetimes: {
		show() {
			if(this.storeId) {
				console.log('1231231232131');
				this.getNewCoupon();
			}
		}
	},

	methods: {
		getNewCoupon() {
			let that = this
			Http.get(Config.api.queryCoupon, {
				store_id: this.properties.storeId,
				province_code: this.properties.provinceCode
      }, {
        handleError: false
      }).then(res => {
				let rd = res.data || [];
        if(rd.length > 0){
          that.setData({
            coupons: rd,
            isShow: rd.length > 0 ? true : false
          });
          // that.triggerEvent('toggle', true);
        }
      })
		},
		
		closeCouponDialog() {
			this.setData({ isShow: false });
			// this.triggerEvent('closeCouponDilog');
		},

		toMyCouponPage() {
			// this.triggerEvent('closeCouponDilog');
			this.setData({ isShow: false });
			wx.navigateTo({
				url: '/pages/coupon-mine/coupon-mine',
			})
		}
	}
});
