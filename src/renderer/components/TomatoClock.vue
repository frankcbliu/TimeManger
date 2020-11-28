<template>
  <div style="width: 100%; height: 100%">
    <div class="main">
      <div class="clock">
        <!-- 右半边半圆背景  -->
        <div class="pie_mod pie_right">
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
        <div class="clock_time">{{ clock_time }}</div>
        <div class="clock_button">
          <i :class="clock_icon" @click="changeClock"></i>
        </div>
      </div>
      <audio :src="clock_bg_sound" ref="audio" loop></audio>
    </div>

    <div class="bottom" :hidden="clockStart">
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
    <div class="bottom" :hidden="!clockStart">
      <div class="interruptList">
        <el-button type="info" plain>上厕所</el-button>
        <el-button type="info" plain>打水</el-button>
        <el-button type="info" plain>看微信消息</el-button>
      </div>
    </div>
  </div>
</template>

<script >
import storage from '../utils/storage.js'
import datetime from '../utils/datetime.js'
import db from '../utils/indexedDB.js'
const notifier = require('node-notifier')

export default {
  name: 'tomato-clock',
  data () {
    return {
      workTime: 25, // 工作钟时长
      restTime: 5, // 休息钟时长
      clockStart: false, // 开启计时
      taskName: '', // 任务名
      tag: 'default',
      input_icon: 'el-icon-edit',
      clock_icon: 'el-icon-video-play',
      clock_time: '25:00',
      clockHandleId: null,
      clock_bg_sound: null, // 默认是嘀嗒
      restSec: undefined, // 剩余秒数
      clockData: {
        'begin_time': null,
        'interrupt': []
      },
      secDeg: 0, // 每秒所占圆的度数
      curDeg: 0 // 当前度数
    }
  },
  watch: {
    '$store.state.Reload.reloadSound' (sound) { // 监听音频配置
      this.clock_bg_sound = require('../assets/' + (sound || 'dida.mp3'))
      this.clockStart = false
    },
    '$store.state.Reload.workTime' (workTime) { // 监听工作时间
      this.workTime = workTime
      if (!this.clockStart) {
        this.restSec = workTime * 60
        this.secDeg = 360 / this.restSec // 计算每秒所占度数
        this.clock_time = datetime.formatClockTime(this.restSec)
      }
    },
    '$store.state.Reload.restTime' (restTime) { // 监听休息时间
      this.restTime = restTime
    },

    clockStart () { // 监听时钟开启与否
      this.clock_icon = this.clockStart ? 'el-icon-video-pause' : 'el-icon-video-play'
      if (this.clockStart) {
        this.start()
      } else {
        clearInterval(this.clockHandleId)
        let audio = this.$refs['audio']
        audio.pause()
        audio.currentTime = 0
      }
    },
    curDeg (newDeg) {
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
  mounted () {
    this.workTime = storage.getItem('work-time') || 25
    this.restTime = storage.getItem('rest-time') || 5
    this.restSec = this.workTime * 60
    this.secDeg = 360 / this.restSec // 计算每秒所占度数
    this.clock_time = datetime.formatClockTime(this.restSec)
    this.clock_bg_sound = require('../assets/' + (storage.getItem('clock-bg-sound') || 'dida.mp3'))
  },

  methods: {
    completeInput () { // 输入框失去焦点或者回车，修改输入框状态
      this.input_icon = this.taskName ? 'el-icon-check' : 'el-icon-edit'
    },

    changeClock () { // 开始/暂停计时
      this.clockStart = !this.clockStart
    },

    start () { // 开始计时
      if (this.restSec === this.workTime * 60) { // 记录开始时间
        this.clockData.begin_time = datetime.getNowDateTime()
      }
      this.updateTime(this.restSec)
      setTimeout(() => {
        this.$refs['audio'].play()
      }, 1000)
    },

    updateTime (sec) { // 更新倒计时文字
      this.clockHandleId = setInterval(() => {
        sec = sec - 1
        this.curDeg = this.secDeg * (this.workTime * 60 - sec) // 更新当前度数
        this.clock_time = datetime.formatClockTime(sec)
        this.restSec = sec
        if (sec === 0) { // 到时间结束
          this.clockStart = false
          // 重置
          this.restSec = this.workTime * 60
          this.curDeg = 0
          this.clock_time = datetime.formatClockTime(this.restSec)
          // 提醒
          this.showNotification()
        }
      }, 1000)
    },
    completeClock (isMain) { // 创建番茄钟数据
      let that = this
      db.createClock({
        'is_main': isMain,
        'begin_time': that.clockData.begin_time,
        'interrupt': that.clockData.interrupt
      })
    },
    showNotification () {
      let that = this
      notifier.notify(
        {
          title: '番茄钟已完成！',
          message: '专注了 xx 分钟！ 你真棒！',
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
            console.log('这是点击了详细设置')
          } else { // contentsClicked / actionClicked
            // 点击完成
            console.log('这是点击了完成', metadata)
            that.completeClock()
          }
        }
      )
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
}

.interruptList {
  display: flex;
  justify-content: space-around;
}

.taskInput {
  margin-left: 8%;
  width: 84%;
}
/*
 *  倒计时
 */
.clock {
  /* margin-left: 20%; */
  padding-top: 3%;
  zoom: 200%;
  position: relative;
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
  background-color:#f5cbb5;
  border-radius: 50%;
  position: absolute;
}
.pie_right,
.pie_right .pie {
  clip: rect(0, 120px, 120px, 60px);
}

.pie_left,
.pie_left .pie {
  clip: rect(0, 60px, 120px, 0);
}

.clock_bg {
  width: 120px;
  height: 120px;
  /* background-color: red; */
  background: #da9169;
  border-radius: 60px;
  position: absolute;
}
.clock_time {
  width: 110px;
  height: 110px;
  margin: 5px 0 0 5px;
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
  margin: 80px 0 0 40px;
  width: 40px;
  height: 40px;
  line-height: 40px;
  position: absolute;
  text-align: center;
  border-radius: 20px;
  z-index: 2;
}
.clock_button > i {
  background-color: #e2a48f;
  color: rgba(256, 256, 256, 0.6);
  zoom: 150%;
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