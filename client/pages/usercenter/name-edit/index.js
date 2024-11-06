const { doRequest } = require('../../../utils/utils');
const config = require('../../../config');

Page({
  data: {
    nameValue: '',
  },
  onLoad(options) {
    const { name } = options;
    this.setData({
      nameValue: name,
    });
  },
  onSubmit() {
    // 保存 nickname
    doRequest({
      url: config.service.userUrl,
      method: 'POST',
      data: {
        nickname: this.data.nameValue,
      },
      success: () => {
        wx.showToast({
          title: '保存成功',
          icon: 'success',
          duration: 2000,
        });
        wx.navigateBack({ backRefresh: true });
      },
      fail: () => {
        wx.showToast({
          title: '保存失败',
          icon: 'none',
          duration: 2000,
        });
      },
    });
  },
  clearContent() {
    this.setData({
      nameValue: '',
    });
  },
});
