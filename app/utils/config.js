/***
 * 导入配置
 */
import {
  Conn,
  // LSRequestHttpDev,
  RequestHttpDev,
  RequestHttpTest,
  RequestHttpPre,
  RequestHttpPro,
  RequestWsDev,
  RequestWsTest,
  RequestWsPre,
  RequestWsPro,
  TencentBucketDev,
  TencentRegionDev,
  TencentBucketPro,
  TencentRegionPro,
  TencentPathDev,
  TencentPathPro,
  ServiceTel,
  WeiXinAppIds,
  Version,
  GioConfig
} from './../config';

//config
let requestHttp = '', requestWs = '' , tencentBucket = '', tencentRegion = '', tencentPath = '';
switch(Conn){
  case 'dev':
    requestHttp = RequestHttpDev;
    requestWs = RequestWsDev
    tencentBucket = TencentBucketDev;
    tencentRegion = TencentRegionDev;
    tencentPath = TencentPathDev;
    break;
  case 'test':
    requestHttp = RequestHttpTest;
    requestWs = RequestWsTest
    tencentBucket = TencentBucketDev;
    tencentRegion = TencentRegionDev;
    tencentPath = TencentPathDev;
    break;
  case 'pre':
    requestHttp = RequestHttpPre;
    requestWs = RequestWsPre
    tencentBucket = TencentBucketPro;
    tencentRegion = TencentRegionPro;
    tencentPath = TencentPathPro;
    break;
  default:
    requestHttp = RequestHttpPro;
    requestWs = RequestWsPro
    tencentBucket = TencentBucketPro;
    tencentRegion = TencentRegionPro;
    tencentPath = TencentPathPro;
}

let apiC = requestHttp + '/c';
let apiCommon = requestHttp + '/common';


