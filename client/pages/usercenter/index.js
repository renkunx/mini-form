import Toast from 'tdesign-miniprogram/toast/index';
// 引入 QCloud 小程序增强 SDK
var qcloud = require('wafer2-client-sdk/index');
const { showBusy, showModel, showSuccess, doRequest } = require('../../utils/utils')
import config from '../../config'
const app = getApp()

const getDefaultData = () => ({
  showMakePhone: false,
  userInfo: {
    avatarUrl: '',
    nickName: '正在登录...',
    phoneNumber: '',
  },
  menuData:[
    [
      // {
      //   title: '清除缓存',
      //   tit: '',
      //   url: '',
      //   type: 'clear-storage',
      // },
      {
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
  ],
  customerServiceInfo: {
    serviceTimeDuration: '9:00-18:00'
  },
  currAuthStep: 1,
  showKefu: true,
  versionNo: '',
  logged: false || app.globalData.logged,
  showQr:false,
  qrUrl:''
});

Page({
  data: getDefaultData(),

  onLoad() {
    this.getVersionInfo();
  },

  onShow() {
    this.getTabBar().init();
    this.init();
  },
  onPullDownRefresh() {
    this.init();
  },

  init() {
    if(this.data.logged || app.globalData.logged){
      this.setData({
        userInfo: wx.getStorageSync('userInfo'),
        currAuthStep: 2
      })
      this.getForm()
    } 
    // else {
    //   this.loginWX();
    // }
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
      case 'manager': {
        this.setData({
          showQr: true
        })
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
      wx.navigateTo({
        url: '/pages/login/index',
      })
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
          logged: true,
          currAuthStep:2
        })
        app.globalData.userInfo = data
        app.globalData.logged = true
        wx.setStorageSync('userInfo', data)
        showSuccess('登录成功')
      },
      fail: () => {
        wx.showToast({
          title: '登录错误',
          icon: 'none',
          duration: 2000,
        });
      },
    });
  },
  getForm(){
    let self = this
    doRequest({
      url:config.service.saveFormUrl,
      method:'GET',
      data: {
        user_id: app.globalData.userInfo.open_id,
      },
      success(res){
        if(res.data.code === 0){
          const { qrUrl } = res.data.data
          self.setData({
            qrUrl:qrUrl,
            menuData: [
              [
                {
                  title: '历史提交',
                  tit: '',
                  url: '',
                  type: 'history',
                }, 
                {
                  title: '客户经理',
                  tit: '',
                  url: '',
                  type: 'manager',
                }, 
              ],
              [
                {
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
            ]
          })
        }else {
          self.setData({
            menuData: [
              [
                {
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
            ]
          })
        }
      }
    })
  },
  closeDialog(){
    this.setData({showQr:false})
  }
});