// pages/complain/complain.js
import constant from './../../utils/constant';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    couponBgSrc: './../../assets/img/coupon_bg.png',
    couponUnusableSrc: './../../assets/img/coupon_unusable.png',
    dataItem: [],
    couponType: constant.COUPON_TYPE
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.getCouponList();
  },
  //获取下单优惠券列表
  getCouponList(){
    let d = wx.getStorageSync('orderCouponListData');
    this.setData({
      dataItem: d
    });
  },
  //选择优惠券
  selectCoupon(e){
    let d = e.currentTarget.dataset.item;
    if(d === null || d.is_usable){
      wx.setStorageSync('orderCouponSelectData', d || {});
      wx.navigateBack();
    }
  }
})