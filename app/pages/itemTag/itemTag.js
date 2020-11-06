// pages/index1/index1.js

const app = getApp();
import { Http, Constant, Config } from './../../utils/index';
let json = {
  code:0,
  data:{
      header_image:'item/4e2e6564-6365-11ea-940e-52540022b647',
      title:'无退赔区',
      vip_discount:99,
      vip_level:3,
      vip_title:'金卡会员',
      bg_color:'#e14543',
      font_color:"#ffffff",
      areas:[
          {
              area_image:'item/4e2e6564-6365-11ea-940e-52540022b647',
              items:[
                  {
                      buyer: "",
                      buyer_id: 0,
                      c_item_id: 4438,
                      cart_num: 0,
                      city_prices: [],
                      code: "10030600",
                      compensated: "",
                      created: "2020-02-25 22:38:30",
                      display_class_id: 0,
                      float_type: "",
                      frame_id: 0,
                      grade: "",
                      gross_weight: 55,
                      id: 16268,
                      images: ["item/3b9f2d0a-57dc-11ea-8550-525400442b3d", "item/3f0ce7d4-57dc-11ea-8550-525400442b3d"],
                      inner_tag_id: 0,
                      is_gift: false,
                      is_on_sale: true,
                      is_presale: false,
                      is_quoted: false,
                      is_vip_item: false,
                      item_spec: "",
                      item_stock: 7,
                      lower_rate: 0,
                      min_num_per_order: 0,
                      net_weight: 50,
                      on_sale_time: null,
                      order_num_max: 1000,
                      origin_place: "山东",
                      package_spec: "胶框",
                      parent_item_id: 9963,
                      piece_spec: "大件",
                      presale_begin: null,
                      presale_delivery_date: null,
                      presale_end: null,
                      presale_end_time: null,
                      presale_start_time: null,
                      presale_stock: 0,
                      price_buy: 7500,
                      price_buy_last: 7500,
                      price_novip: 8480,
                      price_origin: 0,
                      price_sale: 8480,
                      province_code: "791",
                      rank: 0,
                      real_stock: 0,
                      return_rate: 0,
                      sale_already: 0,
                      sale_num_day: 0,
                      sale_num_random: 309,
                      sale_num_total: 0,
                      sale_type: "自营",
                      sales_seven_days: 0,
                      selling_points: "",
                      shelf_life: 3,
                      step_prices: [],
                      step_prices_updated: null,
                      stock_life: 0,
                      supplier: "",
                      supplier_id: 0,
                      system_class_code: "100306",
                      tags: ["无退赔"],
                      tags_edited: "2020-11-05 15:03:01",
                      title: "山东姑娘果",
                      updated: "2020-11-05 15:03:01",
                      video: "item/cb31285a-d0af-11ea-9322-5254006e8da0"
                  }
              ]
          },
          {
              area_image:'itemTags/efa53702-1f34-11eb-a1d7-525400b3465b',
              items:[
                  {
                      buyer: "",
                      buyer_id: 0,
                      c_item_id: 4438,
                      cart_num: 0,
                      city_prices: [],
                      code: "10030600",
                      compensated: "",
                      created: "2020-02-25 22:38:30",
                      display_class_id: 0,
                      float_type: "",
                      frame_id: 0,
                      grade: "",
                      gross_weight: 55,
                      id: 16268,
                      images: ["item/3b9f2d0a-57dc-11ea-8550-525400442b3d", "item/3f0ce7d4-57dc-11ea-8550-525400442b3d"],
                      inner_tag_id: 0,
                      is_gift: false,
                      is_on_sale: true,
                      is_presale: false,
                      is_quoted: false,
                      is_vip_item: false,
                      item_spec: "",
                      item_stock: 7,
                      lower_rate: 0,
                      min_num_per_order: 0,
                      net_weight: 50,
                      on_sale_time: null,
                      order_num_max: 1000,
                      origin_place: "山东",
                      package_spec: "胶框",
                      parent_item_id: 9963,
                      piece_spec: "大件",
                      presale_begin: null,
                      presale_delivery_date: null,
                      presale_end: null,
                      presale_end_time: null,
                      presale_start_time: null,
                      presale_stock: 0,
                      price_buy: 7500,
                      price_buy_last: 7500,
                      price_novip: 8480,
                      price_origin: 0,
                      price_sale: 8480,
                      province_code: "791",
                      rank: 0,
                      real_stock: 0,
                      return_rate: 0,
                      sale_already: 0,
                      sale_num_day: 0,
                      sale_num_random: 309,
                      sale_num_total: 0,
                      sale_type: "自营",
                      sales_seven_days: 0,
                      selling_points: "",
                      shelf_life: 3,
                      step_prices: [],
                      step_prices_updated: null,
                      stock_life: 0,
                      supplier: "",
                      supplier_id: 0,
                      system_class_code: "100306",
                      tags: ["无退赔"],
                      tags_edited: "2020-11-05 15:03:01",
                      title: "山东姑娘果",
                      updated: "2020-11-05 15:03:01",
                      video: "item/cb31285a-d0af-11ea-9322-5254006e8da0"
                  },
                  {
                      buyer: "",
                      buyer_id: 0,
                      c_item_id: 4438,
                      cart_num: 0,
                      city_prices: [],
                      code: "10030600",
                      compensated: "",
                      created: "2020-02-25 22:38:30",
                      display_class_id: 0,
                      float_type: "",
                      frame_id: 0,
                      grade: "",
                      gross_weight: 55,
                      id: 16268,
                      images: ["item/3b9f2d0a-57dc-11ea-8550-525400442b3d", "item/3f0ce7d4-57dc-11ea-8550-525400442b3d"],
                      inner_tag_id: 0,
                      is_gift: false,
                      is_on_sale: true,
                      is_presale: false,
                      is_quoted: false,
                      is_vip_item: false,
                      item_spec: "",
                      item_stock: 7,
                      lower_rate: 0,
                      min_num_per_order: 0,
                      net_weight: 50,
                      on_sale_time: null,
                      order_num_max: 1000,
                      origin_place: "山东",
                      package_spec: "胶框",
                      parent_item_id: 9963,
                      piece_spec: "大件",
                      presale_begin: null,
                      presale_delivery_date: null,
                      presale_end: null,
                      presale_end_time: null,
                      presale_start_time: null,
                      presale_stock: 0,
                      price_buy: 7500,
                      price_buy_last: 7500,
                      price_novip: 8480,
                      price_origin: 0,
                      price_sale: 8480,
                      province_code: "791",
                      rank: 0,
                      real_stock: 0,
                      return_rate: 0,
                      sale_already: 0,
                      sale_num_day: 0,
                      sale_num_random: 309,
                      sale_num_total: 0,
                      sale_type: "自营",
                      sales_seven_days: 0,
                      selling_points: "",
                      shelf_life: 3,
                      step_prices: [],
                      step_prices_updated: null,
                      stock_life: 0,
                      supplier: "",
                      supplier_id: 0,
                      system_class_code: "100306",
                      tags: ["无退赔"],
                      tags_edited: "2020-11-05 15:03:01",
                      title: "山东姑娘果",
                      updated: "2020-11-05 15:03:01",
                      video: "item/cb31285a-d0af-11ea-9322-5254006e8da0"
                  },
                  {
                      buyer: "",
                      buyer_id: 0,
                      c_item_id: 4438,
                      cart_num: 0,
                      city_prices: [],
                      code: "10030600",
                      compensated: "",
                      created: "2020-02-25 22:38:30",
                      display_class_id: 0,
                      float_type: "",
                      frame_id: 0,
                      grade: "",
                      gross_weight: 55,
                      id: 16268,
                      images: ["item/3b9f2d0a-57dc-11ea-8550-525400442b3d", "item/3f0ce7d4-57dc-11ea-8550-525400442b3d"],
                      inner_tag_id: 0,
                      is_gift: false,
                      is_on_sale: true,
                      is_presale: false,
                      is_quoted: false,
                      is_vip_item: false,
                      item_spec: "",
                      item_stock: 7,
                      lower_rate: 0,
                      min_num_per_order: 0,
                      net_weight: 50,
                      on_sale_time: null,
                      order_num_max: 1000,
                      origin_place: "山东",
                      package_spec: "胶框",
                      parent_item_id: 9963,
                      piece_spec: "大件",
                      presale_begin: null,
                      presale_delivery_date: null,
                      presale_end: null,
                      presale_end_time: null,
                      presale_start_time: null,
                      presale_stock: 0,
                      price_buy: 7500,
                      price_buy_last: 7500,
                      price_novip: 8480,
                      price_origin: 0,
                      price_sale: 8480,
                      province_code: "791",
                      rank: 0,
                      real_stock: 0,
                      return_rate: 0,
                      sale_already: 0,
                      sale_num_day: 0,
                      sale_num_random: 309,
                      sale_num_total: 0,
                      sale_type: "自营",
                      sales_seven_days: 0,
                      selling_points: "",
                      shelf_life: 3,
                      step_prices: [],
                      step_prices_updated: null,
                      stock_life: 0,
                      supplier: "",
                      supplier_id: 0,
                      system_class_code: "100306",
                      tags: ["无退赔"],
                      tags_edited: "2020-11-05 15:03:01",
                      title: "山东姑娘果",
                      updated: "2020-11-05 15:03:01",
                      video: "item/cb31285a-d0af-11ea-9322-5254006e8da0"
                  },
              ]
          },
      ]
  }
}
Page({

  data: {
    tencentPath: Config.tencentPath,
    query: {
      store_id: '',
      sort: '-tags_edited',
      page: 1,
      page_size: Constant.PAGE_SIZE,
      item_tag_id: '', //运营专区中今日主推ID
    },
    detail: {
      topic_image_header: [],
      topic_image_detail: []
    },
    dataItem: {
      items: [],
      num: 0
    },
    loading: false,
    showSkeleton: true,

    tagDetail:{
      title:'',
      header_image:'',
      areas:[],
    }
    
  },

  //页面装载时
  onLoad() {
    this.windowWidth = wx.getSystemInfoSync().windowWidth;
    this.windowHeight = wx.getSystemInfoSync().windowHeight;
    this.factor = this.windowWidth / 750;
    
    //判断登录
    app.signIsLogin((res) => {
      let { query } = this.data;
      let ad = app.getSelectStore(); //当前选择的地址
      if(ad && ad.id){
         this.getShoppingCartNum();//获取购物车数量
        query.store_id = ad.id;
        query.item_tag_id = this.options.id;
        this.setData({ query: query }, () => {
          // this.itemQuery();
          this.itemTagsDetail();
        });
      }
    });
  },

  getShoppingCartNum(){
    const that = this
    let address = app.getSelectStore()
    Http.get(Config.api.itemCartTotalNum, {
      store_id: address.id || ''
    }).then((res) => {
      let rd = res.data;
      that.setData({
        shoppingCartNum:rd.total_num
      })
    }).catch(() => {
    });
  },
  notifyParent(e){
    console.log('e',e.detail)
    this.setData({
      shoppingCartNum:e.detail.cart_num
    })
  },
  joinShoppingCart() {
    let that = this;
    let num = app.getShoppingCartNum();//获取购物车数量
    that.setData({ shoppingCartNum: num });
  },

  itemTagsDetail(){
    const that = this
    that.setData({ 
      tagDetail: json.data
    });
    console.log('tageDetail',json.data)
    wx.setNavigationBarTitle({
          title: json.data.title
        });
        wx.setNavigationBarColor({
          frontColor: json.data.font_color,
          backgroundColor: json.data.bg_color,
        })    
    // let that = this;
    // Http.get(Config.api.itemTagsDetail, {
    //   id: that.data.query.item_tag_id
    // }).then(res => {
    //   that.setData({ detail: res.data });
    //   that.setData({ 
    //     tagDetail: res.data 
    //   });
    //   wx.setNavigationBarTitle({
    //     title: res.data.title
    //   });
    // });
  },

  //获取商品列表
  itemQuery() {
    let that = this;
    let { query, dataItem } = that.data;
    wx.showNavigationBarLoading();
    that.setData({ loading: true }, () => {
      Http.get(Config.api.itemQuery, query).then(res => {
        wx.hideNavigationBarLoading();
        let rd = res.data;
        if (query.page === 1) {
          that.setData({
            dataItem: rd,
            loading: false,
            showSkeleton: false
          });
        } else {
          dataItem.items = dataItem.items.concat(rd.items);
          that.setData({
            dataItem: dataItem,
            loading: false,
            showSkeleton: false
          });
        }
      }).catch(error => {
        wx.hideNavigationBarLoading();
        that.setData({
          'query.page': that.data.query.page - 1,
          loading: false
        });
      });
    });
  },
  
  //点击商品
  clickItem(e){
    let item = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: `/pages/itemDetail/itemDetail?id=${item.id}`,
    });
  },

  onPageScroll(e){
    if(this.scrollInterval) return;

    this.scrollInterval = setInterval(() => {
      wx.createSelectorQuery().selectAll('.load-more').boundingClientRect(lmv => {
        if(lmv.length > 0 && lmv[0].top - 400 <= this.windowHeight){
          this.loadMore();
        }
      }).exec();
      if(this.scrollInterval) clearInterval(this.scrollInterval);
      this.scrollInterval = undefined;
    }, 200);
  },
  
  /**
   * 加载更多
   */
  loadMore() {
    let that = this;
    let { query, dataItem, loading } = that.data;
    if(loading) return;
    if (dataItem.num / query.page_size > query.page) {
      that.setData({
        'query.page': query.page + 1
      }, () => {
        that.itemQuery();
      });
    }
  },
})