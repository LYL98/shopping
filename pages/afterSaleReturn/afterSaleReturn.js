//获取应用实例
const app = getApp();
import { Http, Config } from './../../utils/index';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    tencentPath: Config.tencentPath,
    status: {
      init: {
        bg: './../../assets/img/afterSaleReturn/init.png',
        title: '退货中',
        describe: '请等待司机上门取货'
      },
      pick: {
        bg: './../../assets/img/afterSaleReturn/pick.png',
        title: '司机已取货',
        describe: '请等待仓库收货'
      },
      finish: {
        bg: './../../assets/img/afterSaleReturn/finish.png',
        title: '退货成功',
        describe: '仓库已收到货，谢谢您的配合'
      },
      close: {
        bg: './../../assets/img/afterSaleReturn/close.png',
        title: '退货关闭',
        describe: '谢谢您的支持'
      }
    },
    detail: {
      images: []
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //判断登录
    app.signIsLogin(() => {
      this.salebackDetail(options.id);
    });
  },

  //获取退货单
  salebackDetail(id) {
    let that = this;
    wx.showNavigationBarLoading();
    Http.post(Config.api.salebackDetail, { id }).then(res => {
      wx.hideNavigationBarLoading();
      that.setData({
        detail: res.data
      });
    }).catch(error => {
      wx.hideNavigationBarLoading();
    });
  },
})