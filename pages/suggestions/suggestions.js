//获取应用实例
const app = getApp();
import { Config, Http } from './../../utils/index';
import UpCos from './../../utils/upload-tencent-cos';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tencentPath: Config.tencentPath,
    photographSrc: './../../assets/img/photograph.png',
    closeSrc: './../../assets/img/close.png',
    isShowSelectMedia: false,
    subLoading: false,
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
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this
    this.address = app.getSelectStore(); //当前选择的地址
    app.signIsLogin(() => {
      this.displayClassQuery(); //获取商品分类
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
  //获取商品分类
  displayClassQuery() {
    let that = this;
    wx.showNavigationBarLoading();
    Http.get(Config.api.displayClassQuery, {
      province_code: that.address.province_code
    }).then((res) => {
      wx.hideNavigationBarLoading();
      that.setData({
        categoryList: res.data
      });
    }).catch(() => {
      wx.hideNavigationBarLoading();
    })
  },
  //选择类型显示
  selectDisplay() {
    let that = this;
    let {detail} = that.data
    detail.remark = ' '
    this.setData({
      isShow: true,
      selectReasonName: that.data.selectReasonName,
      detail:detail
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
    this.setData({
      selectReasonName: res.detail.title,
      detail: detail,
      currentDisplay: res.detail
    })
  },
  //点击关闭的回调
  storeShowHide() {
    let that = this;
    let {detail} = that.data
    detail.remark = ''
    this.setData({
      isShow: false,
      detail:detail
    })
  },
  //获取商品名称
  bindTitleInput(e) {
    let that = this;
    let { detail } = that.data;
    let title = e.detail.value;
    detail.title = title
    console.log(title);
    
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
    console.log(detail.remark.length);
    
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
    let len = 0;
    let {
      detail
    } = that.data;
    if(detail.images != null){
      len = detail.images.length
    }
    wx.chooseImage({
      count: 5-len,
      sizeType: ['original', 'compressed'],
      sourceType: ['album','camera'],
      success: function (res) {
        let tempFilePaths = res.tempFilePaths;
        for (let i = 0; i < tempFilePaths.length; i++) {
          UpCos.upload({
            module: 'suggestions',
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
    // && !detail.title.trim()
    if (!detail.title ) {
      wx.showToast({
        title: '商品名称不能为空',
        icon: 'none'
      });
      return false;
    }
    // detail.content.trim() &&
    if (detail.remark && detail.remark.length > 200) {
      wx.showToast({
        title: '描述不能超过200个字符',
        icon: 'none'
      });
      return false;
    }

    wx.showModal({
      title: "提示",
      content: "请您确认信息无误\r\n确认后将提交您的提报",
      confirmText: "确认提交",
      confirmColor: "#00AE66",
      success: function (resData) {
        if (resData.confirm) {
          that.setData({ subLoading: true }, ()=>{
            Http.post(Config.api.adviceItem, {
              store_id: detail.store_id,
              display_class_id: detail.display_class_id,
              remark: detail.remark,
              images: detail.images,
              title: detail.title,
              brand: detail.brand,
              item_spec: detail.item_spec,
              purchase_channel: detail.purchase_channel,
            }).then(res => {
              that.setData({ subLoading: false });
              wx.redirectTo({
                url: '/pages/suggestionsResult/suggestionsResult'
              });
            }).catch(err => {
              that.setData({ subLoading: false });
            });
          });
        }
      }
    });
  },
})