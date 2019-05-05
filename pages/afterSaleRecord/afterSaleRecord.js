// pages/afterSaleRecord/afterSaleRecord.js
//获取应用实例
const app = getApp();
import config from './../../utils/config';
import constant from './../../utils/constant';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    tencentPath: config.tencentPath,
    tabIndex: 'await',
    checkedSSrc: './../../assets/img/checked_s.png',
    prefecture8Src: './../../assets/img/checkedTIng.png',
    afterSaleStatus: constant.AFTER_SALE_STATUS,
    afterSaleResult: constant.AFTER_SALE_RESULT,
    query: {
      page: 1,
      page_size: constant.PAGE_SIZE
    },
    dataItem: {
      items: []
    },
    loading: false
  },
  onLoad() {
    this.setData({
      system:  app.globalData.system
    })
  },
  //单击菜单
  clickTab(e) {
    let that = this;
    let v = e.target.dataset.index;
    let { query } = that.data;
    query.page = 1;
    that.setData({
      tabIndex: v,
      initLoad: true,
      query: query,
      dataItem: {
        items: []
      }
    }, ()=>{
      that.getData();
    });
  },

  //获取伙数据
  getData(isInit){
    let that = this;
    let { initLoad, tabIndex, dataItem } = that.data;

    //判断是否第一次加载，或没数据；如果是：显示loading   否则静默更新数据
    if (initLoad || !dataItem.num) {
      this.setData({ loading: true });
    }

    let fun = ()=>{
      //重新恢复数据
      if (isInit) {
        if (query.page_size > constant.PAGE_SIZE) {
          query.page = Math.ceil(query.page_size / constant.PAGE_SIZE);//向上取整
          query.page_size = constant.PAGE_SIZE;
          that.setData({
            query: query
          });
        }
      }
    }

    if (tabIndex === 'await'){
      that.aftersaleCandidate(fun);
    }else{
      that.aftersaleQuery(fun);
    }

  },

  //获取可申请售后的订单
  aftersaleCandidate(callback) {
    let that = this;
    let { query, dataItem } = that.data;
    
    wx.request({
      url: config.api.aftersaleCandidate,
      header: {
        'content-type': 'application/json',
        'Durian-Custom-Access-Token': app.globalData.loginUserInfo.access_token
      },
      data: query,
      success: function (res) {
        if (res.statusCode == 200 && res.data.code == 0) {
          let rd = res.data.data;
          if (query.page === 1) {
            that.setData({
              dataItem: rd
            });
          } else {
            dataItem.items = dataItem.items.concat(rd.items);
            that.setData({
              dataItem: dataItem
            });
          }
        } else {
          app.requestResultCode(res); //处理异常
        }

        typeof callback === 'function' && callback();
      },
      complete: function (res) {
        //判断是否网络超时
        app.requestTimeout(res, ()=>{
          that.aftersaleCandidate(callback);
        });

        that.setData({ loading: false, initLoad: false });
      }
    });
  },

  //获取售后单列表
  aftersaleQuery(callback) {
    let that = this;
    let { query, dataItem } = that.data;

    wx.request({
      url: config.api.aftersaleQuery,
      header: {
        'content-type': 'application/json',
        'Durian-Custom-Access-Token': app.globalData.loginUserInfo.access_token
      },
      data: query,
      success: function (res) {
        if (res.statusCode == 200 && res.data.code == 0) {
          let rd = res.data.data;
          if (query.page === 1) {
            that.setData({
              dataItem: rd
            });
          } else {
            dataItem.items = dataItem.items.concat(rd.items);
            that.setData({
              dataItem: dataItem
            });
          }
        } else {
          app.requestResultCode(res); //处理异常
        }

        typeof callback === 'function' && callback();
      },
      complete: function (res) {
        //判断是否网络超时
        app.requestTimeout(res, () => {
          that.aftersaleQuery(callback);
        });

        that.setData({ loading: false, initLoad: false });
      }
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    //判断登录
    app.signIsLogin(() => {
      let { query } = that.data;
      if (query.page !== 1) {
        query.page_size = query.page_size * query.page;
        query.page = 1;
        that.setData({
          query: query
        }, () => {
          that.getData(true);//获取商品列表 (isInit是否进入页面)
        });
      } else {
        that.getData();
      }
    });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let that = this;
    let { query, dataItem } = that.data;
    if (dataItem.num / query.page_size > query.page) {
      query.page = query.page + 1;
      that.setData({
        initLoad: true,
        query: query
      }, () => {
        that.getData();
      });
    }
  },
})