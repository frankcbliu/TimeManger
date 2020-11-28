<template>
  <div id="menu-bar">
    <div class="triangle"></div>
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
        <div class="tasks" ref="tasks">
          <!-- 未完成的任务 -->
          <template v-if="notDoneTasks.length > 0">
            <draggable v-model="notDoneTasks">
              <transition-group>
                <el-checkbox-group
                  v-model="checkTasks"
                  v-for="item in notDoneTasks"
                  :key="`notDoneTasks${item.id}`"
                  class="notDoneTask"
                >
                  <el-checkbox
                    class="subTask-checkbox"
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
                    @keydown.enter.prevent="changeTaskName(item.id, item.name)"
                    @blur.prevent="changeTaskName(item.id, item.name)"
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
                            handleCheckedSubTask(
                              item.id,
                              subItem.sub_id,
                              +isDone
                            );
                          }
                        "
                        >{{ "" }}</el-checkbox
                      >
                      <span
                        class="subTaskName"
                        :ref="`subTaskName${subItem.sub_id}`"
                        @click="editSubTaskName(subItem.sub_id)"
                        spellcheck="false"
                        @keydown.enter.prevent="
                          changeSubTaskName(subItem.sub_id, subItem.sub_name)
                        "
                        @blur.prevent="
                          changeSubTaskName(subItem.sub_id, subItem.sub_name)
                        "
                        >{{ subItem.sub_name }}</span
                      >
                    </el-checkbox-group>
                    <el-input
                      v-model="newSubTask[item.id]"
                      placeholder="添加新子任务"
                      size="mini"
                      @change="
                        (newSubTask) =>
                          createSubTask(newSubTask, item.id, item.name)
                      "
                    ></el-input>
                  </div>
                </el-checkbox-group>
              </transition-group>
            </draggable>
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
                class="doneTask"
              >
                <el-checkbox
                  class="task-checkbox"
                  :label="item.id"
                  @change="
                    (isDone) => {
                      handleCheckedTask(item.id, +isDone);
                    }
                  "
                  >{{ "" }}</el-checkbox
                >
                <span
                  class="taskName"
                  :ref="`taskName${item.id}`"
                  @click="editTaskName(item.id)"
                  spellcheck="false"
                  @keydown.enter.prevent="changeTaskName(item.id, item.name)"
                  @blur.prevent="changeTaskName(item.id, item.name)"
                  >{{ item.name }}</span
                >
                <div class="subTask">
                  <draggable
                    v-model="item.subTasks"
                    @change="changeSubTaskSort(item.id)"
                  >
                    <transition-group>
                      <el-checkbox-group
                        v-model="checkSubTasks"
                        v-for="subItem in item.subTasks"
                        :key="`subtask${subItem.sub_id}`"
                        class="marginBottom"
                      >
                        <el-checkbox
                          class="subTask-checkbox"
                          :label="subItem.sub_id"
                          @change="
                            (isDone) => {
                              handleCheckedSubTask(
                                item.id,
                                subItem.sub_id,
                                +isDone
                              );
                            }
                          "
                          >{{ "" }}</el-checkbox
                        >
                        <span
                          class="subTaskName"
                          :ref="`subTaskName${subItem.sub_id}`"
                          @click="editSubTaskName(subItem.sub_id)"
                          spellcheck="false"
                          @keydown.enter.prevent="
                            changeSubTaskName(subItem.sub_id, subItem.sub_name)
                          "
                          @blur.prevent="
                            changeSubTaskName(subItem.sub_id, subItem.sub_name)
                          "
                          >{{ subItem.sub_name }}</span
                        >
                      </el-checkbox-group>
                    </transition-group>
                  </draggable>
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
      <div id="mid" v-show="activeName === 'two'">
        <tomato-clock />
      </div>
      <div id="bottom">
        <div></div>
        <span style="margin: 1%; font-size: 25px" @click="openSetting">
          <i class="el-icon-setting" style="color: #606266"></i>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import db from '../utils/indexedDB.js'
import TomatoClock from './TomatoClock.vue'
import draggable from 'vuedraggable'
import datetime from '../utils/datetime'
import storage from '../utils/storage.js'
// 需要用到 electron
const { remote, ipcRenderer } = require('electron')
const { Menu, MenuItem } = remote

