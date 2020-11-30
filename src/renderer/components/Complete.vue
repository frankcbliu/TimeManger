<template>
  <div id="wrapper">
    <!-- 输入框 -->
    <el-input
      v-model="taskName"
      placeholder="请输入任务名"
      size="small"
      class="taskNameInput"
    ></el-input>
    <!-- 新建任务 -->
    <div
      class="newTask pointer"
      :class="{ check: operate.type === 'new_task' }"
      @click="changeOperate('new_task')"
    >
      新建主任务
    </div>
    <!-- 任务列表 -->
    <div class="taskList">
      <div class="taskListTitle">任务列表</div>
      <!-- 未完成的任务 -->
      <template v-if="todoTasks.length > 0">
        <div class="todoTasks">
          <el-checkbox-group
            v-model="checkTasks"
            v-for="item in todoTasks"
            :key="`todoTasks${item.id}`"
          >
            <div
              class="todoTask pointer"
              :class="{
                check:
                  operate.type === 'bind_task' && operate.value === item.id,
              }"
              @click="changeOperate('bind_task', item.id)"
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
              <span class="taskName">{{ item.name }}</span>
              <div
                class="newSubTask"
                :class="{
                  check:
                    operate.type === 'new_sub_task' &&
                    operate.value === item.id,
                }"
                @click.stop="changeOperate('new_sub_task', item.id)"
              >
                新增子任务
              </div>
            </div>

            <div class="subTasks">
              <el-checkbox-group
                v-model="checkSubTasks"
                v-for="subItem in item.subTasks"
                :key="`subtask${subItem.sub_id}`"
              >
                <div
                  class="subTask pointer"
                  :class="{
                    check:
                      operate.type === 'bind_sub_task' &&
                      operate.value === subItem.sub_id,
                  }"
                  @click="changeOperate('bind_sub_task', subItem.sub_id)"
                >
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
                  <span class="subTaskName">{{ subItem.sub_name }}</span>
                </div>
              </el-checkbox-group>
            </div>
          </el-checkbox-group>
        </div>
      </template>
      <div v-else>暂无任务</div>
    </div>
    <!-- 提交按钮 -->
    <div class="bottom">
      <el-button type="primary" size="small" @click="createClock"
        >提交</el-button
      >
      <el-button type="danger" size="small" @click="abandon">放弃</el-button>
    </div>
  </div>
</template>

<script>
import storage from '../utils/storage.js'
import db from '../utils/indexedDB.js'
import datetime from '../utils/datetime'
const { ipcRenderer } = require('electron')

function initLog () {
  const electronLog = require('electron-log')
  let log = electronLog.create('complete')
  let mlog = log.functions.log
  log.functions.log = function (...params) {
    mlog('[complete]', ...params)
  }
  return log.functions
}

const monsole = process.env.NODE_ENV === 'production' ? initLog() : console

