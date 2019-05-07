// pages/shoppingCart/shoppingCart.js
//获取应用实例
const app = getApp();
import config from './../../utils/config';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tencentPath: config.tencentPath,
    loading: false,
    checkedSSrc: './../../assets/img/checked_s.png',
    checkedSrc: './../../assets/img/checked_disabled.png',
    hintBlackSrc: './../../assets/img/hint_black.png',
    empty_cart:'./../../assets/img/empty_cart.png',
    dataItem: [],
    isAllSelect: true,
    totalNum: 0,
    totalPrice: 0,
    isEdit: false,
    initLoad: true,
    closeStore:true,
    goodsStatus:{
      "on_ground":"已上架",
      "under_ground":"已下架",
      "audited":"已审核",
      "auditing":"待审核",
    },
    priceStatus:{
        0:"今日未报价",
        1:"已报价"
    },
    activity:{}
  },
  onLoad() {
    this.setData({
      system:  app.globalData.system
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let that = this;
    //判断登录
    app.signIsLogin(() => {
      that.activity();
      that.getWorkTime();
      that.getShoppingCartData();
    });
  },
  getWorkTime() {
    let that = this;
    wx.request({
      url: config.api.isOrderTime,
      header: {
        'content-type': 'application/json',
        'Durian-Custom-Access-Token': app.globalData.loginUserInfo.access_token
      },
      success: function(res) {
        if (res.statusCode == 200 && res.data.code == 0) {
          let rd = res.data.data;
          that.setData({
            closeStore: rd.is_time_order,
            order_end_time: rd.order_end_time,
            order_start_time: rd.order_start_time
          })
        } else {
          app.requestResultCode(res); //处理异常
        }
      },
      complete: function(res) {
        that.setData({
          loading: false
        });
        //判断是否网络超时
        app.requestTimeout(res, () => {
          that.getWorkTime();
        });
      }
    });
  },
  //切换编辑模式
  changeEdit(){
    let { isEdit } = this.data;
    this.setData({
      isEdit: !isEdit
    });
    this.updateData();//更新本地数据
  },

  //删除购物车商品
  removeItem(){
    let that = this;
    let d = wx.getStorageSync('shoppingCartData');

    if (!d.some(item => item.is_select)) {
      wx.showToast({
        title: '请选择要删除的商品',
        icon: 'none'
      });
      return;
    }

    wx.showModal({
      title: '提示',
      content: '确认从购物车移除？',
      confirmColor: '#00AE66',
      success: function (res) {
        if (res.confirm) {
          //更新本地存储
          for (let i = 0; i < d.length; i++) {
            if (d[i].is_select) {
              d.remove(i);
              i--;
            }
          }
          wx.setStorageSync('shoppingCartData', d);
          that.updateData();//更新本地数据
          app.shoppingCartNum();//计算购物车数量并显示角标
          that.setData({
            isEdit: false
          });
        }
      }
    });
  },

  //添加或减少回调
  upDownCallback(res){
    this.updateData();//更新本地数据
  },

  //全选购物车
  allSelect(){
    let that = this;
    let { isAllSelect } = that.data;
    let d = wx.getStorageSync('shoppingCartData');

    //更新本地存储
    for (let i = 0; i < d.length; i++) {
      if (isAllSelect) {
        d[i].is_select = false;
      } else {
        d[i].is_select = true;
      }
    }
    wx.setStorageSync('shoppingCartData', d);
    that.updateData();//更新本地数据

  },

  //单选
  redioSelect(e){
    let that = this;
    let id = e.currentTarget.dataset.rs.id;
    let rs = e.currentTarget.dataset.rs;
    let status = rs.is_quoted && rs.is_on_sale && rs.item_stock > 0;
    let d = wx.getStorageSync('shoppingCartData');
    //更新本地存储

    for (let i = 0; i < d.length; i++) {
      if (d[i].id === id && status ) {
        d[i].is_select = !d[i].is_select;
        break;
      }else if(d[i].id === id && !status  && this.data.isEdit) {
        d[i].is_select = !d[i].is_select;
        break;
      }
    }
    wx.setStorageSync('shoppingCartData', d);

    that.updateData();//更新本地数据
  },
  setStorage(item) {
    let d = wx.getStorageSync('shoppingCartData');
    for(let i = 0; i< d.length; i++) {
      if(d[i].id== item.id ) {
          d[i].is_select = item.is_select;
          d[i].num = 0;
      }
    }
    wx.setStorageSync('shoppingCartData', d);
  },
  //判断是否全选
  judgeIsAllSelect(){
    let that = this;
    let { dataItem } = that.data;
    if (dataItem && dataItem.length > 0) {
      for (let i = 0; i < dataItem.length; i++) {
        if (!dataItem[i].is_select){
          that.setData({
            isAllSelect: false
          });
          break;
        }
        if(i === dataItem.length - 1){
          that.setData({
            isAllSelect: true
          });
        }
      }
    }else{
      that.setData({
        isAllSelect: false
      });
    }
  },
  //计算折扣及价格
  calcDiscount(itemData){
    let p = itemData.promotion;
    let newPrice = itemData.price_sale_piece; //新价格，如折后价格
    if(p && p.id){
      let r = p.rules;
      for(let i = 0; i < r.length; i++){
        if(r[i].full <= itemData.select_num){
          newPrice = itemData.price_sale_piece * (r[i].reduction / 100);
        }else{
          break;
        }
      }
    }
    return newPrice;
  },
  //更新页面数据
  updateData(){
    let that = this;
    let totalNum = 0, totalPrice = 0;
    let { dataItem } = that.data;
    let d = wx.getStorageSync('shoppingCartData');
    
    if (d.length > 0){
      for (let i = 0; i < dataItem.length; i++) {
        for (let j = 0; j < d.length; j++) {
          if (dataItem[i].id === d[j].id) {
            let status = dataItem[i].is_quoted && dataItem[i].is_on_sale && dataItem[i].item_stock >0
            //上架
            if(status){
              dataItem[i].is_select = d[j].is_select;
            }else if(!status && that.data.isEdit) {
              dataItem[i].is_select = d[j].is_select;
            }else if(!status && !that.data.isEdit) {
              dataItem[i].is_select = false;
              that.setStorage(dataItem[i]);
            }
            dataItem[i].select_num = d[j].num;
            
            if (dataItem[i].is_select && status) {
              totalPrice += that.calcDiscount(dataItem[i]) * dataItem[i].select_num; //折后价加总
            }
            if (dataItem[i].is_select){
              totalNum += dataItem[i].select_num;
            }
            break;
          }
          if (j === d.length - 1) {
            dataItem.remove(i);
            i--;
          }
        }
      }

      that.setData({
        dataItem: dataItem,
        totalNum: totalNum,
        totalPrice: totalPrice
      }, () => {
        that.judgeIsAllSelect();//判断是否全选
      });
    }else{
      that.setData({
        dataItem: [],
        totalNum: 0,
        totalPrice: 0
      });
    }
    app.shoppingCartNum();

  },

  //获取购物车数据
  getShoppingCartData(){
    let that = this;
    let d = wx.getStorageSync('shoppingCartData');
    if (d && d.length > 0) {
      let ids = [];
      for (let i = 0; i < d.length; i++) {
        ids.push(d[i].id);
      }
      let { initLoad, dataItem } = that.data;
      if (initLoad || dataItem.length === 0){
        that.setData({ loading: true });
      }
      let address = app.getSelectStore(); //当前选择的地址
      wx.request({
        url: config.api.itemCartQuery,
        header: {
          'content-type': 'application/json',
          'Durian-Custom-Access-Token': app.globalData.loginUserInfo.access_token
        },
        data: {
          ids: ids.join(),
          store_id: address.id || ''
        },
        success: function (res) {
          if (res.statusCode == 200 && res.data.code === 0) {
            let rd = res.data.data;
            if(rd.length<=0) {
              wx.removeStorageSync('shoppingCartData')

            }else{
              for(let i = 0; i<d.length; i++) {
                let obj = d[i];
                let dId = obj.id;
                let isExist = false;

                for(let j = 0; j < rd.length; j++){
                  let child = rd[j];
                  let status = child.is_quoted && child.is_on_sale && child.item_stock >0
                  let n = child.id;
                  if(n == dId){ //判断ID是否相等
                    if(obj.num<1 && status) obj.num=1;
                    isExist = true;
                    break;
                  }
                }
                if(!isExist){
                  d.remove(i)
                }
              }
              wx.setStorageSync('shoppingCartData', d);
            }

            that.setData({
              dataItem: rd
            },()=>{
             
              that.updateData();//更新本地数据
            });
          } else {
            app.requestResultCode(res); //处理异常
          }
        },
        complete: function (res) {
          that.setData({ loading: false, initLoad: false });
          //判断是否网络超时
          app.requestTimeout(res, () => {
            that.getShoppingCartData();
          });
        }
      });
    }else{
      that.setData({
        dataItem: []
      });
    }
  },
  //邮费优惠
  activity(){
    let that = this;
    wx.request({
      url: config.api.activity,
      header: {
        'content-type': 'application/json',
        'Durian-Custom-Access-Token': app.globalData.loginUserInfo.access_token
      },
      success: function (res) {
        if (res.statusCode == 200 && res.data.code === 0) {
          let rd = res.data.data;
          that.setData({
            activity: rd,
          })
        } else {
          app.requestResultCode(res); //处理异常
        }
      },
      complete: function (res) {
        that.setData({ loading: false});
        //判断是否网络超时
        app.requestTimeout(res, () => {
          that.activity();
        });
      }
    });
  },
  //结算
  submitClearing() {
    let { dataItem } = this.data;
    let notallow = {

    };
    for(let i=0; i<dataItem.length; i++) {
        if(dataItem[i].is_select && dataItem[i].item_status === 'under_ground' ){
          notallow.code = 1;
          break;
        }else if(dataItem[i].is_select && dataItem[i].price_status == 0 ){
          notallow.code = 2;
          break;
        }
    }
   if(notallow.code == 1){
    wx.showModal({
      title: "提示",
      content: "您所购买的商品有未上架，请在购物车移除",
      confirmText: "我知道了",
      confirmColor: "#00AE66",
      showCancel: false,
      success: function () {
        //wx.navigateBack();
      }
    });
   }else if(notallow.code == 2) {
    wx.showModal({
      title: "提示",
      content: "您所购买的商品有未报价，请在购物车移除或等待报价",
      confirmText: "我知道了",
      confirmColor: "#00AE66",
      showCancel: false,
      success: function () {
        // wx.navigateBack();
      }
    });
   }else{
    wx.navigateTo({
      url: '/pages/orderAdd/orderAdd',
    });
   }
    
  },
})