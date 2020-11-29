<template>
  <div id="wrapper">
    <div class="card" style="height: 15%"></div>
  </div>
</template>

<script >
import storage from '../utils/storage.js'
import db from '../utils/indexedDB.js'
const { ipcRenderer } = require('electron')

export default {
  name: 'complete',
  data () {
    return {
      'taskName': '',
      'clockData': null
    }
  },
  created () {
    let data = storage.getItem('complete_clock_data')
    this.taskName = data[0]
    this.clockData = data[1]
    console.log(this.taskName)
    console.log(this.clockData)
  },
  mounted () {

  },
  methods: {
    abandon () { // 放弃这个番茄钟
      ipcRenderer.send('complete-close')
    },
    createClock (clockType, id = 0) { // 创建番茄钟记录
      let that = this
      if (clockType === 'new_main') { // 创建主任务
        // 先创建主任务
        db.createTask({
          'name': that.taskName,
          'is_done': 0,
          'count': 1,
          'sum_time': that.clockData.begin_work_time,
          'done_date': 0
        }, this.$store).then((id) => {
          db.createClock({
            'name': that.taskName,
            'task_id': id,
            'is_main': true,
            'begin_time': that.clockData.begin_time,
            'interrupt': that.clockData.interrupt
          }).then((res) => {
          })
        })
      } else if (clockType === 'bind_main') { // 绑定主任务
        // 更改番茄钟数量、总用时
        db.bindClockTask({
          'id': id,
          'cost': that.clockData.begin_work_time
        }).then((res) => {
          db.createClock({
            'name': res.name,
            'task_id': id,
            'is_main': true,
            'begin_time': that.clockData.begin_time,
            'interrupt': that.clockData.interrupt
          }).then((res) => {
          })
        })
      } else if (clockType === 'bind_sub') { // 绑定子任务
        db.bindClockSubTask({
          'id': id,
          'cost': that.clockData.begin_work_time
        }).then((res) => {
          db.createClock({
            'name': res.sub_name,
            'task_id': id,
            'is_main': false,
            'begin_time': that.clockData.begin_time,
            'interrupt': that.clockData.interrupt
          }).then((res) => {
          })
        })
      }
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
}

#card {
  border-radius: 5px;
  background-color: #e3e3e3;
  padding: 2%;
  display: flex;
  flex-direction: column;
  margin-bottom: 2%;
}

#card > div {
  display: flex;
  flex-direction: row;
  width: 100%;
  align-items: center;
  font-size: 14px;
  color: #606266;
  font-weight: bold;
}
</style>

