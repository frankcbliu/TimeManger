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
        <el-checkbox v-model="autoLaunch" @change="autoStart">开机自启动</el-checkbox>
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
          ></el-slider>
        </div>
      </div>
    </div>
    <div id="mid" v-show="activeName === 'two'">
    </div>
  </div>
</template>

<script >
const { ipcRenderer } = require('electron')

export default {
  name: 'setting',
  data () {
    return {
      activeName: 'one',
      autoLaunch: false, // 开机自启动
      workTime: 25, // 工作钟时长
      restTime: 5 // 休息钟时长
    }
  },
  mounted () {
  },
  methods: {
    autoStart () {
      if (this.autoLaunch) {
        ipcRenderer.send('autoStart')
      } else {
        ipcRenderer.send('cancelAutoStart')
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
