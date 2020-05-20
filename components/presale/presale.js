// components/presale/presale.js
//获取应用实例
const app = getApp();
import { Util, Verification } from './../../utils/index';

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    itemData: {
      type: Object,
      value: {}
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    closeSrc: './../../assets/img/close2.png',
    rightSrc: './../../assets/img/right.png',
    minusSrc: './../../assets/img/minus_index.png',
    addSrc: './../../assets/img/add_index.png',
    num: 1,
    isShow: false,
    deliveryDate: '', //配送日期
    presaleBeginTemp: '', //开始时间
    isCanPresale: false, //是否可预订
    isShowInput: false, //手动输入
    keyHeight: 0,
    inputNum: '',
    stepPricesHint: '',
    discountsPrice: 0, //优惠价格
  },

  //组件生命周期函数，在组件实例进入页面节点树时执行
  attached(){
    let that = this;
    let { itemData } = this.data;
    let nowDateTime = Util.returnDateStr(); //返回今日日期时间
    let nowDate = Util.returnDateFormat(nowDateTime, 'yyyy-MM-dd'); //今日日期
    let tomorrow = Util.returnDateCalc(nowDate, 1); //明天
    let pbt = ''; //临时日期
    //如果配送开始日期 >= 明天
    if(itemData.presale_begin >= tomorrow){
      pbt = itemData.presale_begin;
      that.setData({
        deliveryDate: itemData.presale_begin,
        presaleBeginTemp: pbt
      });
    }else{
      pbt = tomorrow;
      that.setData({
        deliveryDate: tomorrow,
        presaleBeginTemp: pbt
      });
    }

    //判断是否可预定
    let isCanPresale = true;
    if(pbt > itemData.presale_end) isCanPresale = false;
    that.setData({
      isCanPresale: isCanPresale
    });
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //显示隐藏预定
    showHideSelect(){
      let that = this;
      let { isShow, itemData, num } = that.data;
      
      //显示时
      if(!isShow){
        let data = wx.getStorageSync('shoppingCartPresaleData');
        if (data && data.length > 0 && data[0].id === itemData.id) {
          num = data[0].num;
        }else{
          if(itemData.min_num_per_order > 0 && (num < itemData.min_num_per_order)){
            num = itemData.min_num_per_order;
          }else{
            num = num + 1;
          }
          data = [{
            id: itemData.id,
            num: num,
            is_select: true
          }];
          num = num;
          wx.setStorageSync('shoppingCartPresaleData', data);
        }
      }
      this.setData({
        isShow: !isShow,
        num: num
      }, ()=>{
        this.setStepPricesHint();
      });
    },
    //修改日期
    changePresaleDate(e){
      let v = e.detail.value;
      this.setData({
        deliveryDate: v
      });
    },
    //显示输入
    showInput(){
      this.setData({ isShowInput: true, inputNum: '' });
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
      this.setData({ keyHeight: 0 });
    },
    //输入
    inputChange(e){
      let value = e.detail.value;
      this.setData({ inputNum: value });
    },
    //输入完成
    inputConfirm(){
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
      let num = Number(inputNum);
      if(!this.isNumAbnormal(num)) return;
      this.handleUp(num);
      this.hideInput();
    },

    //处理增加购物车
    handleUp(num){
      let { itemData } = this.data;
      let data = wx.getStorageSync('shoppingCartPresaleData');
      if (data && data.length > 0) {
        data[0].num = num;
      } else {
        data = [{
          id: itemData.id,
          num: num,
          is_select: true
        }];
      }
      wx.setStorageSync('shoppingCartPresaleData', data);

      this.setData({
        num: num
      }, ()=>{
        this.setStepPricesHint();
      });
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
     * 加入购物车
     */
    up() {
      let { itemData, num } = this.data;
      if(itemData.min_num_per_order > 0 && (num < itemData.min_num_per_order)){
        num = itemData.min_num_per_order;
      }else{
        num = num + 1;
      }
      this.handleUp(num);
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

    /**
     * 减少购物车
     */
    down() {
      let that = this;
      let { num, itemData } = that.data;

      if(itemData.min_num_per_order === 0 && num <= 1) return false;//最小为1
      if(itemData.min_num_per_order > 0 && num <= itemData.min_num_per_order) return false;//最小为最小订货数
      
      let data = wx.getStorageSync('shoppingCartPresaleData');
      --num;
      if (data && data.length > 0) {
        data[0].num = num;
      }
      wx.setStorageSync('shoppingCartPresaleData', data);

      that.setData({
        num: num
      }, ()=>{
        this.setStepPricesHint();
      });
    },

    //阶梯价提示
    setStepPricesHint(){
      let { num, itemData, stepPricesHint, discountsPrice } = this.data;
      let d = itemData.step_prices;
      if(d && d.length > 0){
        stepPricesHint = '';
        discountsPrice = 0;
        for(let i = 0; i < d.length; i++){
          if(i === d.length - 1 && num >= d[i].num){
            stepPricesHint = `已享￥${Util.returnPrice(d[i].price_sale)}/件`;
            discountsPrice = (itemData.price_sale - d[i].price_sale) * num;
            break;
          }
          if(i < d.length - 1 && num >= d[i].num && num < d[i + 1].num){
            stepPricesHint = `已享￥${Util.returnPrice(d[i].price_sale)}/件，再买${d[i + 1].num - num}件享￥${Util.returnPrice(d[i + 1].price_sale)}/件`;
            discountsPrice = (itemData.price_sale - d[i].price_sale) * num;
            break;
          }
          if(i === 0 && num < d[i].num){
            stepPricesHint = `再买${d[i].num - num}件享￥${Util.returnPrice(d[i].price_sale)}/件`;
            break;
          }
        }
        this.setData({ stepPricesHint, discountsPrice });
      }
    },
    //提交订单
    submitOrder(){
      this.showHideSelect();
      let { deliveryDate } = this.data;
      wx.navigateTo({
        url: '/pages/orderAdd/orderAdd?type=presale&delivery_date=' + deliveryDate,
      });
    }
  }
})
