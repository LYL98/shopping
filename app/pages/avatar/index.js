import WeCropper from '../../components/wecp/wecp.js'
const app = getApp();
import config from './../../utils/config';
import UpCos from './../../utils/upload-tencent-cos';
const device = wx.getSystemInfoSync()
const width = device.windowWidth
const height = device.windowHeight

Page({
  data: {
    cropperOpt: {
      id: 'cropper',
      width,
      height,
      scale: 2.5,
      zoom: 8,
      cut: {
        x: (width - 300) / 2,
        y: (height - 300) / 2,
        width: 300,
        height: 300
      }
    }
  },
  touchStart (e) {
    this.wecropper.touchStart({
      touches: e.touches.filter( i => i.x !==undefined)
    })
  },
  touchMove (e) {
    this.wecropper.touchMove({
      touches: e.touches.filter( i => i.x !==undefined)
    })
  },
  touchEnd (e) {
    this.wecropper.touchEnd(e)
  },
  getCropperImage () {
    let that = this;
    this.wecropper.getCropperImage((avatar) => {
        if (avatar) {
          UpCos.upload({
            module: 'member',
            filePath: avatar
          }).then((res)=>{
            let d = {
              avatar: res.data.key,
            }
            that.upavatar(d);
          }).catch((res)=>{
            wx.showModal({
              title: '提示',
              content: res.message,
              confirmText: '我知道了',
              confirmColor: '#00AE66',
              showCancel: false
            });
          });
        } else {
            wx.showModal({
              title: '提示',
              content: '获取图片失败，请稍后重试',
              confirmText: '我知道了',
              confirmColor: '#00AE66',
              showCancel: false
            });
        }
    })
  },
  upavatar(data) {
    let that = this;
    wx.request({
      url: config.api.upavatar,
      header: {
        'content-type': 'application/json',
        'Vesta-Custom-Access-Token': app.globalData.loginUserInfo.access_token
      },
      method:'POST',
      data:data,
      success: function (res) {
        if (res.statusCode == 200 && res.data.code == 0) {
            wx.removeStorageSync("upavatar");
            wx.switchTab({
                url: `/pages/my/my`
            })
        } else {
          app.requestResultCode(res); //处理异常
        }
      },
      complete: function () {
        that.setData({ loading: false, initLoad: false });
      }
    });
  },
  uploadTap () {
    const that = this

    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success (res) {
        const src = res.tempFilePaths[0]
        //  获取裁剪图片资源后，给data添加src属性及其值

        that.wecropper.pushOrign(src)
      }
    })
  },
  onLoad (option) {
    const { cropperOpt } = this.data

    if (option.src) {
      cropperOpt.src = option.src
      new WeCropper(cropperOpt)
        .on('ready', (ctx) => {
          //console.log(`wecropper is ready for work!`)
        })
        .on('beforeImageLoad', (ctx) => {
          //console.log(`before picture loaded, i can do something`)
          //console.log(`current canvas context:`, ctx)
          wx.showToast({
            title: '上传中',
            icon: 'loading',
            duration: 20000
          })
        })
        .on('imageLoad', (ctx) => {
          //console.log(`picture loaded`)
          //console.log(`current canvas context:`, ctx)
          wx.hideToast()
        })
        .on('beforeDraw', (ctx, instance) => {
          //console.log(`before canvas draw,i can do something`)
          //console.log(`current canvas context:`, ctx)
        })
        .updateCanvas()
    }
  }
})