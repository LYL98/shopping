// pages/shoppingCart/shoppingCart.js
//获取应用实例
const app = getApp();
import { Http, Config, Constant, Util } from './../../utils/index';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tencentPath: Config.tencentPath,
    loading: false,
    checkedSSrc: './../../assets/img/checked_s.png',
    checkedSrc: './../../assets/img/checked_disabled.png',
    hintBlackSrc: './../../assets/img/hint_black.png',
    empty_cart: './../../assets/img/empty_cart.png',
    dataItem: [],
    isAllSelect: true,
    totalNum: 0,
    totalPrice: 0,
    discountsPrice: 0,
    isEdit: false,
    initLoad: true,
    closeStore: true,
    goodsStatus: {
      "on_ground": "已上架",
      "under_ground": "已下架",
      "audited": "已审核",
      "auditing": "待审核",
    },
    priceStatus: {
      0: "今日未报价",
      1: "已报价"
    },
    couponNum: 0, //今日可用优惠券数量
    isShowCouponHint: true,
    activity: {},
    query: {
      fail_num: 0, //失效数量
      page: 1,
      page_size: 5
    },
    slideButtons: [{ text: '删除' }],
    validCartList:[],
    inValidCartList:[],
    isShowInput:false,
    inputNum: '',
    keyHeight: 0,
    loginUserInfo:{},
    discount:0,
    level:0,
    title:'',
    receiveCouponList:[],
    autoCouponList:[],
    address:{},
    itemIndex:0,
  },
  onLoad() {
    this.address = {}; //当前选择地址
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.address = app.getSelectStore(); //当前选择地址    
    this.setData({
      loginUserInfo:app.globalData.loginUserInfo
    })
    //判断登录
    app.signIsLogin(() => {
      // this.activity();
      this.setData({
        address: app.getSelectStore()
      })
      let address = app.getSelectStore(); //当前选择的地址
      this.getWorkTime();
      this.getShoppingCartData();
      this.couponList(); //获取优惠券列表
      this.getUserLevel()
      this.getReceiveCoupon()
      this.getAutoCoupon()
    });
  },
  getReceiveCoupon(){
    const that = this;
    console.log('this.data.address.province_code',this.data.address.province_code)
    Http.get(Config.api.receiveCoupon, {
      page:1,
      page_size:3,
      store_id: this.data.address.id || '',
      province_code:this.data.address.province_code
    }, { handleError: false }).then((res) => {
      res.data.items.forEach(item => {
        if(item.discount_type == 'gift'){
          item.gift_info.forEach(itemChild=> {
            if(itemChild.title.length > 3){
              itemChild.title = itemChild.title.slice(0,3) + '*'

            }
          })
        }
      })
      that.setData({ receiveCouponList: res.data.items });
    });
  },
  getAutoCoupon(){
    const that = this;
    Http.get(Config.api.receiveCoupon, {
      page:1,
      page_size:6,
      grant_way:'auto',
      store_id: this.data.address.id || '',
      province_code:this.data.address.province_code

    }, { handleError: false }).then((res) => {
      res.data.items.forEach(item => {
        if(item.coupon_type == 'goods_gift'){
          item.gift_info.forEach(itemChild=> {
            if(itemChild.title.length > 3){
              itemChild.title = itemChild.title.split(0,3) + '*'
            }
          })
        }
      })
      that.setData({ autoCouponList: res.data.items });
    });
  },
  //点击页面底下的tab
  onTabItemTap(e) {
    /*===== 埋点 start ======*/
    app.gioActionRecordAdd('tabbar', { tabType_var: '购物车' });
    /*===== 埋点 end ======*/
  },
  //获取工作时间
  getWorkTime() {
    let that = this;
    Http.get(Config.api.isOrderTime, {
      province_code: that.address.province_code
    }).then((res) => {
      that.setData({
        closeStore: res.data.is_time_order,
        order_end_time: res.data.order_end_time,
        order_start_time: res.data.order_start_time
      });
    });
  },
  //获取优惠券列表
  couponList() {
    let that = this;
    Http.get(Config.api.myCoupon, {
      status: 'unused',
      store_id: this.data.address.id || ''
    }, { handleError: false }).then((res) => {
      that.setData({ couponNum: res.data.num, isShowCouponHint: true });
    });
  },
  // 获取用户level
  getUserLevel(){
    let that = this;
    Http.get(Config.api.userVipSelf, {
    }, { handleError: false }).then((res) => {
      this.setData({
        discount:res.data.discount,
        level:res.data.level,
        title:res.data.title.substring(0,2)
      })
      console.log('res: ', res);
      
    });
  },
  //隐藏优惠券提示
  hideCouponHint() {
    this.setData({ isShowCouponHint: false });
  },
  //切换编辑模式
  changeEdit() {
    let { isEdit } = this.data;
    this.setData({
      isEdit: !isEdit
    });
    this.updateData();//更新本地数据
  },

  //删除购物车商品
  removeItem() {
    let that = this;

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
          that.setData({
            isEdit: false
          });
        }
      }
    });
  },

  onDelete(e){
    const { item,index } = e.currentTarget.dataset;
    console.log('index',index)
    let that = this;
		wx.showModal({
      title: '提示',
      content: `确认从购物车移除${item.title}`,
      confirmColor: '#FDCA1F',
      success: function (res) {
        if (res.confirm) {
          Http.post(Config.api.itemCartRemove, {
            cart_item_ids: [item.id]
          }, { handleError: false }).then((res) => {
            that.data.validCartList.splice(index,1)
            that.setData({ 
              validCartList: that.data.validCartList,
              totalNum:res.data.total_num,
              totalPrice:res.data.amount,
              isAllSelect:res.data.is_all_selected
            });
            app.setShoppingCartNum(res.data.total_num)
          });
        }
      }
    });
  },

  

  clearInValid(){
    let that = this;
   
    wx.showModal({
      title: '提示',
      content: '确认清除失效商品？',
      confirmColor: '#FDCA1F',
      success: function (res) {
        if (res.confirm) {
          Http.post(Config.api.itemCartRemove, {
            cart_item_ids: that.data.inValidCartList.map(item => item.id)
          }, { handleError: false }).then((res) => {
            that.setData({ 
              inValidCartList: [],
              totalNum:res.data.total_num,
              totalPrice:res.data.amount,
              isAllSelect:res.data.is_all_selected
            });
            app.setShoppingCartNum(res.data.total_num)
          });
        }
      }
      
    });
  },
  traggleCartInput(e){
    const { itemData,itemIndex } = e.detail;

    console.log('进入',e)
    this.setData({
      isShowInput:true,
      itemIndex:itemIndex
    })

  },
  traggleCartHideInput(){
    this.setData({ isShowInput: false, inputNum: '' });
  },
  hideInput(){
    this.setData({ isShowInput: false, inputNum: '' });
  },
  inputChange(e){
    let value = e.detail.value;
    this.setData({ inputNum: value });
  },
  inputBlur(e){
    this.setData({ keyHeight: 0 });
  },
  stepPriceInfo(num,itemData){
    let d = itemData.step_prices;
    console.log('d',d)
    let isStepPrice = false
    let stepPrice = 0
    if(d && d.length > 0){
      console.log('1')
      for(let i = 0; i < d.length; i++){
        console.log(2,num >= d[i].num)
        if(i === d.length - 1 && num >= d[i].num){
          isStepPrice = true;
          stepPrice = d[i].price_sale;
          break;
        }else if(i < d.length - 1 && num >= d[i].num && num < d[i + 1].num){
          isStepPrice = true;
          stepPrice = d[i].price_sale;
          break;
        }
      }
    }
    return {isStepPrice,stepPrice};
  },
  setStepPricesHint(itemData){
    console.log('this.data.discount: ', itemData);
    let sph = '';
    let d = itemData.step_prices;

    if(d && d.length > 0){
      for(let i = 0; i < d.length; i++){
        if(i === d.length - 1 && itemData.cart_num >= d[i].num){
          sph = `已享￥${Util.returnPrice(d[i].price_sale)}/件`;
          break;
        }
        if(i < d.length - 1 && itemData.cart_num >= d[i].num && itemData.cart_num < d[i + 1].num){
          sph = `已享￥${Util.returnPrice(d[i].price_sale)}/件，再买${d[i + 1].num - itemData.cart_num}件享￥${Util.returnPrice(d[i + 1].price_sale)}/件`;
          break;
        }
        if(i === 0 && itemData.cart_num < d[i].num){
          sph = `再买${d[i].num - itemData.cart_num}件享￥${Util.returnPrice(d[i].price_sale)}/件` 
          break;
        }
      }
    }
    return sph;
    // if(sph !== stepPricesHint) this.setData({ stepPricesHint: sph });
    // this.triggerEvent('traggleStepPriceHint', {
    //   stepPricesHint,
    //   id:this.data.itemData.id
    // });
  },
  getStepPricesHint(itemData){
    let price;
    let d = itemData.step_prices;

    if(d && d.length > 0){
      for(let i = 0; i < d.length; i++){
        if(i === d.length - 1 && itemData.num >= d[i].num){
          price = d[i].price_sale
          break;
        }
        if(i < d.length - 1 && itemData.num >= d[i].num && itemData.num < d[i + 1].num){
          price = d[i].price_sale
          break;
        }
        if(i === 0 && itemData.num < d[i].num){
          price = itemData.originPriceSale
          break;
        }
      }
    }
    console.log('***',price,itemData.originPriceSale)
    return price;
  },
  // traggleStepPriceHint(e){
  //   console.log('e',e)
  //   let tempData = this.data.validCartList
  //   this.data.validCartList.map((item,index) =>{
  //     if(item.id === e.detail.id){
  //       tempData[index].stepPricesHint = e.detail.stepPricesHint
  //       console.log('tempData[index].stepPricesHint: ', tempData[index].stepPricesHint);
  //       this.setData({
  //         validCartList:tempData
  //         })
  //       // let temp_str='validCartList['+index+'].stepPricesHint';
  //       // this.setData({
  //       //   [temp_str]:e.stepPricesHint
  //       // })
  //     }
  //   })
  //   console.log('sss',this.data.validCartList)
    
  // }, 
    //输入法弹起
    inputHeightChange(e){
      let h = e.detail.height;
      let systemInfo = wx.getSystemInfoSync();
      // 状态栏的高度
      let ktxStatusHeight = systemInfo.statusBarHeight;
      // 导航栏的高度
      let navigationHeight = 44;
      // window的高度
      let ktxWindowHeight = systemInfo.windowHeight;
      // 屏幕的高度
      let ktxScreentHeight = systemInfo.screenHeight;
      // 底部tabBar的高度
      let tabBarHeight = ktxScreentHeight - ktxStatusHeight - navigationHeight - ktxWindowHeight + 5;
      this.setData({ keyHeight: h - tabBarHeight });
    },
  inputConfirm(e){
    console.log('****',e)
    const that = this
   

    Http.post(Config.api.itemCartEdit, {
      cart_item_id: e.detail.itemData.id,
      num: that.data.inputNum
    }).then((res) => {
      let rd = res.data;
      that.setData({
        ['itemData.cart_num']:that.data.inputNum
      })
      this.joinShopCart = this.selectComponent(`#joinShopCart${this.data.itemIndex}`)
      this.joinShopCart.triggleInputNum(that.data.inputNum)
      this.joinShopCart.inputConfirm()

      that.setData({ loading: false });
    }).catch(() => {
    });
  },

  //添加或减少回调
  upDownCallback(res) {
    if(res.detail.num === 0 || res.detail.is_select){
      this.updateData();//更新本地数据
    }
  },

  //全选购物车
  allSelect() {
    let that = this;
    Http.post(Config.api.itemCartSelectedAll, {
      is_select_all: that.data.isAllSelect ? 0 : 1,
      store_id:that.data.address.id || ''
    }, { handleError: false }).then((res) => {
     
      that.data.validCartList.forEach((item,index) => {
        let tempIsSelected = `validCartList[${index}].is_selected`;
        this.setData({
          [tempIsSelected]:res.data.is_all_selected,
        })
      })
      this.setData({
        isAllSelect:res.data.is_all_selected,
        totalPrice:res.data.amount,
      })
      console.log('res: ', res);
      
    });
    // let { isAllSelect } = that.data;
    // let d = wx.getStorageSync('shoppingCartData');

    // //更新本地存储
    // for (let i = 0; i < d.length; i++) {
    //   if (isAllSelect) {
    //     d[i].is_select = false;
    //   } else {
    //     d[i].is_select = true;
    //   }
    // }
    // wx.setStorageSync('shoppingCartData', d);
    // that.updateData();//更新本地数据

  },

  //单选
  redioSelect(e) {
    let that = this;
    let item= e.currentTarget.dataset.item;
    Http.post(Config.api.itemCartSelected, {
      cart_item_id: item.id,
      is_selected:item.is_selected ? 0 : -1
    }, { handleError: false }).then((res) => {
      let tempIsSelected = `validCartList[${index}].is_selected`;
      this.setData({
        isAllSelect:res.data.is_all_selected,
        totalPrice:res.data.amount,
        [tempIsSelected]:res.data.is_selected,
      })
      console.log('res: ', res);
      
    });
    
    // let rs = e.currentTarget.dataset.rs;
    // let status = rs.is_quoted && rs.is_on_sale && Util.judgeItemStock(rs);
    // let d = wx.getStorageSync('shoppingCartData');
    // //更新本地存储

    // for (let i = 0; i < d.length; i++) {
    //   if (d[i].id === id && status) {
    //     d[i].is_select = !d[i].is_select;
    //     break;
    //   } else if (d[i].id === id && !status && this.data.isEdit) {
    //     d[i].is_select = !d[i].is_select;
    //     break;
    //   }
    // }
    // wx.setStorageSync('shoppingCartData', d);

    that.updateData();//更新本地数据
  },
  notifyParent(e){
    this.setData({
      totalPrice:e.detail.amount,
      isAllSelect:e.detail.is_all_selected,
    })
    let itemData = e.detail.itemData
    if(itemData.step_prices && itemData.step_prices.length > 0){
      this.data.validCartList.map((item,index) => {
        let tempHint = `validCartList[${index}].stepPricesHint`;
        let tempNum= `validCartList[${index}].cart_num`;
          if(item.id == itemData.id){
            this.setData({
              [tempHint]:this.setStepPricesHint(itemData),
              [tempNum]:itemData.cart_num
            })
          }
        })
    }
    
    
    

  },
  notifyRemove(e){
    const that = this
    Http.post(Config.api.itemCartRemove, {
      cart_item_ids: [e.detail.id]
    }, { handleError: false }).then((res) => {
      that.data.validCartList.splice(e.detail.index,1)
      that.setData({ 
        validCartList: that.data.validCartList,
        totalNum:res.data.total_num,
        totalPrice:res.data.amount,
        isAllSelect:res.data.is_all_selected
      });
      app.setShoppingCartNum(res.data.total_num)
    });
  },
  setStorage(item) {
    let d = wx.getStorageSync('shoppingCartData');
    for (let i = 0; i < d.length; i++) {
      if (d[i].id == item.id) {
        d[i].is_select = item.is_select;
        d[i].num = 0;
        d[i].price = item.price_sale
      }
    }
    wx.setStorageSync('shoppingCartData', d);
  },
  //判断是否全选
  judgeIsAllSelect() {
    let that = this;
    let { dataItem } = that.data;
    if (dataItem && dataItem.length > 0) {
      for (let i = 0; i < dataItem.length; i++) {
        if (!dataItem[i].is_select) {
          that.setData({
            isAllSelect: false
          });
          break;
        }
        if (i === dataItem.length - 1) {
          that.setData({
            isAllSelect: true
          });
        }
      }
    } else {
      that.setData({
        isAllSelect: false
      });
    }
  },
  //更新页面数据
  updateData(data) {
    wx.showLoading();
    let that = this;

    data.effective_items.forEach(item => {
      item.stepPricesHint = that.setStepPricesHint(item)
    })
    data.lose_effect_items.forEach(item => {
      item.stepPricesHint = that.setStepPricesHint(item)
    })
    that.setData({
      validCartList:data.effective_items,
      inValidCartList:data.lose_effect_items,
      isAllSelect:data.is_all_selected,
      totalPrice:data.amount,
      totalNum:data.total_num
    })
    wx.hideLoading();
    // let totalNum = 0, totalPrice = 0, discountsPrice = 0;
    // let { dataItem } = that.data;
    // if (data) dataItem = data;

    // let d = wx.getStorageSync('shoppingCartData');

    // if (d.length > 0) {
    //   for (let i = 0; i < dataItem.length; i++) {
    //     for (let j = 0; j < d.length; j++) {
    //       if (dataItem[i].id === d[j].id) {
    //         let status = dataItem[i].is_quoted && dataItem[i].is_on_sale && Util.judgeItemStock(dataItem[i])
    //         //上架
    //         if (status) {
    //           dataItem[i].is_select = d[j].is_select;
    //         } else if (!status && that.data.isEdit) {
    //           dataItem[i].is_select = d[j].is_select;
    //         } else if (!status && !that.data.isEdit) {
    //           dataItem[i].is_select = false;
    //           that.setStorage(dataItem[i]);
    //         }
    //         dataItem[i].select_num = d[j].num;

    //         if (dataItem[i].is_select && status) {
    //           let td = this.getStepPrices(dataItem[i]);
    //           totalPrice += td.totalPrice;
    //           discountsPrice += td.discountsPrice;
    //         }
    //         if (dataItem[i].is_select) {
    //           totalNum += dataItem[i].select_num;
    //         }
    //         break;
    //       }
    //       if (j === d.length - 1) {
    //         dataItem.remove(i);
    //         i--;
    //       }
    //     }
    //   }

      

    //   let validCartList = [];
    //   let inValidCartList = [];
    //   dataItem.map(item => {
    //     item.originPriceSale = item.originPriceSale || item.price_sale;
    //     let stepPricesHint = this.setStepPricesHint(item.select_num,item)
    //     console.log('stepPricesHint',stepPricesHint)
    //     if(stepPricesHint && stepPricesHint.length > 0){
    //       item.price_sale = this.getStepPricesHint(item.select_num,item)
    //     }
    //     item.stepPricesHint = stepPricesHint
    //     if(item.is_on_sale && Util.judgeItemStock(item) && item.is_quoted){
    //       validCartList.push(item)
    //     }else{
    //       inValidCartList.push(item)
    //     }
    //   })
    //   console.log('打印更新后的validCartList',validCartList)
     
    //   that.setData({
    //     dataItem: dataItem,
    //     totalNum: totalNum,
    //     totalPrice: totalPrice,
    //     discountsPrice: discountsPrice,
    //     validCartList: dataItem.filter(item => item.is_on_sale && Util.judgeItemStock(item) && item.is_quoted),
    //     inValidCartList,
    //   }, () => {
    //     that.judgeIsAllSelect();//判断是否全选
    //     console.log('***validCartList',this.data.validCartList);
    //   });
    // } else {
    //   that.setData({
    //     dataItem: [],
    //     totalNum: 0,
    //     totalPrice: 0,
    //     discountsPrice: 0,
    //     validCartList:[],
    //     inValidCartList:[]
    //   });
    // }
    // app.shoppingCartNum(); //计算购物车数量并显示角标
  },

  //阶梯价
  getStepPrices(data){
    let d = data.step_prices,
        num = data.select_num,
        totalPrice = data.price_sale * data.select_num,
        discountsPrice = 0;
    if(d && d.length > 0){
      for(let i = 0; i < d.length; i++){
        if(i === d.length - 1 && num >= d[i].num){
          totalPrice = d[i].price_sale * data.select_num;
          discountsPrice = (data.price_sale - d[i].price_sale) * data.select_num;
          break;
        }
        if(i < d.length - 1 && num >= d[i].num && num < d[i + 1].num){
          totalPrice = d[i].price_sale * data.select_num;
          discountsPrice = (data.price_sale - d[i].price_sale) * data.select_num;
          break;
        }
      }
    }
    return {
      totalPrice: totalPrice,
      discountsPrice: discountsPrice
    };
  },

  //获取购物车数据
  getShoppingCartData() {
    const that = this;
    Http.get(Config.api.itemCartQuery, {
      store_id: this.data.address.id || ''
    }).then((res) => {
      let rd = res.data;
      app.setShoppingCartNum(rd.total_num)
      that.updateData(rd);//更新本地数据
      wx.hideNavigationBarLoading();
      that.setData({ loading: false });
    }).catch(() => {
      wx.hideNavigationBarLoading();
      that.setData({ loading: false });
    });
  },
  //邮费优惠
  activity() {
    let that = this;
    Http.get(Config.api.activity, {}).then((res) => {
      that.setData({
        activity: res.data,
      })
    });
  },

  onSubmit(){
    let d = []
    this.data.validCartList.map(item => {
      if(item.is_selected){
        let price;
        let stepPriceInfo = this.stepPriceInfo(item.cart_num,item)
        if(stepPriceInfo.isStepPrice){
          price = stepPriceInfo.stepPrice < item.price_sale ? stepPriceInfo.stepPrice : item.price_sale
        }else{
          price = item.price_sale
        }
        d.push({
          id:item.item_id,
          is_select:item.is_selected,
          num:item.cart_num,
          price
        })
      }
        
    })
    console.log('d',d)
    wx.setStorageSync('shoppingCartData',d);
    wx.navigateTo({
			url: `/pages/orderAdd/orderAdd`
		});
    this.submitClearing()
  },  
  //结算
  submitClearing() {
    /*===== 埋点 start ======*/
    app.gioActionRecordAdd('firstBuyEntrance_evar', '购物车');
    app.gioActionRecordAdd('secBuyEntrance_evar', '-');
    /*===== 埋点 end ======*/
  },

  toGetCoupon(){
    wx.navigateTo({
			url: `/pages/coupon-get/coupon-get`
		});
  },

  toReturnCoupon(){
    wx.navigateTo({
			url: `/pages/coupon-return/coupon-return`
		});
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    /*let { query, dataItem } = this.data;
    if (dataItem.length / query.page_size > query.page) {
      query.page = query.page + 1;
      this.setData({
        query: query
      }, () => {
        this.getShoppingCartData();
      });
    }*/
  }
})