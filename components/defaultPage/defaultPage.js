// components/defaultPage/defaultPage.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    currentPage: { type: String, value: '' }
  },

  /**
   * 组件的初始数据
   */
  data: {
    pageOption: {
      myMessage: { imgSrc: './../../assets/img/default_page_my_message.png', title: '暂无消息' },
      coupon: { imgSrc: './../../assets/img/default_page_coupon.png', title: '一张优惠券都没有~' },
      myCsm: { imgSrc: './../../assets/img/default_page_my_csm.png', title: '暂无客户经理' },
      shop: { imgSrc: './../../assets/img/default_page_shop.png', title: '暂无门店' },
      afterSaleAwait: { imgSrc: './../../assets/img/default_page_after_sale_record.png', title: '暂无可申请订单' },
      afterSaleRecord: { imgSrc: './../../assets/img/default_page_after_sale_record.png', title: '还没有申请过售后' },
      search: { imgSrc: './../../assets/img/default_page_search.png', title: '抱歉, 没有找到您搜索的' },
      order: { imgSrc: './../../assets/img/default_page_order.png', title: '一个订单都没有' },
      shoppingCart: { imgSrc: './../../assets/img/default_page_shopping_cart.png', title: '购物车空空如也' },
      itemList: { imgSrc: './../../assets/img/default_page_item_list.png', title: '还没有商品呢' },
      itemLabel: { imgSrc: './../../assets/img/default_page_item_list.png', title: '还没有商品呢' },
      accountRecord: { imgSrc: './../../assets/img/default_page_account_record.png', title: '暂无账户明细' }

    },
    default: {
      imgSrc: '',
      title: ''
    }
  },

  lifetimes: {
    attached() {
      this.setDefaultPage();
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    setDefaultPage() {
      this.setData({
        default: this.data.pageOption[this.properties.currentPage]
      })
    }
  }
})
