//获取应用实例
const app = getApp();
import { QrCode } from './../../utils/index';

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.drawQrCode();
  },
  //画二维码
  drawQrCode(){
    const systemInfo = wx.getSystemInfoSync();
    let address = app.getSelectStore(); //当前选择的地址
    QrCode({
      width: systemInfo.windowWidth / 750 * 480,
      height: systemInfo.windowWidth / 750 * 480,
      canvasId: 'myQrcode',
      text: `{"type":"after_sale_return","store_id":${address.id}}`
    })
  },
})