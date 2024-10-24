import Toast from 'tdesign-miniprogram/toast/index';
import { areaData } from '../../../../config/index';
import config from '../../../../config'

const innerPhoneReg = '^1(?:3\\d|4[4-9]|5[0-35-9]|6[67]|7[0-8]|8\\d|9\\d)\\d{8}$';
const innerNameReg = '^[a-zA-Z\\d\\u4e00-\\u9fa5]+$';
const { doRequest, showModel, showSuccess } = require('../../../../utils/utils')
const app = getApp()

Page({
  options: {
    multipleSlots: true,
  },
  externalClasses: ['theme-wrapper-class'],
  data: {
    locationState: {
      cityCode: '',
      cityName: '',
      districtCode: '',
      districtName: '',
      name: '',
      tel: '',
      area: null,
      budget: null,
      provinceCode: '',
      provinceName: '',
      detailAddress:'',
    },
    areaData: areaData,
    areaPickerVisible: false,
    submitActive: false,
    visible: false,
    labelValue: '',
    columns: 3,
    contactUrl:'https://i.haidao.tech/2024/10/b7560e96407654b2d91da4a09ddae590.png',
    privateData: {
      verifyTips: '',
    },
  },
  onShow() {
    this.init()
  },

  onUnload() {
    
  },

  init() {
    // 获取当前登录没，没登录跳转登录
    if(app.globalData.logged){
      this.getForm()
    } else {
      // 跳转登录
      wx.switchTab({
        url: '/pages/usercenter/index',
      })
    }
  },
  getForm(){
    let self = this
    doRequest({
      url:config.service.saveFormUrl,
      method:'GET',
      data: {
        user_id: app.globalData.userInfo.openId,
      },
      success(res){
        debugger
        if(res.data.code === 0){
          const {city_code, city_name, district_code, district_name,
          name, tel, area, budget, province_code, province_name, detail_address} = res.data.data
          self.setData({
            locationState: {
              cityCode: city_code,
              cityName: city_name,
              districtCode: district_code,
              districtName: district_name,
              name: name,
              tel: tel,
              area: area,
              budget: budget,
              provinceCode: province_code,
              provinceName: province_name,
              detailAddress:detail_address,
            }
          })
        }
      },
      fail(error){
        showModel('提示', error.message)
      }
    })
  },
  onInputValue(e) {
    const { item } = e.currentTarget.dataset;
    if (item === 'address') {
      const { selectedOptions = [] } = e.detail;
      this.setData(
        {
          'locationState.provinceCode': selectedOptions[0].value,
          'locationState.provinceName': selectedOptions[0].label,
          'locationState.cityName': selectedOptions[1].label,
          'locationState.cityCode': selectedOptions[1].value,
          'locationState.districtCode': selectedOptions[2].value,
          'locationState.districtName': selectedOptions[2].label,
          areaPickerVisible: false,
        },
        () => {
          const { isLegal, tips } = this.onVerifyInputLegal();
          this.setData({
            submitActive: isLegal,
            privateData:{
              ...this.data.privateData,
              verifyTips: tips
            }
          });
        },
      );
    } else {
      const { value = '' } = e.detail;
      this.setData(
        {
          [`locationState.${item}`]: value,
        },
        () => {
          const { isLegal, tips } = this.onVerifyInputLegal();
          this.setData({
            submitActive: isLegal,
            privateData:{
              ...this.data.privateData,
              verifyTips: tips
            }
          });
        },
      );
    }
  },
  onPickArea() {
    this.setData({ areaPickerVisible: true });
  },
  onPickLabels(e) {
    const { item } = e.currentTarget.dataset;
    const {
      locationState: { labelIndex = undefined },
      labels = [],
    } = this.data;
    let payload = {
      labelIndex: item,
      addressTag: labels[item].name,
    };
    if (item === labelIndex) {
      payload = { labelIndex: null, addressTag: '' };
    }
    this.setData({
      'locationState.labelIndex': payload.labelIndex,
    });
    this.triggerEvent('triggerUpdateValue', payload);
  },
  addLabels() {
    this.setData({
      visible: true,
    });
  },
  confirmHandle() {
    const { labels, labelValue } = this.data;
    this.setData({
      visible: false,
      labels: [...labels, { id: labels[labels.length - 1].id + 1, name: labelValue }],
      labelValue: '',
    });
  },
  cancelHandle() {
    this.setData({
      visible: false,
      labelValue: '',
    });
  },
  onCheckDefaultAddress({ detail }) {
    const { value } = detail;
    this.setData({
      'locationState.isDefault': value,
    });
  },

  onVerifyInputLegal() {
    const { name, tel, detailAddress, districtName } = this.data.locationState;
    const prefixPhoneReg = String(this.properties.phoneReg || innerPhoneReg);
    const prefixNameReg = String(this.properties.nameReg || innerNameReg);
    const nameRegExp = new RegExp(prefixNameReg);
    const phoneRegExp = new RegExp(prefixPhoneReg);

    if (!name || !name.trim()) {
      return {
        isLegal: false,
        tips: '请填姓名',
      };
    }
    if (!nameRegExp.test(name)) {
      return {
        isLegal: false,
        tips: '姓名仅支持输入中文、英文（区分大小写）、数字',
      };
    }
    if (!tel || !tel.trim()) {
      return {
        isLegal: false,
        tips: '请填写手机号',
      };
    }
    if (!phoneRegExp.test(tel)) {
      return {
        isLegal: false,
        tips: '请填写正确的手机号',
      };
    }
    if (!districtName || !districtName.trim()) {
      return {
        isLegal: false,
        tips: '请选择省市区信息',
      };
    }
    if (!detailAddress || !detailAddress.trim()) {
      return {
        isLegal: false,
        tips: '请完善详细地址',
      };
    }
    if (detailAddress && detailAddress.trim().length > 50) {
      return {
        isLegal: false,
        tips: '详细地址不能超过50个字符',
      };
    }
    return {
      isLegal: true,
      tips: '添加成功',
    };
  },

  builtInSearch({ code, name }) {
    return new Promise((resolve, reject) => {
      wx.getSetting({
        success: (res) => {
          if (res.authSetting[code] === false) {
            wx.showModal({
              title: `获取${name}失败`,
              content: `获取${name}失败，请在【右上角】-小程序【设置】项中，将【${name}】开启。`,
              confirmText: '去设置',
              confirmColor: '#FA550F',
              cancelColor: '取消',
              success(res) {
                if (res.confirm) {
                  wx.openSetting({
                    success(settinRes) {
                      if (settinRes.authSetting[code] === true) {
                        resolve();
                      } else {
                        console.warn('用户未打开权限', name, code);
                        reject();
                      }
                    },
                  });
                } else {
                  reject();
                }
              },
              fail() {
                reject();
              },
            });
          } else {
            resolve();
          }
        },
        fail() {
          reject();
        },
      });
    });
  },

  onSearchAddress() {
    this.builtInSearch({ code: 'scope.userLocation', name: '地址位置' }).then(() => {
      wx.chooseLocation({
        success: (res) => {
          if (res.name) {
            this.triggerEvent('addressParse', {
              address: res.address,
              name: res.name,
              latitude: res.latitude,
              longitude: res.longitude,
            });
          } else {
            Toast({
              context: this,
              selector: '#t-toast',
              message: '地点为空，请重新选择',
              icon: '',
              duration: 1000,
            });
          }
        },
        fail: function (res) {
          console.warn(`wx.chooseLocation fail: ${JSON.stringify(res)}`);
          if (res.errMsg !== 'chooseLocation:fail cancel') {
            Toast({
              context: this,
              selector: '#t-toast',
              message: '地点错误，请重新选择',
              icon: '',
              duration: 1000,
            });
          }
        },
      });
    });
  },
  formSubmit() {
    const { submitActive } = this.data;
    if (!submitActive) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: this.privateData.verifyTips,
        icon: '',
        duration: 1000,
      });
      return;
    }
    const { locationState } = this.data;

    doRequest({
      url:config.service.saveFormUrl,
      method:'POST',
      data: {
        user_id: app.globalData.userInfo.openId,
        tel: locationState.tel,
        name: locationState.name,
        province_name: locationState.provinceName,
        province_code: locationState.provinceCode,
        city_name: locationState.cityName,
        city_code: locationState.cityCode,
        district_name: locationState.districtName,
        district_code: locationState.districtCode,
        detail_address: locationState.detailAddress,
        area: locationState.area,
        budget: locationState.budget
      },
      method: 'POST',
      success(res){
        if(res.code === 0){
          showSuccess('提交成功')
        } else {
          showModel('提示', res.message)
        }
      },
      fail(error){
        showModel('提示', error.message)
      }
    })
  },
});
