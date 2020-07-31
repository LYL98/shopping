// components/selectStore/selectStore.js
//获取应用实例
const app = getApp();
import config from './../../utils/config';

Component({
    /**
     * 组件的属性列表
     */
    properties: {
        categoryList: {
            type: Array
        },
        currentDisplay:{
            type: Object
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        locationSrc: './../../assets/img/location.png',
        downSrc: './../../assets/img/arrow_down2.png',
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
            let that = this
            this.setData({
                dataItem: that.properties.categoryList
            })
            console.log(that.data.addressTemp);
            if(that.properties.currentDisplay.id){
                that.setData({
                    addressTemp: that.properties.currentDisplay
                })
            }
        }
    },

    pageLifetimes: {
    },

    /**
     * 组件的方法列表
     */
    methods: {
        //选择门店
        selectStore(e) {
            let index = e.currentTarget.dataset.index;
            let {
                dataItem
            } = this.data;
            this.setData({
                addressTemp: dataItem[index]
            });
        },

        //确认选择门店
        affirmSelectStore() {
            let {
                addressTemp
            } = this.data;
            if (addressTemp.id) {
                this.setData({
                }, () => {
                    this.triggerEvent('callback', addressTemp); //触发回调事件
                    this.cancelSelect();
                });
            } else {
                wx.showToast({
                    title: '请选择商品分类',
                    icon: 'none'
                });
            }
        },

        //取消选择
        cancelSelect() {
            let {
                address
            } = this.data;
            this.triggerEvent('toggle');
        },
    }
})