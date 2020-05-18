Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  onTap(){
    wx.navigateBack();
  },
  goToSuggestions(){
    wx.redirectTo({
      url: '/pages/suggestions/suggestions'
    })
  }
})