export default {
  name: 'menu-bar',
  components: {
    TomatoClock,
    draggable
  },
  data () {
    return {
      activeName: 'one',
      notDoneTasks: [], // 未完成的任务
      doneTasks: [], // 已完成的任务
      isShowDoneTasks: false,
      checkTasks: [], // 选中的主任务id
      checkSubTasks: [], // 选中的主任务id
      newTask: '',
      newSubTask: [],
      isScroll: false, // 监听滚轮是否滚动
      taskSort: [],
      notDoneTasksSort: storage.getItem('not-done-tasks-sort')
    }
  },
  async mounted () {
    await db.initDB()
    this.init()
    let tasksRef = this.$refs['tasks']
    tasksRef.addEventListener('scroll', () => {
      this.isScroll = !!tasksRef.scrollTop
    })
  },
  computed: {
    showDoneDay () {
      return storage.getItem('show-done-day') || 1
    }
  },
  methods: {
    async init () {
      // 重置新增的任务和子任务
      this.newTask = ''
      this.newSubTask = []

      let notDoneTasks = await db.getTaskByParam('is_done', 0) // 获取所有未完成的任务
      let doneTasks = await db.getTaskByShowDoneDay(this.showDoneDay) // 获取 showDoneDay 天内的已完成任务

      // 主任务排序
      if (
        this.notDoneTasksSort &&
        this.notDoneTasksSort.length === notDoneTasks.length
      ) {
        let tempObj = {}
        for (let item of notDoneTasks) {
          tempObj[item.id] = item
        }
        console.log(tempObj)
        notDoneTasks = []
        for (let id of this.notDoneTasksSort) {
          notDoneTasks.push(tempObj[id])
        }
      }

      let checkTasks = []
      let checkSubTasks = []
      let notDoneTasksSort = []
      for (let item of [...notDoneTasks, ...doneTasks]) {
        item.subTasks = await db.getSubTaskById(item.id) // 获取子任务
        for (let subItem of item.subTasks) {
          if (subItem.is_done) {
            checkSubTasks.push(subItem.sub_id) // 选中已完成的任务
          }
        }
        if (item.is_done) {
          checkTasks.push(item.id)
        } else {
          if (
            !(
              this.notDoneTasksSort &&
              this.notDoneTasksSort.length === this.notDoneTasks.length
            )
          ) {
            // 如果缓存里有notDoneTasksSort且长度和notDoneTasks一致，则不执行更新操作
            notDoneTasksSort.push(item.id)
          }
        }
      }
      this.doneTasks = doneTasks
      this.notDoneTasks = notDoneTasks
      this.checkTasks = checkTasks
      this.checkSubTasks = checkSubTasks

      if (
        !(
          this.notDoneTasksSort &&
          this.notDoneTasksSort.length === this.notDoneTasks.length
        )
      ) {
        // 如果缓存里有notDoneTasksSort且长度和notDoneTasks一致，则不执行更新操作
        this.notDoneTasksSort = notDoneTasksSort
        storage.setItem('not-done-tasks-sort', notDoneTasksSort) // 更新缓存
      }
      console.log(this.notDoneTasksSort)
      console.log(this.notDoneTasks)
      console.log(this.doneTasks)
    },
    clickShowDoneTasks () {
      // 是否显示已完成的任务
      this.isShowDoneTasks = !this.isShowDoneTasks
    },
    async createTask (newTask) {
      // 创建主任务
      if (this.newTask) {
        await db.createTask({
          name: newTask,
          is_done: 0,
          sum_time: 0,
          done_date: 0
        })
        this.init()
      }
    },
    async createSubTask (newSubTask, id, name, isDone) {
      // 创建子任务
      if (this.newSubTask) {
        if (isDone) {
          // 如果主任务已经完成，置为未完成
          await db.setTaskParam(id, { is_done: 0, done_date: 0 })
        }
        await db.createSubTask({
          id: id,
          name: name,
          sub_name: newSubTask,
          is_done: 0,
          sum_time: 0
        })
        this.init()
      }
    },
    async handleCheckedTask (id, isDone, subTasks) {
      // 更改主任务状态
      if (isDone) {
        // 如果已完成，子任务默认为全部完成
        await db.setTaskParam(id, {
          is_done: isDone,
          done_date: datetime.getTimeStamp()
        })
        for (let subItem of subTasks) {
          await db.setSubTaskParam(subItem.sub_id, { is_done: 1 })
        }
      } else {
        await db.setTaskParam(id, { is_done: isDone, done_date: 0 })
      }
      this.init()
    },
    async handleCheckedSubTask (id, subId, isDone) {
      // 更改子任务状态
      await db.setSubTaskParam(subId, { is_done: isDone })
      if (!isDone) {
        // 如果子任务设为未完成，主任务也设为未完成
        await db.setTaskParam(id, { is_done: 0, done_date: 0 })
      }
      this.init()
    },
    editTaskName (id) {
      // 主任务名设为可编辑
      this.$refs[`taskName${id}`][0].contentEditable = true
    },
    async changeTaskName (id, oldTaskName) {
      // 修改主任务名
      let taskNameRef = this.$refs[`taskName${id}`][0]
      let newTaskName = taskNameRef.innerHTML
      if (newTaskName !== oldTaskName) {
        await db.setTaskParam(id, { name: newTaskName })
        this.init()
      }
      taskNameRef.blur()
    },
    editSubTaskName (subId) {
      // 子任务名设为可编辑
      this.$refs[`subTaskName${subId}`][0].contentEditable = true
    },
    async changeSubTaskName (subId, oldSubTaskName) {
      // 修改子任务名
      let subTaskNameRef = this.$refs[`subTaskName${subId}`][0]
      let newSubTaskName = subTaskNameRef.innerHTML
      if (newSubTaskName !== oldSubTaskName) {
        await db.setSubTaskParam(subId, { sub_name: newSubTaskName })
        this.init()
      }
      subTaskNameRef.blur()
    },
    changeTaskSort () {
      // 改变未完成的任务排序
      let notDoneTasksSort = []
      for (let item of this.notDoneTasks) {
        notDoneTasksSort.push(item.id)
      }
      this.notDoneTasksSort = notDoneTasksSort
      storage.setItem('not-done-tasks-sort', this.notDoneTasksSort) // 更新缓存
      console.log(this.notDoneTasksSort)
    },
    changeSubTaskSort () {
      // 改变子任务排序
      // console.log(this.notDoneTasksSort)
    },
    openSetting () {
      // 打开设置
      console.log('open setting')
      // 右键菜单
      const menu = new Menu()
      menu.append(
        new MenuItem({
          label: '偏好设置',
          click: function () {
            ipcRenderer.send('setting')
          }
        })
      )
      menu.append(
        new MenuItem({
          label: '退出',
          click: function () {
            ipcRenderer.send('exit')
          }
        })
      )

      // 第二个菜单
      // menu.append( ... )
      // 展示出来
      menu.popup(remote.getCurrentWindow())
    }
  }
}
</script>

