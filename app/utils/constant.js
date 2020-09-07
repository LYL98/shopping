module.exports = {
  //分页大小
  PAGE_SIZE: 20,
  //订单状态
  ORDER_STATUS: {
    wait_confirm: '待确认',
    confirmed: '待发货',
    assigned: '待发货',
    wait_delivery: '待发货',
    deliveried: '待收货',
    received: '已完成',
    order_done: '已完成',
    order_canceled: '已取消'
  },
  //付款状态
  PAY_STATUS: {
    wait_pay: '待付款',
    wait_complete: '待补款',
    done: '已完成'
  },
  //付款类型
  PAY_TYPE: {
    weixin: '微信',
    balance: '余额'
  },
  //订单价格变动原因
  PRICE_CHANGE: {
    short: '缺货',
    weight_up: '实重上升',
    weight_down: '实重下降'
  },
  //售后单状态
  AFTER_SALE_STATUS: {
    init: '处理中',
    waiting_response: '处理中',//之前为待响应，后续会删除
    waiting_dispose: '处理中',
    handling: '处理中',
    close: '已完成',
  },
  //售后单处理结果
  AFTER_SALE_RESULT: {
    init: '请您留意及跟进协商处理', //正在处理
    refund: '处理结果：退款', //退款
    'return': '处理结果：退货', //退货
    refund_return: '处理结果：退款、退货', //退款、退货
    ignore: '处理结果：已协商无需处理' //不处理
  },
  //零钱变更记录
  BALANCE_CHANGE: {
    manual_deduct: '手动扣款',
    pay: '用户支付',
    top_up: '用户充值',
    freight_redone: '运费重算',
    sys_refund: '系统退款',
    cancel_order_refund: '订单取消退款',
    after_sale_refund: '售后退款',
    frame_return: '退框退款',
    refund_for_pay_after_cancel: '金额退回',
    manual_aftersale: '退赔售后(手动充值)',
    manual_discount: '优惠充值(手动充值)',
    manual_promotion: '活动充值(手动充值)',
    manual_frame_return: '周转筐充值(手动充值)',
    manual_return_cash: '返点充值(手动充值)',
    manual_freight_redone: '运费充值(手动充值)',
    gb_profit: '团购收益金',
    gb_transfer: '团购余额转账',
    manual_other: '其他(手动充值)'
  },
  //订单退款退还
  ORDER_REFUND: {
    sys_refund: '改单退款',
    cancel_order_refund: '取消订单退款',
    freight_redone: '运费重算',
    pay_after_cancel: '金额退回'
  },
  //优惠券类型
  COUPON_TYPE: {
    type_reduction: '订单满减券',
    type_discount: '订单满折券',
    type_gift: '订单满赠券',
    type_delivery: '运费优惠券'
  }
}