import http from '../../public/js/http.js';
import api from '../../public/js/api.js';
import WXPage from '../Page';

let app = getApp();
let { formatDate } = require('../../public/js/utils.js');

new WXPage({
  data: {
    // 订单id
    id: '',
    // 订单详情
    order: {},
    // 总数
    totalNum: 0,
    // 退单原因
    backReason: '',
    // 是否显示退单原因框
    backReasonToggle: false,
    // 数据是否加载完毕
    isLoaded: false,
    // 是否正在取消订单中
    isCancelling: false,
    // 是否确认收货中
    isReceiving: false,
    // 是否正在退单中
    isBacking: false
  },
  // 输入退单原因
  inputbackReason (e) {
    this.setData({
      backReason: e.detail.value
    });
  },
  // 跳转
  jump () {
    let { order } = this.data;
    app.orderItems = order.orderItems;

    wx.navigateTo({
      url: '/pages/product_list/index'
    })
  },
  // 显示隐藏退单原因弹窗
  switchBackReason () {
    let { backReasonToggle } = this.data;

    this.setData({
      backReasonToggle: !backReasonToggle
    })
  },
  // 确认退单原因
  confirmBackReason () {
    let { backReason } = this.data;

    try {
      if (!backReason) {
        throw new Error('请填写退单原因');
      }
    } catch (e) {
      return this.toast.error({
        content: e.message
      })
    }

    this.setData({
      backReason
    });

    this.switchBackReason();
    this.confirmBackOrder();
  },
  // 确定取消订单弹窗
  confirmCancelOrder () {
    wx.showModal({
      title: '提示',
      content: '您确定要取消订单吗？',
      success: (res) => {
        if (res.confirm) {
          this.cancelOrder();
        }
      }
    })
  },
  // 确定退单弹窗
  confirmBackOrder () {
    wx.showModal({
      title: '提示',
      content: '您确定要退单吗？',
      success: (res) => {
        if (res.confirm) {
          this.backOrder();
        }
      }
    })
  },
  // 取消订单
  cancelOrder () {
    wx.showLoading();
    let { id, isCancelling } = this.data;

    if (isCancelling) {
      return this.toast.error({
        content: '正在取消中'
      })
    }

    this.setData({
      isCancelling: true
    })

    http.request({
      url: `${api.order}${id}`,
      method: 'DELETE'
    }).then((res) => {
      wx.hideLoading();

      if (res.errorCode == 200) {
        this.toast.success({
          content: res.moreInfo || '取消成功'
        })

        setTimeout(() => {
          this.setData({
            isCancelling: false
          });

          this.getData();
        }, 1500)
      } else {
        this.toast.error({
          content: res.moreInfo || '取消失败，请重试',
        })

        this.setData({
          isCancelling: false
        })
      }
    });
  },
  // 申请退单
  backOrder () {
    wx.showLoading();
    let { id, isBacking, backReason } = this.data;

    try {
      if (isBacking) {
        throw new Error('正在退单中');
      }
      if (!backReason) {
        throw new Error('请填写退单原因');
      }
    } catch (e) {
      return this.toast.error({
        content: e.message
      })
    }

    this.setData({
      isBacking: true
    })

    http.request({
      url: `${api.order_back}${id}`,
      method: 'DELETE',
      data: {
        reason: backReason
      }
    }).then((res) => {
      wx.hideLoading();

      if (res.errorCode == 200) {
        this.toast.success({
          content: res.moreInfo || '退单成功'
        })

        setTimeout(() => {
          this.setData({
            isBacking: false
          });

          this.getData();
        }, 1500)
      } else {
        this.toast.error({
          content: res.moreInfo || '退单失败，请重试'
        })

        this.setData({
          isBacking: false
        })
      }
    });
  },
  // 确认收货
  confirmReceived () {
    wx.showLoading();
    let { id, isReceiving } = this.data;

    if (isReceiving) {
      return this.toast.error({
        content: '正在确认中'
      })
    }

    this.setData({
      isReceiving: true
    })

    http.request({
      url: `${api.order_confirm}${id}`,
      method: 'PUT'
    }).then((res) => {
      wx.hideLoading();

      if (res.errorCode == 200) {
        this.toast.success({
          content: res.moreInfo || '确认收货成功'
        })

        setTimeout(() => {
          this.setData({
            isReceiving: false
          });

          this.getData();
        }, 1500)
      } else {
        this.toast.error({
          content: res.moreInfo || '确认收货失败，请重试'
        })

        this.setData({
          isReceiving: false
        })
      }
    });
  },
  // 获取订单数据
  getData () {
    let { id } = this.data;

    wx.showLoading();
    http.request({
      url: `${api.order}${id}`
    }).then((res) => {
      wx.hideLoading();
      let order = res.data;
      let totalNum = 0;
      order.updatedAt = formatDate(new Date(order.updatedAt));

      order.orderItems.forEach((item) => {
        totalNum += item.quantity;
      });

      this.setData({
        totalNum,
        order: res.data,
        isLoaded: true
      });
    });
  },
  onLoad (params) {
    if (params.id) {
      this.setData({
        id: params.id
      });
      this.getData();
    } else {
      wx.showModal({
        title: '提示',
        content: '无法加载数据，请传入订单id'
      })
    }
  }
})
