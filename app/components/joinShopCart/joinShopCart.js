// components/joinShopCart/joinShopCart.js
//获取应用实例
const app = getApp();
import { Util, Verification } from './../../utils/index';

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    //数据
    itemData: {
      type: Object,
      value: {}
    },
    //尺寸
    size:{
      type: String,
      value: 'small'
    },
    //显示删除提醒
    isDeleteHint: {
      type: Boolean,
      value: false
    },
    //来自页面
    sourcePage: {
      type: String,
      value: ''
    },
    showFlyball: {
      type: Boolean,
      value: true
    },
    isTriggleCartEvent: {
      type: Boolean,
      value: true
    },
    isFromCartPage: {
      type: Boolean,
      value: false
    },
    discount: {
      type: Number,
      value: 0
    },
    level: {
      type: Number,
      value: 0
    },
    itemIndex: {
      type: Number,
      value: 0
    },
    title: {
      type: String,
      value: ''
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    addIndexSrc: './../../assets/img/add_index.png',
    minusIndexSrc: './../../assets/img/minus_index.png',
    addSrc: './../../assets/img/add_index.png',
    minusSrc: './../../assets/img/minus_index.png',
    num: 0,
    tempNum: 0,
    hide_good_box: true,
    isCanPresale: false, //是否可预订
    isShowStepPrices: false, //打开阶梯价格选择
    stepPricesIndex: -1,
    isShowInput: false, //手动输入
    keyHeight: 0,
    inputNum: '',
    stepPricesHint: '', //阶梯价格优惠提示
    loginUserInfo:{},
  },

  onShow(){
    this.setData({
      loginUserInfo:app.globalData.loginUserInfo
    })
  },
  //监听
  observers: {
    //数据
    itemData(a){
      this.initData();
    }
  },

  lifetimes: {
    //组件生命周期函数，在组件实例进入页面节点树时执行
    attached(){
      //this.initData();
    },
  },

  //组件所在页面的生命周期声明对象，目前仅支持页面的show和hide两个生命周期
  pageLifetimes: {
    show: function(){
      let that = this;
      let num = that.getShoppingCart();
      that.setData({
        num: num,
        tempNum: num
      });
      that.judgePresale();//判断预定
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //初始化数据
    initData(){
      let that = this;
      let num = that.getShoppingCart();
      that.setData({
        num: num,
        tempNum: num
      }, ()=>{
        this.setStepPricesHint();
      });
      let ww = app.globalData.ww;
      let x = ww - (ww / 5) - (ww / 5 / 2);
      let y = app.globalData.hh;
      if (that.properties.sourcePage === 'itemLabel' || that.properties.sourcePage === 'search'){
        x = 20;
        y = app.globalData.hh - 55;
      }else if (that.properties.size === "large"){
        x = ww / 5;
      }
      that.busPos = {
        x: x,
        y: y
      }
      that.judgePresale();//判断预定
    },
    //判断是否可预订
    judgePresale(){
      let { itemData } = this.data;
      //如果为预订
      if(itemData.is_presale){
        let nowDateTime = Util.returnDateStr(); //返回今日日期时间
        //判断是否可预定
        let isCanPresale = true;
        if(itemData.presale_start_time < nowDateTime || nowDateTime > itemData.presale_end_time) isCanPresale = false;
        this.setData({ isCanPresale });
      }
    },
    /**
     * 加入购物车
     */
    up(e) {
      this.thatEvent = e;
      let { itemData, num } = this.data;
      if(itemData.step_prices.length > 0 && num === 0){
        this.setData({ isShowStepPrices: true, stepPricesIndex: -1 });
      }else{
        this.handleNum();
      }
    },
    //选择阶梯
    selectStepPrices(e){
      let stepPricesIndex = e.currentTarget.dataset.index;
      
      if(stepPricesIndex >= 0){
        let { itemData } = this.data;
        let num = itemData.step_prices[stepPricesIndex].num;
        if(!this.isNumAbnormal(num)) return;
      }      
      this.setData({ stepPricesIndex });
    },
    //取消选择
    cancelSelectStepPrices(){
      this.setData({ isShowStepPrices: false });
    },
    //处理阶梯价
    handleStepPrices(){
      let { itemData, stepPricesIndex } = this.data;
      this.setData({ isShowStepPrices: false }, ()=>{
        if(stepPricesIndex >= 0){
          this.handleUp(itemData.step_prices[stepPricesIndex].num);
        }else{
          this.handleNum();
        }
      });
    },
    //数量异常提示
    isNumAbnormal(num){
      let { itemData } = this.data;
      if(num < itemData.min_num_per_order){
        wx.showToast({
          title: `该商品${itemData.min_num_per_order}件起售`,
          icon: 'none'
        });
        return false;
      }
      if(num > itemData.order_num_max){
        wx.showToast({
          title: `该商品最大订货数${itemData.order_num_max}件`,
          icon: 'none'
        });
        return false;
      }
      if(num > itemData.item_stock){
        wx.showToast({
          title: '该商品库存只有' + itemData.item_stock + '件',
          icon: 'none'
        });
        return false;
      }
      return true;
    },

    //库存不足
    upUnusable(){
      this.isNumAbnormal(this.data.num + 1);
    },

    //显示输入
    showInput(e){
      console.log('e: ', this.data.itemData);
      console.log('e:itemIndex ', this.data.itemIndex);
      if(!this.data.isTriggleCartEvent){
        return
      }
      console.log('this.data.isFromCartPage: ', this.data.isFromCartPage);
      if(this.data.isFromCartPage){
        this.triggerEvent('traggleCartInput', {
          itemData:this.data.itemData,
          itemIndex:this.data.itemIndex
				});
      }else{
        this.thatEvent = e;
        this.setData({ isShowInput: true, inputNum: '' });
      }
      
    },
    //隐藏输入
    hideInput(){
      this.setData({ isShowInput: false, inputNum: '' });
    },
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
    //失去焦点
    inputBlur(){
      if(!this.data.isTriggleCartEvent){
        return
      }
      this.setData({ keyHeight: 0 });
    },
    //输入
    inputChange(e){
      if(!this.data.isTriggleCartEvent){
        return
      }
      let value = e.detail.value;
      this.setData({ inputNum: value });
    },
    //输入完成
    inputConfirm(){
      if(!this.data.isTriggleCartEvent){
        return
      }
      let { inputNum } = this.data;
      if(!inputNum){
        wx.showToast({
          title: '请输入件数',
          icon: 'none'
        });
        return;
      }
      if(!Verification.isNumber(inputNum)){
        wx.showToast({
          title: '请输入正确的件数',
          icon: 'none'
        });
        return;
      }
      if(inputNum <= 0){
        wx.showToast({
          title: '请输入正确的件数',
          icon: 'none'
        });
        return;
      }
      let num = Number(inputNum);
      if(!this.isNumAbnormal(num)) return;
      this.handleUp(num);
      this.hideInput();
      if(this.data.isFromCartPage){
        this.triggerEvent('traggleCartHideInput', {
				});
      }
    },
    // 购物车触发修改inputNum
    triggleInputNum(e){
      console.log('触发input ok',this.data.itemData)
      this.setData({
        inputNum:e
      })
      console.log('e',e)
    },

    //处理点击或输入数量、不使用优惠数量
    handleNum(){
      if(!this.data.isTriggleCartEvent){
        return
      }
      let { itemData, num} = this.data;
      // 如果库存不足
      if(itemData.item_stock === 0 || itemData.item_stock < itemData.min_num_per_order){
        return;
      }
      // 如果是购物车页面，并且该商品未报价，则禁止增加计数
      if (!itemData.is_quoted && this.properties.sourcePage === 'shoppingCart') {
        return;
      }
      if(itemData.min_num_per_order > 0 && (num < itemData.min_num_per_order)){
        num = itemData.min_num_per_order;
      }else{
        ++num;
      }
      this.handleUp(num);
    },
    //处理增加购物车
    handleUp(num){
      wx.sho
      if(!this.data.isTriggleCartEvent){
        return
      }
      let { itemData } = this.data;
      console.log('***',itemData)
      let tempData = {};
      // this.touchOnGoods(this.thatEvent);
      let data = wx.getStorageSync('shoppingCartData');

      if (data && data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          if (itemData.id === data[i].id) {
            data[i].num = num;
            tempData = data[i];
            break;
          }
          if (i === data.length - 1){
            tempData = {
              id: itemData.id,
              num: num,
              is_select: true
            };
            data.unshift(tempData);
            break;
          }
        }
      } else {
        tempData = {
          id: itemData.id,
          num: num,
          is_select: true
        };
        data = [tempData];
      }
      wx.setStorageSync('shoppingCartData', data);

      this.setData({
        num: num
      }, ()=>{
        this.setStepPricesHint();
      });

      app.shoppingCartNum();//计算购物车数量并显示角标

      this.triggerEvent('callback', tempData);//触发回调事件

      /*===== 埋点 start ======*/
      app.gioActionRecordAdd('addToCart', {
        productID_var: itemData.id, //商品ID
        productName: itemData.title, //商品名称
        primarySort_var: `一级类目ID${itemData.display_class_id || '0'}`, //一级类目
        productAmount_var: Util.returnPrice(itemData.price_sale * num), //商品金额
        quantity_var: num, //商品数量
      });
      /*===== 埋点 end ======*/
    },

    /**
     * 减少购物车
     */
    down() {
      if(!this.data.isTriggleCartEvent){
        return
      }
      let { itemData, num, isDeleteHint } = this.data;
      let tempData = {};
      //内部方法
      let fun = () => {
        let data = wx.getStorageSync('shoppingCartData');
        if(itemData.min_num_per_order > 0 && num <= itemData.min_num_per_order){
          num = 0;
        }else{
          --num;
        }
        if (data && data.length > 0) {
          for (let i = 0; i < data.length; i++) {
            if (itemData.id === data[i].id) {
              if (num <= 0) {
                data.remove(i);
                tempData = { num: 0, is_select: false };
                break;
              }
              data[i].num = num;
              tempData = data[i];
              break;
            }
          }
        }
        wx.setStorageSync('shoppingCartData', data);

        this.setData({
          num: num
        }, ()=>{
          this.setStepPricesHint();
        });

        app.shoppingCartNum();//计算购物车数量并显示角标

        this.triggerEvent('callback', tempData);//触发回调事件
      }

      if (((itemData.min_num_per_order > 0 && num <= itemData.min_num_per_order) ||
          itemData.min_num_per_order === 0 && num === 1) && isDeleteHint){
        wx.showModal({
          title: '提示',
          content: '确认移除商品？',
          confirmColor: '#FDCA1F',
          success: function (res) {
            if (res.confirm) {
              fun();//调用内部方法
            }
          }
        });
      }else{
        fun();//调用内部方法
      }
      
    },

    //阶梯价提示
    setStepPricesHint(){
      let { num, itemData, stepPricesHint, sourcePage } = this.data;
      //如不是详情页和购物车
      if(sourcePage !== 'itemDetail' && sourcePage !== 'shoppingCart') return;

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
            sph = `再买${d[i].num - num}件享￥${Util.returnPrice(d[i].price_sale)}/件`;
            break;
          }
        }
      }
      if(sph !== stepPricesHint) this.setData({ stepPricesHint: sph });
      // this.triggerEvent('traggleStepPriceHint', {
      //   stepPricesHint,
      //   id:this.data.itemData.id
      // });
    },

    /**
     * 获取购物车信息
     * */
    getShoppingCart() {
      let that = this;
      let { itemData } = that.data;
      let d = wx.getStorageSync('shoppingCartData');
      if (d && d.length > 0){
        for(let i = 0; i < d.length; i++){
          if (itemData.id === d[i].id){
            return d[i].num;
          }
          if(i === d.length -1){
            return 0;
          }
        }
      }else{
        return 0;
      }
    },
    
    //加入购物车动画
    touchOnGoods: function (e) {
      this.finger = {}; var topPoint = {};
      this.finger['x'] = e.touches["0"].clientX;
      this.finger['y'] = e.touches["0"].clientY;

      if (this.finger['x'] > this.busPos['x']) {
        topPoint['x'] = (this.finger['x'] - this.busPos['x']) / 2 + this.busPos['x'];
      } else {
        topPoint['x'] = (this.busPos['x'] - this.finger['x']) / 2 + this.finger['x'];
      }

      if (this.finger['y'] < this.busPos['y']) {
        topPoint['y'] = this.finger['y'] - 150;
      } else {
        topPoint['y'] = this.busPos['y'] - 150;
      }

      this.linePos = app.bezier([this.finger, topPoint, this.busPos], 30);

      this.startAnimation();
    },
    //开始动画
    startAnimation: function () {
      var index = 0, that = this,
        bezier_points = that.linePos['bezier_points'];

      if (that.timer){
        clearInterval(that.timer);
      }

      this.setData({
        hide_good_box: false,
        bus_x: that.finger['x'],
        bus_y: that.finger['y']
      });
      this.timer = setInterval(function () {
        index++;
        that.setData({
          bus_x: bezier_points[index]['x'],
          bus_y: bezier_points[index]['y']
        });
        if (index >= 30) {
          clearInterval(that.timer);
          that.setData({
            hide_good_box: true
          });
        }
      }, 10);
    },
  }
})
