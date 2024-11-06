import Toast from 'tdesign-miniprogram/toast/index';
import config from '../../../config'
const { doRequest } = require('../../../utils/utils')
const { phoneEncryption } = require('../../../utils/util')

Page({
  data: {
    personInfo: {
      avatarUrl: 'https://i.haidao.tech/mini-form%E5%B0%8F%E7%A8%8B%E5%BA%8F%E9%A6%96%E9%A1%B5/avatar.jpg',
      nickname: '',
      gender: 0,
      phoneNumber: '',
    },
    showUnbindConfirm: false,
    pickerOptions: [
      {
        name: '男',
        code: '1',
      },
      {
        name: '女',
        code: '2',
      },
    ],
    typeVisible: false,
    genderMap: ['', '男', '女'],
  },
  onLoad() {
    this.init();
  },
  init() {
    this.fetchData();
  },
  fetchData() {
    // 获取后端的 /user/info 接口数据
    doRequest({
      url: config.service.userUrl,
      method: 'GET',
      success: (res) => {
        const response = res.data
        if (response.code === 0) {
          this.setData({
            'personInfo.avatarUrl': response.data.avatarUrl,
            'personInfo.nickname': response.data.nickname,
            'personInfo.gender': response.data.gender,
            'personInfo.phoneNumber': phoneEncryption(response.data.phone || ''),
          });
        } else {
          Toast({
            message: res.message,
            icon: 'error',
          });
        }
      },
      fail: (err) => {
        Toast({
          message: err.message,
          icon: 'error',
        });
      },
    });
  },
  onClickCell({ currentTarget }) {
    const { dataset } = currentTarget;
    const { nickname } = this.data.personInfo;

    switch (dataset.type) {
      case 'gender':
        this.setData({
          typeVisible: true,
        });
        break;
      case 'name':
        wx.navigateTo({
          url: `/pages/usercenter/name-edit/index?name=${nickname}`,
        });
        break;
      case 'avatarUrl':
        wx.getUserProfile({
          desc: '用于展示用户头像和昵称', // 说明用途
          success: (res) => {
            this.setData({
              userInfo: res.userInfo // 获取用户信息
            });
            console.log('用户头像:', res.userInfo.avatarUrl);
            console.log('用户昵称:', res.userInfo.nickName);
          },
          fail: (err) => {
            console.error('获取用户信息失败:', err);
          }
        })
        // this.toModifyAvatar();
        break;
      default: {
        break;
      }
    }
  },
  onClose() {
    this.setData({
      typeVisible: false,
    });
  },
  onConfirm(e) {
    const { value } = e.detail;
    this.setData(
      {
        typeVisible: false,
        'personInfo.gender': value,
      },
      () => {
        doRequest({
          url: config.service.userUrl,
          method: 'POST',
          data: {
            gender: value,
          },
          success: () => {
            Toast({
              context: this,
              selector: '#t-toast',
              message: '设置成功',
              theme: 'success',
            });
          },
          fail: (error) => {
            Toast({
              context: this,
              selector: '#t-toast',
              message: error.errMsg || error.msg || '修改头像出错了',
              theme: 'error',
            });
          },
        });
      },
    );
  },
  async toModifyAvatar() {
    try {
      const tempFilePath = await new Promise((resolve, reject) => {
        wx.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: ['album', 'camera'],
          success: (res) => {
            const { path, size } = res.tempFiles[0];
            if (size <= 10485760) {
              resolve(path);
            } else {
              reject({ errMsg: '图片大小超出限制，请重新上传' });
            }
          },
          fail: (err) => reject(err),
        });
      });
      const tempUrlArr = tempFilePath.split('/');
      const tempFileName = tempUrlArr[tempUrlArr.length - 1];
      Toast({
        context: this,
        selector: '#t-toast',
        message: `已选择图片-${tempFileName}`,
        theme: 'success',
      });
    } catch (error) {
      if (error.errMsg === 'chooseImage:fail cancel') return;
      Toast({
        context: this,
        selector: '#t-toast',
        message: error.errMsg || error.msg || '修改头像出错了',
        theme: 'error',
      });
    }
  },
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail 
    this.setData({
      'personInfo.avatarUrl': avatarUrl,
    },()=>{
      doRequest({
        url: config.service.userUrl,
        method: 'POST',
        data: {
          avatarUrl: avatarUrl,
        },
        success: () => {
          Toast({
            context: this,
            selector: '#t-toast',
            message: `设置成功`,
            theme: 'success',
          });
        },
        fail: (error) => {
          Toast({
            context: this,
            selector: '#t-toast',
            message: error.errMsg || error.msg || '设置手机号出错了',
            theme: 'error',
          });
        },
      });
    })
  },
  getPhoneNumber (e) {  // 动态令牌
    let self = this
    if(e.detail.code){
      // 获取手机号按钮的回调函数中
      doRequest({
        url: config.service.phoneUrl,
        method: 'POST',
        data: {
          code: e.detail.code
        },
        success: (res) => {
          if (res.data.code === 0) {
            const phoneNumber = res.data.data.phoneNumber;
            self.setData({
              'personInfo.phoneNumber': phoneNumber
            }, ()=>{
              doRequest({
                url: config.service.userUrl,
                method: 'POST',
                data: {
                  phone: phoneNumber,
                },
                success: () => {
                  Toast({
                    context: this,
                    selector: '#t-toast',
                    message: `设置成功`,
                    theme: 'success',
                  });
                },
                fail: (error) => {
                  Toast({
                    context: this,
                    selector: '#t-toast',
                    message: error.errMsg || error.msg || '设置手机号出错了',
                    theme: 'error',
                  });
                },
              });
            })
          } else {
            console.error('获取手机号失败:', res.data.error);
          }
        }
      });
    }
  }
});
