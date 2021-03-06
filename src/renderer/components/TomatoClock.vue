<template>
  <div style="width: 100%; height: 100%">
    <div class="main">
      <div class="clock" :class="{ resting: clockStatus === 'resting' }">
        <!-- 右半边半圆背景  -->
        <div class="pie_mod pie_right">
          <div
            class="close"
            v-show="clockStatus !== 'init' && clockStatus !== 'resting'"
            @click="abandon"
          >
            <i class="el-icon-circle-close"></i>
          </div>
          <!-- 右边半圆 -->
          <div class="pie" ref="pie1"></div>
        </div>
        <!-- 左半边半圆背景  -->
        <div class="pie_mod pie_left">
          <!-- 左边半圆 -->
          <div class="pie" ref="pie2"></div>
        </div>
        <!-- 倒计时背景 -->
        <div class="clock_bg"></div>
        <!-- 倒计时-时间文案 -->
        <div class="clock_time" @click="changeClock">{{ clock_time }}</div>
        <div class="clock_button" @click="changeClock">
          <i :class="clock_icon"></i>
        </div>
      </div>
      <audio :src="clock_bg_sound" ref="audio" loop></audio>
    </div>

    <div
      class="bottom"
      v-show="clockStatus !== 'timing' && clockStatus !== 'interrupt'"
    >
      <div class="bottom-left">
        <i
          class="el-icon-bell"
          v-show="!clock_muted"
          @click="changeMuted(true)"
        ></i>
        <i
          class="el-icon-close-notification"
          v-show="clock_muted"
          @click="changeMuted(false)"
        ></i>
      </div>

      <el-input
        placeholder="请输入任务"
        v-model="taskName"
        class="taskInput"
        :suffix-icon="input_icon"
        @change="completeInput"
      >
        <el-select
          v-model="tag"
          slot="prepend"
          placeholder="标签"
          style="width: 80px"
        >
          <el-option label="默认" value="default"></el-option>
          <el-option label="工作" value="work"></el-option>
          <el-option label="学习" value="learn"></el-option>
        </el-select>
      </el-input>
    </div>
    <div
      class="bottom"
      v-show="clockStatus === 'timing' || clockStatus === 'interrupt'"
    >
      <div class="bottom-left">
        <i
          class="el-icon-bell"
          v-show="!clock_muted"
          @click="changeMuted(true)"
        ></i>
        <i
          class="el-icon-close-notification"
          v-show="clock_muted"
          @click="changeMuted(false)"
        ></i>
      </div>

      <div class="interruptList">
        <el-button type="info" plain @click="clickInterrupt('上厕所')"
          >上厕所</el-button
        >
        <el-button type="info" plain @click="clickInterrupt('打水')"
          >打水</el-button
        >
        <el-button type="info" plain @click="clickInterrupt('其他')"
          >其他</el-button
        >
      </div>
    </div>
  </div>
</template>

<script >
import storage from '../utils/storage.js'
import datetime from '../utils/datetime.js'
import db from '../utils/indexedDB.js'
const notifier = require('node-notifier')
const { ipcRenderer } = require('electron')

function initLog () {
  const electronLog = require('electron-log')
  let log = electronLog.create('tomato')
  let mlog = log.functions.log
  log.functions.log = function (...params) {
    mlog('[tomato]', ...params)
  }
  return log.functions
}

// const monsole = process.env.NODE_ENV === 'production' ? initLog() : console
const monsole = initLog()

