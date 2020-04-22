const app = getApp();
import { Config, Http } from './../../utils/index';

Component({
	options: {
		addGlobalClass: true
	},
	properties: {
		fromPage: { type: String, value: 'login' }, //来自页面 login
	},
	data: {
		loading: false,
		myInfo: {}
	},
	// 组件所在页面的生命周期函数
	pageLifetimes: {
		show() {
			//初始化
			this.loginRes = {};
			let myInfo = app.globalData.loginUserInfo;
			this.setData({
				myInfo: myInfo
			});
			//如果没有手机号
			if (!myInfo.phone) {
				this.getLoginCode();
			}
		},
		hide() {
			if (this.loginTime) clearInterval(this.loginTime);
		},
		//页面卸载时触发
		onUnload() {
			if (this.loginTime) clearInterval(this.loginTime);
		},
	},

	//组件生命周期
	lifetimes: {
		attached() {
			//初始化
			this.loginRes = {};
			let myInfo = app.globalData.loginUserInfo;
			this.setData({
				myInfo: myInfo
			});
			//如果没有手机号
			if (!myInfo.phone) {
				this.getLoginCode();
			}
		},
		detached(){
			if (this.loginTime) clearInterval(this.loginTime);
		}
	},
	methods: {
		//获取logincode
		getLoginCode() {
			let that = this;
			let fun = () => {
				//调用登录接口
				wx.login({
					success: function (loginRes) {
						that.loginRes = loginRes;
					},
					fail: function (res) {
						wx.showModal({
							title: "提示",
							content: res.errMsg,
							confirmText: "我知道了",
							confirmColor: "#00AE66",
							showCancel: false
						});
					}
				});
			}
			if (this.loginTime) {
				clearInterval(this.loginTime);
			}
			//如果停留在页面上，每隔4分页调一次微信登录取最新code
			this.loginTime = setInterval(() => {
				fun();
			}, 240000);
			fun();
		},
		//获取用户手机号
		getPhoneNumber(e) {
			let { fromPage } = this.properties;
			if(fromPage === 'login'){
				this.signLogin(e);
			}else{
				this.getPhome(e);
			}
		},
		//商户登录
		signLogin(e){
			let that = this;
			let ed = e.detail.encryptedData;
			let iv = e.detail.iv;
			if (!ed || !iv) return;
			let { myInfo } = that.data;
			that.setData({
				loading: true
			}, ()=>{
				Http.post(Config.api.signLogin, {
					code: that.loginRes.code,
					encryptedData: ed,
					iv: iv,
				}).then((res) => {		
						that.setData({ loading: false, myInfo: myInfo });
						clearInterval(that.loginTime);
						that.triggerEvent('callback', res.data);
				}).catch(() => {
						that.setData({ loading: false });
						that.getLoginCode(); //重新获取code
				});
			});	
		},
		//获取手机号
		getPhome(e){
			let that = this;
			let ed = e.detail.encryptedData;
			let iv = e.detail.iv;
			if (!ed || !iv) return;
			let { myInfo } = that.data;
			that.setData({
				loading: true
			}, ()=>{
				Http.post(Config.api.xxxxxx, {
					code: that.loginRes.code,
					encryptedData: ed,
					iv: iv,
				}).then((res) => {
					myInfo.phone = res.data.phone_number;
					that.setData({ loading: false, myInfo: myInfo });
					clearInterval(that.loginTime);
					that.triggerEvent('callback', res.data);
				}).catch(() => {
					that.setData({ loading: false });
					that.getLoginCode(); //重新获取code
				});
			});
		}
	}
})