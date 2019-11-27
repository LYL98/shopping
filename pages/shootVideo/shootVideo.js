//获取应用实例
const app = getApp();
import UpCos from './../../utils/upload-tencent-cos';

// pages/shootVideo/shootVideo.js
Page({
  data: {
    originalVideo: '',
    event: '', //处理事件
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //判断登录
    app.signIsLogin((res) => {
      this.setData({
        event: options.event || '',
      }, ()=>{
        this.chooseVideo();
      });
    });
  },
  //调起拍摄视频
  chooseVideo(){
    let that = this;
    wx.chooseVideo({
      sourceType: ['camera'],
      maxDuration: 15,
      success(res){
        wx.showLoading({
          title: '上传中...',
          mask: true,
          success: function () {
            UpCos.upload({
              module: 'after_sale_video',
              name_suffix: '.mp4',
              filePath: res.tempFilePath
            }).then((resData)=>{
              wx.hideLoading();
              that.handleEvent(resData);
            }).catch((res)=>{
              wx.hideLoading();
              wx.showModal({
                title: '提示',
                content: res.message,
                confirmText: '我知道了',
                confirmColor: '#00AE66',
                showCancel: false
              });
            });
          }
        });
      },
      fail(res){
        wx.navigateBack(); //返回上一页
      }
    });
  },
  //上传视频后处理事件
  handleEvent(res){
    let { event } = this.data;
    //售后页面
    if(event === 'afterSale'){
      let afterSale = app.getPage('pages/afterSale/afterSale');
      if(afterSale){
        let { detail } = afterSale.data;
        detail.media_urls.push(res.data.key);
        afterSale.setData({
          detail: detail
        }, ()=>{
          wx.navigateBack(); //返回上一页
        });
      }
    }
    //售后追加信息
    else if(event === 'reply'){
      let reply = app.getPage('pages/reply/reply');
      if(reply){
        let { detail } = reply.data;
        detail.media_urls.push(res.data.key);
        reply.setData({
          detail: detail
        }, ()=>{
          wx.navigateBack(); //返回上一页
        });
      }
    }
  }
})