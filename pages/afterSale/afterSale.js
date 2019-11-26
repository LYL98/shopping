// pages/afterSale/afterSale.js
//获取应用实例
const app = getApp();
import config from './../../utils/config';
import UpCos from './../../utils/upload-tencent-cos';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    tencentPath: config.tencentPath,
    id: 0,
    isShow: false,
    detail: {
      images: [],
    },
    selectReasonName: '',
    photographSrc: './../../assets/img/photograph.png',
    closeSrc: './../../assets/img/close.png',
    loading: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    //判断登录
    app.signIsLogin(() => {
      let id = options.id;
      that.setData({
        id: id,
        system:  app.globalData.system
      }, ()=>{
        that.aftersaleAddData();
      });
    });
  },

  //修改申请原因
  // changeReason(e){
  //   let that = this;
  //   let v = e.target.dataset.reason;
  //   let { detail } = that.data;
  //   detail.reason = v;
  //   that.setData({
  //     detail: detail
  //   });
  // },

  //输入框事件
  inputChange(e) {
    let that = this;
    let fieldkey = e.target.dataset.fieldkey;
    let { detail } = that.data;
    let value = e.detail.value;
    detail[fieldkey] = value;
    this.setData({
      detail: detail
    });
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
  //删除video
  deleteVideo(){
    let that = this;
    wx.showModal({
      title: '提示',
      content: '您确定删除视频？',
      confirmColor: '#00AE66',
      success: function(res) {
        if (res.confirm) {
          that.setData({ 'detail.media_url': '' });
        }
      }
    });
  },
  //查看视频
  showVideo(){

  },
  selectReason() {
    let that = this;
    this.setData({
      isShow:true,
      selectReasonName: that.data.detail.reason
    })

  },
  toggleToast(e){
    let { detail } = this.data;
    detail.reason = e.detail.reasonName;
    this.setData({
      isShow: e.detail.reason,
      detail: detail,
      selectReasonName: e.detail.reasonName
    })
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
    let { detail } = that.data;
    if(detail.images.length >= 5){
      wx.showToast({
        title: '最多只能上传5张图片',
        icon: 'none'
      });
      return false;
    }
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
  
  //获取售后单信息
  aftersaleAddData(){
    let that = this;
    let { id } = that.data;
    that.setData({ loading: true }, ()=>{
      wx.request({
        url: config.api.aftersaleAddData,
        header: {
          'content-type': 'application/json',
          'Durian-Custom-Access-Token': app.globalData.loginUserInfo.access_token
        },
        data: {
          order_item_id: id
        },
        success: function (res) {
          if (res.statusCode == 200 && res.data.code == 0) {
            let rd = res.data.data;
            
            that.setData({
              detail: {
                ...rd,
                reason: rd.reason || '',
                images: rd.images || []
              }
            });
          } else {
            app.requestResultCode(res); //处理异常
          }
        },
        complete: function (res) {
          //判断是否网络超时
          app.requestTimeout(res, () => {
            that.aftersaleAddData();
          });
  
          that.setData({ loading: false });
        }
      });
    });
  },

  //提交售后单信息
  aftersaleAdd() {
    let that = this;
    let { detail, id } = that.data;

    if (detail.images.length === 0){
      wx.showToast({
        title: '请至少上传一张图片',
        icon: 'none'
      });
      return false;
    }

    if (!detail.reason) {
      wx.showToast({
        title: '请选择售后原因',
        icon: 'none'
      })
      return false;
    }

    if (!detail.content.trim()){
      wx.showToast({
        title: '描述不能为空',
        icon: 'none'
      });
      return false;
    }

    if (detail.content.trim() && detail.content.length > 200){
      wx.showToast({
        title: '描述不能超过200个字符',
        icon: 'none'
      });
      return false;
    }

    that.setData({ loading: true });
    wx.request({
      url: config.api.aftersaleAdd,
      header: {
        'content-type': 'application/json',
        'Durian-Custom-Access-Token': app.globalData.loginUserInfo.access_token
      },
      method: 'POST',
      data: {
        order_item_id: id,
        reason: detail.reason,
        content: detail.content,
        media_url: detail.media_url,
        images: detail.images
      },
      success: function (res) {
        if (res.statusCode == 200 && res.data.code == 0) {
          wx.redirectTo({
            url: '/pages/afterSaleDetail/afterSaleDetail?id=' + res.data.data.id
          });
          wx.showToast({
            title: '售后申请已提交',
            icon: 'none'
          });
        } else {
          app.requestResultCode(res); //处理异常
        }
      },
      complete: function (res) {
        //判断是否网络超时
        app.requestTimeout(res, () => {
          that.aftersaleAdd();
        });

        that.setData({ loading: false });
      }
    });
  }

})