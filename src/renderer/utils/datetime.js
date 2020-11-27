
export default {

  getNowDate () { // 获取当前日期
    let time = new Date()
    let y = time.getFullYear()
    let M = time.getMonth() + 1
    let d = time.getDate()
    return y + '-' + M + '-' + d
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
