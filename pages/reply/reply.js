const app = getApp();
import config from './../../utils/config';
import UpCos from './../../utils/upload-tencent-cos';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    tencentPath: config.tencentPath,
    loading: false,
    photographSrc: './../../assets/img/photograph.png',
    closeSrc: './../../assets/img/close.png',
    id:'',
    detail:{
        images: []
    },
  },
  onLoad(option) {
      this.setData({
          id: option.id
      })
  },
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
      success: function (res) {
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
    sourceType: ['camera'],
    success: function (res) {
      let tempFilePaths = res.tempFilePaths;
      for (let i =0; i<tempFilePaths.length; i++) {
        UpCos.upload({
          module: 'after_sale_reply',
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

  //提交售后单信息
  aftersaleAdd() {
    let that = this;
    let { detail, id } = that.data;

    if (!detail.remark.trim()){
      wx.showToast({
        title: '描述不能为空',
        icon: 'none'
      });
      return false;
    }

    if (detail.remark.trim() && detail.remark.length > 200){
      wx.showToast({
        title: '描述不能超过200个字符',
        icon: 'none'
      });
      return false;
    }

    // if (detail.images.length === 0){
    //   wx.showToast({
    //     title: '请至少上传一张图片',
    //     icon: 'none'
    //   });
    //   return false;
    // }

    that.setData({ loading: true });
    wx.request({
      url: config.api.aftersaleComment,
      header: {
        'content-type': 'application/json',
        'Durian-Custom-Access-Token': app.globalData.loginUserInfo.access_token
      },
      method: 'POST',
      data: {
        aftersale_id: id,
        content: detail.remark,
        images: detail.images
      },
      success: function (res) {
        if (res.statusCode == 200 && res.data.code == 0) {
          wx.redirectTo({
            url: '/pages/afterSaleDetail/afterSaleDetail?id='+ that.data.id
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
});

