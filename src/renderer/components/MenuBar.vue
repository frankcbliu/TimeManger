<template>
  <div id="wrapper">
    <div id="top">
      <el-radio-group v-model="activeName" class="toggleBar" size="mini">
        <el-radio-button label="one">
          <i class="el-icon-finished"></i>
        </el-radio-button>
        <el-radio-button label="two">
          <i class="el-icon-time"></i>
        </el-radio-button>
      </el-radio-group>
    </div>
    <div id="mid" v-show="activeName === 'one'">
      <el-input
        style="menu-input"
        v-model="newTask"
        placeholder="添加新任务"
        size="small"
        class="newTaskInput"
        @change="createTask"
        :class="{ scroll: isScroll }"
      ></el-input>
      <div class="task" ref="task">
        <!-- 未完成的任务 -->
        <template v-if="notDoneTasks.length > 0">
          <el-checkbox-group
            v-model="checkTasks"
            v-for="item in notDoneTasks"
            :key="`notDoneTasks${item.id}`"
            class="marginBottom"
          >
            <el-checkbox
              style="zoom: 120%"
              :label="item.id"
              @change="
                (isDone) => {
                  handleCheckedTask(item.id, +isDone, item.subTasks);
                }
              "
              >{{ "" }}</el-checkbox
            >
            <span
              class="taskName"
              :ref="`taskName${item.id}`"
              @click="editTaskName(item.id)"
              spellcheck="false"
              @keydown.enter.prevent="changeTaskName(item.id)"
              >{{ item.name }}</span
            >
            <div class="subTask">
              <el-checkbox-group
                v-model="checkSubTasks"
                v-for="subItem in item.subTasks"
                :key="`subtask${subItem.sub_id}`"
                class="marginBottom"
              >
                <el-checkbox
                  style="zoom: 115%"
                  :label="subItem.sub_id"
                  @change="
                    (isDone) => {
                      handleCheckedSubTask(subItem.sub_id, +isDone);
                    }
                  "
                  >{{ subItem.sub_name }}</el-checkbox
                >
              </el-checkbox-group>
              <el-input
                v-model="newSubTask[item.id]"
                placeholder="添加新子任务"
                size="mini"
                @change="
                  (newSubTask) => createSubTask(newSubTask, item.id, item.name)
                "
              ></el-input>
            </div>
          </el-checkbox-group>
        </template>
        <!-- 已完成的任务 -->
        <template v-if="doneTasks.length > 0">
          <div @click="clickShowDoneTasks" class="showDoneTasks marginBottom">
            <i class="el-icon-arrow-up" v-if="isShowDoneTasks"></i>
            <i class="el-icon-arrow-down" v-else></i>
            完成的任务
          </div>
          <template v-if="isShowDoneTasks">
            <el-checkbox-group
              v-model="checkTasks"
              v-for="(item, index) in doneTasks"
              :key="`doneTasks${index}`"
              class="marginBottom"
            >
              <el-checkbox
                :label="item.id"
                @change="
                  (isDone) => {
                    handleCheckedTask(item.id, +isDone);
                  }
                "
                >{{ item.name }}</el-checkbox
              >
              <div class="subTask">
                <el-checkbox-group
                  v-model="checkSubTasks"
                  v-for="subItem in item.subTasks"
                  :key="`subtask${subItem.sub_id}`"
                  class="marginBottom"
                >
                  <el-checkbox
                    :label="subItem.sub_id"
                    @change="
                      (isDone) => {
                        handleCheckedSubTask(subItem.sub_id, +isDone);
                      }
                    "
                    >{{ subItem.sub_name }}</el-checkbox
                  >
                </el-checkbox-group>
                <el-input
                  v-model="newSubTask[item.id]"
                  placeholder="添加新子任务"
                  class="marginBottom"
                  size="mini"
                  @change="
                    (newSubTask) =>
                      createSubTask(
                        newSubTask,
                        item.id,
                        item.name,
                        item.is_done
                      )
                  "
                />
              </div>
            </el-checkbox-group>
            
          </template>
        </template>
      </div>
    </div>
    <div id="mid" v-show="activeName === 'two'">two</div>
    <div id="bottom">
      <div></div>
      <span style="margin: 1%; font-size: 25px" @click="openSetting">
        <i class="el-icon-setting" style="color: #606266"></i>
      </span>
    </div>
  </div>
</template>

<script>
import db from '../utils/indexedDB.js'
// 需要用到 electron
const { remote, ipcRenderer } = require('electron')
const { Menu, MenuItem } = remote

