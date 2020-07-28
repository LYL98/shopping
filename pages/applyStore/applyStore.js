// pages/applyStore/applyStore.js
import config from './../../utils/config';
import { Http, Config } from './../../utils/index';
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    applyStatus: 'uncommitted',
    area:[
      {key:'lt_50', name: '<50平米'},
      {key:'in_50_100', name: '50-100平米'},
      {key:'gt_100', name: '>100平米'}
    ],
    areaIndex:-1,
    ages: [
      { key:'before_70', name: '70前' },
      { key:'after_70', name: '70后' },
      { key:'after_80', name: '80后' },
      { key:'after_90', name: '90后' }
    ],
    agesIndex:-1,
    facility:[{key:'freeze', name: '冰柜', checked: false}, {key:"colfd", name:"冷藏", checked: false}],
    address: "",
    detailAddress: "",
  },

  onLoad: function (options) {
    this.ad = app.getSelectStore()
    this.getApplyStatus()
  },

  onReady: function () {

  },

  onShow: function () {

  },

  bindPickerChange(e) {
    const index = e.detail.value
    const { type } = e.currentTarget.dataset
    console.log(index, type)
    this.setData({
      [`${type}Index`]: index
    })
  },

  changeFacility(e) {
    const {index} = e.currentTarget.dataset
    this.setData({
      [`facility[${index}].checked`]: !this.data.facility[index].checked
    })
  },

  changeInput(e) {
    const {detail, currentTarget} = e
    this.setData({
      [currentTarget.dataset.type] : detail.value
    })
  },

  getLocationCB(e) {
    console.log(e)
    const { lat, lng, address } = e.detail
    this.data.location = {lat, lng}
    this.setData({
      address,
    })
  },

  getApplyStatus() {
    let store_id = this.ad.id
    Http.get(Config.api.storeApplyStatus,{
        store_id:store_id
      }).then(res => {
      console.log(res)
      const { business_ares, kp_age, address, geo, status} = res.data
      if(status == 'uncommitted') {
        this.pregeo = geo || {}
        //TODO: 年龄 经营面积处理
        // this.setData({
        //   address: address,
        // })
      }
      this.setData({
        applyStatus: status,
      })
    })
  },


  applyStore() {
    console.log(this.data)
    console.log(this.ad)
    // const {business_ares, geo, id} = this.ad
    const {ages, agesIndex, area, areaIndex, address, detailAddress, facility } = this.data
    let selectFacility = []
    facility.forEach(item => {
      if(item.checked) {
        selectFacility.push(item.name)
      }
    })
    if(selectFacility.length < 1) {
      wx.showToast({ title: '店内设施不能为空', icon: 'none' })
      return
    }
    if(areaIndex < 0) {
      wx.showToast({ title: '经营面积不能为空', icon: 'none' })
      return
    }
    if(agesIndex < 0) {
      wx.showToast({ title: '年龄不能为空', icon: 'none' })
      return
    }
    if(!address || address.trim().length < 1) {
      wx.showToast({ title: '门店地址不能为空', icon: 'none' })
      return
    }
    // if(!detailAddress || detailAddress.trim().length < 1) {
    //   wx.showToast({ title: '详细地址不能为空', icon: 'none' })
    //   return
    // }

    Http.post(Config.api.storeApply, {
      store_id: this.ad.id,
      business_ares: area[areaIndex].name,
      kp_age: ages[agesIndex].name,
      facility: selectFacility,
      address: address + detailAddress,
      geo: {...this.pregeo, ...this.data.location}, //目前只更新经纬度
    }).then(res => {
      // 更新状态
      this.getApplyStatus()
    })
  }
})