module.exports = {
  api: {
    signLogin: apiC + '/login',//登录
    signUpdateOUID: apiC + '/update_ouid', //更新用户的oid和uid
    signIsLogin: apiC + '/sign/is_login',//判断是否登录
    signUnBindWechat: apiC + '/sign/unbind_wechat', //解绑定微信
    profilePasswordModify: apiC + '/profile/password_modify',//用户密码修改
    tencentUploadPresignedUrl: apiCommon + '/tencent/presigned_url',//获取腾讯presigned_url
    tencentTmpSecret: apiCommon + '/tencent/tmp_secret',//获取腾讯上传配置
    messageFormAdd: apiC + '/member/form/add', //formid收集

    banner: apiC + '/item/banner', //banner首页
    noticeList: apiC + '/order/marquee', //banner首页
    itemTagsList: apiC + '/item/tags/list', //tags首页
    itemTagsListNew: apiC + '/item/tags/list_new', //tags首页
    itemTagsDetail: apiC + '/item/tags/detail', //tags详情
    itemCollectionAdd: apiC + '/item/collection/add',//商品收藏信息添加
    itemCollectionCancel: apiC + '/item/collection/cancel',//商品收藏信息取消
    itemCollectionQuery: apiC + '/item/collection/query',//收藏商品展示
    itemDetail: apiC + '/item/detail',//商品详情
    itemDetailCoupon: apiC + '/coupon/item/available/query',//商品详情优惠券
    receiveCoupon: apiC + '/coupon/receive/query',//可领取优惠券列表
    displayClassQuery: apiC + '/display_class/list',//商品分类展示
    itemListDisplayClass: apiC + '/item/query/by_display_class',//用户端商品浏览(根据展示分类code)
    itemListDisplayClassNew: apiC + '/item/query/by_display_class_new', //用户端商品浏览(根据展示分类code)new
    itemQuery: apiC + '/item/query',//商品搜索
    itemCartQuery: apiC + '/cart/item/list',//商品库存查询(购物车用)
    itemCartEdit: apiC + '/cart/item/num/edit',//购物车数量修改(购物车用)
    itemCartSelected: apiC + '/cart/item/selected',//购物车单选
    itemCartSelectedAll: apiC + '/cart/item/select_all',//购物车全选
    itemCartAdd: apiC + '/cart/item/add',//加入购物车
    itemCartRemove: apiC + '/cart/item/remove',//移除购物车
    itemCartTotalNum: apiC + '/cart/item/total_num',//获取购物车数量
    cartOrderAgain: apiC + '/cart/order/again',//获取购物车数量
    itemRecoentlyBuy: apiC + '/item/list/recent_buy',//最近购买商品
    activity: apiC + '/order/delivery/info',//邮费优惠
    getNewCoupon: apiC + '/promotion/new_store_coupon/query', //获取新人优惠券

    promotion: apiC + '/promotion', //全场的活动

    profile: apiC + '/profile',//用户信息
    myCsm: apiC + '/my_csm', //我的客户经理
    logout: apiC + '/sign/logout',//退出
    merchantDetail: apiC + '/merchant/detail',//商户基本信息
    merchantBalance: apiC + '/merchant/balance',//商户余额
    merchantStoreList: apiC + '/merchant/store/list',//商户门店列表
    merchantStoreDetail: apiC + '/store/detail',//商户门店详情
    getStoreTags: apiC + '/store/tags', //获取门店tags
    editStore: apiC + '/store/edit', //编辑门店
    memberList: apiC + '/merchant/member/list', //用户所在商户的用户列表信息查询
    upavatar: apiC +'/profile/modify',  //头像上传
    messageInfo: apiC + '/message/info', // 获取消息信息，包含未读消息的数量
    messageQuery: apiC + '/message/query', // 消息列表

    orderPre: apiC + '/order/pre',//预生成订单
    orderAdd: apiC + '/order/add',//创建订单
    orderQuery: apiC + '/order/query',//批量查询订单
    orderDetail: apiC + '/order/detail',//获取单个订单详情
    orderCancel: apiC + '/order/cancel',//订单取消
    orderPay: apiC + '/order/pay',//订单支付
    orderPayConfirm: apiC + '/order/pay/confirm',//支付确认
    orderConfirmReceive: apiC + '/order/receive', // 确认收货
    weappGetOpenId: apiCommon + '/weapp/get_openid', //code获取openid
    isOrderTime: apiC + '/order/info', //是否可下单
    aftersaleCandidate: apiC + '/aftersale/candidate', //获取可申请售后的订单
    aftersaleQuery: apiC + '/aftersale/query', //获取售后单列表
    aftersaleAddData: apiC + '/aftersale/get_order_item', //获取提交售后页面信息(get)
    aftersaleAdd: apiC + '/aftersale/add', //提交售后页面信息(post)
    aftersaleDetail: apiC + '/aftersale/detail', //获取售后单详情
    aftersaleComment: apiC + '/aftersale/append', //售后消息追加
    afterMsg: apiC + '/aftersale/dialog/read/info', //售后消息
    salebackDetail: apiC + '/saleback/detail', //退货单详情
    gradeDetail: apiC + '/vip/config/desc/get', // 会员等级说明
    myGradeLevel: apiC + '/vip/myself', // 会员等级说明
    

    balanceTopup: apiC + '/balance/topup',//余额充值
    balanceTopupConfirm: apiC + '/balance/topup/confirm',//余额充值确认
    balanceLog: apiC + '/balance/log',//获取余额变动记录
    
    couponList: apiC + '/promotion/own_coupon/query', //优惠券列表(我的优惠券)
    orderCouponList: apiC + '/order/coupon/list', //优惠券列表(下单选择优惠券)
    userVipSelf: apiC + '/vip/myself', //获取用户level
  
    // v4.3
    myCoupon: apiC + '/coupon/mine', // 我的优惠券
    getCoupon: apiC + '/coupon/receive', // 立即领取优惠券
    queryCoupon: apiC + '/coupon/gain/list', // 查询获取优惠券（弹窗）
    availableAllCoupon : apiC + '/coupon/receive/query', // 可领取的优惠券列表(所有)
    availableCoupon : apiC + '/coupon/item/available/query', // 可领取的优惠券列表（商品）


    sysBrand: apiC + '/basicdata/constant/brand', //获取品牌
    sysService: apiC + '/basicdata/constant/customer_service', //投诉电话
    unifiedDescription: apiC + '/basicdata/constant/unified_description', //获取商品统一描述

    liveQuery: apiC + '/live_video/query',    //  直播查询
    liveRepQuery: apiC + '/live_rep/query',   //  重播查询
    liveRoomMark: apiC + '/room/mark',        //  直播间订阅
    liveRoomUnMark: apiC + '/room/un_mark',   //  直播间取消订阅

    adviceItem:apiC + '/advice_item',
    
    
    hotSaleItems: apiC + '/item/top', // 热销榜单
    storeApply: apiC + '/included/apply', // 门店申请
    storeApplyStatus: apiC + '/included/apply/status', // 门店申请状态

  },
  //腾讯Bucket、Region
  tencentBucket: tencentBucket, //Bucket
  tencentRegion: tencentRegion, //Region

  tencentPath: tencentPath, //腾讯下载地址
  serviceTel: ServiceTel, //服务电话
  weiXinAppIds: WeiXinAppIds, //要打开的微信appids
  conn: Conn,
  requestWs: requestWs, // wensocket
  version: Version,
  gioConfig: GioConfig
}