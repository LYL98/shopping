import { Config } from './../../utils/index';

Page({
  data: {
    tencentPath: Config.tencentPath,
    src: ''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      src: options.src || '',
    });
  },
  
})