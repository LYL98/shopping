// pages/suggestions/suggestions.js
//获取应用实例
const app = getApp();
import config from './../../utils/config';
import {
  Constant,
  Config,
  Http
} from './../../utils/index';
import UpCos from './../../utils/upload-tencent-cos';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tencentPath: config.tencentPath,
    photographSrc: './../../assets/img/photograph.png',
    closeSrc: './../../assets/img/close.png',
    loading: false,
    isShowSelectMedia: false,
    detail: {
      images: [],
      remark:'',
      brand:'',
      item_spec:'',
      purchase_channel:'',
      title:''
    },
    selectReasonName: '',
    categoryList: [],
    currentDisplay:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.address = {}; //当前选择的地址
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
    let that = this
    this.address = app.getSelectStore(); //当前选择的地址
    let data = wx.getStorageSync('addOrderSelectAddress');
    console.log(data);

    app.signIsLogin(() => {
      this.displayClassQuery(); //获取商品分类
      console.log(this.address);
      let data = wx.getStorageSync('addOrderSelectAddress');
      let {
        detail
      } = that.data
      detail.store_id = data.id
      that.setData({
        detail: detail
      })
    })

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
  //获取商品分类
  displayClassQuery() {
    let that = this;
    Http.get(Config.api.displayClassQuery, {
      province_code: that.address.province_code
    }).then((res) => {
      that.setData({
        categoryList: res.data
      });
    }).catch(() => {

    })
  },
  //选择类型显示
  selectDisplay() {
    let that = this;
    this.setData({
      isShow: true,
      selectReasonName: that.data.detail.title
    });
  },
  //选择分类的回调
  selectStoreCallBack(res) {
    console.log(res);
    let {
      detail,
      currentDisplay
    } = this.data
    detail.display_class_id = res.detail.id
    detail.title = res.detail.title
    this.setData({
      selectReasonName: res.detail.title,
      detail: detail,
      currentDisplay: res.detail
    })
  },
  //点击关闭的回调
  storeShowHide() {
    this.setData({
      isShow: false
    })
  },
  //获取商品名称
  bindTitleInput(e) {
    let that = this;
    let { detail } = that.data;
    let title = e.detail.value;
    detail.title = title
    that.setData({
      detail:detail
    })
  },
  //商品品牌
  bindBrandInput(e) {
    let that = this;
    let { detail } = that.data;
    let brand = e.detail.value;
    detail.brand = brand
    that.setData({
      detail:detail
    })
  },
  //规格
  bindSpecInput(e) {
    let that = this;
    let { detail } = that.data;
    let item_spec = e.detail.value;
    detail.item_spec = item_spec
    that.setData({
      detail:detail
    })
  },
  //渠道
  bindChannelInput(e) {
    let that = this;
    let { detail } = that.data;
    let purchase_channel = e.detail.value;
    detail.purchase_channel = purchase_channel
    that.setData({
      detail:detail
    })
  },
  //区域输入
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
  deletelImg(e) {
    let that = this;
    wx.showModal({
      title: '提示',
      content: '您确定删除图片？',
      confirmColor: '#00AE66',
      success: function (res) {
        if (res.confirm) {
          let index = e.currentTarget.dataset.index;
          let {
            detail
          } = that.data;
          detail.images.remove(index);
          that.setData({
            detail: detail
          });
        }
      }
    });
  },
  //显示隐藏选择图片视频
  showHideSelectMedia() {
    let {
      detail
    } = this.data;
    if (detail.images.length >= 5) {
      wx.showToast({
        title: '最多只能上传5个',
        icon: 'none'
      });
      return;
    }
    this.setData({
      isShowSelectMedia: !this.data.isShowSelectMedia
    });
  },
  //查看图片
  showImg(e) {
    let index = e.currentTarget.dataset.index;
    let {
      detail,
      tencentPath
    } = this.data;

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

  //点击上传图片
  clickPic() {
    let that = this;
    wx.chooseImage({
      count: 5,
      sizeType: ['original', 'compressed'],
      sourceType: ['camera'],
      success: function (res) {
        let tempFilePaths = res.tempFilePaths;
        for (let i = 0; i < tempFilePaths.length; i++) {
          UpCos.upload({
            module: 'after_sale',
            filePath: tempFilePaths[i]
          }).then((resData) => {
            let {
              detail
            } = that.data;
            detail.images.push(resData.data.key);
            that.setData({
              detail: detail
            });
          }).catch((res) => {
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

  //提交反馈信息
  // adviceItem
  adviceItemAdd() {
    let that = this;
    let {
      detail,
      id
    } = that.data;

    if (!detail.display_class_id) {
      wx.showToast({
        title: '请选择商品分类',
        icon: 'none'
      })
      return false;
    }
    if (!detail.title.trim()) {
      wx.showToast({
        title: '商品名称不能为空',
        icon: 'none'
      });
      return false;
    }
    // detail.content.trim() &&
    if (detail.content && detail.content.length > 200) {
      wx.showToast({
        title: '描述不能超过200个字符',
        icon: 'none'
      });
      return false;
    }

    // if (detail.images.length === 0 && !detail.media_urls.length === 0) {
    //   wx.showToast({
    //     title: '请至少上传一张图片或视频',
    //     icon: 'none'
    //   });
    //   return false;
    // }
    wx.showModal({
      title: "提示",
      content: "请您确认信息无误,确认后将提交您的反馈",
      confirmText: "确认提交",
      confirmColor: "#00AE66",
      // showCancel: false,
      success: function (resData) {
        if (resData.confirm) {
          that.setData({
            loading: true
          }, () => {
            Http.post(config.api.adviceItem, {
              store_id: detail.store_id,
              display_class_id: detail.display_class_id,
              remark: detail.content,
              images: detail.images,
              title: detail.title,
              brand: detail.brand,
              item_spec: detail.item_spec,
              purchase_channel: detail.purchase_channel,
            }).then(res => {
              wx.redirectTo({
                url: '/pages/suggestionsResult/suggestionsResult' ,
                complete: () => {
                  that.setData({
                    loading: false
                  });
                }
              });
              wx.showToast({
                title: '反馈建议已提交',
                icon: 'none'
              });
            }).catch(err => {
              that.setData({
                loading: false
              });
            });
          });
        }
      }
      });
    if (that.data.loading) return;
   
  },
})