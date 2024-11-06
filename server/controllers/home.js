const DB = require('../tools/db');

exports.get = async (ctx) => {
    try {
        const { group } = ctx.query; // 获取 group 查询参数
        
        // 构建查询
        let query = DB('home');
        
        // 如果提供了 group 参数，添加到查询条件中
        if (group !== undefined) {
            query = query.where('group', group);
        }
        
        // 执行查询
        const homeData = await query.select('*')
                                .orderBy('group','asc')
                                .orderBy('sort','asc');

        // 如果没有找到数据
        if (homeData.length === 0) {
            ctx.status = 404;
            ctx.body = {
                code: -10,
                data: null,
                message: group ? `未找到分组 ${group} 的首页数据` : '未找到首页数据'
            };
            return;
        }

        // 返回找到的数据
        ctx.body = {
            code: 0,
            data: homeData,
            message: group ? `成功获取分组 ${group} 的首页数据` : '成功获取首页数据'
        };
    } catch (error) {
        console.error('获取首页数据时出错:', error);
        ctx.status = 500;
        ctx.body = {
            code: -10,
            data: null,
            message: '获取首页数据时发生错误'
        };
    }
};

