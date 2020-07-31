// pages/afterSaleDetail/afterSaleDetail.js
//获取应用实例
const app = getApp();
import config from './../../utils/config';
import constant from './../../utils/constant';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    tencentPath: config.tencentPath,
    loading: false,
    checkedSSrc: './../../assets/img/checked_s_done.png',
    checkedIng: './../../assets/img/checked_ing.png',
    checkedTIng: './../../assets/img/afterSaleTop.png',
    checkedSrc: './../../assets/img/afterSaleTop.png',
    checkedDone: './../../assets/img/afterSaleDn.png',
    hintBlackSrc: './../../assets/img/hint_black.png',
    defImg:'./../../assets/img/default_avatar.png',
    defcustImg: './../../assets/img/defcustImg.png',
    afterSaleResult: constant.AFTER_SALE_RESULT,
    commentName:{
      member: "你",
      operator: "客服",
      background: "客服",
    },
    opt_type : {
      quality:'质量问题',
      delivery: '物流异常',
      amount_delivery: '运费退还',
      weight: '少称',
      not_match: '与SKU描述不相符',
      num: '缺货/错货',
      num_short: '缺货',
      num_error: '错货',
      big_order_bonus: '大单优惠',
      betray_low_price: '违反低价承诺',
      other: '其他',
    },
    id: 0,
    detail: {
      images: [],
      saleback: {}
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //判断登录
    app.signIsLogin(() => {
      let id = options.id || '';
      this.setData({
        id: id
      }, () => {
        this.aftersaleDetail();
      });
    });
  },

  //获取可申请售后的订单
  aftersaleDetail() {
    let that = this;
    let { id } = that.data;

    wx.request({
      url: config.api.aftersaleDetail,
      header: {
        'content-type': 'application/json',
        'Vesta-Custom-Access-Token': app.globalData.loginUserInfo.access_token
      },
      method:'POST',
      data: {
        id: id
      },
      success: function (res) {
        if (res.statusCode == 200 && res.data.code == 0) {
          let rd = res.data.data;
          that.setData({
            detail: rd
          });
        } else {
          app.requestResultCode(res); //处理异常
        }
      },
      complete: function (res) {
        //判断是否网络超时
        app.requestTimeout(res, () => {
          that.aftersaleDetail();
        });

        that.setData({ loading: false });
      }
    });
  },
  //查看大图
  previewImage: function (e) {
    let { tencentPath } = this.data;
    var images = e.currentTarget.dataset.src;
    let index = e.currentTarget.dataset.index;

    // let images = img.split(',');
    let urls = [];
    let current = tencentPath + images[index] + '_watermark750';


    for (let i = 0; i < images.length; i++) {
      urls.push(tencentPath + images[i] + '_watermark750');
    }

    wx.previewImage({	
      current: current, 
      urls: urls
    })
  }

})