// pages/live/live.js
const app = getApp();
import { Http, Config } from './../../utils/index';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    statusList: ['全部', '即将开播', '直播中', '直播回放'],
    statusStr: ['', 102, 101, 103],

    query: {
      live_status: '',
      page: 1,
      page_size: 10
    },

    list: {
      items: []
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //判断登录
    app.signIsLogin(() => {
      this.liveQuery();
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    app.shoppingCartNum();
  },

  // navbar 切换的响应事件
  handleNavTouch(e) {
    let { query, statusStr } = this.data;
    query.live_status = statusStr[e.detail.index];
    query.page = 1;
    this.setData(
      {
        query: query,
        list: {
          items: [],
          num: 0
        }
      },
      () => {
        this.liveQuery();
        wx.pageScrollTo({
          scrollTop: 0,
          duration: 0
        });
      }
    );
  },

  liveQuery() {
    wx.showNavigationBarLoading();
    let { list, query } = this.data;
    Http.get(Config.api.liveQuery, query)
      .then(res => {
        let rd = res.data || {};
        rd.items = Array.isArray(rd.items)
          ? rd.items.map(item => {
              item.start_time = (item.start_time || '').slice(5, 16);
              return item;
            })
          : [];
        rd.num = rd.num || 0;

        if (query.page === 1) {
          this.setData({ list: rd });
        } else {
          this.setData({ 
            list: {
              items: list.items.concat(rd.items),
              num: rd.num
            }
          });
        }

        wx.hideNavigationBarLoading();
      })
      .catch(() => {
        wx.hideNavigationBarLoading();
      })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    let that = this;
    let {query} = that.data;
      query.page = 1;
      that.setData({
        query: query
      }, () => {
        that.liveQuery();
      });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    let that = this;
    let {query, list} = that.data;
    if (list.num / query.page_size > query.page) {
      //如果没有到达最后一页，加载数据
      query.page = query.page + 1;
      that.setData({
        query: query
      }, () => {
        that.liveQuery();
      });
    }
  },

  //点击页面底下的tab
  onTabItemTap(e){
    /*===== 埋点 start ======*/
    app.gioActionRecordAdd('tabbar', { tabType_var: '直播' });
    /*===== 埋点 end ======*/
  },

});
