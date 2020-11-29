
export default {
  getNowDate () { // 获取当前日期
    let time = new Date()
    let y = time.getFullYear()
    let M = time.getMonth() + 1
    let d = time.getDate()
    return y + '-' + M + '-' + d
  },
  /**
   * 获取日期时间戳（秒为单位）
   * @param {Number}} offset offset 为偏移的天数，默认为0，即当前时间
   */
  getDateTimeStamp (offset = 0) {
    return new Date(this.getNowDate()) / 1000 - 60 * 60 * 24 * offset
  },

  /**
   * 获取当前的时间戳（秒为单位）
   */
  getTimeStamp () {
    return new Date() / 1000
  },

  getNowDateTime () { // 获取当前的日期和时间
    let time = new Date()
    let y = time.getFullYear()
    let M = time.getMonth() + 1
    let d = time.getDate()
    let h = this.formatTwo(time.getHours())
    let m = this.formatTwo(time.getMinutes())
    let s = this.formatTwo(time.getSeconds())
    return y + '-' + M + '-' + d + ' ' + h + ':' + m + ':' + s
  },

  // 格式化番茄钟
  formatClockTime (sec) {
    if (sec < 0) sec = 0
    const minute = Math.floor(sec / 60)
    const second = sec % 60
    return [minute, second].map(this.formatTwo).join(':')
  },

  // 格式化时间为两位数
  formatTwo (n) {
    n = n.toString()
    return n[1] ? n : '0' + n
  }

}
