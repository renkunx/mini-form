import config from '../../../../config'

Page({
  data: {
    pdfUrl:''
  },
  onShow() {
    const userInfo = wx.getStorageSync('userInfo')
    this.setData({
      pdfUrl: `${config.service.host}/weapp/pdf?fileName=${userInfo.open_id}.pdf`,
    });
  },
});
