// 引入 QCloud 小程序增强 SDK
const qcloud = require('../vendor/wafer2-client-sdk/index');

const showBusy= text => wx.showToast({
  title: text,
  icon: 'loading',
  duration: 10000,
  mask: true,
})
// 显示成功提示
const showSuccess= text => wx.showToast({
  title: text,
  icon: 'success'
})

// 显示失败提示
const showModel= (title, content) => {
  wx.hideToast();

  wx.showModal({
      title,
      content: JSON.stringify(content),
      showCancel: false
  });
}

module.exports = {
  showBusy,
  showSuccess,
  showModel,
  /**
   * 点击「请求」按钮，测试带会话请求的功能
   */
  doRequest:({url,success,fail,complete,login=false,...rest}) =>{
    showBusy('正在请求');

    // qcloud.request() 方法和 wx.request() 方法使用是一致的，不过如果用户已经登录的情况下，会把用户的会话信息带给服务器，服务器可以跟踪用户
    qcloud.request({
        // 要请求的地址
        url: url,

        // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
        login: login,
        ...rest,
        success(result) {
            success && success(result)
        },

        fail(error) {
            fail && fail(error)
        },

        complete() {
          wx.hideToast()
          complete && complete()
        }
    });
  },
}