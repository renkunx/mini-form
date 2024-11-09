const config = require('../config')
module.exports =  {
    
    single: async(ctx)=>{
      if (!ctx.file) {
        ctx.status = 400;
        ctx.body.message = '没有文件被上传。';
        return;
      }
      ctx.body = {
        code: 0,
        message: '文件上传成功',
        filename: ctx.file.filename,
        path: `${config.serverHost}/uploads/${ctx.file.filename}`
      };
    },
    multiple: async(ctx)=>{
      if (!ctx.files || ctx.files.length === 0) {
        ctx.status = 400;
        ctx.body.message = '没有文件被上传。';
        return;
      }
      ctx.body = {
        code: 0,
        message: '文件上传成功',
        files: ctx.files.map(file => ({
          filename: file.filename,
          path: `${config.serverHost}/uploads/${file.filename}`
        }))
      };
    }
}