export default {
  name: 'menu-bar',
  data () {
    return {
      activeName: 'one',
      store: null,
      isShowDoneTasks: false,
      checkTasks: [], // 主任务选中的id
      checkSubTasks: [],
      notDoneTasks: [], // 未完成的任务
      doneTasks: [], // 已完成的任务
      newTask: '',
      newSubTask: [],
      isScroll: false // 监听滚轮是否滚动
    }
  },
  async mounted () {
    await db.initDB()
    this.init()
    let taskDoc = this.$refs['task']
    taskDoc.addEventListener('scroll', () => {
      this.isScroll = !!taskDoc.scrollTop
    })
  },
  methods: {
    async init () {
      this.checkNotDoneTasks = []
      this.checkDoneTasks = []
      this.newTask = ''
      this.newSubTask = []
      this.tasks = await db.getAllTask()

      let notDoneTasks = []
      let doneTasks = []
      let checkTasks = []
      let checkSubTasks = []
      for (let item of this.tasks) {
        item.subTasks = await db.getSubTaskById(item.id) // 获取子任务
        for (let subItem of item.subTasks) {
          if (subItem.is_done) {
            checkSubTasks.push(subItem.sub_id) // 选中已完成的任务
          }
        }
        if (item.is_done) {
          doneTasks.push(item)
          checkTasks.push(item.id)
        } else {
          notDoneTasks.push(item)
        }
      }
      this.doneTasks = doneTasks
      this.notDoneTasks = notDoneTasks
      this.checkTasks = checkTasks
      this.checkSubTasks = checkSubTasks
      console.log(this.notDoneTasks)
      console.log(this.doneTasks)
    },
    clickShowDoneTasks () { // 是否显示已完成的任务
      this.isShowDoneTasks = !this.isShowDoneTasks
    },
    createTask (newTask) { // 创建主任务
      if (this.newTask) {
        db.createTask({
          'name': newTask,
          'is_done': 0,
          'sum_time': 0
        })
        this.init()
      }
    },
    createSubTask (newSubTask, id, name, isDone) { // 创建子任务
      if (this.newSubTask) {
        if (isDone) { // 如果主任务已经完成，置为未完成
          db.setTaskIsDone(id, 0)
        }
        db.createSubTask({
          'id': id,
          'name': name,
          'sub_name': newSubTask,
          'is_done': 0,
          'sum_time': 0
        })
        this.init()
      }
    },
    async handleCheckedTask (id, isDone, subTasks) { // 更改主任务状态
      await db.setTaskIsDone(id, isDone)
      if (isDone) { // 如果已完成，子任务默认为全部完成
        for (let subItem of subTasks) {
          await db.setSubTaskIsDone(subItem.sub_id, 1)
        }
      }
      this.init()
    },
    async handleCheckedSubTask (subId, isDone) { // 更改子任务状态
      await db.setSubTaskIsDone(subId, isDone)
      this.init()
    },
    editTaskName (id) { // 主任务名设为可编辑
      this.$refs[`taskName${id}`][0].contentEditable = true
    },
    changeTaskName (id) { // 修改主任务名
      console.log(id)
    },
    openSetting () {
      console.log('open setting')
      // 右键菜单
      const menu = new Menu()
      menu.append(new MenuItem({
        label: '偏好设置',
        click: function () {
          ipcRenderer.send('setting')
        }
      }))
      menu.append(new MenuItem({
        label: '退出',
        click: function () {
          ipcRenderer.send('exit')
        }
      }))

      // 第二个菜单
      // menu.append( ... )
      // 展示出来
      menu.popup(remote.getCurrentWindow())
    }
  }
}
</script>

<style scoped>
[contenteditable]:focus {
  outline: none;
  color: #000;
}
.marginBottom {
  margin-bottom: 10px;
}
#wrapper {
  height: 100vh;
  width: 100vw;
  overflow-y: hidden;
}

#top {
  height: 12%;
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid #ddd;
}
.toggleBar i {
  font-size: 16px;
}
#mid {
  height: 80%;
}

.newTaskInput {
  height: 15%;
  display: flex;
  align-items: center;
  padding: 0 20px;
}
.scroll {
  box-shadow: 0 3px 8px -4px rgba(0, 0, 0, 0.12);
}
.task {
  padding: 10px 20px;
  height: 85%;
  overflow-y: scroll;
}
.taskName {
  font-size: 16px;
  font-weight: bold;
  color: #606266;
}
.showDoneTasks {
  cursor: pointer;
}
.subTask {
  padding: 5px 0 5px 20px;
}
#bottom {
  height: 8%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #ddd;
}

.menu-input {
  background-color: #f1f2f1;
  font-size: 20px;
}
</style>

<style>
.el-checkbox__label {
  font-size: 16px !important;
}
.newTaskInput > .el-input__inner {
  font-size: 20px;
  padding-top: 3px;
  padding-left: 6px;
  padding-bottom: 3px;
  background-color: #f7f7f7;
}

.el-input.is-active .el-input__inner,
.el-input__inner:focus {
  border-width: 3px;
}

.subTask > .el-input > .el-input.is-active .el-input__inner,
.subTask > .el-input > .el-input__inner:focus {
  border-width: 0px;
  background-color: #f1f2f1;
}

.subTask > .el-input > .el-input__inner {
  font-size: 16px;
  padding-top: 3px;
  padding-left: 6px;
  padding-bottom: 3px;
  background-color: #f2f1f2;
  border-width: 0px;
}
</style>