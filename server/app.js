const Koa = require('koa')
const app = new Koa()
const debug = require('debug')('koa-weapp')
const response = require('./middlewares/response')
const bodyParser = require('./middlewares/bodyparser')
const config = require('./config')

// 解析请求体
app.use(bodyParser())

// 使用响应处理中间件
app.use(response)

// 引入路由分发
const router = require('./routes')
app.use(router.routes())

// 启动程序，监听端口
app.listen(config.port, () => debug(`listening on port ${config.port}`))
