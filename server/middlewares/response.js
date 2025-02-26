const debug = require('debug')('koa-weapp')

/**
 * 响应处理模块
 */
module.exports = async function (ctx, next) {

    try {
        // 调用下一个 middleware
        await next()

        // 如果已经设置了特定的Content-Type（如PDF），则不做处理
        if (ctx.response.header['content-disposition'] && 
            ctx.response.header['content-disposition'].includes('.pdf')) {
            ctx.set('Content-Type', 'application/pdf');
            return;
        }

        // 处理响应结果
        // 如果直接写入在 body 中，则不作处理
        // 如果写在 ctx.body 为空，则使用 state 作为响应
        ctx.body = ctx.body ? ctx.body : {
            code: ctx.state.code !== undefined ? ctx.state.code : 0,
            data: ctx.state.data !== undefined ? ctx.state.data : {}
        }
    } catch (e) {
        // catch 住全局的错误信息
        debug('Catch Error: %o', e)

        // 设置状态码为 500 - 服务端错误
        ctx.status = 200

        // 输出详细的错误信息
        ctx.body = {
            code: -10,
            error: e && e.message ? e.message : e.toString()
        }
    }
}
