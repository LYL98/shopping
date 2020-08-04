
// components/selectStore/selectStore.js
//获取应用实例
const app = getApp();
import config from './../../utils/config';

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
    attached() {
      this.merchantStoreList(); //获取获取地址列表
    }
  },


  pageLifetimes: {
    // 页面被展示
    show() {
      // show时更新门店列表，防止后台更改子账号门店，小程序端存在缓存
      this.merchantStoreList(true); //获取获取地址列表

    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //获取地址列表
    merchantStoreList(isNotCallback) {
      let that = this;
      wx.request({
        url: config.api.merchantStoreList,
        header: {
          'content-type': 'application/json',
          'Vesta-Custom-Access-Token': app.globalData.loginUserInfo.access_token
        },
        data: {
          is_freeze: 0
        },
        success: function(res) {
          if (res.statusCode == 200 && res.data.code === 0) {
            let rd = res.data.data;
            let address = app.getSelectStore(); //当前选择的地址
            //如果地址列表只有一个，默认选择
            if (rd.length === 1){
              address = rd[0];
              wx.setStorageSync('addOrderSelectAddress', rd[0]);
            } else if(rd.length === 0){
              // 无地址列表，则清除本地缓存门店数据
              address = {}
              wx.removeStorageSync('addOrderSelectAddress')
            }
            //如果没有选择地址
            if(!address.id){
              that.showSelect(); //显示选择地址
            }else{
              if(!isNotCallback) {
                that.triggerEvent('callback', address);//触发回调事件
              }
              
            }
            
            that.setData({
              dataItem: rd,
              address: address,
              addressTemp: address
            });
          } else {
            app.requestResultCode(res); //处理异常
          }
        },
        complete: function(res) {
          //判断是否网络超时
          app.requestTimeout(res, () => {
            that.merchantStoreList();
          });
        }
      });
    },
    //显示选择
    showSelect(){
      wx.hideTabBar();
      this.triggerEvent('toggle', true);
      let { address } = this.data;
      this.setData({
        isShow: true,
        addressTemp: address
      });
    },

    //选择门店
    selectStore(e){
      let index = e.currentTarget.dataset.index;
      let { dataItem } = this.data;
      this.setData({
        addressTemp: dataItem[index]
      });
    },

    //确认选择门店
    affirmSelectStore(){
      let { addressTemp } = this.data;
      if(addressTemp.id){
        this.setData({
          address: addressTemp
        }, ()=>{
          this.cancelSelect();
          wx.setStorageSync('addOrderSelectAddress', addressTemp);
          this.triggerEvent('callback', addressTemp);//触发回调事件
        });
      }else{
        wx.showToast({
          title: '请选择门店',
          icon: 'none'
        });
      }
    },

    //取消选择
    cancelSelect(){
      let { address } = this.data;
      if(!address.id){
        return;
      }
      wx.showTabBar();
      this.triggerEvent('toggle', false);
      this.setData({
        isShow: false
      });
    },
  }
})
