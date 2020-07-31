/***
 * 修改基础配置（在根目录新增config.js，写入以下内容，并修改成实际的地址）
 */

//是否开发(dev开发；test测试；pre预发布；pro生产)
export const Conn = 'dev';

//开发环境api地址
export const RequestHttpDev = 'https://xxx.xxx.xxx';

//测试环境api地址
export const RequestHttpTest = 'https://xxx.xxx.xxx';

//预发布环境api地址
export const RequestHttpPre = 'https://xxx.xxx.xxx';

//生产环境api地址
export const RequestHttpPro = 'https://xxx.xxx.xxx';

//测试环境腾讯上传Bucket、Region
export const TencentBucketDev = 'xxxx';
export const TencentRegionDev = 'xxxx';

//生产环境腾讯上传Bucket、Region
export const TencentBucketPro = 'xxxx';
export const TencentRegionPro = 'xxxx';

//测试环境腾讯下载地址
export const TencentPathDev = 'https://cdn-xxx.xxx.xxx/';

//生产环境腾讯下载地址
export const TencentPathPro = 'https://cdn-xxx.xxx.xxx/';

//服务电话
export const ServiceTel = '1234567890';

//要打开的微信appids
export const WeiXinAppIds = ['wxxxxxxxxxxxxxxx', 'xxxxxxxxxxxxxx'];
// WeiXinAppIds[0] 满天星优选 wxd71d35efcb08acc8
// WeiXinAppIds[1] 门店助手 wx1653f76966571193


//版本1
export const Version = 'Vx.x.x';

//growingio配置
export const GioConfig = {
    projectId: 'xxxxxxxxxx', //'你的 GrowingIO 项目ID',
    appId: 'wxxxxxxxxxxxxxxx', //'你的小程序AppID',
    version: Version //'小程序版本'
};