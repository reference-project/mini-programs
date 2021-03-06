import http from '../../public/js/http.js';
import api from '../../public/js/api.js';
import WXPage from '../Page';

new WXPage({
  data: {
    id: 0,
    fullName: '',
    phonePrimary: '',
    stateProvinceRegion: '',
    city: '',
    county: '',
    addressLine: '',
    isDefault: 0,
  },
  // 改变姓名
  bindNameChange (e) {
    this.setData({
      fullName: e.detail.value
    })
  },
  // 改变电话
  bindPhoneChange (e) {
    this.setData({
      phonePrimary: e.detail.value
    })
  },
  // 改变收货地址
  bindRegionChange (e) {
    this.setData({
      stateProvinceRegion: e.detail.value[0],
      city: e.detail.value[1],
      county: e.detail.value[2]
    })
  },
  // 改变详细地址
  bindAddressLineChange (e) {
    this.setData({
      addressLine: e.detail.value
    })
  },
  // 设置或者取消默认地址
  chooseDefault () {
    this.setData({
      isDefault: this.data.isDefault ? 0 : 1
    });
  },
  // 获取地址信息
  getAddressData (id) {
    wx.showLoading();
    http.request({
      url: `${api.address}/${id}`,
    }).then((res) => {
      wx.hideLoading();

      this.setData({
        id: res.data.id,
        fullName: res.data.fullName,
        phonePrimary: res.data.phonePrimary,
        stateProvinceRegion: res.data.stateProvinceRegion,
        city: res.data.city,
        county: res.data.county,
        addressLine: res.data.addressLine,
        isDefault: res.data.default
      });
    });
  },
  // 保存收货地址
  save () {
    // 如果数据没加载回来，则不能保存
    if (!this.data.id) {
      return;
    }

    try{
      // 如果姓名为空，则提示
      if(this.data.fullName === ''){
        throw new Error('姓名不能为空');
      }
      // 如果详细地址为空，则提示
      if(this.data.defaultMessage === ''){
        throw new Error('详细地址不能为空');
      }
    } catch(e){
      return this.toast.error({
        content: e.message
      })
    }

    wx.showLoading();
    http.request({
      url: `${api.address}/${this.data.id}`,
      method: 'PUT',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        name: this.data.fullName,
        phonePrimary: this.data.phonePrimary,
        stateProvinceRegion: this.data.stateProvinceRegion,
        city: this.data.city,
        county: this.data.county,
        addressLine: this.data.addressLine,
        isDefault: this.data.isDefault
      }
    }).then((res) => {
      wx.hideLoading();

      // 如果字段填写错误
      if (res.errors && res.errors.length != 0) {
        this.toast.error({
          content: res.errors[0].defaultMessage
        })
      } else {
        // 修改成功
        this.toast.success({
          content: res.moreInfo || '修改成功'
        })

        setTimeout(() => {
          var pages = getCurrentPages();
          var prevPage = pages[pages.length - 2];  //上一个页面
          prevPage.getAddressList();

          wx.navigateBack({
            delta: 1
          })
        }, 1500)
      }
    });
  },
  onLoad: function (url) {
    this.getAddressData(url.id);
  }
})
