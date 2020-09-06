const app = getApp();
import { Http, Config } from './../../utils/index';

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    storeId: {
      type: String | Number,
      value: ''
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    isShow: false,
    dataItems: []
  },

  lifetimes: {
    attached(){
      this.storeId = '';
    },
  },

  //监听
  observers: {
    //数据
    storeId(a){
      if(this.storeId !== a){
        this.getNewCoupon();
        this.storeId = a;
      }
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    getNewCoupon(){
      let that = this;
      Http.get(Config.api.getNewCoupon, {
        store_id: this.properties.storeId
      }, {
        handleError: false
      }).then(res => {
        if(res.data.length > 0){
          let rd = res.data;
          that.setData({
            dataItems: rd,
            isShow: rd.length > 0 ? true : false
          });
          that.triggerEvent('toggle', true);
        }
      })
    },
    hideCoupon(){
      this.triggerEvent('toggle', false);
      this.setData({ isShow: false });
    }
  }
})
