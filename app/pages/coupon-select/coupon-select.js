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
    let coupons = wx.getStorageSync(this.data.couponCategory === 'goods' ? 'orderCouponGoodsListData' : 'orderCouponDeliveryListData');
    this.setData({
      coupons
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
    prevPage.noUseCoupon(status);
    wx.navigateBack();

  }









})