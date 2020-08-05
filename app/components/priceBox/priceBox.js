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
    // 销售价
    priceSale: {
      type: Number,
      value: 0
    },
    // 原价
    priceOrigin: {
      type: Number,
      value: 0
    },
    // 普通价
    priceNoVip : {
      type: Number,
      value: 0
    },
    vipTitle: {
      type: String,
      value: ''
    },
    vipLevel: {
      type: Number,
      value: 0
    },
    isVipItem: {
      type: Boolean,
      value: false
    }
  },

  observers: {
  },

  data: {
  },

  pageLifetimes: {
    show:function() {
    },
  },

  methods: {
    // initData() {
    //   let { vip_title="", vip_level=0 } = app.globalData.loginUserInfo
    //   this.setData({
    //     vipTitle: vip_title.length > 2 ? vip_title.substring(0,2) : vip_title,
    //     vipLevel: vip_level
    //   })
    // }
  }
})
