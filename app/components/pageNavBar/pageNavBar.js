// components/pageNavBar/pageNavBar.js
const app = getApp();
Component({
	options: {
		multipleSlots: true,
		addGlobalClass: true
	},
	properties: {
		extClass: {
			type: String,
			value: ''
		},
		title: {
			type: String,
			value: ''
		},
		color: {
			type: String,
			value: 'rgba(0, 0, 0, 1)'
		},
		background: {
			type: String,
			value: 'rgba(255, 255, 255, 1)'
		},
		back: {
			type: Boolean,
			value: true
		},
		home: {
			type: Boolean,
			value: false
		},
		isLoading: {
			type: Boolean,
			value: false
		},
		loadingColor: {
			type: String,
			value: '#ccc'
		},
		fixed: {
			type: Boolean,
			value: true
		}
	},

	data: {},

	created: function () {
		this.getSystemInfo();
	},
	attached: function () {
		this.setStyle(); //设置样式
	},

	methods: {
		getSystemInfo() {
			console.log(app.globalSystemInfo);
			if (app.globalSystemInfo && app.globalSystemInfo.capsulePosition) {
			} else {
				let systemInfo = wx.getSystemInfoSync();
				let ios = !!(systemInfo.system.toLowerCase().search('ios') + 1);
				// 1. 胶囊的位置
				let rect;
				try {
					rect = wx.getMenuButtonBoundingClientRect
						? wx.getMenuButtonBoundingClientRect()
						: null;
					if (!rect || !rect.width || !rect.top || !rect.left || !rect.height) {
						// api不兼容 or rect的属性为0
						throw 'getMenuButtonBoundingClientRect error';
					}
				} catch (error) {
					let gap = 8; //胶囊按钮上下间距
					let width = 96; //胶囊的宽度
					if (systemInfo.platform === 'android') {
						gap = 8;
						width = 96;
					} else if (systemInfo.platform === 'devtools') {
						// 开发者工具
						gap = ios ? 5.5 : 7.5;
						width = 96;
					} else {
						gap = 4;
						width = 88;
					}
					if (!systemInfo.statusBarHeight) {
						//开启wifi的情况下修复statusBarHeight值获取不到
						systemInfo.statusBarHeight =
							systemInfo.screenHeight - systemInfo.windowHeight - 20;
					}
					rect = {
						//获取不到胶囊信息就自定义重置一个 (胶囊height 32, width, right 10)
						bottom: systemInfo.statusBarHeight + gap + 32,
						height: 32,
						left: systemInfo.windowWidth - width - 10,
						right: systemInfo.windowWidth - 10,
						top: systemInfo.statusBarHeight + gap,
						width: width
					};
					console.log('error', error);
					console.log('rect', rect);
				}
				let navBarHeight = (function () {
					let gap = rect.top - systemInfo.statusBarHeight;
					return systemInfo.statusBarHeight + 2 * gap + rect.height;
				})();

				//下方扩展4像素高度 防止下方边距太小
				systemInfo.navBarExtendHeight = ios ? 4 : 0;

				systemInfo.navBarHeight = navBarHeight;
				//右上角胶囊按钮信息bottom: 58 height: 32 left: 317 right: 404 top: 26 width: 87 目前发现在大多机型都是固定值 为防止不一样所以会使用动态值来计算nav元素大小
				systemInfo.capsulePosition = rect;
				systemInfo.ios = ios;
				// 存储全局
				app.globalSystemInfo = systemInfo;
			}
		},

		setStyle() {
			const {
				statusBarHeight,
				navBarHeight,
				capsulePosition,
				navBarExtendHeight,
				ios,
				windowWidth
			} = app.globalSystemInfo;
			const { back, home, title } = this.data;
			let rightDistance = windowWidth - capsulePosition.right; //胶囊按钮右侧到屏幕右侧的边距
			let leftWidth = windowWidth - capsulePosition.left; //胶囊按钮左侧到屏幕右侧的边距

			let navigationbarinnerStyle = [
				`color: ${this.data.color}`,
				`background: ${this.data.background}`,
				`height:${navBarHeight + navBarExtendHeight}px`,
				`padding-top:${statusBarHeight}px`,
				`padding-right:${leftWidth}px`,
				`padding-bottom:${navBarExtendHeight}px`
			].join(';');

			let navBarLeft = [];
			if ((back && !home) || (!back && home)) {
				// 只有一个按钮的时候
				navBarLeft = [
					`width:${capsulePosition.width}px`,
					`height:${capsulePosition.height}px`
				].join(';');
			} else if ((back && home) || title) {
				navBarLeft = [
					`width:${capsulePosition.width}px`,
					`height:${capsulePosition.height}px`,
					`margin-left:${rightDistance}px`
				].join(';');
			} else {
				navBarLeft = [`width:auto`, `margin-left:0px`].join(';');
			}

			this.setData({
				navigationbarinnerStyle,
				navBarLeft,
				navBarHeight,
				capsulePosition,
				navBarExtendHeight,
				ios
			});
		},

		tapBack() {
			wx.navigateBack({});
			// this.triggerEvent('tapBackCallback');
		},
		tapHome() {
			wx.switchTab({
				url: '/pages/index/index'
			});
		}
	}
});
