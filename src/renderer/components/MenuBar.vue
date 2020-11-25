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
      <el-input v-model="newTask" placeholder="添加新任务" class="marginBottom"></el-input>
      <!-- 未完成的任务 -->
      <template v-if="taskLists1.length > 0">
        <el-checkbox-group v-model="checkTaskList1" v-for="item in taskLists1" :key="item.id" class="marginBottom">
          <el-checkbox :label="item.id" @change="((status) => { handleCheckedTaskList(item.id, status) })">{{ item.taskName }}</el-checkbox>
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
          <el-checkbox-group v-model="checkTaskList2" v-for="item in taskLists2" :key="item.id" class="marginBottom">
            <el-checkbox :label="item.id" @change="((status) => { handleCheckedTaskList(item.id, status) })">{{ item.taskName }}</el-checkbox>
          </el-checkbox-group>
        </template>
      </template>
    </div>
    <div id="mid" v-show="activeName === 'two'">
      two
    </div>
    <div id="bottom">
      sss
    </div>
  </div>
</template>

<script>
// const indexedDB = window.indexedDB || window.webkitindexedDB || window.msIndexedDB || mozIndexedDB
import { Menu } from 'electron'
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
  mounted () {
    // const request = indexedDB.open('timeManger')
    // request.onerror = function (event) {
    //   console.error('IndexedDB数据库打开错误')
    // }
    // request.onupgradeneeded = function (event) {
    //   const db = event.target.result
    //   if (!db.objectStoreNames.contains('taskList')) {
    //     let objectStore = db.createObjectStore('person', { autoIncrement: true })
    //   }
    // }
    // request.onsuccess = function () {
    //   console.log('succeeded')
    // }
  },
  methods: {
    clickShowTaskList2 () {
      this.isShowTaskList2 = !this.isShowTaskList2
    },
    handleCheckedTaskList (id, status) { // 更改任务状态
      console.log(id)
      console.log(status)
      // todo: 将id对应的任务状态置为相应状态，并重新获取任务；
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
  background-color: green;
}

</style>
