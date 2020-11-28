<template>
  <div id="wrapper">
    <div id="top">
      <el-radio-group v-model="activeName" class="toggleBar" size="mini">
        <el-radio-button label="one">
          <i class="el-icon-s-tools"> 通用</i>
        </el-radio-button>
        <el-radio-button label="two">
          <i class="el-icon-message-solid"> 声音</i>
        </el-radio-button>
      </el-radio-group>
    </div>
    <div id="mid" v-show="activeName === 'one'">
      <div id="card" style="height: 13%">
        <el-checkbox v-model="autoLaunch" @change="autoStart"
          >开机自启动</el-checkbox
        >
      </div>
      <div id="card" style="height: 30%">
        <div>
          <span style="width: 20%">番茄时长（Min）</span>
          <el-slider
            style="width: 80%"
            v-model="workTime"
            show-input
            :max="60"
            :min="1"
            @change="updateWorkTime"
          ></el-slider>
        </div>
        <div>
          <span style="width: 20%">休息时长（Min）</span>
          <el-slider
            style="width: 80%"
            v-model="restTime"
            show-input
            :max="60"
            :min="1"
            @change="updateRestTime"
          ></el-slider>
        </div>
      </div>
    </div>
    <div id="mid" v-show="activeName === 'two'">
      <div id="card" style="height: 18%">
        <div>
          <span style="width: 18%; font-size: 18px; line-height: 40px"
            >背景音效</span
          >
          <el-select
            v-model="clockSound"
            placeholder="请选择音频"
            @change="updateSound"
          >
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </div>
      </div>
    </div>
  </div>
</template>

<script >
import storage from '../utils/storage.js'

export default {
  name: 'setting',
  data () {
    return {
      activeName: 'one',
      autoLaunch: false, // 开机自启动
      workTime: 25, // 工作钟时长
      restTime: 5, // 休息钟时长
      clockSound: '',
      options: [{
        value: 'dida.mp3',
        label: '嘀嗒'
      },
      {
        value: 'fatiao.mp3',
        label: '发条嘀嗒'
      }, {
        value: 'rain.mp3',
        label: '雨声'
      }]
    }
  },
  mounted () {
    this.autoLaunch = storage.getItem('auto-launch') || false
    this.workTime = storage.getItem('work-time') || 25
    this.restTime = storage.getItem('rest-time') || 5
    this.clockSound = storage.getItem('clock-bg-sound') || 'dida.mp3'
  },
  methods: {
    autoStart () { // 根据自启配置修改缓存
      if (this.autoLaunch) {
        storage.setItem('auto-launch', true)
      } else {
        storage.setItem('auto-launch', false)
      }
    },
    updateWorkTime () { // 工作时间
      storage.setItem('work-time', this.workTime)
      this.$store.dispatch('changeWorkTime', this.workTime)
    },
    updateRestTime () { // 休息时间
      storage.setItem('rest-time', this.restTime)
      this.$store.dispatch('changeRestTime', this.restTime)
    },
    updateSound () { // 更新背景音
      storage.setItem('clock-bg-sound', this.clockSound)
      this.$store.dispatch('changeSound', this.clockSound)
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

#top {
  height: 12%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.toggleBar i {
  font-size: 16px;
}

#mid {
  height: 88%;
  padding: 10px 20px;
}

#card {
  border-radius: 5px;
  background-color: #e3e3e3;
  padding: 2%;
  display: flex;
  flex-direction: column;
  margin-bottom: 2%;
}
#card .el-checkbox {
  margin-bottom: 1%;
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

<style>
.el-slider__runway {
  background-color: white !important;
}
</style>
