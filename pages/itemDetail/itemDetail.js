//获取应用实例
const app = getApp();
import config from './../../utils/config';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    tencentPath: config.tencentPath,
    id: 0,
    tempOneImg: '', //第一张图片，临时
    detail: {},
    vidoes: [],
    currentSwiper: 0,
    promotionData: {}, //全场活动数据
  },
  swiperChange: function (e) {
    this.setData({
      currentSwiper: e.detail.current
    })
  },
  //加入购物车回调
  joinShoppingCart() {
    let that = this;
    let num = app.getShoppingCartNum();//获取购物车数量
    that.setData({ shoppingCartNum: num });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
    //判断登录
    app.signIsLogin(() => {
      let id = options.id;
      let num = app.getShoppingCartNum();//获取购物车数量
      let address = app.getSelectStore(); //当前选择的地址

      //获取上个页面的数据(加快显示数据)===
      let pages = getCurrentPages();
      let page = pages[pages.length - 2];
      let d = {}, tempOneImg = '';
      if(page){
        d = page.data.dataItem;
        if(d && d.items){
          d = d.items.filter(item => item.id == id);
          d = d.length > 0 ? d[0] : {images: []};
          tempOneImg = d.images[0] + (page.route === 'pages/index/index' ? '_watermark375x375' : '_watermark200x200');
          d.images = [];
        }else{
          d = {};
        }
      }
      //==============================

      that.setData({ 
        id: id,
        tempOneImg: tempOneImg,
        detail: d,
        address: address,
        shoppingCartNum: num
      }, ()=>{
        that.getItemDetail();
        that.promotion();
      });
    });
  },

  //页面卸载时触发
  onUnload(){
    app.shoppingCartNum();//计算购物车数量并显示角标
  },

  //获取商品详情
  getItemDetail() {
    let that = this;
    let { id, address, tencentPath } = that.data;
    wx.showNavigationBarLoading();
    wx.request({
      url: config.api.itemDetail,
      header: {
        'content-type': 'application/json',
        'Durian-Custom-Access-Token': app.globalData.loginUserInfo.access_token
      },
      data: {
        id: id,
        store_id: address.id || ''
      },
      success: function(res) {
        if (res.statusCode == 200 && res.data.code == 0) {
          let rd = res.data.data;
          let vidoes= [];
          if(rd.content){
            let m = rd.content.match(/\<iframe .*<\/iframe>/g) ? rd.content.match(/\<iframe .*<\/iframe>/)[0] :'';
            vidoes = m ? m.match(/https:[\'\"]?([^\'\"]*)[\'\"]?/ig):[];
            for(let i =0; i<vidoes.length;i++) {
              vidoes[i] = vidoes[i].replace(/"/g,'')
            }

            rd.content = rd.content.replace(/<img/g, '<img style="width:100%;height:auto" ');
          }
          
          that.setData({
            detail: rd,
            vidoes: vidoes
          });
          that.unifiedDescription(); //统一描述
        } else {
          app.requestResultCode(res); //处理异常
        }
      },
      complete: function(res) {
        wx.hideNavigationBarLoading();
        //判断是否网络超时
        app.requestTimeout(res, () => {
          that.getItemDetail();
        });
      }
    });
  },
  //全场活动
  promotion(){
    let that = this;
    wx.request({
      url: config.api.promotion,
      header: {
        'content-type': 'application/json',
        'Durian-Custom-Access-Token': app.globalData.loginUserInfo.access_token
      },
      success: function(res) {
        if (res.statusCode == 200 && res.data.code == 0) {
          let rd = res.data.data;
          that.setData({
            promotionData: rd || {}
          });
        } else {
          app.requestResultCode(res); //处理异常
        }
      },
      complete: function(res) {
        //判断是否网络超时
        app.requestTimeout(res, () => {
          that.promotion();
        });
      }
    });
  },
  //获取统一描述
  unifiedDescription(){
    let that = this;
    wx.request({
      url: config.api.unifiedDescription,
      header: {
        'content-type': 'application/json',
        'Durian-Custom-Access-Token': app.globalData.loginUserInfo.access_token
      },
      success: function(res) {
        if (res.statusCode == 200 && res.data.code == 0) {
          let rd = res.data.data;
          if(rd){
            rd = rd.replace(/<img/g, '<img style="width:100%;height:auto" ');
          }
          that.setData({
            description: rd
          });
        } else {
          app.requestResultCode(res); //处理异常
        }
      },
      complete: function(res) {
        //判断是否网络超时
        app.requestTimeout(res, () => {
          that.promotion();
        });
      }
    });
  },
  //收藏
  itemCollectionAdd(){
    let that = this;
    let { id } = that.data;
    wx.request({
      url: config.api.itemCollectionAdd,
      header: {
        'content-type': 'application/json',
        'Durian-Custom-Access-Token': app.globalData.loginUserInfo.access_token
      },
      data: {
        id: id
      },
      method: 'POST',
      success: function (res) {
        if (res.statusCode == 200 && res.data.code == 0) {
          that.getItemDetail();
          wx.showToast({
            title: '已收藏',
            icon: 'none'
          });
        } else {
          app.requestResultCode(res); //处理异常
        }
      },
      complete: function (res) {
        //判断是否网络超时
        app.requestTimeout(res, () => {
          that.itemCollectionAdd();
        });
      }
    });
  },
  //取消收藏
  itemCollectionCancel() {
    let that = this;
    let { id } = that.data;
    wx.request({
      url: config.api.itemCollectionCancel,
      header: {
        'content-type': 'application/json',
        'Durian-Custom-Access-Token': app.globalData.loginUserInfo.access_token
      },
      data: {
        id: id
      },
      method: 'POST',
      success: function (res) {
        if (res.statusCode == 200 && res.data.code == 0) {
          that.getItemDetail();
          wx.showToast({
            title: '已取消收藏',
            icon: 'none'
          });
        } else {
          app.requestResultCode(res); //处理异常
        }
      },
      complete: function (res) {
        //判断是否网络超时
        app.requestTimeout(res, () => {
          that.itemCollectionCancel();
        });
      }
    });
  },
  //查看大图
  previewImage: function (e) {
    let { tencentPath } = this.data;
    var images = e.currentTarget.dataset.src;
    let index = e.currentTarget.dataset.index;

    // let images = img.split(',');
    let urls = [];
    let current = tencentPath + images[index] + '_watermark750';


    for (let i = 0; i < images.length; i++) {
      urls.push(tencentPath + images[i] + '_watermark750');
    }

    wx.previewImage({
      current: current,
      urls: urls
    })
  },
  //第一张图片加载完成
  oneImgLoad(e){
    let index = e.currentTarget.dataset.index;
    if(index === 0){
      this.setData({ tempOneImg: '' });
    }
  }
})