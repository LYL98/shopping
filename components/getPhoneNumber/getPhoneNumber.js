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
	},

	//组件生命周期
	lifetimes: {
		attached() {
			//记录loginRes
			this.loginRes = {};
			this.getLoginCode();
		}
	},
	methods: {
		//获取logincode
		getLoginCode() {
			let that = this;
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
			let code = that.loginRes.code;
			if(!code){
				that.getError();
				return;
			}
			let ed = e.detail.encryptedData;
			let iv = e.detail.iv;
			if (!ed || !iv) return;
			that.setData({
				loading: true
			}, ()=>{
				Http.post(Config.api.signLogin, {
					code: code,
					encryptedData: ed,
					iv: iv,
				}).then((res) => {
					that.setData({ loading: false });
					that.triggerEvent('callback', res.data);
				}).catch(() => {
					that.setData({ loading: false });
					that.getError();
				});
			});
		},
		//获取手机号
		getPhome(e){
			let that = this;
			let code = that.loginRes.code;
			if(!code){
				that.getError();
				return;
			}
			let ed = e.detail.encryptedData;
			let iv = e.detail.iv;
			if (!ed || !iv) return;
			that.setData({
				loading: true
			}, ()=>{
				Http.post(Config.api.xxxxxx, {
					code: code,
					encryptedData: ed,
					iv: iv,
				}).then((res) => {
					that.setData({ loading: false });
					that.triggerEvent('callback', res.data);
				}).catch(() => {
					that.setData({ loading: false });
					that.getError();
				});
			});
		},
		//获取失败
		getError(){
			this.getLoginCode(); //重新取code
			wx.showModal({
				title: "提示",
				content: "手机号码获取失败，请重新获取",
				confirmText: "我知道了",
				confirmColor: "#00AE66",
				showCancel: false
			});
		}
	}
})