export default {
  name: 'complete',
  data () {
    return {
      taskName: '',
      clockData: null,
      /**
       * 操作
       * 1、新建主任务: {type: 'new_task'}
       * 2、新建子任务: {type: 'new_sub_task', value: id}
       * 3、选择主任务: {type: 'bind_task', value: id}
       * 4、选择子任务: {type: 'bind_sub_task, value: sub_id}
       */
      operate: {
        type: '',
        value: 0
      },
      todoTasks: [], // 未完成的任务
      isShowDoneTasks: false,
      checkTasks: [], // 选中的主任务id
      checkSubTasks: [], // 选中的子任务id
      todoTasksSort: storage.getItem('todo-tasks-sort'), // 未完成的主任务排序 [id]
      todoSubTasksSort: storage.getItem('todo-sub-tasks-sort') // 未完成的子任务排序 {id: [subId]}
    }
  },
  // watch: {
  //   '$store.state.Reload.todoTasksSort' (todoTasksSort) {
  //     this.todoTasksSort = JSON.parse(JSON.stringify(todoTasksSort)) // 拷贝
  //     // this.init()
  //   }
  // },
  // created () { // 删除缓存，测试用
  //   db.clear()
  //   storage.clear()
  // },
  created () {
    let data = storage.getItem('complete_clock_data') || ['', { 'begin_work_time': 25, 'begin_time': '', 'interrupt': [] }]
    this.taskName = data[0]
    this.clockData = data[1]
  },
  async mounted () {
    await db.initDB()
    this.init()
  },
  methods: {
    /**
     * 初始化函数
     */
    async init () {
      monsole.log('init')
      let todoTasks = await db.getTaskByParam('is_done', 0) // 获取所有未完成的任务

      let checkSubTasks = []
      // 获取子任务并更新选中列表
      for (let item of todoTasks) {
        let subTasks = await db.getSubTaskById(item.id) // 获取子任务
        item.subTasks = this.subTaskSort(subTasks, item.id)
        for (let subItem of item.subTasks) {
          if (subItem.is_done) {
            checkSubTasks.push(subItem.sub_id) // 选中已完成的任务
          }
        }
      }

      this.todoTasks = this.taskSort(todoTasks) // 排序
      this.checkSubTasks = checkSubTasks
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
        storage.setItem('todo-sub-tasks-sort', this.todoSubTasksSort) // 更新缓存
      }
      return todoSubTasks
    },
    // 更新操作
    changeOperate (type, value = 0) {
      this.operate = {
        type,
        value
      }
    },
    /**
     * 更改主任务状态
     */
    async handleCheckedTask (id, isDone, subTasks) {
      await db.setTaskParam(id, {
        is_done: isDone,
        done_date: isDone ? datetime.getTimeStamp() : 0
      })
      if (isDone) {
        // 如果已完成，子任务默认为全部完成
        for (let subItem of subTasks) {
          await db.setSubTaskParam(subItem.sub_id, { is_done: 1 })
          this.checkSubTasks.push(subItem.sub_id)
        }
        this.todoTasksSort = this.removeArrValue(this.todoTasksSort, id) // 删除缓存里的id
      } else {
        this.todoTasksSort.push(id) // 未完成则往缓存里添加id
      }
      this.$store.dispatch('updateTodoTasksSort', this.todoTasksSort)
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
    },
    abandon () { // 放弃这个番茄钟
      ipcRenderer.send('complete-close')
    },
    async createClock () { // 创建番茄钟记录
      await this.createOrBindClock()
      ipcRenderer.send('complete-close')
      this.$store.dispatch('resetClockStatus')
    },
    async createOrBindClock () {
      let { type: clockType, value: id } = this.operate
      monsole.log('operate: ', JSON.stringify(this.operate))
      let that = this
      if (clockType === 'new_task') { // 创建主任务
        // 先创建主任务
        let taskId = await db.createTask({
          'name': that.taskName,
          'is_done': 0,
          'count': 1,
          'sum_time': that.clockData.begin_work_time,
          'done_date': 0
        })
        this.$store.dispatch('pushTodoTasksSort', taskId)
        let res = await db.createClock({
          'name': that.taskName,
          'task_id': taskId,
          'is_main': true,
          'begin_time': that.clockData.begin_time,
          'interrupt': that.clockData.interrupt
        })
        monsole.log('res: ', JSON.stringify(res))
      } else if (clockType === 'new_sub_task') { // 创建子任务
        monsole.log('创建子任务')
        let task = await db.bindClockTask(id, that.clockData.begin_work_time) // 获取主任务名称
        monsole.log('bindClockTask result: ', JSON.stringify(task))
        let subId = await db.createSubTask({
          'name': task.name,
          'id': task.id,
          'sub_name': that.taskName,
          'sub_count': 1
        })
        this.$store.dispatch('pushTodoSubTasksSort', [task.id, subId])
        db.createClock({
          'name': that.taskName,
          'task_id': subId,
          'is_main': false,
          'begin_time': that.clockData.begin_time,
          'interrupt': that.clockData.interrupt
        })
      } else if (clockType === 'bind_task') { // 绑定主任务
        // 更改番茄钟数量、总用时
        db.bindClockTask(
          id,
          that.clockData.begin_work_time
        ).then((res) => {
          db.createClock({
            'name': res.name,
            'task_id': id,
            'is_main': true,
            'begin_time': that.clockData.begin_time,
            'interrupt': that.clockData.interrupt
          }).then((res) => {
          })
        })
      } else if (clockType === 'bind_sub_task') { // 绑定子任务
        db.bindClockSubTask(
          id,
          that.clockData.begin_work_time
        ).then((res) => {
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
  color: #606266;
}
.taskNameInput {
  height: 10%;
  padding: 0 5px;
  display: flex;
  align-items: flex-end;
}

.newTask {
  box-sizing: border-box;
  height: 10%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
  border: 1px solid #f5cbb5;
  margin: 2% 5px;
  border-radius: 5px;
}

.taskList {
  border-bottom: 1px solid #ddd;
  height: 66%;
}

.taskListTitle {
  height: 30px;
  line-height: 30px;
  padding: 0 5px;
  font-size: 14px;
  background-color: #f6f6f6;
  border-top: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
}
.todoTasks {
  height: calc(100% - 30px);
  overflow-y: scroll;
}
.taskName {
  font-size: 16px;
}
.todoTask {
  padding: 5px;
  position: relative;
}
.todoTask:hover,
.subTask:hover {
  background-color: #e5e3e6;
}
.subTask {
  margin-left: 20px;
  padding: 2.5px 2.5px;
}
.subTaskName {
  font-size: 15px;
}
.newSubTask {
  font-size: 14px;
  display: inline-block;
  position: absolute;
  right: 5px;
  border: 1px solid #f5cbb5;
  background-color: #fff;
  border-radius: 10px;
  padding: 1px 8px;
  top: 50%;
  transform: translateY(-50%);
}
.bottom {
  height: 10%;
  display: flex;
  justify-content: space-around;
  align-items: center;
}
.check {
  background-color: #f5cbb5 !important;
}
.pointer {
  cursor: pointer;
}
</style>

