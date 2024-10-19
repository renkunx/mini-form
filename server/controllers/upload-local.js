const { multiply } = require('lodash');
const config = require('../config')
module.exports =  {
    
    single: async(ctx)=>{
      if (!ctx.file) {
        ctx.state.code = 400;
        ctx.state.message = '没有文件被上传。';
        return;
      }
      ctx.state.data = {
        message: '文件上传成功',
        filename: ctx.file.filename,
        path: ctx.file.path
      };
    },
    multiple: async(ctx)=>{
      if (!ctx.files || ctx.files.length === 0) {
        ctx.state.code = 400;
        ctx.state.message = '没有文件被上传。';
        return;
      }
      ctx.state.data = {
        message: '文件上传成功',
        files: ctx.files.map(file => ({
          filename: file.filename,
          path: file.path
        }))
      };
    }
}
