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
    couponType: constant.COUPON_TYPE,
    couponCategory:''
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onLoad(options){
    if(options.type === 'goods'){
      this.setData({
        couponCategory:'goods'
      })
    }else{
      this.setData({
        couponCategory:'delivery'
      })
    }

  },
  onShow: function() {
    this.getCouponList();
  },
  //获取下单优惠券列表
  getCouponList(){

    let d = wx.getStorageSync(this.data.couponCategory === 'goods' ? 'orderCouponGoodsListData' : 'orderCouponDeliveryListData');
    this.setData({
      dataItem: d
    });
  },
  //选择商品优惠券
  selectGoodsCoupon(e){
    let d = e.currentTarget.dataset.item;
    if(d === null || d.is_usable){
      wx.setStorageSync('orderCouponGoodsSelectData' , d || {});
      wx.navigateBack();
    }
  },
  //选择运费优惠券
  selectDeliveryCoupon(e){
    let d = e.currentTarget.dataset.item;
    if(d === null || d.is_usable){
      wx.setStorageSync('orderCouponDeliverySelectData', d || {});
      wx.navigateBack();
    }
  },

})