export default {
  name: 'tomato-clock',
  data () {
    return {
      // config
      workTime: 25, // 工作钟时长
      restTime: 5, // 休息钟时长
      input_icon: 'el-icon-edit',
      clock_icon: 'el-icon-video-play',
      clock_time: '25:00',
      clock_bg_sound: null, // 默认是嘀嗒
      clock_muted: undefined,
      // render
      clockHandleId: null,
      secDeg: 0, // 每秒所占圆的度数
      curDeg: 0, // 当前度数
      // user_input
      taskName: '', // 任务名
      tag: 'default',
      clockStatus: '', // 开启计时
      restSec: undefined, // 剩余秒数
      clockData: {
        'begin_work_time': null, // 开始计时时的工作时间
        'begin_time': null,
        'interrupt': [],
        'interruptName': '', // 当前中断名字
        'interruptStart': null
      }
    }
  },
  watch: {
    '$store.state.Reload.clockStatus' () { // 刷新状态
      this.clockStatus = 'resting'
    },
    '$store.state.Reload.isMuted' (isMuted) { // isMuted 是否静音
      this.$refs['audio'].muted = isMuted
      this.clock_muted = isMuted
    },
    '$store.state.Reload.reloadSound' (sound) { // 监听音频配置
      if (this.clockStatus !== 'init') { this.clockStatus = 'pending' }
      this.clock_bg_sound = require('../assets/' + (sound || 'dida.mp3'))
    },
    '$store.state.Reload.workTime' (workTime) { // 监听工作时间
      this.workTime = workTime
      if (this.clockStatus === 'init') { // 此时为非计时状态
        this.restSec = workTime * 60
        this.secDeg = 360 / this.restSec // 计算每秒所占度数
        this.clock_time = datetime.formatClockTime(this.restSec)
      }
    },
    '$store.state.Reload.restTime' (restTime) { // 监听休息时间
      this.restTime = restTime
    },
    clockStatus (status) { // 监听时钟状态
      if (status === 'init') { // 时钟处于初始化状态
        this.clock_icon = 'el-icon-video-play'
        this.restSec = this.workTime * 60
        this.secDeg = 360 / this.restSec // 计算每秒所占度数
        this.curDeg = 0
        this.clock_time = datetime.formatClockTime(this.restSec)
        clearInterval(this.clockHandleId)
        this.closeAudio()
      } else if (status === 'timing') { // 时钟处于计时状态
        this.clock_icon = 'el-icon-video-pause'
        this.start()
      } else if (status === 'pending') { // 时钟处于暂停状态
        this.clock_icon = 'el-icon-video-play'
        clearInterval(this.clockHandleId)
        this.closeAudio()
      } else if (status === 'completed') { // 时钟处于完成状态
        storage.setItem('complete_clock_data', [this.taskName, this.clockData])
        // 提醒
        this.showNotification()
        // 重置
        this.clock_icon = 'el-icon-check'
        this.restSec = this.workTime * 60
        this.secDeg = 360 / this.restSec // 计算每秒所占度数
        this.curDeg = 0
        this.clock_time = '完成'
        clearInterval(this.clockHandleId)
        this.closeAudio()
      } else if (status === 'interrupt') { // 时钟处于中断状态
        this.clock_icon = 'el-icon-video-play'
        clearInterval(this.clockHandleId)
        this.closeAudio()
      } else if (status === 'resting') { // 时钟处于休息状态
        monsole.log('休息时长: ', this.restTime)
        // 清空任务名
        this.taskName = ''
        this.input_icon = 'el-icon-edit'
        // 开启休息的番茄钟
        this.clock_icon = 'el-icon-close'
        this.restSec = this.restTime * 60
        this.secDeg = 360 / this.restSec // 计算每秒所占度数
        this.curDeg = 0
        this.updateTime(this.restSec, 'init')
      }
    },
    curDeg (newDeg) { // 监听当前角度变化
      console.log(this.curDeg)
      let pie1 = this.$refs['pie1']
      let pie2 = this.$refs['pie2']
      if (newDeg <= 180) {
        pie1.style['transform'] = `rotate(${newDeg}deg)`
        pie2.style['transform'] = `rotate(0deg)`
      } else {
        pie2.style['transform'] = `rotate(${newDeg - 180}deg)`
      }
    }
  },
  /**
   * 初始化
   */
  async mounted () {
    this.workTime = storage.getItem('work-time') || 25
    this.restTime = storage.getItem('rest-time') || 5
    this.$refs['audio'].muted = Boolean(storage.getItem('clock-is-muted'))
    this.clock_muted = this.$refs['audio'].muted
    this.clock_bg_sound = require('../assets/' + (storage.getItem('clock-bg-sound') || 'dida.mp3'))
    this.clockStatus = 'init' // 执行初始化
  },

  methods: {
    abandon () {
      this.clockStatus = 'init'
    },
    completeInput () { // 输入框失去焦点或者回车，修改输入框状态
      this.input_icon = this.taskName ? 'el-icon-check' : 'el-icon-edit'
    },
    changeClock () { // 计时状态机流转
      if (this.clockStatus === 'init') {
        this.clockStatus = 'timing'
        this.clockData.begin_time = datetime.getNowDateTime()// 记录开始时间
        this.clockData.begin_work_time = this.workTime // 记录开始时的工作时间
      } else if (this.clockStatus === 'timing') {
        this.clockStatus = 'pending'
      } else if (this.clockStatus === 'pending') {
        this.clockStatus = 'timing'
      } else if (this.clockStatus === 'completed') {
        storage.setItem('complete_clock_data', [this.taskName, this.clockData])
        ipcRenderer.send('complete')
      } else if (this.clockStatus === 'interrupt') {
        this.clockStatus = 'timing'
        // 添加中断事件
        this.clockData.interrupt.push({
          'name': this.clockData.interruptName,
          'cost': Math.round(datetime.getTimeStamp() - this.clockData.interruptStart)
        })
      } else if (this.clockStatus === 'resting') {
        this.clockStatus = 'init'
      }
    },

    start () { // 开始计时
      this.updateTime(this.restSec, 'completed')
      setTimeout(() => {
        if (this.clockStatus !== 'timing') { return }
        this.$refs['audio'].play()
      }, 1000)
    },

    updateTime (sec, nextStatus) { // 更新倒计时文字
      let changeTime = this.clockStatus === 'resting' ? this.restTime : this.workTime
      this.clockHandleId = setInterval(() => {
        sec = sec - 1
        this.curDeg = this.secDeg * (changeTime * 60 - sec) // 更新当前度数
        this.clock_time = datetime.formatClockTime(sec)
        this.restSec = sec
        if (sec === 0) { // 到时间结束
          if (this.clockStatus === 'resting') {
            let that = this
            notifier.notify(
              {
                title: '休息结束！',
                message: `休息了 ${that.restTime} 分钟，打起精神来! `,
                sound: 'default',
                wait: false,
                sender: 'com.electron.timemanager' // 见 Info.plist 文件中的 CFBundleIdentifier 字段 https://github.com/julienXX/terminal-notifier
              }
            )
          }
          this.clockStatus = nextStatus // 'completed'
        }
      }, 1000)
    },
    closeAudio () { // 关闭声音
      let audio = this.$refs['audio']
      audio.pause()
      audio.currentTime = 0
    },
    async completeMainTaskClock (isMain) { // 创建属于主任务的番茄钟数据
      monsole.log('快捷创建主任务')
      // 先创建主任务
      let taskId = await db.createTask({
        'name': this.taskName,
        'is_done': 0,
        'count': 1,
        'sum_time': this.clockData.begin_work_time,
        'done_date': 0
      })
      this.$store.dispatch('pushTodoTasksSort', taskId)
      await db.createClock({
        'name': this.taskName,
        'task_id': taskId,
        'is_main': true,
        'begin_time': this.clockData.begin_time,
        'interrupt': this.clockData.interrupt,
        'count': 0,
        'sum_time': this.clockData.begin_work_time
      })
      // 清空任务名
      this.$store.dispatch('resetClockStatus')
    },

    showNotification () { // 展示通知栏
      let that = this
      notifier.notify(
        {
          title: '番茄钟已完成！',
          message: `专注了 ${that.clockData.begin_work_time} 分钟！ 你真棒! `,
          sound: 'default',
          wait: true,
          // icon: require('../assets/notification.png'), // 图标
          closeLabel: '详细设置',
          actions: '完成',
          sender: 'com.electron.timemanager' // 见 Info.plist 文件中的 CFBundleIdentifier 字段 https://github.com/julienXX/terminal-notifier
          // sender: 'com.apple.Safari'
        },
        function (err, response, metadata) {
          if (err) throw err
          // 点击详细设置
          if (metadata.activationType === 'closed') {
            ipcRenderer.send('complete')
          } else { // contentsClicked / actionClicked
            monsole.log('activationType: ', metadata.activationType)
            // 点击完成
            if (that.taskName !== '' && metadata.activationType === 'actionClicked') { // 任务名非空，默认创建主任务
              that.completeMainTaskClock()
              return
            }
            // 超时
            if (metadata.activationType !== 'timeout') {
              ipcRenderer.send('complete')
            }
          }
        }
      )
    },

    clickInterrupt (name) { // 点击中断按钮
      if (this.clockStatus !== 'interrupt') { // 避免中断情况下点击了其他的中断事件
        this.clockStatus = 'interrupt'
        this.clockData.interruptStart = datetime.getTimeStamp()
      }
      this.clockData.interruptName = name
    },
    changeMuted (muted) {
      this.clock_muted = muted
      this.$refs['audio'].muted = muted
    }

  }

}
</script>

