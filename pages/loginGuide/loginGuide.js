
Page({
  /**
   * 页面的初始数据
   */
  data: {
    isConsent: false
  },
  //同意
  checkConsent(){
    this.setData({
      isConsent: !this.data.isConsent
    });
  },
  //跳转
  skipPage(){
    wx.navigateTo({
      url: '/pages/login/login'
    })
  }
})