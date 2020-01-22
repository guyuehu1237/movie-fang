const db=wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    movieid:'',
    movie_title:"",
    detail:[],
    comment:'',
    score:5,
    images:[],
    fileIds:[]
  },
onCommentChange:function(e){
  this.setData({ comment: e.detail
  })
},
  onRateChange:function(e){
    this.setData({
      score: e.detail
    })
  },
  uploadimgs:function(){
    wx.chooseImage({
      count: 9,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success:res=>{
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths
        console.log(tempFilePaths)
        this.setData({
          images:tempFilePaths
        })
      }
    })
  },
  submit:function(){
     //上传文件至云存储
     wx.showLoading({
       title: '正在上传',
     });
     let imgArr=[];
     for(let i=0;i<this.data.images.length;i++){
       console.log('----------------------');
       imgArr.push(new Promise((resolve,reject)=>{
         let item=this.data.images[i];
         let suffix=/\.\w+$/.exec(item)[0];
         wx.cloud.uploadFile({
           cloudPath:new Date().getTime()+suffix, // 上传至云端的路径
           filePath: item, // 小程序临时文件路径
           success: res => {
             // 返回文件 ID
             console.log('res.fileID'+res.fileID)
             this.setData({
               fileIds: this.data.fileIds.concat(res.fileID)
             });
             resolve();
           },
           fail: console.error
         })
       })
       )
     };
    Promise.all(imgArr).then(res=>{
      console.log('++++++++++++++++');
      db.collection('comment').add({
        data: {
          comment: this.data.comment,
          score: this.data.score,
          movieid: this.data.detail.id,
          movie_title: this.data.detail.title,
          fileIds:this.data.fileIds
        }
      }).then(res => {
        console.log(res);
        wx.hideLoading();
        wx.showToast(
          {
            "title":"上传成功"
          }
        )
      }).catch(err => {
        console.log(err);
      })
    })

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    wx.cloud.callFunction(
      {name:'getdetail',
      data:{
        movieid:options.movieid
      }
      }
    ).then(res=>{
      console.log(res);
      this.setData({
        detail:JSON.parse(res.result)
      })
    }).catch(err=>{
      console.log(err)
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})