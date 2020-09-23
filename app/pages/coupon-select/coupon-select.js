// pages/coupon-select/coupon-select.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    couponCategory: '', // goods  delivery
    coupons: [],

  },

  onLoad: function (options) {
    this.setData({
      couponCategory: options.type
    })
  },

  onShow: function () {
    this.getCouponList();
  },

  // 获取下单优惠券列表
  getCouponList(){
    const {couponCategory} = this.data
    let coupons = wx.getStorageSync(couponCategory === 'goods' ? 'orderCouponGoodsListData' : 'orderCouponDeliveryListData') || [];
    let checkedCoupon = wx.getStorageSync(couponCategory === 'goods'?'orderCouponGoodsSelectData':'orderCouponDeliverySelectData') || {}
    this.setData({
      coupons: coupons.map(item => {
        item.fe_checked = item.id === checkedCoupon.id ? true : false 
        return {...item.coupon, ...item}
      }),
    });
  },

  // 选择优惠券
  handleCouponSelect(e) {
    const { itemIndex } = e.detail
    let couponItem = this.data.coupons[itemIndex]
    wx.setStorageSync(this.data.couponCategory === 'goods'?'orderCouponGoodsSelectData':'orderCouponDeliverySelectData', couponItem || {})
    this.setNoUseCoupon(false)
  },

  // 不选择优惠券
  cancelUseCoupon() {
    wx.setStorageSync(this.data.couponCategory === 'goods'?'orderCouponGoodsSelectData':'orderCouponDeliverySelectData', {noUse:true})
    this.setNoUseCoupon(true)
  },

  setNoUseCoupon(status){
    let pages = getCurrentPages();
		let prevPage = pages[pages.length - 2];
    this.data.couponCategory === 'goods' ? prevPage.noUseGoodsCoupon(status) : prevPage.noUseDeliveryCoupon(status)
    wx.navigateBack();
  },
  









})