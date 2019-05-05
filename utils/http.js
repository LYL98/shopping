
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
      let tokenKey = app.globalData.loginUserInfo.token_key; //动态tokenKey
      wx.request({
        url: url,
        header: {
          'content-type': 'application/json',
          [tokenKey || type]: app.globalData.loginUserInfo.access_token
        },
        method: method,
        data: data || {},
        success: function (res) {
          if (res.statusCode == 200 && res.data.code === 0) {
            resolve(res.data)
          } else {
            app.requestResultCode(res);
            reject(res);
          }
        },
        fail: function(res) {
          reject(res);
        },
        complete: function (res) {
          //判断是否网络超时
          app.requestTimeout(res, () => {
            that.request(method, url, data);
          });
        }
      });
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