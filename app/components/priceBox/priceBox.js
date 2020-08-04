// components/priceBox/priceBox.js
const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isQuoted: {
      type: Boolean,
      value: false
    },
    priceSale: {
      type: Number,
      value: 0
    },
    priceOrigin: {
      type: Number,
      value: 0
    }
  },

  observers: {
    'priceSale':function(){
      this.initData();
    },
  },

  data: {
    vipTitle:'',
    vipLevel:0,
  },

  pageLifetimes: {
    show:function() {
    },
  },

  methods: {
    initData() {
      let { vip_title="银卡会员", vip_level=2 } = app.globalData.loginUserInfo
      this.setData({
        vipTitle: vip_title.length > 2 ? vip_title.substring(0,2) : vip_title,
        vipLevel: vip_level
      })
    }
  }
})
