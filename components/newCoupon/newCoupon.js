const app = getApp();
import { Http, Config } from './../../utils/index';

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    loading: {
      type: Boolean,
      value: false
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
      this.getNewCoupon();
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    getNewCoupon(){
      let that = this;
      Http.get(Config.api.getNewCoupon, {}, {
        handleError: false
      }).then(res => {
        if(res.data.length > 0){
          that.setData({ dataItems: res.data, isShow: true });
        }
      })
    }
  }
})
