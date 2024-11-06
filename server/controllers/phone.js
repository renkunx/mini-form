const axios = require('axios');
const config = require('../config');

// 获取微信接口调用凭证
async function getAccessToken() {
  try {
    const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${config.appId}&secret=${config.appSecret}`;
    const response = await axios.get(url);
    return response.data.access_token;
  } catch (error) {
    console.error('获取access_token失败:', error);
    throw error;
  }
}

exports.getPhoneNumber = async (ctx) => {
  const { code } = ctx.request.body;
  
  if (!code) {
    ctx.status = 400;
    ctx.body = {
      code: -1,
      error: '缺少必要的code参数'
    };
    return;
  }

  try {
    // 获取access_token
    const accessToken = await getAccessToken();
    
    // 调用微信接口获取手机号
    const url = `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${accessToken}`;
    const response = await axios.post(url, {
      code: code
    });

    if (response.data.errcode === 0) {
      // 成功获取手机号
      ctx.body = {
        code: 0,
        data: {
          phoneNumber: response.data.phone_info.phoneNumber,
          countryCode: response.data.phone_info.countryCode,
          // 可以根据需要返回其他信息
        }
      };
    } else {
      ctx.status = 400;
      ctx.body = {
        code: -1,
        error: '获取手机号失败',
        detail: response.data.errmsg
      };
    }
  } catch (error) {
    console.error('获取手机号时出错:', error);
    ctx.status = 500;
    ctx.body = {
      code: -1,
      error: '服务器内部错误'
    };
  }
}; 