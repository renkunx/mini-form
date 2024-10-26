const CONF = {
    port: '5757',
    rootPathname: '',

    // 是否使用腾讯云代理登录小程序
    useQcloudLogin: false,
    // 是否使用腾讯云 cos
    useQcloudCos: false,

    cos: {
        /**
         * 区域
         * @查看 https://cloud.tencent.com/document/product/436/6224
         */
        region: 'ap-guangzhou',
        // Bucket 名称
        fileBucket: 'wximg',
        // 文件夹
        uploadFolder: ''
    },

    // 微信登录态有效期
    wxLoginExpires: 72000
}

module.exports = process.env.NODE_ENV === 'local' ? Object.assign({}, CONF, require('./config.local')) : Object.assign({}, CONF, require('./config.prod'));
