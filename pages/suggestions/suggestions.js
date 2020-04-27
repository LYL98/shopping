// pages/suggestions/suggestions.js
//获取应用实例
const app = getApp();
import config from './../../utils/config';
import { Http } from './../../utils/index';
import UpCos from './../../utils/upload-tencent-cos';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tencentPath: config.tencentPath,
    photographSrc: './../../assets/img/photograph.png',
    loading: false,
    isShowSelectMedia: false,
    detail: {
      images: [],
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

   //删除照片
   deletelImg(e){
    let that = this;
    wx.showModal({
      title: '提示',
      content: '您确定删除图片？',
      confirmColor: '#00AE66',
      success: function(res) {
        if (res.confirm) {
          let index = e.currentTarget.dataset.index;
          let { detail } = that.data;
          detail.images.remove(index);
          that.setData({
            detail: detail
          });
        }
      }
    });
  },
    //显示隐藏选择图片视频
    showHideSelectMedia(){
      let { detail } = this.data;
      if(detail.images.length >= 5){
        wx.showToast({
          title: '最多只能上传5个',
          icon: 'none'
        });
        return;
      }
      this.setData({ isShowSelectMedia: !this.data.isShowSelectMedia });
    },
    //查看图片
    showImg(e){
      let index = e.currentTarget.dataset.index;
      let { detail, tencentPath } = this.data;
  
      let urls = [];
      let curl = tencentPath + detail.images[index];
  
      for(let i = 0; i < detail.images.length; i++){
        urls.push(tencentPath + detail.images[i]);
      }
      
      wx.previewImage({
        current: curl,
        urls: urls
      })
    },

      //点击上传图片
  clickPic() {
    let that = this;
    wx.chooseImage({
      count: 5,
      sizeType: ['original', 'compressed'],
      sourceType: [ 'camera'],
      success: function (res) {
        let tempFilePaths = res.tempFilePaths;
        for (let i = 0; i < tempFilePaths.length; i++) {
          UpCos.upload({
            module: 'after_sale',
            filePath: tempFilePaths[i]
          }).then((resData)=>{
            let { detail } = that.data;
            detail.images.push(resData.data.key);
            that.setData({
              detail: detail
            });
          }).catch((res)=>{
            wx.showModal({
              title: '提示',
              content: res.message,
              confirmText: '我知道了',
              confirmColor: '#00AE66',
              showCancel: false
            });
          });
        }
      }
    });
   
  },
})