<style scoped>
.main {
  height: 82%;
  width: 100%;
}

.bottom {
  height: 18%;
  width: 100%;
  padding-top: 1%;
  padding-left: 2%;
  padding-right: 2%;
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.interruptList {
  display: flex;
  justify-content: space-around;
}

.bottom-left {
  font-size: 24px;
  /* color: #606266; */
  color: rgb(30, 150, 30);
}

.bottom-left .el-icon-close-notification{
  color: rgb(161, 46, 46);
}

.taskInput {
  width: 84%;
}
/*
 *  倒计时
 */
.clock {
  /* margin-left: 20%; */
  padding-top: 5%;
  zoom: 200%;
  position: relative;
  display: flex;
  justify-content: center;
}
.pie_mod {
  width: 120px;
  height: 120px;
  position: absolute;
  z-index: 1;
}
.pie_mod .pie {
  width: 120px;
  height: 120px;
  background-color: #f5cbb5;
  border-radius: 50%;
  position: absolute;
}
.pie_right,
.pie_right .pie {
  clip: rect(0, 120px, 120px, 60px);
}
.close {
  position: absolute;
  right: 0;
  color: #e2a48f;
  cursor: pointer;
}

.pie_left,
.pie_left .pie {
  clip: rect(0, 60px, 120px, 0);
}

.clock_bg {
  width: 120px;
  height: 120px;
  background-color: #da9169;
  border-radius: 60px;
  position: absolute;
}
.clock_time {
  width: 110px;
  height: 110px;
  margin-top: 5px;
  background-color: #e2a48f;
  border-radius: 56.25px;
  position: absolute;
  z-index: 1;
  text-align: center;
  line-height: 110px;
  font-size: 40px;
  color: rgba(256, 256, 256, 0.6);
  user-select: none;
}
.clock_button {
  margin-top: 80px;
  width: 40px;
  height: 40px;
  line-height: 40px;
  position: absolute;
  text-align: center;
  border-radius: 20px;
  z-index: 2;
  cursor: pointer;
}
.clock_button > i {
  background-color: #e2a48f;
  color: rgba(256, 256, 256, 0.6);
  zoom: 150%;
}
/* 边颜色 */
.resting .pie {
  background-color: #6fd2b9;
}
/* 背景颜色 */
.resting .clock_time {
  background-color: #3cbd9d;
}
.resting .clock_button > i {
  background-color: #3cbd9d;
}
/* 进度条颜色 */
.resting .clock_bg {
  background-color: #009670;
}
</style>

<style>
.taskInput > .el-input.is-active .el-input__inner,
.taskInput > .el-input__inner:focus {
  border-width: 3px;
  border-color: #92b3f5 !important;
}

.taskInput > .el-input__inner {
  font-size: 18px;
  padding-top: 3px;
  padding-left: 6px;
  padding-bottom: 3px;
  background-color: #f7f7f7;
}

.taskInput > .el-input__suffix > .el-input__suffix-inner > .el-icon-edit {
  font-size: 18px;
  font-weight: bold;
}

.taskInput > .el-input__suffix > .el-input__suffix-inner > .el-icon-check {
  font-size: 20px;
  font-weight: bold;
  color: green;
}
</style>