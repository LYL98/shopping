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
    address:{}
  },
  onLoad() {
    this.address = {}; //当前选择地址
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    app.shoppingCartNum(); //计算购物车数量并显示角标
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
        if(item.coupon_type == 'goods_gift'){
          item.gift_info.forEach(itemChild=> {
            if(itemChild.title.length > 3){
              itemChild.title = itemChild.title.split(0,3) + '*'
            }
          })
        }
      })
      console.log('手动领取',res.data.items)
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
      console.log('res.data.items',res.data.items)
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
    console.log('**************')
    let that = this;
    Http.get(Config.api.myCoupon, {
      status: 'unused',
      store_id: this.data.address.id || ''
    }, { handleError: false }).then((res) => {
      console.log('获取可用优惠券',res.data.num)
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
          that.setData({
            isEdit: false
          });
        }
      }
    });
  },

  onDelete(e){
    const { id } = e.currentTarget.dataset;
    console.log('id: ', id);
    let that = this;
    let shoppingCartData = wx.getStorageSync('shoppingCartData');
		wx.showModal({
      title: '提示',
      content: '确认从购物车移除？',
      confirmColor: '#FDCA1F',
      success: function (res) {
        if (res.confirm) {
          shoppingCartData.map((item,index) => {
              if (item.id === id) {
                console.log('item.id: ', item.id);
                // let validCartList = that.data.validCartList
                // validCartList.map((itemChild,indexChild) => {
                //   if(itemChild.id = id){
                //     console.log('indexChild: ', indexChild);
                //     that.setData({
                //       validCartList: validCartList.splice(indexChild,1)
                //     })
                //   }
                // })
                shoppingCartData.splice(index,1)
               
              }
          });
          wx.setStorageSync('shoppingCartData', shoppingCartData);
          that.updateData();
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
          let inValidCartList = that.data.inValidCartList.map(item => item.id)
          console.log('inValidCartList',inValidCartList)
          let shoppingCartData = wx.getStorageSync('shoppingCartData');
          let tempShowCartData = []
          shoppingCartData.map(item => {
            if(!inValidCartList.includes(item.id)){
              tempShowCartData.push(item)
            }
          })
          
          wx.setStorageSync('shoppingCartData', tempShowCartData);
          
          that.updateData();
        }
      }
      
    });
  },
  traggleCartInput(e){
    console.log('进入')
    this.setData({
      isShowInput:true
    })
    // const { itemData } = e.detail;
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
  setStepPricesHint(num,itemData){

    console.log('this.data.discount: ', this.data.discount);
    let sph = '';
    let d = itemData.step_prices;
    if(d && d.length > 0){
      for(let i = 0; i < d.length; i++){
        if(i === d.length - 1 && num >= d[i].num){
          sph = `已享￥${Util.returnPrice(d[i].price_sale)}/件`;
          break;
        }
        if(i < d.length - 1 && num >= d[i].num && num < d[i + 1].num){
          sph = `已享￥${Util.returnPrice(d[i].price_sale)}/件，再买${d[i + 1].num - num}件享￥${Util.returnPrice(d[i + 1].price_sale)}/件`;
          break;
        }
        if(i === 0 && num < d[i].num){
          sph = `再买${d[i].num - num}件享￥${Util.returnPrice(d[i].price_sale)}/件` 
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
    this.joinShopCart = this.selectComponent('#joinShopCart')
    this.joinShopCart.triggleInputNum(this.data.inputNum)
    this.joinShopCart.inputConfirm()
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
  redioSelect(e) {
    let that = this;
    let id = e.currentTarget.dataset.rs.id;
    let rs = e.currentTarget.dataset.rs;
    let status = rs.is_quoted && rs.is_on_sale && Util.judgeItemStock(rs);
    let d = wx.getStorageSync('shoppingCartData');
    //更新本地存储

    for (let i = 0; i < d.length; i++) {
      if (d[i].id === id && status) {
        d[i].is_select = !d[i].is_select;
        break;
      } else if (d[i].id === id && !status && this.data.isEdit) {
        d[i].is_select = !d[i].is_select;
        break;
      }
    }
    wx.setStorageSync('shoppingCartData', d);

    that.updateData();//更新本地数据
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
    let totalNum = 0, totalPrice = 0, discountsPrice = 0;
    let { dataItem } = that.data;
    if (data) dataItem = data;

    let d = wx.getStorageSync('shoppingCartData');

    if (d.length > 0) {
      for (let i = 0; i < dataItem.length; i++) {
        for (let j = 0; j < d.length; j++) {
          if (dataItem[i].id === d[j].id) {
            let status = dataItem[i].is_quoted && dataItem[i].is_on_sale && Util.judgeItemStock(dataItem[i])
            //上架
            if (status) {
              dataItem[i].is_select = d[j].is_select;
            } else if (!status && that.data.isEdit) {
              dataItem[i].is_select = d[j].is_select;
            } else if (!status && !that.data.isEdit) {
              dataItem[i].is_select = false;
              that.setStorage(dataItem[i]);
            }
            dataItem[i].select_num = d[j].num;

            if (dataItem[i].is_select && status) {
              let td = this.getStepPrices(dataItem[i]);
              totalPrice += td.totalPrice;
              discountsPrice += td.discountsPrice;
            }
            if (dataItem[i].is_select) {
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

      

      let validCartList = [];
      let inValidCartList = [];
      dataItem.map(item => {
        let stepPricesHint = this.setStepPricesHint(item.select_num,item)
        item.stepPricesHint = stepPricesHint
        if(item.is_on_sale && Util.judgeItemStock(item) && item.is_quoted){
          validCartList.push(item)
        }else{
          inValidCartList.push(item)
        }
      })
      console.log('validCartList',validCartList)
     
      that.setData({
        dataItem: dataItem,
        totalNum: totalNum,
        totalPrice: totalPrice,
        discountsPrice: discountsPrice,
        validCartList,
        inValidCartList,
      }, () => {
        that.judgeIsAllSelect();//判断是否全选
      });
    } else {
      that.setData({
        dataItem: [],
        totalNum: 0,
        totalPrice: 0,
        discountsPrice: 0,
        validCartList:[],
        inValidCartList:[]
      });
    }
    wx.hideLoading();
    app.shoppingCartNum(); //计算购物车数量并显示角标
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
    let that = this;
    let d = wx.getStorageSync('shoppingCartData');
    let item = [];
    if (d && d.length > 0) {
      let ids = [];
      for (let i = 0; i < d.length; i++) {
        ids.push(d[i].id);
        item.push({
          id: d[i].id,
          num: d[i].num,
        })
      }

      wx.showNavigationBarLoading();
      that.setData({ loading: true }, ()=>{
        Http.post(Config.api.itemCartQuery, {
          ids: ids,
          store_id: this.data.address.id || ''
        }).then((res) => {
          let rd = res.data;
          if (rd.length === 0) {
            wx.removeStorageSync('shoppingCartData');
          } else {
            for (let i = 0; i < d.length; i++) {
              let obj = d[i];
              let dId = obj.id;
              let isExist = false;

              for (let j = 0; j < rd.length; j++) {
                let child = rd[j];
                let status = child.is_quoted && child.is_on_sale && Util.judgeItemStock(child);
                let n = child.id;
                if (n == dId) { //判断ID是否相等
                  if (obj.num < 1 && status) obj.num = child.min_num_per_order || 1;
                  isExist = true;
                  break;
                }
              }
              if (!isExist) {
                d.remove(i);
              }
            }
            wx.setStorageSync('shoppingCartData', d);
          }
          that.updateData(rd);//更新本地数据
          wx.hideNavigationBarLoading();
          that.setData({ loading: false });
        }).catch(() => {
          wx.hideNavigationBarLoading();
          that.setData({ loading: false });
        });
      });
    } else {
      that.setData({
        dataItem: [],
        validCartList:[],
        inValidCartList:[],
      });
    }
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
    let d = wx.getStorageSync('shoppingCartData');
    console.log('valid',this.data.validCartList);
    this.data.validCartList.map(item => {
        d.forEach(itemChild => {
          if(item.id == itemChild.id){
            itemChild.price = item.price_sale
          }
        })
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
			url: `/pages/coupon-get/coupon-get`
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