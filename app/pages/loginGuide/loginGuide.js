
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
    if(!this.data.isConsent){
      wx.showToast({
        title: '请勾选同意\r\n《用户协议》和《隐私政策》',
        icon: 'none'
      });
      return;
    }
    wx.navigateTo({
      url: '/pages/login/login'
    })
  }
})