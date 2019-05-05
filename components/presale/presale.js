// components/presale/presale.js
import util from './../../utils/util';

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
  },

  //组件生命周期函数，在组件实例进入页面节点树时执行
  attached(){
    let that = this;
    let { itemData } = this.data;
    let nowDateTime = util.returnDateStr(); //返回今日日期时间
    let nowDate = util.returnDateFormat(nowDateTime, 'yyyy-MM-dd'); //今日日期
    let tomorrow = util.returnDateCalc(nowDate, 1); //明天
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
          data = [{
            id: itemData.id,
            num: 1,
            is_select: true
          }];
          num = 1;
          wx.setStorageSync('shoppingCartPresaleData', data);
        }
      }
      this.setData({
        isShow: !isShow,
        num: num
      });
    },
    //修改日期
    changePresaleDate(e){
      let v = e.detail.value;
      this.setData({
        deliveryDate: v
      });
    },
    /**
     * 加入购物车
     */
    up() {
      let that = this;
      let { itemData, num } = that.data;
      ++num;
      let data = wx.getStorageSync('shoppingCartPresaleData');
      if (data && data.length > 0) {
        data[0].num = num;
      } else {
        data = [{
          id: itemData.id,
          num: 1,
          is_select: true
        }];
      }
      wx.setStorageSync('shoppingCartPresaleData', data);

      that.setData({
        num: num
      });
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
      let { num } = that.data;

      if(num === 1) return false;//最小为1
      
      let data = wx.getStorageSync('shoppingCartPresaleData');
      --num;
      if (data && data.length > 0) {
        data[0].num = num;
      }
      wx.setStorageSync('shoppingCartPresaleData', data);

      that.setData({
        num: num
      });
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
