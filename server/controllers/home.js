const DB = require('../tools/db');

exports.get = async (ctx) => {
    try {
        // 从数据库中获取 home 表的所有数据
        const homeData = await DB('home').select('*');

        // 如果没有找到数据
        if (homeData.length === 0) {
            ctx.status = 404;
            ctx.body = {
                code: -1,
                data: null,
                message: '未找到首页数据'
            };
            return;
        }

        // 返回找到的数据
        ctx.body = {
            code: 0,
            data: homeData,
            message: '成功获取首页数据'
        };
    } catch (error) {
        console.error('获取首页数据时出错:', error);
        ctx.status = 500;
        ctx.body = {
            code: -1,
            data: null,
            message: '获取首页数据时发生错误'
        };
    }
};

