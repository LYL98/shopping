const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

//返回价格
const returnPrice = (data) => {
  //let v = data?parseFloat(data/100).toFixed(2) : '0.00';
  let pr = data ? parseFloat(data / 100).toString() : '0';
  let index = pr.indexOf(".");
  if (index > 0) {
    pr = pr.substring(0, index + 3);
  }
  return pr;
}

//处理价格(元转为分)
const handlePrice = (price) =>{
  if (!price) return 0;
  let v = price * 100;
  return Math.round(v);
}

//返回折扣
var returnDiscount = function(data){
  var d = data ? parseFloat(data / 10).toString() : '0';
  var index = d.indexOf(".");
  if (index > 0) {
    d = d.substring(0, index + 2);
  }
  return d;
}

//数字前面自动补零(num传入的数字，n需要的字符长度)
const prefixInteger = (num, n) => {
  return (Array(n).join(0) + num).slice(-n);
}

//返回date字符串
const returnDateStr = (dateObj) => {
  var t = this;
  var myDate = dateObj || (new Date());
  return (myDate.getFullYear() + ("-")
    + (prefixInteger(myDate.getMonth() + 1, 2)) + ("-")
    + (prefixInteger(myDate.getDate(), 2)) + " "
    + (prefixInteger(myDate.getHours(), 2)) + ":"
    + (prefixInteger(myDate.getMinutes(), 2)) + ":"
    + (prefixInteger(myDate.getSeconds(), 2)));
}

//时间倒计时（结束时间）
const returnSurplusNum = (endDateStr) => {
  //结束时间
  let endDate = new Date(endDateStr.replace(/-/g, "/"));
  //当前时间
  let nowDate = new Date();
  //相差的总秒数
  let totalSeconds = parseInt((endDate - nowDate) / 1000);
  //天数
  let days = Math.floor(totalSeconds / (60 * 60 * 24));
  //取模（余数）
  let modulo = totalSeconds % (60 * 60 * 24);
  //小时数
  let hours = Math.floor(modulo / (60 * 60));
  modulo = modulo % (60 * 60);
  //分钟
  let minutes = Math.floor(modulo / 60);
  //秒
  let seconds = modulo % 60;

  return {
    days: days,
    hours: hours,
    minutes: minutes,
    seconds: seconds
  }
}

  //日期格式化
  /**
    *
    yyyy：年
    MM：月
    dd：日
    hh：1~12小时制(1-12)
    HH：24小时制(0-23)
    mm：分
    ss：秒
    S：毫秒
    E：星期几
    D：一年中的第几天
    F：一月中的第几个星期(会把这个月总共过的天数除以7)
    w：一年中的第几个星期
    W：一月中的第几星期(会根据实际情况来算)
    a：上下午标识
    k：和HH差不多，表示一天24小时制(1-24)。
    K：和hh差不多，表示一天12小时制(0-11)。
    z：表示时区
  */
 const returnDateFormat = (dateStr, format) => {
  if (!dateStr){
    return ''
  }else if (format === 'yyyy-MM-dd') {
    return dateStr.substring(0, 10);
  } else if (format === 'MM-dd') {
    return dateStr.substring(5, 10);
  } else if (format === 'HH:mm:ss') {
    return dateStr.substring(11, 19);
  } else if (format === 'HH:mm') {
    return dateStr.substring(11, 16);
  } else if (format === 'MM-dd HH:mm') {
    return dateStr.substring(5, 16);
  } else {
    return dateStr;
  }
}
//计算日期
const returnDateCalc = (dateStr, num) => {
  var dd = new Date(dateStr.replace(/-/g, "/"));
  dd.setDate(dd.getDate() + num);//获取AddDayCount天后的日期
  var y = dd.getFullYear();
  var m = (dd.getMonth() + 1) < 10 ? "0" + (dd.getMonth() + 1) : (dd.getMonth() + 1);//获取当前月份的日期，不足10补0
  var d = dd.getDate() < 10 ? "0" + dd.getDate() : dd.getDate();//获取当前几号，不足10补0
  return y + "-" + m + "-" + d;
}

// 两个时间相差的天数 2020-12-12
function dateDifference(sDate, eDate) {
	let dateSpan = 0,
		iDays = -1;
	sDate = Date.parse(sDate);
	eDate = Date.parse(eDate);
	if (sDate > eDate) return -1;
	dateSpan = Math.abs(eDate - sDate);
	iDays = Math.floor(dateSpan / (24 * 3600 * 1000));
	return iDays;
}

//uuid
function getUuid() {
  var d = new Date().getTime();
  if (window && window.performance && typeof window.performance.now === "function") {
      d += performance.now(); //use high-precision timer if available
  }
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
  return uuid;
}

//判断库存是否够数
var judgeItemStock = function(item){
  if(item.min_num_per_order > 0){
    if(item.item_stock < item.min_num_per_order){
      return false;
    }
    return true;
  }
  if(item.item_stock > 0){
    return true;
  }
  return false;
}

// 是否在当天的某个时间段内
var returnIsInTimeBucket = function(date, h1, m1, h2, m2) {
  var h = date.getHours();
  var m = date.getMinutes();
  return (h1 < h || h1 == h && m1 <= m) && (h < h2 || h == h2 && m <= m2);
}

module.exports = {
  formatTime: formatTime,
  returnPrice: returnPrice,
  handlePrice: handlePrice,
  returnDateStr: returnDateStr,
  returnSurplusNum: returnSurplusNum,
  returnDateFormat: returnDateFormat,
  returnDateCalc: returnDateCalc,
  getUuid: getUuid,
  judgeItemStock: judgeItemStock,
  returnDiscount: returnDiscount,
  returnIsInTimeBucket: returnIsInTimeBucket,
  dateDifference: dateDifference,
}
