import Toast from 'tdesign-miniprogram/toast/index';
// 引入 QCloud 小程序增强 SDK
var qcloud = require('../../vendor/wafer2-client-sdk/index');
const { showBusy, showModel, showSuccess } = require('../../utils/utils')
const app = getApp()
const menuData = [
  [{
    title: '历史提交',
    tit: '',
    url: '',
    type: 'history',
  }, ],
  [{
    title: '清除缓存',
    tit: '',
    url: '',
    type: 'clear-storage',
  },{
      title: '帮助中心',
      tit: '',
      url: '',
      type: 'help-center',
    },
    {
      title: '客服热线',
      tit: '',
      url: '',
      type: 'service',
      icon: 'service',
    },
  ],
];

const getDefaultData = () => ({
  showMakePhone: false,
  userInfo: {
    avatarUrl: '',
    nickName: '正在登录...',
    phoneNumber: '',
  },
  menuData,
  customerServiceInfo: {},
  currAuthStep: 1,
  showKefu: true,
  versionNo: '',
  logged: false || app.globalData.logged
});

Page({
  data: getDefaultData(),

  onLoad() {
    this.getVersionInfo();
  },

  onShow() {
    this.init();
  },
  onPullDownRefresh() {
    this.init();
  },

  init() {
    !this.data.logged && this.loginWX();
  },

  onClickCell({
    currentTarget
  }) {
    const {
      type
    } = currentTarget.dataset;

    switch (type) {
      case 'clear': {
        wx.clearStorage()
        break;
      }
      case 'service': {
        this.openMakePhone();
        break;
      }
      case 'help-center': {
        Toast({
          context: this,
          selector: '#t-toast',
          message: '你点击了帮助中心',
          icon: '',
          duration: 1000,
        });
        break;
      }
      case 'clear-storage': {
        wx.clearStorage()
        wx.showToast({
          title: '清除成功',
        })
        break;
      }
      case 'history': {
        wx.navigateTo({
          url: '/pages/usercenter/address/list/index'
        });
        break;
      }
      default: {
        Toast({
          context: this,
          selector: '#t-toast',
          message: '未知跳转',
          icon: '',
          duration: 1000,
        });
        break;
      }
    }
  },

  jumpNav(e) {
    const status = e.detail.tabType;

    if (status === 0) {
      wx.navigateTo({
        url: '/pages/order/after-service-list/index'
      });
    } else {
      wx.navigateTo({
        url: `/pages/order/order-list/index?status=${status}`
      });
    }
  },

  jumpAllOrder() {
    wx.navigateTo({
      url: '/pages/order/order-list/index'
    });
  },

  openMakePhone() {
    this.setData({
      showMakePhone: true
    });
  },

  closeMakePhone() {
    this.setData({
      showMakePhone: false
    });
  },

  call() {
    wx.makePhoneCall({
      phoneNumber: this.data.customerServiceInfo.servicePhone,
    });
  },

  gotoUserEditPage() {
    const {
      currAuthStep
    } = this.data;
    if (currAuthStep === 2) {
      wx.navigateTo({
        url: '/pages/usercenter/person-info/index'
      });
    } else {
      this.loginWX()
    }
  },

  getVersionInfo() {
    const versionInfo = wx.getAccountInfoSync();
    const {
      version,
      envVersion = __wxConfig
    } = versionInfo.miniProgram;
    this.setData({
      versionNo: envVersion === 'release' ? version : envVersion,
    });
  },
  loginWX(){
    showBusy('正在登录');
    const session = qcloud.Session.get()
    if (session) {
      // 第二次登录
      // 或者本地已经有登录态
      // 可使用本函数更新登录态
      qcloud.loginWithCode({
        success: res => {
          this.setData({
            userInfo: res,
            logged: true,
            currAuthStep:2
          })
          app.globalData.userInfo = res
          app.globalData.logged = true
          wx.setStorageSync('userInfo', res)
          showSuccess('登录成功')
        },
        fail: err => {
          console.error(err)
          showModel('登录错误', err.message)
        }
      })
    } else {
      // 首次登录
      qcloud.login({
        success: res => {
          this.setData({
            userInfo: res,
            logged: true,
            currAuthStep: 2
          })
          app.globalData.userInfo = res
          wx.setStorageSync('userInfo', res)
          app.globalData.logged = true
          showSuccess('登录成功')
        },
        fail: err => {
          console.error(err)
          showModel('登录错误', err.message)
        }
      })
    }
  }
});