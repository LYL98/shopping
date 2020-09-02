//获取应用实例
const app = getApp();
import { Http, Config } from './../../utils/index';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    tencentPath: Config.tencentPath,
    id: 0,
    tempOneImg: '', //第一张图片，临时
    detail: {},
    vidoes: [],
    currentSwiper: 0,
    promotionData: {}, //全场活动数据
    address: {},
    isShowVideo: false,
    loginUserInfo:{},
    isOnSale:true,
    isShowVipInfo:false

  },
  //播放视频
  playVideo(){
    this.setData({ isShowVideo: true });
  },
  //停止播放
  stopVideo(){
    this.setData({ isShowVideo: false });
  },
  //滑动
  swiperChange: function (e) {
    this.setData({
      currentSwiper: e.detail.current
    });
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
  onShow(){
    
  },

  //获取商品详情
  getItemDetail() {
    let that = this;
    let { id, address } = that.data;
    wx.showNavigationBarLoading();
    Http.get(Config.api.itemDetail, {
      id: id,
      store_id: address.id || ''
    }).then(res => {
      wx.hideNavigationBarLoading();
      let rd = res.data;
      if(!rd.is_on_sale){
        this.setData({
          isOnSale:false
        })
        wx.setNavigationBarTitle({
          title: '商品已下架'
        });
      }else{
        this.setData({
          isOnSale:true
        })
      }
      
      let vidoes= [];
      if(rd.content){
        let m = rd.content.match(/\<iframe .*<\/iframe>/g) ? rd.content.match(/\<iframe .*<\/iframe>/)[0] : '';
        vidoes = m ? m.match(/https:[\'\"]?([^\'\"]*)[\'\"]?/ig) : [];
        for(let i =0; i < vidoes.length; i++) {
          vidoes[i] = vidoes[i].replace(/"/g,'')
        }
        console.log('rd.content',rd.content)
        rd.content = rd.content.replace(/<img/g, '<img style="width:100%;height:auto" ');
        rd.content = this.convert(rd.content);
      }
      if(rd.is_vip_item && rd.vip_level > 0 && rd.vip_discount > 0 ){
        this.setData({
          isShowVipInfo:true
        })
      }else{
        this.setData({
          isShowVipInfo:false
        })
      }
      that.setData({
        detail: rd,
        vidoes: vidoes
      });
      //不是不本省商品，提示
      console.log(rd.province_code, address.province_code);
      if(rd.province_code !== address.province_code){
        wx.showModal({
          title: '提示',
          content: '该商品非本省商品',
          confirmText: "我知道了",
          confirmColor: "#00AE66",
          showCancel: false
        });
      }

      that.unifiedDescription(); //统一描述
      /*===== 埋点 start ======*/
      let tags = '';
      rd.tags.forEach(item => {
        tags = `${tags}${tags ? ',' : ''}[${item}]`;
      });
      app.gioActionRecordAdd('productDetailPageView', {
        productID_var: rd.id, //商品ID
        productName: rd.title, //商品名称
        primarySort_var: `一级类目ID${rd.display_class_id || ''}`, //一级类目
        productArea_var: tags, //商品专区
        productSpec_var: rd.item_spec, //商品规格
      });
      /*===== 埋点 end ======*/
    }).catch(error => {
      wx.hideNavigationBarLoading();
    });
  },
  convert(htmlText) {
		let str = htmlText.replace(/<img[^>]*>/gi, function (match) {
			return match.replace(
				/style\s*?=\s*?([‘"])[\s\S]*?\1/gi,
				'style="width:100%;max-width:100%;height:auto;"'
			); // 替换style
		});

		return str;
	},
  //全场活动
  promotion(){
    let that = this;
    Http.get(Config.api.promotion, {}).then(res => {
      let rd = res.data;
      that.setData({
        promotionData: rd || {}
      });
    });
  },
  //获取统一描述
  unifiedDescription(){
    let that = this;
    let { address } = that.data;
    Http.get(Config.api.unifiedDescription, {
      province_code: address.province_code
    }).then(res => {
      let rd = res.data;
      if(rd){
        rd = rd.replace(/<img/g, '<img style="width:100%;height:auto" ');
      }
      that.setData({
        description: rd
      });
    });
  },
  //收藏
  itemCollectionAdd(){
    let that = this;
    let { id, detail } = that.data;
    Http.post(Config.api.itemCollectionAdd, {id: id}, {throttle: false}).then(res => {
      that.getItemDetail();
      wx.showToast({
        title: '已收藏',
        icon: 'none'
      });
      /*===== 埋点 start ======*/
      app.gioActionRecordAdd('collectClick', {
        productID_var: detail.id, //商品ID
        productName: detail.title, //商品名称
      });
      /*===== 埋点 end ======*/
    });
  },
  //取消收藏
  itemCollectionCancel() {
    let that = this;
    let { id } = that.data;
    Http.post(Config.api.itemCollectionCancel, {id: id}, {throttle: false}).then(res => {
      that.getItemDetail();
      wx.showToast({
        title: '已取消收藏',
        icon: 'none'
      });
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
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let { tencentPath, detail } = this.data;
    return {
      title: detail.title,
      path: `/pages/itemDetail/itemDetail?id=${detail.id}`,
      imageUrl: tencentPath + detail.images[0] + '_min750x600',
    }
  },
})