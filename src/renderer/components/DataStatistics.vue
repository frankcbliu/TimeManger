<template>
  <div id="wrapper">
    <div id="top">
      <div class="block">
        <span class="demonstration">日期范围</span>
        <el-date-picker
          v-model="date_range"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="printDate"
        >
        </el-date-picker>
      </div>
      <el-button type="primary" round @click="lastDays(7)">近一周</el-button>
      <el-button type="primary" round @click="lastDays(30)">近一月</el-button>
      <el-button type="primary" round @click="lastDays(90)">近三月</el-button>

    </div>
    <div id="chart1"></div>
  </div>
</template>

<script>
// import storage from '../utils/storage.js'
// import db from '../utils/indexedDB.js'
// import datetime from '../utils/datetime'
// const { ipcRenderer } = require('electron')

function initLog () {
  const electronLog = require('electron-log')
  let log = electronLog.create('data')
  let mlog = log.functions.log
  log.functions.log = function (...params) {
    mlog('[data]', ...params)
  }
  return log.functions
}

const monsole = process.env.NODE_ENV === 'production' ? initLog() : console
export default {
  name: 'data-statistics',
  data () {
    return {
      date_range: null
    }
  },
  watch: {
    date_range: function (range) {
      console.log('更改为: ', range)
    }
  },
  mounted () {
    monsole.log('init')
    this.$chart.line1('chart1')
  },
  methods: {
    printDate () {
      console.log(this.date_range)
    },
    lastDays (days) {
      // days = 7, 30, 90 -> 上周，上个月，上三个月
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * days)
      this.date_range = [start, end]
    }
  }
}
</script>

<style scoped>
body {
  background-color: #ececec;
}

#wrapper {
  height: 100vh;
  width: 100vw;
  color: #606266;
}

#top {
  height: 10%;
  display: flex;
  align-items: center;
  justify-content: space-around;
}
#chart1 {
  width: 100%;
  height: 90%;
}
</style>

