const DB = require('../tools/db');
const { generatePDF } = require('./pdf')
const { encrypt } = require('../tools/crypto');
// 查询 info 表数据
exports.get = async (ctx) => {
    try {
        const { user_id } = ctx.query;
        let query = DB('info');

        if (user_id) {
            query = query.where('user_id', user_id);
        }

        const infoData = await query.select('*');

        if (infoData.length === 0) {
            ctx.status = 404;
            ctx.body = {
                code: -10,
                data: null,
                message: '未找到信息'
            };
            return;
        }
        let resData = null
        if(user_id){
            resData = infoData[0]
            const homeInfo = await DB('home').where('name', resData.
                recommender_name).select('*').first();
            const manager = homeInfo.phone
            const qrUrl = `http://yqw.fft.com.cn/nbback/qwmsg/genKFQRCode?name=${encodeURIComponent(resData.name)}&phone=${encrypt(resData.phone)}&manager=${encrypt(homeInfo.phone || '19906920597')}`
            resData.qrUrl = qrUrl
            resData.manager = manager
        }else{
            resData = infoData
        }
        

        ctx.body = {
            code: 0,
            data: resData,
            message: '成功获取信息'
        };
    } catch (error) {
        console.error('获取信息时出错:', error);
        ctx.status = 500;
        ctx.body = {
            code: -10,
            data: null,
            message: '获取信息时发生错误'
        };
    }
};

// 插入或更新 info 数据
exports.upsert = async (ctx) => {
    try {
        const { user_id, ...infoData } = ctx.request.body;

        if (!user_id) {
            ctx.status = 400;
            ctx.body = {
                code: -10,
                data: null,
                message: 'user_id 是必需的'
            };
            return;
        }

        // 尝试更新现有记录
        const updatedRows = await DB('info')
            .where('user_id', user_id)
            .update(infoData);

        // 根据数据生成pdf文件
        generatePDF('form',{ user_id, ...infoData }, user_id.substr(5));
        const homeInfo = await DB('home').where('name', infoData.
            recommender_name).select('*').first();
        const qrUrl = `http://yqw.fft.com.cn/nbback/qwmsg/genKFQRCode?name=${encodeURIComponent(infoData.name)}&phone=${encrypt(infoData.phone)}&manager=${encrypt(homeInfo.phone || '19906920597')}`
        if (updatedRows === 0) {
            // 如果没有更新任何行，则插入新记录
            await DB('info').insert({ user_id, ...infoData });
            ctx.body = {
                code: 0,
                data: { user_id, qrUrl },
                message: '成功插入新信息'
            };
        } else {
            ctx.body = {
                code: 0,
                data: { user_id, qrUrl },
                message: '成功更新信息'
            };
        }
    } catch (error) {
        console.error('插入或更新信息时出错:', error);
        ctx.status = 500;
        ctx.body = {
            code: -10,
            data: null,
            message: '插入或更新信息时发生错误'
        };
    }
};
