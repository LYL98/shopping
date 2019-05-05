import config from './../../utils/config';
const app = getApp();

var x, y, x1, y1, x2, y2;

Component({
    properties: {
        list: {
            type: Array,
            observer: function(a,b) {
                this.init();
            }
        },
    },
    data: {
        current: -1,
        tencentPath: config.tencentPath,
        photographSrc: './../../assets/img/photograph.png',
        s_v: 15,
        s_h: 15,
        u_w: 210 / 2,
        u_h: 105 / 2,
        all_width: '',
        move_x: '',
        move_y: ''
    },
    attached: function () {
        this.init();
    },
    methods: {
        init() {
            var self = this;
            let arr_m = [];
            this.properties.list.map((item, index, list) => {
                let m = { id: (index + 1), text: item };
                arr_m.push(m)
            });
            this.setData({
                content: arr_m
            })
    
            var width = self.data.all_width = app.globalData.windowWidth, _w = 0, row = 0, column = 0;
            var arr = [].concat(self.data.content)
            arr.forEach(function (n, i) {
                n.left = (self.data.u_w + self.data.s_h) * row + self.data.s_h;
                n.top = (self.data.u_h + self.data.s_v) * column + self.data.s_v;
                n._left = n.left;
                n._top = n.top;
                _w += self.data.u_w + self.data.s_h;
                if (_w + self.data.u_w + self.data.s_h > width) {
                    _w = 0;
                    row = 0;
                    column++;
                } else {
                    row++;
                }

            });
            self.setData({
                content: arr
            })
        },
        movestart: function (e) {
            x = e.touches[0].clientX;
            y = e.touches[0].clientY;
            x1 = e.currentTarget.offsetLeft;
            y1 = e.currentTarget.offsetTop;
           
            this.setData({
                current: e.target.dataset.index,
                move_x: x1,
                move_y: y1
            });
        },
        move: function (e) {
            var self = this;
            // // console.log('move',e.target.dataset.current);
            x2 = e.touches[0].clientX - x + x1;
            y2 = e.touches[0].clientY - y + y1;

            var underIndex = this.getCurrnetUnderIndex();

            // var now_current=this.data.current;
            if (underIndex != null && underIndex != this.data.current) {
                var arr = [].concat(this.data.content);
                this.changeArrayData(arr, underIndex, this.data.current);

                this.setData({
                    content: arr,
                    current: underIndex
                })
            }
            // console.log(self.data.current,arr);


            this.setData({
                move_x: x2,
                move_y: y2
            });
        },
        moveend: function (e) {
            this.setData({
                current: -1,
            });
            let list = this.data.content;
            let arr = [];
            list.map( ele => arr.push(ele.text));
            this.triggerEvent('eventChange',{arr: arr});
        },
        changeArrayData: function (arr, i1, i2) {
            var temp = arr[i1];
            arr[i1] = arr[i2];
            arr[i2] = temp;

            var _left = arr[i1]._left, _top = arr[i1]._top;
            arr[i1]._left = arr[i2]._left;
            arr[i1]._top = arr[i2]._top;
            arr[i2]._left = _left;
            arr[i2]._top = _top;

            var left = arr[i1].left, top = arr[i1].top;
            arr[i1].left = arr[i2].left;
            arr[i1].top = arr[i2].top;
            arr[i2].left = left;
            arr[i2].top = top;
        },

        getCurrnetUnderIndex: function (endx, endy) {
            var endx = x2 + this.data.u_w / 2,
                endy = y2 + this.data.u_h / 2;
            var v_judge = false, h_judge = false, column_num = (this.data.all_width - this.data.s_h) / (this.data.s_h + this.data.u_w) >> 0;
            // console.log(endx,endy);
            var _column = (endy - this.data.s_v) / (this.data.u_h + this.data.s_v) >> 0;
            var min_top = this.data.s_v + (_column) * (this.data.u_h + this.data.s_v),
                max_top = min_top + this.data.u_h;
            // console.log('v', _column, endy, min_top, max_top);
            if (endy > min_top && endy < max_top) {
                v_judge = true;
            }
            var _row = (endx - this.data.s_h) / (this.data.u_w + this.data.s_h) >> 0;
            var min_left = this.data.s_h + (_row) * (this.data.u_w + this.data.s_h),
                max_left = min_left + this.data.u_w;
            // console.log('x', _row, endx, min_left, max_left);
            if (endx > min_left && endx < max_left) {
                h_judge = true;
            }
            if (v_judge && h_judge) {
                var index = _column * column_num + _row;
                if (index > this.data.content.length - 1) {
                    return null;
                } else {
                    return index;
                }
            } else {
                return null;
            }
        },
        upload: function (e) {
            this.triggerEvent('myevent')
        },
        removeImg: function(e) {
            let index = e.target.dataset.index;
            this.triggerEvent('eventDel',{index: index});
        }
    }
})
