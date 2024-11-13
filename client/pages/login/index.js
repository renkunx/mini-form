const app = getApp()
const { doRequest, showModel } = require('../../utils/utils')
const config = require('../../config')
// 引入 QCloud 小程序增强 SDK
var qcloud = require('wafer2-client-sdk/index');
Page({
  data: {
    checked: false,
    phone: '',
    code: '',
    timer: null,
    countdown: 60,
    canGetCode: true,
    logo:'https://i.haidao.tech/mini-form%E5%B0%8F%E7%A8%8B%E5%BA%8F%E9%A6%96%E9%A1%B5/logo.png'
  },

  onLoad() {
    // 检查是否已登录
    if(app.globalData.logged) {
      wx.switchTab({
        url: '/pages/usercenter/index'
      })
    }
  },

  onShow() {
    this.init();
  },
  onPullDownRefresh() {
    this.init();
  },

  init() {
    if(this.data.logged || app.globalData.logged){
      this.setData({
        userInfo: wx.getStorageSync('userInfo')
      })
    } else {
      this.loginWX();
    }
  },

  // 同意协议
  onCheckChange(event) {
    const { checked } = event.detail;
    this.setData({
      checked
    });
  },

  // 获取手机号 
  getPhoneNumber(e) {
    if(!this.data.checked) {
      wx.showToast({
        title: '请先同意用户协议',
        icon: 'none'
      })
      return
    }

    if(e.detail.code) {
      doRequest({
        url: config.service.phoneUrl,
        method: 'POST',
        data: {
          code: e.detail.code
        },
        success: (res) => {
          if(res.data.code === 0) {
            const phoneNumber = res.data.data.phoneNumber
            // 保存手机号
            doRequest({
              url: config.service.userUrl,
              method: 'POST', 
              data: {
                phone: phoneNumber
              },
              success: () => {
                app.globalData.logged = true
                wx.navigateBack({
                  delta: 1
                })
              }
            })
          }
        }
      })
    }
  },

  // 查看协议
  viewAgreement() {
    wx.navigateTo({
      url: '/pages/404/index'
    })
  },
  loginWX(){
    const session = qcloud.Session.get()
    // 设置登录地址
    qcloud.setLoginUrl(config.service.loginUrl);
    if (session) {
      // 第二次登录
      // 或者本地已经有登录态
      // 可使用本函数更新登录态
      qcloud.loginWithCode({
        success: () => {
          this.getUserInfo()
        },
        fail: err => {
          console.error(err)
          showModel('登录错误', err.message)
        }
      })
    } else {
      // 首次登录
      qcloud.login({
        success: () => {
          this.getUserInfo()
        },
        fail: err => {
          console.error(err)
          showModel('登录错误', err.message)
        }
      })
    }
  },
  getUserInfo(){
    doRequest({
      url: config.service.userUrl,
      method: 'GET',
      success: (res) => {
        const {code, data} = res.data
        data.avatarUrl = data.avatarUrl || 'https://i.haidao.tech/mini-form%E5%B0%8F%E7%A8%8B%E5%BA%8F%E9%A6%96%E9%A1%B5/avatar.jpg'
        this.setData({
          userInfo: data,
        })
        app.globalData.userInfo = data
        wx.setStorageSync('userInfo', data)
      },
      fail: () => {
        wx.showToast({
          title: '登录错误',
          icon: 'none',
          duration: 2000,
        });
      },
    });
  }
}) 