<style scoped>
.triangle {
  position: relative;
  width: 0;
  height: 0;
  border-right: 10px solid transparent;
  border-bottom: 10px solid #f2f1f2;
  border-left: 10px solid transparent;
  left: 50%;
  transform: translateX(-50%);
}

[contenteditable]:focus {
  outline: none;
  color: #000;
  caret-color: #409eff;
}
.marginBottom {
  margin-bottom: 10px;
}
#wrapper {
  background-color: #f2f1f2;
  height: calc(100vh - 10px);
  width: 100vw;
  overflow-y: hidden;
  border-radius: 8px;
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
.tasks {
  /* padding: 10px 20px; */
  height: 85%;
  overflow-y: scroll;
}
.notDoneTask,
.doneTask {
  padding: 10px 20px;
}
.notDoneTask:hover {
  background-color: #e6e3e6;
  cursor: move;
}
.doneTask:hover {
  background-color: #e6e3e6;
}
.task-checkbox {
  zoom: 120%;
}
.taskName {
  font-size: 20px;
  font-weight: bold;
  color: #606266;
}
.taskName:hover,
.subTaskName:hover {
  cursor: auto;
}
.subTaskName {
  font-size: 16px;
  color: #606266;
}
.showDoneTasks {
  padding: 0 20px;
  cursor: pointer;
}
.subTask {
  padding: 5px 0 5px 20px;
}
.subTask-checkbox {
  zoom: 115%;
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

/* checkbox 边框未选中时灰色 */
span.el-checkbox__inner {
  border-color: #9b9a9a;
}

.newTaskInput > .el-input.is-active .el-input__inner,
.newTaskInput > .el-input__inner:focus {
  border-width: 3px;
  border-color: #92b3f5 !important;
}

/* 已完成的 checkbox 后的文字变灰色 */
.el-checkbox.is-checked + span {
  color: #9b9a9a !important;
  text-decoration: line-through;
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