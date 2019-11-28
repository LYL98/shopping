
const http = {
  request: function(method, url, data, type) {
    if (!url) {
      throw new Error('缺少请求的URL');
      return;
    }
    if (data && typeof data !== 'object') {
      throw new Error('请求参数必须为object');
      return;
    }

    let that = this;
    return new Promise((resolve, reject) => {
      const app = getApp(); //移动到此位置，防止app.js调用出错
      const fun = () => {
        let tokenKey = app ? app.globalData.loginUserInfo.token_key : ''; //动态tokenKey
        wx.request({
          url: url,
          header: {
            'content-type': 'application/json',
            [tokenKey || type]: app ? app.globalData.loginUserInfo.access_token : ''
          },
          method: method,
          data: data || {},
          success: function (res) {
            if (res.statusCode == 200 && res.data.code === 0) {
              resolve(res.data)
            } else {
              //不提示判断
              if(!data.is_no_prompt) app.requestResultCode(res);
              reject(res);
            }
          },
          fail: function(res) {
            //reject(res); //已在complete处理
          },
          complete: function (res) {
            //不提示判断
            if(!data.is_no_prompt){
              //判断是否网络超时
              app.requestTimeout(res, (result) => {
                if(result === 'fail' || result === 'cancel'){
                  reject(res);
                }else{
                  fun();
                }
              });
            }else{
              reject(res);
            }
          }
        });
      }
      fun();
    })
  }
}

module.exports = {
  get: function(url, data) {
    return http.request('GET', url, data, 'Durian-Groupbuy-Access-Token');
  },
  post: function(url, data) {
    return http.request('POST', url, data, 'Durian-Groupbuy-Access-Token');
  }
}