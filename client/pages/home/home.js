const imageCdn = 'https://tdesign.gtimg.com/mobile/demos';
const swiperList = [
  {
    value: `${imageCdn}/swiper1.png`,
    ariaLabel: '图片1',
  },
  {
    value: `${imageCdn}/swiper2.png`,
    ariaLabel: '图片2',
  },
  {
    value: `${imageCdn}/swiper1.png`,
    ariaLabel: '图片1',
  },
  {
    value: `${imageCdn}/swiper2.png`,
    ariaLabel: '图片2',
  },
];
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
    swiperList,
    adTop:'https://tdesign.gtimg.com/mobile/demos/swiper1.png',
    mrchList: [
      {
        name:'商户一',
        icon:'',
        url:'https://www.baidu.com'
      },
      {
        name:'商户二',
        icon:'',
        url:'https://www.baidu.com'
      },
      {
        name:'商户三',
        icon:'',
        url:'https://www.baidu.com'
      },
      {
        name:'商户四',
        icon:'',
        url:'https://www.baidu.com'
      },
      {
        name:'商户五',
        icon:'',
        url:'https://www.baidu.com'
      },
      {
        name:'商户六',
        icon:'',
        url:'https://www.baidu.com'
      },
      {
        name:'商户七',
        icon:'',
        url:'https://www.baidu.com'
      },
      {
        name:'商户八',
        icon:'',
        url:'https://www.baidu.com'
      },
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
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
    this.getHome()
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
    debugger
    doRequest({
      url: config.service.homeUrl,
      method: 'GET',
      success(res){
        console.log(res)
      }
    })
  }
})