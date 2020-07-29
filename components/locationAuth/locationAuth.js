import { Util } from './../../utils/index';
const sysInfo = wx.getSystemInfoSync();
let systemAuthMsg =
	sysInfo.system.indexOf('Android') !== -1
		? '无法获取定位信息，请在手机应用权限管理中打开微信的定位权限'
    : '您未授权微信获取定位，请到iphone的「设置」-「应用」-「微信」-「打开定位」';

Component({

  properties: {
		openMap: {
			type: Boolean,
			value: true
			},
			showText: {
				type: Boolean,
				value: true
		},
		itemIndex: {
			type: Number,
			value: -1,
		},
		isLimitTime: {
			type: Boolean,
			value: false
		}

  },

  data: {
    location: {
      lat:'',
      lng:'',
    }
  },

  methods: {
    // 打开授权设置页后回调
		openSettingCallback(e) {
			let locationAuth = e.detail.authSetting['scope.userLocation'];
			if (locationAuth) {
				// 重新获取用户的位置
				this.initLocation(true);
			}
    },
    // 地址更新
  switchAddress() {
	  const { location } = this.data
		const { lat, lng } = location;
		wx.chooseLocation({
			latitude: lat,
			longitude: lng,
			success: (res) => {
				console.log(res);
				if (res.errMsg === 'chooseLocation:ok') {
					console.log(res)
					const { latitude, longitude, address, name } = res;
					this.triggerEvent('getlocation', {
						lat: latitude,
						lng: longitude,
						address,
					})
				}
			}
		});
  },

    // 自动定位 获取经纬度
    initLocation(notSystemAuthMsg = false) {

		if(this.data.isLimitTime) {
			if(!Util.returnIsInTimeBucket(new Date(), 9, 30, 22, 30)) {
        wx.showToast({ title: '只允许早上9:30到晚上10:30期间修改定位信息', icon: 'none' });
        return
      }
		}
		
	  let that = this
      wx.getLocation({
				type: 'gcj02', //wgs84
				success: function(res){
					const { latitude, longitude } = res;
          			that.data.location = {lat: latitude, lng: longitude}
          			that.setData({ showLocationAuthDialog: false });
					console.log(that)
					if(that.data.openMap) {
						that.switchAddress()
					} else {
						that.triggerEvent('getlocation', {
							...that.data.location,
							itemIndex: that.data.itemIndex
						})
					}
					return;
				},
				fail: (res) => {
					console.log('wx.getLocation fail 的 res');
					console.log(res);
					// 显示授权弹窗
					this.setData({ showLocationAuthDialog: true });
					wx.getSetting({
						complete: (res) => {
							console.log('wx.getSetting complete 的 res');
							console.log(res);
							if (!res.authSetting['scope.userLocation']) {
								//  用户未给小程序授权地理位置
								this.setData({ showSystemLocationAuth: false });
							} else {
								this.setData({ showSystemLocationAuth: true });
								//  手机系统定位未开启
								if (!notSystemAuthMsg) {
									wx.showModal({
										content: systemAuthMsg,
										confirmText: '好的',
										confirmColor: '#00AE66',
										showCancel: false
									});
                				}
							}
						}
					});
				}
			});
    }
  },
  
})
