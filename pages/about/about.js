//获取应用实例
const app = getApp();
import { Config } from './../../utils/index';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tencentPath: Config.tencentPath,
    sys: {},
    brandInfo: {}
  },
  onLoad(option) {
    let sys = app.getSystemInfo();
    this.setData({sys: sys});
    //判断登录
    app.signIsLogin((res) => {
      this.getBrand();
    });
  },

  //获取品牌
  getBrand(){
    app.getBrand((res)=>{
      this.setData({
        brandInfo: res
      });
    });
  },
})