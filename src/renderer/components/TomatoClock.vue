<template>
  <div style="width: 100%; height: 100%">
    <div id="clock">画个钟</div>

    <div class="bottom" :hidden="!clockStart">
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
    <div class="bottom" :hidden="clockStart">
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

export default {
  name: 'tomato-clock',
  data () {
    return {
      workTime: 25, // 工作钟时长
      restTime: 5, // 休息钟时长
      clockStart: true, // 开启计时
      taskName: '', // 任务名
      tag: 'default',
      input_icon: 'el-icon-edit'
    }
  },
  mounted () {
    this.workTime = storage.getItem('work-time') || 25
    this.restTime = storage.getItem('rest-time') || 5
  },
  methods: {
    completeInput () { // 输入框失去焦点或者回车，修改输入框状态
      this.input_icon = this.taskName ? 'el-icon-check' : 'el-icon-edit'
    }
  }
}
</script>

<style scoped>
#clock {
  height: 80%;
}

.bottom {
  height: 20%;
  width: 100%;
  padding-left: 2%;
  padding-right: 2%;
}

.interruptList {
  display: flex;
  justify-content: space-around;
}

.taskInput {
  margin-left: 3%;
  width: 84%;
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