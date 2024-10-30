const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const puppeteer = require('puppeteer');
const ATTACHMENT_DIR = path.join(__dirname, '..', 'attachment');

// 确保 attachment 目录存在
if (!fs.existsSync(ATTACHMENT_DIR)) {
  fs.mkdirSync(ATTACHMENT_DIR, { recursive: true });
}

const generatePDF = async (templateName, data, password) => {
  // 读取HTML模板
  const templatePath = path.join(__dirname, '..', 'templates', `${templateName}.hbs`);
  const templateSource = fs.readFileSync(templatePath, 'utf8');

  // 编译模板
  const template = Handlebars.compile(templateSource);

  // 使用数据渲染模板
  const html = template(data);


  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--headless', '--disable-gpu'],
    ignoreDefaultArgs: ['--disable-extensions']
  });
  const page = await browser.newPage();

  // 设置页面内容
  await page.setContent(html, { waitUntil: 'networkidle0' });

  // PDF选项
  const pdfOptions = {
    format: 'A4',
    printBackground: true
  };

  // 如果提供了密码，添加保护
  if (password) {
    pdfOptions.userPassword = password;
    pdfOptions.ownerPassword = password;
  }

  // 生成PDF文件名
  const pdfFileName = `${data.user_id}.pdf`;
  const pdfFilePath = path.join(ATTACHMENT_DIR, pdfFileName);

  // 生成PDF并保存到文件
  await page.pdf({ ...pdfOptions, path: pdfFilePath });

  // 关闭浏览器
  await browser.close();

}

exports.generatePDF = generatePDF;

exports.generatePDFFromTemplate = async (ctx) => {
  const { templateName, data, password } = ctx.request.body;

  if (!templateName || !data) {
    ctx.status = 400;
    ctx.body = { error: '模板名称和数据都是必需的' };
    return;
  }

  try {
    await generatePDF(templateName, data, password);
    ctx.body = {
      code: 0,
      data: {
        message: 'PDF生成成功',
        fileName: data.user_id + '.pdf'
      }
    };
  } catch (error) {
    console.error('生成PDF时出错:', error);
    ctx.status = 500;
    ctx.body = { error: '生成PDF时出错' };
  }
};

exports.getPDF = async (ctx) => {
  const { fileName } = ctx.query;
  const filePath = path.join(ATTACHMENT_DIR, fileName);

  if (!fs.existsSync(filePath)) {
    ctx.status = 404;
    ctx.body = { error: 'PDF文件不存在' };
    return;
  }

  ctx.set('Content-Type', 'application/pdf');
  ctx.set('Content-Disposition', `inline; filename=${fileName}`);
  ctx.body = fs.createReadStream(filePath);
};
