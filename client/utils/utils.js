// 引入 QCloud 小程序增强 SDK
const qcloud = require('wafer2-client-sdk/index');

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

function parseAddress(fullAddress, areaData) {
  const result = {
    provinceCode: '',
    provinceName: '',
    cityCode: '',
    cityName: '',
    districtCode: '',
    districtName: '',
    address: ''
  };

  // 遍历省级数据
  for (const province of areaData) {
    if (fullAddress.startsWith(province.label)) {
      result.provinceCode = province.value;
      result.provinceName = province.label;
      
      // 遍历市级数据
      for (const city of province.children || []) {
        // 对于直辖市，城市名和省名相同
        if (fullAddress.includes(city.label)) {
          result.cityCode = city.value;
          result.cityName = city.label;
          
          // 遍历区级数据
          for (const district of city.children || []) {
            if (fullAddress.includes(district.label)) {
              result.districtCode = district.value;
              result.districtName = district.label;
              
              // 获取详细地址
              // 将省市区名称从完整地址中移除
              let address = fullAddress;
              [result.provinceName, result.cityName, result.districtName].forEach(name => {
                address = address.replace(name, '');
              });
              result.address = address.trim();
              
              return result;
            }
          }
          break;
        }
      }
      break;
    }
  }
  
  return result;
}

module.exports = {
  showBusy,
  showSuccess,
  showModel,
  parseAddress,
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