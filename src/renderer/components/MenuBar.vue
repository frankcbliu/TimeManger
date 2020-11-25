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
        v-model="newTask"
        placeholder="添加新任务"
        class="marginBottom"
        @change="createTask"
      ></el-input>
      <!-- 未完成的任务 -->
      <template v-if="taskLists1.length > 0">
        <el-checkbox-group
          v-model="checkTaskList1"
          v-for="item in taskLists1"
          :key="item.id"
          class="marginBottom"
        >
          <el-checkbox
            :label="item.id"
            @change="
              (status) => {
                handleCheckedTaskList(item.id, status);
              }
            "
            >{{ item.taskName }}</el-checkbox
          >
        </el-checkbox-group>
      </template>
      <!-- 已完成的任务 -->
      <template v-if="taskLists2.length > 0">
        <div @click="clickShowTaskList2" class="showTaskList2 marginBottom">
          <i class="el-icon-arrow-up" v-if="isShowTaskList2"></i>
          <i class="el-icon-arrow-down" v-else></i>
          完成的任务
        </div>
        <template v-if="isShowTaskList2">
          <el-checkbox-group
            v-model="checkTaskList2"
            v-for="item in taskLists2"
            :key="item.id"
            class="marginBottom"
          >
            <el-checkbox
              :label="item.id"
              @change="
                (status) => {
                  handleCheckedTaskList(item.id, status);
                }
              "
              >{{ item.taskName }}</el-checkbox
            >
          </el-checkbox-group>
        </template>
      </template>
    </div>
    <div id="mid" v-show="activeName === 'two'">two</div>
    <div id="bottom">
      <div></div>
      <span style="margin: 1%; font-size: 25px" @click="openSetting"
        ><i class="el-icon-setting"></i>
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
      newTask: '',
      isShowTaskList2: false,
      checkTaskList1: [],
      checkTaskList2: [3, 4], // 默认选择
      taskLists1: [ // 未完成的任务
        {
          id: 1,
          taskName: '学electron1',
          estimatedNum: null, // 预计番茄数
          completedNum: null, // 已完成番茄数
          remarks: null
        },
        {
          id: 2,
          taskName: '学electron学呀学不会1',
          estimatedNum: 3, // 预计番茄数
          completedNum: 1, // 已完成番茄数
          remarks: '弃疗'
        }
      ],
      taskLists2: [ // 已完成的任务
        {
          id: 3,
          taskName: '学electron2',
          estimatedNum: null, // 预计番茄数
          completedNum: null, // 已完成番茄数
          remarks: null
        },
        {
          id: 4,
          taskName: '学electron学呀学不会2',
          estimatedNum: 3, // 预计番茄数
          completedNum: 3, // 已完成番茄数
          remarks: '弃疗'
        }
      ]
    }
  },
  async mounted () {
    await db.initDB()
    await this.init()
  },
  methods: {
    async init () {
      let doneTasks = await db.getTaskByIsDone(1)
      let notDoneTasks = await db.getTaskByIsDone(0)
      console.log(doneTasks)
      console.log(notDoneTasks)
    },
    openSetting () {
      console.log('open setting')
      // 右键菜单
      const menu = new Menu()
      menu.append(new MenuItem({
        label: '退出',
        click: function () {
          ipcRenderer.send('quit')
        }
      }))
      // 第二个菜单
      // menu.append( ... )
      // 展示出来
      menu.popup(remote.getCurrentWindow())
    },
    clickShowTaskList2 () {
      this.isShowTaskList2 = !this.isShowTaskList2
    },
    handleCheckedTaskList (id, status) { // 更改任务状态
      console.log(id)
      console.log(status)
      // todo: 将id对应的任务状态置为相应状态，并重新获取任务；
    },
    async createTask () {
      db.createTask({
        'name': this.newTask,
        'is_done': 0,
        'sum_time': 0
      })
      console.log(await db.getAllTask())
    }
  }
}
</script>

<style>
@import url("https://fonts.googleapis.com/css?family=Source+Sans+Pro");

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: "Source Sans Pro", sans-serif;
}
.marginBottom {
  margin-bottom: 10px;
}
#wrapper {
  background: radial-gradient(
    ellipse at top left,
    rgba(255, 255, 255, 1) 40%,
    rgba(229, 229, 229, 0.9) 100%
  );
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
  height: 80%;
  padding: 10px 20px;
}
.showTaskList2 {
  cursor: pointer;
}

#bottom {
  height: 8%;
  /* background-color: green; */
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
