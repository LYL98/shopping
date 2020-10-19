// components/handleShopCart/handleShopCart.js
//获取应用实例

import { Util, Verification,Http,Config } from './../../utils/index';
const app = getApp();
let isCanAdd = true;
Component({

  properties: {
    //数据
    itemData: {
      type: Object,
      value: {}
    },
  },

  data: {
    // num: 0,
    // tempNum: 0,
    isCanPresale: false, //是否可预订
    isShowStepPrices: false, //打开阶梯价格选择
    stepPricesIndex: -1,
    
  },

  //监听
  observers: {
    //数据
    itemData(a){
      this.initData();
    }
  },

  pageLifetimes: {
    show: function(){
      let that = this;
      // let num = that.getShoppingCart();
      that.setData({
        // num: num,
        // tempNum: num
      });
      that.judgePresale();//判断预定
    }
  },

  methods: {
    initData() {
      let that = this;
      // let num = that.getShoppingCart();
      that.setData({
        // num: num,
        // tempNum: num
      }, ()=>{
        // this.setStepPricesHint();
      });

      that.judgePresale();//判断预定
    },

    //判断是否可预订
    judgePresale(){
      let that = this;
      let { itemData } = that.data;
      //如果为预订
      if(itemData.is_presale){
        let nowDateTime = Util.returnDateStr(); //返回今日日期时间
        let nowDate = Util.returnDateFormat(nowDateTime, 'yyyy-MM-dd'); //今日日期
        let tomorrow = Util.returnDateCalc(nowDate, 1); //明天
        let pbt = ''; //临时日期
        //如果配送开始日期 >= 明天
        if(itemData.presale_begin >= tomorrow){
          pbt = itemData.presale_begin;
        }else{
          pbt = tomorrow;
        }
        //判断是否可预定
        let isCanPresale = true;
        if(pbt > itemData.presale_end) isCanPresale = false;
        that.setData({
          isCanPresale: isCanPresale
        });
      }
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

    /**
     * 加入购物车
     */
    up(e) {
      
      const that = this;
      if(that.data.itemData.step_prices.length > 0 && that.data.itemData.cart_num == 0){
        this.setData({ isShowStepPrices: true, stepPricesIndex: -1 });
      }else{
        if(!isCanAdd) return;
        isCanAdd = false
        let address = app.getSelectStore();
        Http.post(Config.api.itemCartAdd, {
          item_id: that.data.itemData.id,
          store_id:address.id || ''
        }, { handleError: false }).then((res) => {
          that.setData({
            ['itemData.cart_num']:res.data.item_num,
          })
          
          app.setShoppingCartNum(res.data.total_num)
          that.notifyParent(res.data.total_num)
          isCanAdd = true
        }).catch(err => {
          isCanAdd = true
        });
      }
     
      // this.thatEvent = e;
      // let { itemData, num } = this.data;
      // if(itemData.step_prices.length > 0 && num === 0){
      //   this.setData({ isShowStepPrices: true, stepPricesIndex: -1 });
      // }else{
      //   this.handleNum();
      // }
    },
    notifyParent(cart_num){
      this.triggerEvent('notifyParent', {
        cart_num,
			});
    },
    //处理点击或输入数量、不使用优惠数量
    handleNum(){
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
      let { itemData } = this.data;
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
        // this.setStepPricesHint();
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

    //库存不足
    upUnusable(){
      this.isNumAbnormal(this.data.num + 1);
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
      console.log('isCanAdd',isCanAdd)
      if(!isCanAdd) return;
      isCanAdd = false
      let { itemData, stepPricesIndex } = this.data;
      let address = app.getSelectStore();

      console.log('address',address);
      console.log('itemData',itemData);
      const that = this;

        Http.post(Config.api.itemCartAdd, {
          item_id: itemData.id,
          store_id:address.id || '',
          num:itemData.step_prices[stepPricesIndex].num
        }, { handleError: false }).then((res) => {
          that.setData({
            ['itemData.cart_num']:res.data.item_num,
            isShowStepPrices:false
          })
          app.setShoppingCartNum(res.data.total_num)
          isCanAdd = true
        }).catch(err => {
          isCanAdd = true
        });
      
      
      // this.setData({ isShowStepPrices: false }, ()=>{
      //   if(stepPricesIndex >= 0){
      //     this.handleUp(itemData.step_prices[stepPricesIndex].num);
      //   }else{
      //     this.handleNum();
      //   }
      // });
    },

  }
})
