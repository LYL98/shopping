// components/joinShopCart/joinShopCart.js
//获取应用实例
const app = getApp();
import util from './../../utils/util';

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
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    addIndexSrc: './../../assets/img/add_index.png',
    minusIndexSrc: './../../assets/img/minus_index.png',
    addSrc: './../../assets/img/add.png',
    minusSrc: './../../assets/img/minus.png',
    num: 0,
    tempNum: 0,
    hide_good_box: true,
    isCanPresale: false, //是否可预订
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
      });
      let ww = app.globalData.ww;
      let x = ww - (ww / 4) - (ww / 4 / 2);
      let y = app.globalData.hh;
      if (that.properties.sourcePage === 'itemLabel' || that.properties.sourcePage === 'search'){
        x = 20;
        y = app.globalData.hh - 55;
      }else if (that.properties.size === "large"){
        x = ww / 4;
      }
      that.busPos = {
        x: x,
        y: y
      }
      that.judgePresale();//判断预定
    },
    //判断是否可预订
    judgePresale(){
      let that = this;
      let { itemData } = that.data;
      //如果为预订
      if(itemData.is_presale){
        let nowDateTime = util.returnDateStr(); //返回今日日期时间
        let nowDate = util.returnDateFormat(nowDateTime, 'yyyy-MM-dd'); //今日日期
        let tomorrow = util.returnDateCalc(nowDate, 1); //明天
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
     * 加入购物车
     */
    up(e) {
      let that = this;
      let { itemData, num } = that.data;
      // 如果是购物车页面，并且该商品未报价，则禁止增加计数
      if (!itemData.is_quoted && this.properties.sourcePage === 'shoppingCart') {
          return;
      }
      ++num;
      that.touchOnGoods(e);
      let data = wx.getStorageSync('shoppingCartData');

      if (data && data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          if (itemData.id === data[i].id) {
            data[i].num = num;
            break;
          }
          if (i === data.length - 1){
            data.unshift({
              id: itemData.id,
              num: 1,
              is_select: true
            });
            break;
          }
        }
      } else {
        data = [{
          id: itemData.id,
          num: 1,
          is_select: true
        }];
      }
      wx.setStorageSync('shoppingCartData', data);

      that.setData({
        num: num
      });

      app.shoppingCartNum();//计算购物车数量并显示角标

      that.triggerEvent('callback');//触发回调事件
    },

    //库存不足
    upUnusable(){
      let { itemData } = this.data;
      if (itemData.order_num_max >= itemData.item_stock){
        wx.showToast({
          title: '库存只有' + itemData.item_stock + '件',
          icon: 'none'
        });
      }else{
        wx.showToast({
          title: '已超最大订货件数',
          icon: 'none'
        });
      }
    },

    /**
     * 减少购物车
     */
    down() {
      let that = this;
      let { itemData, num, isDeleteHint } = that.data;
      
      //内部方法
      let fun = () => {
        let data = wx.getStorageSync('shoppingCartData');
        --num;
        if (data && data.length > 0) {
          for (let i = 0; i < data.length; i++) {
            if (itemData.id === data[i].id) {
              if (num <= 0) {
                data.remove(i);
                break;
              }
              data[i].num = num;
              break;
            }
          }
        }
        wx.setStorageSync('shoppingCartData', data);

        that.setData({
          num: num
        });

        app.shoppingCartNum();//计算购物车数量并显示角标

        that.triggerEvent('callback');//触发回调事件
      }

      if (num === 1 && isDeleteHint){
        wx.showModal({
          title: '提示',
          content: '确认移除商品？',
          confirmColor: '#00AE66',
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
