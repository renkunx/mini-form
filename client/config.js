/**
 * 小程序配置文件
 */

// 此处主机域名修改成腾讯云解决方案分配的域名
// var host = 'https://mini-form.app.haidao.tech';
var host = 'https://mp.taiyanggroup.com';
// var host = 'http://localhost:5757';

var config = {

    // 下面的地址配合云端 Demo 工作
    service: {
        host,

        // 登录地址，用于建立会话
        loginUrl: `${host}/weapp/login`,

        // 测试的请求地址，用于测试会话
        requestUrl: `${host}/weapp/user`,

        // 测试的信道服务地址
        tunnelUrl: `${host}/weapp/tunnel`,

        // 上传图片接口cos
        uploadUrl: `${host}/weapp/upload`,
        // 上传图片接口local 单文件
        uploadSingleUrl: `${host}/weapp/upload-local-single`,
        // 上传图片接口local 多文件
        uploadMultipleUrl: `${host}/weapp/upload-local-multiple`,

        // 保存表单 post 获取 get
        saveFormUrl: `${host}/weapp/info`,

        // 获取首页数据
        homeUrl: `${host}/weapp/home`,

        // 获取手机号
        phoneUrl: `${host}/weapp/phone`,

        // 获取用户信息
        userUrl: `${host}/weapp/user/info`
    }
};

module.exports = config;