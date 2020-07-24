// pages/applyStore/applyStore.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    area:[
      {key:'lt_50', name: '< 50平米'},
      {key:'in_50_100', name: '50<100平米'},
      {key:'gt_100', name: '> 100平米'}
    ],
    areaIndex:-1,
    ages: [
      { key:'before_70', name: '70前' },
      { key:'after_70', name: '70后' },
      { key:'after_80', name: '80后' },
      { key:'after_90', name: '90后' }
    ],
    agesIndex:-1,
    facility:[{key:'freeze', name: '冰柜'}, {key:"colfd", name:"冷藏"}],
    facilityIndex: 0,
    address: "",
    detailAddress: "",
  },

  onLoad: function (options) {
 
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
      facilityIndex: index
    })
  },

  getLocationCB(e) {
    console.log(e)
  }

})