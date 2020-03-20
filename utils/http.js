const TOKEN_DEFAULT_KEY = 'Vesta-Custom-Access-Token';
const SUCCESS_STATUS_CODE = 200; // 正确的响应码
const SUCCESS_DATA_CODE = 0; // 正确的数据码
let CATCHE_POSTED_LIST = []; // 缓存 post api 请求 的列表 { url: string, latest_timestamp: number  }

const initConfig = function (method, config) {
  let contentType = config && config.contentType || 'application/json';
  let handleError = true;
  let throttle = method == 'GET' ? false : true;

  if (config && typeof config.handleError === 'boolean') {
    handleError = config.handleError;
  }

  if (method === 'POST' && config && typeof config.throttle === 'boolean') {
    throttle = config.throttle;
  }

  return {contentType, handleError, throttle};
}

const request = function (method, url, data, config) {
  if (!url) {
    throw new Error('缺少请求的URL');
    return;
  }
  if (data && typeof data !== 'object') {
    throw new Error('请求参数必须为object');
    return;
  }

  const {contentType, handleError, throttle} = initConfig(method, config);

  return new Promise((resolve, reject) => {

    if (throttle) {
      let posted = CATCHE_POSTED_LIST.find(item => item.url === url);

      if (posted) {

        if (posted.latest_timestamp + (3 * 1000) > new Date().getTime()) {
          console.warn('提交频率过于频繁，请稍后重试！', posted);
          reject({message: '提交频率过于频繁，请稍后重试！'});
          return;
        }

        posted.latest_timestamp = new Date().getTime();
      } else {
        posted = {url: url, latest_timestamp: new Date().getTime()}
        CATCHE_POSTED_LIST.push(posted);
      }
    }


    const app = getApp(); //移动到此位置，防止app.js调用出错

    let tokenKey = (app && app.getTokenKey()) || ''; //动态tokenKey
    let accessToken = (app && app.getAccessToken()) || '';

    const fun = () => {

      wx.request({
        url: url,
        header: {
          'content-type': contentType,
          [tokenKey || TOKEN_DEFAULT_KEY]: accessToken
        },
        method: method,
        data: data || {},
        success: function (res) {
          if (res.statusCode == SUCCESS_STATUS_CODE && res.data && res.data.code == SUCCESS_DATA_CODE) {
            resolve(res.data)
          } else {
            handleError && app.requestResultCode(res);
            reject(res);
          }
        },
        complete: function (res) {

          if (!handleError) {
            reject(res);
            return;
          }

          app && app.requestTimeout(res, (result) => {
            if (result === 'timeout') {
              fun();
            } else {
              reject(res);
            }
          });
        }
      });
    }
    fun();
  })
};

module.exports = {
  get: function (url, data, config) {
    return request('GET', url, data, config);
  },

  post: function (url, data, config) {
    return request('POST', url, data, config);
  }
}