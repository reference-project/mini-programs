let { formatDate } = require('../../public/js/utils.js');

Page({
  data: {
    form: {
      cheapMoney: '',
      remark: '',
      date: formatDate(new Date(), 'YYYY-MM-DD'),
    }
  },
  bindDateChange: function(e) {
    this.setData({
      form: {
        date: e.detail.value
      }
    })
  },
})