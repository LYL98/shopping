// pages/shopDetail/shopDetail.js
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
    loading: false,
    id: 0,
    isedit:false,
    detail: {
      images: []
    },
    sortArr:[],
    photographSrc: './../../assets/img/photograph.png',
    editInofName: true,
    edit:{
      title:'',
      address:'',
      linkman:'',
      phone:'',
    },
    vk:{
      title:'门店名称不能为空',
      address:'收货地址不能为空',
      linkman:'收货人不能为空',
      phone:'收货电话不能为空',
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    //判断登录
    app.signIsLogin(()=>{
      let id = options.id;
      that.setData({
        id: id
      }, ()=>{
        that.merchantStoreDetail();
      });
    });
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
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        let tempFilePaths = res.tempFilePaths;
        that.setData({ loading: true }, ()=>{
          UpCos.upload({
            module: 'shop_detail',
            filePath: tempFilePaths[0]
          }).then((resData)=>{
            console.log(resData);
            let { detail } = that.data;
            detail.images.push(resData.data.key);
            that.setData({
              detail: detail,
              loading: false
            });
          }).catch((res)=>{
            wx.showModal({
              title: '提示',
              content: res.message,
              confirmText: '我知道了',
              confirmColor: '#00AE66',
              showCancel: false
            });
            that.setData({ loading: false });
          });
        });
      }
    });
  },
  //查看图片
  showImg(e) {
    let index = e.currentTarget.dataset.index;
    let { detail, tencentPath } = this.data;

    let urls = [];
    let curl = tencentPath + detail.images[index];

    for (let i = 0; i < detail.images.length; i++) {
      urls.push(tencentPath + detail.images[i]);
    }

    wx.previewImage({
      current: curl,
      urls: urls
    })
  },
  sortChange(e) {
    let arr = e.detail.arr;
    this.setData({
      sortArr: arr
    })
  },
  //删除照片
  removeImg(e){
    let that = this;
    wx.showModal({
      title: '提示',
      content: '您确定删除图片？',
      confirmColor: '#00AE66',
      success: function (res) {
        if (res.confirm) {
          let index = e.detail.index;
          let { detail, tencentPath } = that.data;
          let imgs = detail.images
          imgs.splice(index, 1);

          that.setData({
            ["detail.images"]: imgs
          });
        }
      }
    });
  },
  bindaddress(e){
    this.setData({
      ["edit.address"]: e.detail.value.trim()
    })
  },
  bindKeyInput(e){
    this.setData({
      ["edit.title"]: e.detail.value.trim()
    })
  },
  bindlinkman(e){
    this.setData({
      ["edit.linkman"]: e.detail.value.trim()
    })
  },
  bindphone(e){
    this.setData({
      ["edit.phone"]: e.detail.value.trim()
    })
  },
  editInof(){
    let that = this;
    let {edit} = this.data;
    this.setData({
      editInofName:!this.data.editInofName,
      isedit:!this.data.isedit
    })
    if(!this.data.isedit){
      for(let i in edit) {
        let v = edit[i].toString().trim();
        if(!v) {
          wx.showToast({
            title: that.data.vk[i],
            icon: 'none'
          });
          that.setData({
            editInofName:!this.data.editInofName,
            isedit:!this.data.isedit
          })
          return;
        }
      }

      if (edit.title && edit.title.length > 10) {
          wx.showToast({
            title: '门店名称长度不能超过10个字符',
            icon: 'none'
          });
          that.setData({
            editInofName:!this.data.editInofName,
            isedit:!this.data.isedit
          })
          return;
      }

      if (edit.linkman && edit.linkman.length > 10) {
        wx.showToast({
          title: '收货人姓名长度不能超过10个字符',
          icon: 'none'
        });
        that.setData({
          editInofName:!this.data.editInofName,
          isedit:!this.data.isedit
        })
        return;
      }

      if (!/^1[3|4|5|7|8|9][0-9]{9}$/.test(edit.phone)) {
        wx.showToast({
          title: '请输入11位手机号码',
          icon: 'none'
        });
        that.setData({
          editInofName:!this.data.editInofName,
          isedit:!this.data.isedit
        })
        return;
      }

      if (edit.address && edit.address.length > 30) {
        wx.showToast({
          title: '收货地址长度不能超过30个字符',
          icon: 'none'
        });
        that.setData({
          editInofName:!this.data.editInofName,
          isedit:!this.data.isedit
        })
        return;
      }

      this.editStore();
    }

  },
  editStore() {
    let that = this;
    let { detail, edit, sortArr} = that.data;
    let images = sortArr.length ? sortArr : detail.images;
    this.setData({
      ["edit.images"]:images
    });
    
    for(let i in  edit) {
      if(!edit[i]) {
        wx.showToast({
          title: that.data.vk[i],
          icon: 'none'
        });
      }
    }
  
    wx.request({
      url: config.api.editStore,
      header: {
        'content-type': 'application/json',
        'Durian-Custom-Access-Token': app.globalData.loginUserInfo.access_token
      },
      method: 'POST',
      data: that.data.edit,
      success: function (res) {
        if (res.statusCode == 200 && res.data.code == 0) {
          wx.navigateTo({
            url: '/pages/shop/shop',
          });
        } else {
          app.requestResultCode(res); //处理异常
        }
      },
      complete: function (res) {
        //判断是否网络超时
        app.requestTimeout(res, () => {
          that.editStore();
        });
      }
    });
  },
  cancel(){
    let that = this;
    this.setData({
      editInofName:true,
      isedit:false
    }, ()=> that.merchantStoreDetail());
    
  },
  //获取商户门店详情
  merchantStoreDetail(){
    let that = this;
    let { id } = that.data;
    this.setData({ loading: true });
    wx.request({
      url: config.api.merchantStoreDetail,
      header: {
        'content-type': 'application/json',
        'Durian-Custom-Access-Token': app.globalData.loginUserInfo.access_token
      },
      data: {
        id: id
      },
      success: function (res) {
        if (res.statusCode == 200 && res.data.code == 0) {
          let rd = res.data.data;
          let rs = {
            title: rd.title,
            address: rd.address,
            linkman: rd.linkman,
            phone: rd.phone,
            id: rd.id,
          };
          that.setData({
            detail: rd,
            edit:rs
          });
        } else {
          app.requestResultCode(res); //处理异常
        }
      },
      complete: function (res) {
        that.setData({ loading: false });
        //判断是否网络超时
        app.requestTimeout(res, () => {
          that.merchantStoreDetail();
        });
      }
    });
  }
})