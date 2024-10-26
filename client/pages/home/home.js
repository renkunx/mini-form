const { doRequest, showModel, showSuccess } = require('../../utils/utils')

import config from '../../config'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    current: 1,
    autoplay: true,
    duration: 500,
    interval: 5000,
    ad1:[],
    ad2:[],
    ad3:[],
    ad4:[],
    ad5:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getHome()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.getTabBar().init();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
  
  getHome(){
    let self = this
    doRequest({
      url: config.service.homeUrl,
      method: 'GET',
      success(res){
        wx.hideToast()
        const {code, data} = res.data
        let ad1=[],ad2=[],ad3=[],ad4=[],ad5=[]
        if(code === 0){
          data.forEach((item)=>{
            switch(item.group){
              case 'ad1':
                ad1.push(item);
                break;
              case 'ad2':
                ad2.push(item);
                break;
              case 'ad3':
                ad3.push(item);
                break;
              case 'ad4':
                ad4.push(item);
                break;
              case 'ad5':
                ad5.push(item);
                break;
            }
          })
          self.setData({
            ad1,ad2,ad3:ad3.map(item=>{
              item.value = item.icon
              item.ariaLabel = item.name
              return item
            }),ad4,ad5
          })
        }
      }
    })
  },
  gotoDetail(item){
    console.log(item)
    wx.navigateTo({
      url: '/pages/404/index',
    })
  }
})