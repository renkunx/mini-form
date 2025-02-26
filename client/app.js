/**
 * @fileOverview 微信小程序的入口文件
 */

var qcloud = require('wafer2-client-sdk/index');
var config = require('./config');

App({
    /**
     * 小程序初始化时执行，我们初始化客户端的登录地址，以支持所有的会话操作
     */
    onLaunch() {
        qcloud.setLoginUrl(config.service.loginUrl);
    },
    onShow(options) {
      const { recommender } = options.query
      if(recommender){
        wx.setStorageSync('recommender', {sort: Number(recommender)})
      }
      const userInfo = wx.getStorageSync('userInfo')
      if(userInfo){
        this.globalData = {
          userInfo,
          logged:true
        }
      }
    },
    globalData: {
      userInfo: null,
      logged: false
    }
});