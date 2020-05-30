// pages/complain/complain.js
import config from './../../utils/config';
import util from './../../utils/util';
import constant from './../../utils/constant';
const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    couponBgSrc: './../../assets/img/coupon_bg.png',
    couponUnusableSrc: './../../assets/img/coupon_unusable.png',
    couponUseSrc: './../../assets/img/coupon_use.png',
    couponPastSrc: './../../assets/img/coupon_past.png',
    query: {
      page: 1,
      page_size: constant.PAGE_SIZE,
      avaiable: '1'
    },
    dataItem: {
      items: (()=>{
        //初始化骨架数据
        let items = [];
        for(let i = 0; i < 2; i++){
          let d = {
            coupon: {
              time_start: '0000-00-00 00:00:00',
              time_end: '0000-00-00 00:00:00',
              amount_full: 30000,
              benefit: 88,
              title: '优惠券名称',
            },
            id: i,
          };
          items.push(d);
        }
        return items;
      })(),
      num: 2
    },
    couponType: constant.COUPON_TYPE,
    showSkeleton: true,
    nowDataTime: '', //当前时间
    from: '', //来自什么页面：shoppingCart 购物车
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    //判断登录
    app.signIsLogin(() => {
      let date = util.returnDateStr(); //返回当前时间字符串
      let { from } = this.options;
      let { query } = this.data;
      if(from === 'shoppingCart'){
        query.avaiable_now = '1';
      }
      this.setData({
        nowDataTime: date,
        from: from || '',
        query: query
      }, ()=>{
        this.couponList();
      });
    });
  },
  //单击菜单
  clickTab(e) {
    let v = e.target.dataset.index;
    let { query } = this.data;
    query.page = 1;
    query.avaiable = v;
    this.setData({
      query: query
    }, ()=>{
      this.couponList();
    });

    wx.pageScrollTo({
      scrollTop: 0,
      duration: 0
    });
  },
  //获取下单优惠券列表
  couponList(){
    let that = this;
    let address = app.getSelectStore(); //当前选择地址
    let { query, dataItem } = that.data;
    wx.showNavigationBarLoading();
    wx.request({
      url: config.api.couponList,
      header: {
        'content-type': 'application/json',
        'Vesta-Custom-Access-Token': app.globalData.loginUserInfo.access_token
      },
      data: {
        ...query,
        store_id: address.id
      },
      success: function (res) {
        if (res.statusCode == 200 && res.data.code == 0) {
          let rd = res.data.data;
          if (query.page === 1) {
            that.setData({
              dataItem: rd,
              showSkeleton: false
            });
          } else {
            dataItem.items = dataItem.items.concat(rd.items);
            that.setData({
              dataItem: dataItem,
              showSkeleton: false
            });
          }
        } else {
          app.requestResultCode(res); //处理异常
        }
      },
      complete: function (res) {
        wx.hideNavigationBarLoading();
        //判断是否网络超时
        app.requestTimeout(res, () => {
          that.couponList();
        });
      }
    });
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    let that = this;
    let { query, dataItem } = that.data;
    if (dataItem.num / query.page_size > query.page) {
      query.page = query.page + 1;
      that.setData({
        query: query
      }, () => {
        that.couponList();
      });
    }
  }
})