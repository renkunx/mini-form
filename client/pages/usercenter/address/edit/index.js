import Toast from 'tdesign-miniprogram/toast/index';
import { areaData } from '../../../../config/index';
import config from '../../../../config'

const innerPhoneReg = '^1(?:3\\d|4[4-9]|5[0-35-9]|6[67]|7[0-8]|8\\d|9\\d)\\d{8}$';
const innerNameReg = '^[a-zA-Z\\d\\u4e00-\\u9fa5]+$';
const { doRequest, showModel, showSuccess, parseAddress } = require('../../../../utils/utils')
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
      phone: app?.globalData?.userInfo?.phone || '',
      area: null,
      budget: null,
      provinceCode: '',
      provinceName: '',
      detailAddress:'',
      recommender:'',
      recommenderName:'',
      latitude:0.00,
      longitude:0.00
    },
    areaData: areaData,
    areaPickerVisible: false,
    submitActive: false,
    visible: false,
    labelValue: '',
    columns: 3,
    contactUrl:'https://wework.qpic.cn/wwpic3az/679190_PAQD5xcTQjGXCZ2_1731576912/0',
    privateData: {
      verifyTips: '',
    },
    recommenderVisible: false,
    recommenders: [],
    showPdf:false,
    previewVisible: false,
    showIndex: false,
    closeBtn: true,
    deleteBtn: false,
    showChooseMap: false,
  },
  onShow() {
    this.getTabBar().init();
    if(this.data.showChooseMap){
      this.setData({showChooseMap:false})
      return
    }
    if(app.globalData.logged){    
      this.init()
    } else {
      wx.showToast({
        title: '请先登录',
      })
      // 跳转登录
      wx.navigateTo({
        url: '/pages/login/index',
      })
    }
  },

  onUnload() {},

  init() {
    // 获取当前登录没，没登录跳转登录
    if(app.globalData.logged){
      this.getForm()
    } else {
      wx.showToast({
        title: '请先登录',
      })
      // 跳转登录
      wx.navigateTo({
        url: '/pages/login/index',
      })
    }
    // 获取推荐商户
    this.getMerchant()
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
          const {city_code, city_name, district_code, district_name,
          name, phone, area, budget, province_code, province_name, detail_address, recommender, recommender_name} = res.data.data
          self.setData({
            locationState: {
              cityCode: city_code,
              cityName: city_name,
              districtCode: district_code,
              districtName: district_name,
              name: name,
              phone: app?.globalData?.userInfo?.phone || phone,
              area: area,
              budget: parseFloat((budget/10000).toFixed(4)),  // 单位为万元
              provinceCode: province_code,
              provinceName: province_name,
              detailAddress:detail_address,
              recommender: recommender,
              recommenderName: recommender_name
            }
          })
        }else {
          app?.globalData?.userInfo?.phone && self.setData({
            locationState: {
              phone: app?.globalData?.userInfo?.phone || phone,
            }
          })
        }
      },
      fail(error){
        showModel('提示', error.message)
      }
    })
  },
  getMerchant(){
    let self = this
    doRequest({
      url:config.service.homeUrl+'?group=ad2',
      method:'GET',
      success(res){
        const { data, code } = res.data
        if(code === 0){
          // 如果本地存储有推荐人，则使用本地的推荐人
          const recommender = wx.getStorageSync('recommender')
          let recommenderObj = null
          self.setData({
            recommenders: data.map((item)=> {
              item.label = item.name
              item.value = item.sort
              if(recommender && recommender.sort === item.sort){
                recommenderObj = item
              }
              return item
            }),
          })
          if(recommender){
            self.setData({
              'locationState.recommender': recommenderObj.sort,
              'locationState.recommenderName': recommenderObj.name,
            })
          }
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
    const { name, phone, detailAddress, districtName, area, budget, recommender_name } = this.data.locationState;
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
    if (!phone || !phone.trim()) {
      return {
        isLegal: false,
        tips: '请填写手机号',
      };
    }
    if (!phoneRegExp.test(phone)) {
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
    if (!area){
      return {
        isLegal: false,
        tips: '请填写房屋面积',
      };
    }
    if (!budget){
      return {
        isLegal: false,
        tips: '请填写装修预算',
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
      this.setData({showChooseMap:true})
      wx.chooseLocation({
        success: (res) => {
          if (res.name) {
            const { address, name, latitude, longitude } = res;
            // 使用完整地址进行解析
            const fullAddress = address+name;
            const parsedAddress = parseAddress(fullAddress, this.data.areaData);
            
            this.setData({
              'locationState.provinceCode': parsedAddress.provinceCode,
              'locationState.provinceName': parsedAddress.provinceName,
              'locationState.cityCode': parsedAddress.cityCode,
              'locationState.cityName': parsedAddress.cityName,
              'locationState.districtCode': parsedAddress.districtCode,
              'locationState.districtName': parsedAddress.districtName,
              'locationState.detailAddress': parsedAddress.address || name,
              'locationState.latitude': latitude,
              'locationState.longitude': longitude
            }, () => {
              const { isLegal, tips } = this.onVerifyInputLegal();
              this.setData({
                submitActive: isLegal,
                privateData: {
                  ...this.data.privateData,
                  verifyTips: tips
                }
              });
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
    let self = this;
    doRequest({
      url:config.service.saveFormUrl,
      method:'POST',
      data: {
        user_id: app.globalData.userInfo.open_id,
        phone: locationState.phone,
        name: locationState.name,
        province_name: locationState.provinceName,
        province_code: locationState.provinceCode,
        city_name: locationState.cityName,
        city_code: locationState.cityCode,
        district_name: locationState.districtName,
        district_code: locationState.districtCode,
        detail_address: locationState.detailAddress,
        area: locationState.area,
        budget: locationState.budget*10000,
        recommender_name: locationState.recommenderName,
        recommender: locationState.recommender,
        latitude: locationState.latitude,
        longitude: locationState.longitude
      },
      method: 'POST',
      success(res){
        const { code, data } = res.data
        if(code === 0){
          self.setData({
            showPdf: true,
            pdfUrl: `${config.service.host}/weapp/pdf?fileName=${data.user_id}.pdf`,
            contactUrl: data.qrUrl
          })
        }
      },
      fail(error){
        showModel('提示', error.message)
      }
    })
  },
  onColumnChange(e) {
    console.log('picker pick:', e);
  },

  onPickerChange(e) {
    const { value, label } = e.detail;
    this.setData({
      'locationState.recommender': value[0],
      'locationState.recommenderName': label[0],
    },() => {
      const { isLegal, tips } = this.onVerifyInputLegal();
      this.setData({
        submitActive: isLegal,
        privateData:{
          ...this.data.privateData,
          verifyTips: tips
        }
      });
    },);
  },

  onPickerCancel(e) {
    const { key } = e.currentTarget.dataset;
    console.log(e, '取消');
    console.log('picker1 cancel:');
    this.setData({
      [`${key}Visible`]: false,
    });
  },

  onRecommenderPicker() {
    this.setData({ recommenderVisible: true });
  },
  closeDialog(){
    let self = this;
    wx.setClipboardData({
      data: this.data.pdfUrl,
      success(){
        self.setData({
          showPdf: false
        })
      }
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
              'locationState.phone': phoneNumber
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
  },
  showPreview(){
    this.setData({
      previewVisible: true
    })
  },
  onPreviewClose(){
    this.setData({
      previewVisible: false
    })
  }
});
