
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
  getTimeStamp (offset = 0) {
    return new Date(this.getNowDate()) / 1000 - 60 * 60 * 24 * offset
  },

  getNowDateTime () { // 获取当前的日期和时间
    let time = new Date()

    let y = time.getFullYear()
    let M = time.getMonth() + 1
    let d = time.getDate()
    let h = time.getHours()
    h = h < 10 ? '0' + h : h
    let m = time.getMinutes()
    m = m < 10 ? '0' + m : m
    let s = time.getSeconds()
    s = s < 10 ? '0' + s : s
    return y + '-' + M + '-' + d + ' ' + h + ':' + m + ':' + s
  }
}
