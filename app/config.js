/***
 * 修改基础配置
 */

//是否开发(dev开发、test测试；pre预发布；pro生产)
export const Conn = 'test';

//测试环境api地址
export const RequestHttpDev = 'https://vestadev.pgyscm.com';
export const RequestWsDev = 'wss://iris.pgyscm.com/connection/websocket';

//测试发布环境api地址
export const RequestHttpTest = 'https://vestatest.pgyscm.com';
export const RequestWsTest = 'wss://iris.pgyscm.com/connection/websocket';

//预发布环境api地址
export const RequestHttpPre = 'https://vestapre.pgyscm.com';
export const RequestWsPre = 'wss://iris.pgyscm.com/connection/websocket';

//生产环境api地址
export const RequestHttpPro = 'https://vesta.pgyscm.com';
export const RequestWsPro = 'wss://iris.pgyscm.com/connection/websocket';
//测试环境腾讯上传Bucket、Region
export const TencentBucketDev = 'durian-dev-1258811046';
export const TencentRegionDev = 'ap-shanghai';

//生产环境腾讯上传Bucket、Region
export const TencentBucketPro = 'durian-pro-1258811046';
export const TencentRegionPro = 'ap-shanghai';

//测试环境腾讯下载地址
export const TencentPathDev = 'https://cdn-vesta-dev.pgyscm.com/';

//生产环境腾讯下载地址
export const TencentPathPro = 'https://cdn-vesta-pro.pgyscm.com/';

//服务电话
export const ServiceTel = '4008258522';

//要打开的微信appids
export const WeiXinAppIds = ['wxd71d35efcb08acc8', 'wx1653f76966571193'];

//版本
export const Version = 'V4.2.0';

//growingio配置
export const GioConfig = {
    projectId: 'a2dac281ef3539e4', //'你的 GrowingIO 项目ID',
    appId: 'wx70a3bf5f7a69987d', //'你的小程序AppID',
    version: Version, //'小程序版本'
};

/**
 * 配置project.config.json文件里的appid
 * wx70a3bf5f7a69987d
 * 
 * 配置app.json文件里的 navigateToMiniProgramAppIdList
 * ["wxd71d35efcb08acc8"]
 */