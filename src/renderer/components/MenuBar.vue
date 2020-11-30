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
          <template v-if="todoTasks.length > 0">
            <draggable v-model="todoTasks" @change="changeTaskSort()">
              <transition-group>
                <el-checkbox-group
                  v-model="checkTasks"
                  v-for="item in todoTasks"
                  :key="`todoTasks${item.id}`"
                  class="todoTask"
                >
                  <div class="taskTop">
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
                      @keydown.enter.prevent="
                        changeTaskName(item.id, item.name)
                      "
                      @blur.prevent="changeTaskName(item.id, item.name)"
                      >{{ item.name }}</span
                    >
                    <div class="taskTopRight">
                      <div class="taskCount">🍅 {{ item.count || 0 }}</div>
                      <div
                        class="taskExpand"
                        @click="taskExpand(item.id, item.isDone, item.subTasks)"
                      >
                        ···
                      </div>
                    </div>
                  </div>

                  <div class="subTasks">
                    <draggable
                      v-model="item.subTasks"
                      @change="changeSubTaskSort(item.subTasks, item.id)"
                    >
                      <transition-group>
                        <el-checkbox-group
                          v-model="checkSubTasks"
                          v-for="subItem in item.subTasks"
                          :key="`subtask${subItem.sub_id}`"
                          class="subTask"
                        >
                          <div class="taskTop">
                            <el-checkbox
                              style="zoom: 115%"
                              :label="subItem.sub_id"
                              @change="
                                (isDone) => {
                                  handleCheckedSubTask(
                                    item.id,
                                    item.is_done,
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
                                changeSubTaskName(
                                  subItem.sub_id,
                                  subItem.sub_name
                                )
                              "
                              @blur.prevent="
                                changeSubTaskName(
                                  subItem.sub_id,
                                  subItem.sub_name
                                )
                              "
                              >{{ subItem.sub_name }}</span
                            >
                            <div class="taskTopRight">
                              <div class="taskCount">
                                🍅 {{ subItem.sub_count || 0 }}
                              </div>
                              <div
                                class="taskExpand"
                                @click="
                                  subTaskExpand(
                                    subItem.sub_id,
                                    item.id,
                                    subItem.is_done
                                  )
                                "
                              >
                                ···
                              </div>
                            </div>
                          </div>
                        </el-checkbox-group>
                      </transition-group>
                    </draggable>
                    <el-input
                      v-model="newSubTask[item.id]"
                      placeholder="添加新子任务"
                      size="mini"
                      class="subTaskInput"
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
            <div @click="clickShowDoneTasks" class="showDoneTasks">
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
                <div class="taskTop">
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
                  <div class="taskTopRight">
                    <div class="taskCount">🍅 {{ item.count || 0 }}</div>
                    <div
                      class="taskExpand"
                      @click="taskExpand(item.id, item.is_done, item.subTasks)"
                    >
                      ···
                    </div>
                  </div>
                </div>
                <div class="subTasks">
                  <el-checkbox-group
                    v-model="checkSubTasks"
                    v-for="subItem in item.subTasks"
                    :key="`subtask${subItem.sub_id}`"
                    class="marginBottom"
                  >
                    <div class="taskTop">
                      <el-checkbox
                        class="subTask-checkbox"
                        :label="subItem.sub_id"
                        @change="
                          (isDone) => {
                            handleCheckedSubTask(
                              item.id,
                              item.is_done,
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
                      <div class="taskTopRight">
                        <div class="taskCount">
                          🍅 {{ subItem.sub_count || 0 }}
                        </div>
                        <div
                          class="taskExpand"
                          @click="
                            subTaskExpand(
                              subItem.sub_id,
                              item.id,
                              subItem.is_done
                            )
                          "
                        >
                          ···
                        </div>
                      </div>
                    </div>
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

function initLog () {
  const electronLog = require('electron-log')
  let log = electronLog.create('menuBar')
  let mlog = log.functions.log
  log.functions.log = function (...params) {
    mlog('[menuBar]', ...params)
  }
  return log.functions
}

const monsole = process.env.NODE_ENV === 'production' ? initLog() : console

export default {
  name: 'menu-bar',
  components: {
    TomatoClock,
    draggable
  },
  data () {
    return {
      activeName: 'one',
      todoTasks: [], // 未完成的任务
      doneTasks: [], // 已完成的任务
      isShowDoneTasks: false,
      checkTasks: [], // 选中的主任务id
      checkSubTasks: [], // 选中的子任务id
      newTask: '',
      newSubTask: [],
      isScroll: false, // 监听滚轮是否滚动
      todoTasksSort: storage.getItem('todo-tasks-sort'), // 未完成的主任务排序 [id]
      todoSubTasksSort: storage.getItem('todo-sub-tasks-sort') // 未完成的子任务排序 {id: [subId]}
    }
  },
  watch: {
    '$store.state.Reload.tomatoClockNumVersion' () { // 刷新番茄钟数量
      this.init()
    },
    '$store.state.Reload.todoTasksSort' (todoTasksSort) {
      this.todoTasksSort = JSON.parse(JSON.stringify(todoTasksSort)) // 拷贝
      monsole.log('监听到主任务顺序改变', JSON.stringify(this.todoTasksSort))
      this.init()
    },
    '$store.state.Reload.todoSubTasksSort' (todoSubTasksSort) {
      this.todoSubTasksSort = JSON.parse(JSON.stringify(todoSubTasksSort)) // 拷贝
      monsole.log(
        '监听到子任务顺序改变',
        JSON.stringify(this.todoSubTasksSort)
      )
      this.init()
    }
  },
  created () {
    // 删除缓存，测试用
    // db.clear()
    // storage.clear()
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
    /**
     * 初始化函数
     */
    async init () {
      // 重置新增的任务和子任务
      this.newTask = ''
      this.newSubTask = []

      let todoTasks = await db.getTaskByParam('is_done', 0) // 获取所有未完成的任务
      let doneTasks = await db.getTaskByShowDoneDay(this.showDoneDay) // 获取showDoneDay天内的已完成任务
      monsole.log('[init] todoTasks: ', JSON.stringify(todoTasks))
      monsole.log('[init] doneTasks: ', JSON.stringify(doneTasks))

      let checkTasks = []

      let checkSubTasks = []
      // 获取子任务并更新选中列表
      for (let item of [...todoTasks, ...doneTasks]) {
        let subTasks = await db.getSubTaskById(item.id) // 获取子任务
        console.log(this.todoSubTasksSort)
        console.log(subTasks)
        item.subTasks = this.subTaskSort(subTasks, item.id)
        for (let subItem of item.subTasks) {
          if (subItem.is_done) {
            checkSubTasks.push(subItem.sub_id) // 选中已完成的任务
          }
        }
        if (item.is_done) {
          checkTasks.push(item.id)
        }
      }

      this.doneTasks = doneTasks
      this.todoTasks = this.taskSort(todoTasks) // 排序
      this.checkTasks = checkTasks
      this.checkSubTasks = checkSubTasks
      console.log(todoTasks)
      console.log(doneTasks)
    },
    /**
     * 初始化未完成的主任务列表顺序
     */
    taskSort (todoTasks) {
      if (this.todoTasksSort) {
        let tempObj = {}
        for (let item of todoTasks) {
          // 生成{id: {}}的对象，方便后续获取
          tempObj[item.id] = item
        }
        todoTasks = []
        for (let id of this.todoTasksSort) {
          todoTasks.push(tempObj[id])
        }
      } else {
        let todoTasksSort = []
        // 如果缓存里有不存在todoTasksSort，则执行更新操作
        for (let item of todoTasks) {
          todoTasksSort.push(item.id)
        }
        this.$store.dispatch('updateTodoTasksSort', todoTasksSort)
      }
      return todoTasks
    },
    /**
     * 初始化未完成的主任务下的子任务顺序
     */
    subTaskSort (todoSubTasks, id) {
      let tempSort = []
      if (this.todoSubTasksSort && this.todoSubTasksSort[id]) {
        let tempObj = {}
        for (let item of todoSubTasks) {
          tempObj[item.sub_id] = item
        }
        todoSubTasks = []
        for (let subId of this.todoSubTasksSort[id]) {
          todoSubTasks.push(tempObj[subId])
        }
      } else {
        this.todoSubTasksSort = this.todoSubTasksSort || {}
        // 如果缓存里有不存在todoSubTasksSort[id]，则执行更新操作
        for (let item of todoSubTasks) {
          tempSort.push(item.sub_id)
        }
        this.todoSubTasksSort[id] = tempSort
        this.$store.dispatch('updateTodoSubTasksSort', this.todoSubTasksSort)
        // storage.setItem('todo-sub-tasks-sort', this.todoSubTasksSort) // 更新缓存
      }
      return todoSubTasks
    },
    /**
     * 是否显示已完成的任务
     */
    clickShowDoneTasks () {
      this.isShowDoneTasks = !this.isShowDoneTasks
    },
    /**
     * 创建主任务
     */
    async createTask (newTask) {
      if (this.newTask) {
        let taskId = await db.createTask({
          name: newTask,
          is_done: 0,
          sum_time: 0,
          done_date: 0,
          count: 0
        })
        this.$store.dispatch('pushTodoTasksSort', taskId)
      }
    },
    /**
     * 创建子任务
     */
    async createSubTask (newSubTask, id, name, isDone) {
      if (this.newSubTask) {
        if (isDone) {
          // 如果主任务已经完成，置为未完成
          await db.setTaskParam(id, { is_done: 0, done_date: 0 })
          this.todoTasksSort.push(id)
          this.$store.dispatch('updateTodoTasksSort', this.todoTasksSort)
        }
        let newSubId = await db.createSubTask(
          {
            id: id,
            name: name,
            sub_name: newSubTask,
            is_done: 0,
            sum_time: 0
          },
          this.$store
        )
        this.todoSubTasksSort[id].push(newSubId) // 缓存添加新id
        this.$store.dispatch('updateTodoSubTasksSort', this.todoSubTasksSort)
        // storage.setItem('todo-sub-tasks-sort', this.todoSubTasksSort) // 更新缓存
        this.init()
      }
    },
    /**
     * 更改主任务状态
     */
    async handleCheckedTask (id, isDone, subTasks) {
      await db.setTaskParam(id, {
        is_done: isDone,
        done_date: isDone ? datetime.getDateTimeStamp() : 0
      })
      if (isDone) {
        // 如果已完成，子任务默认为全部完成
        for (let subItem of subTasks) {
          await db.setSubTaskParam(subItem.sub_id, { is_done: 1 })
        }
        this.todoTasksSort = this.removeArrValue(this.todoTasksSort, id) // 删除缓存里的id
      } else {
        this.todoTasksSort.push(id) // 未完成则往缓存里添加id
      }
      this.$store.dispatch('updateTodoTasksSort', this.todoTasksSort)
      // this.init()
    },
    /**
     * 更改子任务状态
     */
    async handleCheckedSubTask (id, taskIsDone, subId, subTaskIsDone) {
      await db.setSubTaskParam(subId, { is_done: subTaskIsDone })
      if (!subTaskIsDone && taskIsDone) {
        // 如果子任务设为未完成且主任务为已完成，主任务设为未完成
        await db.setTaskParam(id, { is_done: 0, done_date: 0 })
        this.todoTasksSort.push(id)
        this.$store.dispatch('updateTodoTasksSort', this.todoTasksSort)
      }
      this.init()
    },
    /**
     * 主任务名设为可编辑
     */
    editTaskName (id) {
      this.$refs[`taskName${id}`][0].contentEditable = true
    },
    /**
     * 修改主任务名
     */
    async changeTaskName (id, oldTaskName) {
      let taskNameRef = this.$refs[`taskName${id}`][0]
      let newTaskName = taskNameRef.innerHTML
      if (newTaskName !== oldTaskName) {
        await db.setTaskParam(id, { name: newTaskName })
        this.init()
      }
      taskNameRef.blur() // 取消焦点
    },
    /**
     * 子任务名设为可编辑
     */
    editSubTaskName (subId) {
      this.$refs[`subTaskName${subId}`][0].contentEditable = true
    },
    /**
     * 修改子任务名
     */
    async changeSubTaskName (subId, oldSubTaskName) {
      let subTaskNameRef = this.$refs[`subTaskName${subId}`][0]
      let newSubTaskName = subTaskNameRef.innerHTML
      if (newSubTaskName !== oldSubTaskName) {
        await db.setSubTaskParam(subId, { sub_name: newSubTaskName })
        this.init()
      }
      subTaskNameRef.blur()
    },
    /**
     * 改变未完成的任务顺序
     */
    changeTaskSort () {
      let todoTasksSort = []
      for (let item of this.todoTasks) {
        todoTasksSort.push(item.id)
      }
      this.$store.dispatch('updateTodoTasksSort', todoTasksSort)
    },

    /**
     * 改变子任务排序
     */
    changeSubTaskSort (subTasks, id) {
      let tempSort = []
      for (let item of subTasks) {
        tempSort.push(item.sub_id)
      }
      this.todoSubTasksSort[id] = tempSort
      this.$store.dispatch('updateTodoSubTasksSort', this.todoSubTasksSort)
      // storage.setItem('todo-sub-tasks-sort', this.todoSubTasksSort) // 更新缓存
    },
    /**
     * 点击主任务的···
     */
    taskExpand (id, isDone, subTasks) {
      let that = this
      const menu = new Menu()
      menu.append(
        new MenuItem({
          label: '删除',
          click: function () {
            db.deleteTask(id) // 删除主任务
            if (!isDone) {
              // 未完成
              // 删除缓存
              that.todoTasksSort = that.removeArrValue(that.todoTasksSort, id) // 删除缓存里的id
              that.$store.dispatch('updateTodoTasksSort', that.todoTasksSort)
            }
            for (let subItem of subTasks) {
              // 删除所有子任务
              db.deleteSubTask(subItem.sub_id)
            }
            that.init()
          }
        })
      )
      menu.append(
        new MenuItem({
          label: '编辑',
          click: function () {
            monsole.log('edit')
          }
        })
      )
      // 展示出来
      menu.popup(remote.getCurrentWindow())
    },
    /**
     * 点击子任务的···
     */
    subTaskExpand (subId, id, isDone) {
      let that = this
      const menu = new Menu()
      menu.append(
        new MenuItem({
          label: '删除',
          click: function () {
            db.deleteSubTask(subId) // 删除子任务
            // 未完成的任务删除缓存
            that.todoSubTasksSort[id] = that.removeArrValue(
              that.todoSubTasksSort[id],
              subId
            ) // 删除缓存里的subId
            that.$store.dispatch(
              'updateTodoSubTasksSort',
              that.todoSubTasksSort
            )
            that.init()
          }
        })
      )
      menu.append(
        new MenuItem({
          label: '编辑',
          click: function () {
            monsole.log('edit')
          }
        })
      )
      // 展示出来
      menu.popup(remote.getCurrentWindow())
    },

    openSetting () {
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
          label: '打开完成界面',
          click: function () {
            ipcRenderer.send('complete')
          }
        })
      )
      menu.append(
        new MenuItem({
          label: '清空缓存',
          click: function () {
            db.clear()
            storage.clear()
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
    },
    /**
     * 删除数组某个元素
     */
    removeArrValue (arr, value) {
      let index = arr.indexOf(value)
      if (index > -1) {
        arr.splice(index, 1)
      }
      return arr
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
.todoTask,
.doneTask {
  padding: 10px 20px;
}
.todoTask:hover {
  background-color: #e6e3e6;
  cursor: move;
}
.doneTask:hover {
  background-color: #e6e3e6;
}
.task-checkbox {
  zoom: 120%;
}
.taskTop {
  position: relative;
}
.taskName {
  font-size: 20px;
  font-weight: bold;
  color: #606266;
}
.taskTopRight {
  display: flex;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: 20px;
  font-size: 20px;
  font-weight: bold;
  color: #606266;
  cursor: auto;
}
.taskCount {
  display: flex;
  align-items: center;
  margin-right: 20px;
}
.taskExpand {
  cursor: pointer;
}

.showDoneTasks {
  padding: 10px 20px;
  cursor: pointer;
  background-color: #dbdadb;
}
.subTasks {
  padding: 5px 0 5px 20px;
}
.subTask {
  padding: 2.5px 0 2.5px 5px;
}
.subTask:hover {
  background-color: #d8d6d8;
}
.subTaskName {
  font-size: 16px;
  color: #606266;
}
.subTask-checkbox {
  zoom: 115%;
}
.taskName:hover,
.subTaskName:hover {
  cursor: auto;
}

.subTaskInput {
  margin-top: 5px;
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

.subTasks > .el-input > .el-input.is-active .el-input__inner,
.subTasks > .el-input > .el-input__inner:focus {
  border-width: 0px;
  background-color: #f1f2f1;
}

.subTasks > .el-input > .el-input__inner {
  font-size: 16px;
  padding-top: 3px;
  padding-left: 6px;
  padding-bottom: 3px;
  background-color: #f2f1f2;
  border-width: 0px;
}
</style>