
// components/selectStore/selectStore.js
//获取应用实例
const app = getApp();
import config from '../../utils/config';

Component({
  /**
   * 组件的属性列表
   */
  properties: {
  },

  /**
   * 组件的初始数据
   */
  data: {
    closeSrc: './../../assets/img/close2.png',
    checkSrc: './../../assets/img/checked.png',
    checkedSrc: './../../assets/img/checked_s.png',
    address: {},
    addressTemp: {},
    isShow: false,
  },

  lifetimes: {
    // 在组件实例进入页面节点树时执行
    // attached() {
    //   this.merchantStoreList(); //获取获取地址列表
    // }
  },


  pageLifetimes: {
    // 页面被展示
    show() {
      // show时更新门店列表，防止后台更改子账号门店，小程序端存在缓存
      // this.merchantStoreList(true); //获取获取地址列表

    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onFreightClose(){
      this.triggerEvent('onFreightClose');
    }
  }
})
