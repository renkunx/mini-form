/**
 * ajax 服务路由集合
 */
const router = require('koa-router')({
    prefix: '/weapp'   // 定义所有路由的前缀都已 /weapp 开头
})
const controllers = require('../controllers')
const multer = require('@koa/multer');
const path = require('path')
const fs = require('fs');
const config = require('../config')
// 配置存储
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadDir = path.join(__dirname, '../uploads');
      // 确保上传目录存在
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      // 生成文件名：时间戳 + 原始文件名
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
  
const upload = multer({ storage: storage });

// 从 sdk 中取出中间件
// 这里展示如何使用 Koa 中间件完成登录态的颁发与验证
const { auth: { authorizationMiddleware, validationMiddleware } } = require('../qcloud')

// --- 登录与授权 Demo --- //
// 登录接口 /weapp/login
router.get('/login', authorizationMiddleware, controllers.login)
// 用户信息接口（可以用来验证登录态） /weapp/user
router.get('/user', validationMiddleware, controllers.user)

// --- 图片上传 Demo --- //
// 图片上传接口，小程序端可以直接将 url 填入 wx.uploadFile 中 /weapp/upload
// 根据配置决定上传路由的行为
if (config.useQcloudCos) {
    // 使用腾讯云对象存储
    router.post('/upload', controllers.upload);
} else {
    // 重定向到本地上传
    router.post('/upload', async (ctx) => {
        ctx.redirect('/weapp/upload-local-single');
    });
}
// 图片上传接口，小程序端可以直接将 url 填入 wx.uploadFile 中 /weapp/upload
router.post('/upload-local-single', upload.single('file'), controllers['upload-local'].single)
// 处理多文件上传
router.post('/upload-local-multiple', upload.array('file', 5), controllers['upload-local'].multiple)

// --- 信道服务接口 Demo --- //
// GET  用来响应请求信道地址的 /weapp/tunnel
router.get('/tunnel', controllers.tunnel.get)
// POST 用来处理信道传递过来的消息
router.post('/tunnel', controllers.tunnel.post)

// --- 客服消息接口 Demo --- //
// GET  用来响应小程序后台配置时发送的验证请求 /weapp/message
router.get('/message', controllers.message.get)
// POST 用来处理微信转发过来的客服消息
router.post('/message', controllers.message.post)

module.exports = router
