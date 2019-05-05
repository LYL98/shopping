const app = getApp();
import config from './../../utils/config';

Component({
    properties: {
        reason:{
          type: String
        },      
     },
    data:{
        reasons:[
            "质量问题","不足称重","其它"
        ],
        rn:''
    },
    attached() {
       
    },
    methods:{
        changeReason(e){
            let t = e.target.dataset.reason;
            this.setData({
                rn:t
            })
            this.triggerEvent('myevent', {
                reasonName:t,
                reason:false
            })
        }, 
        cancelFn(){
            let t = this.data.rn || this.properties.reason;
            this.triggerEvent('myevent', {
                reason:false,
                reasonName:t,
            })
        }   
    }
    
})
