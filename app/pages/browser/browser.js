Page({
  data: {
    url: ''
  },
  //页面加载时触发
  onLoad(options) {
    this.setData({
      url: options.url || ''
    });
  },
})