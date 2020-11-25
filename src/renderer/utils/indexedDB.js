import console from 'console'

/**
 * indexedDB.js，浏览器本地数据库操作
 */
export default {
  // indexedDB兼容
  indexedDB: window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB,

  db: null,
  /**
   * 初始化数据库
   */
  initDB () {
    window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || { READ_WRITE: 'readwrite' } // This line should only be needed if it is needed to support the object's constants for older browsers
    window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange
    if (!this.indexedDB) {
      console.log("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.")
    }

    // 用于自测阶段清空数据库
    // if (process.env.NODE_ENV === 'development') {
    //   var req = window.indexedDB.deleteDatabase('timeManager')
    //   req.onsuccess = function () {
    //     console.log('成功删除数据库')
    //   }
    // }

    let request = this.indexedDB.open('timeManager', 1)
    let that = this
    return new Promise((resolve, reject) => {
      request.onsuccess = function (event) {
        that.db = event.target.result
        resolve(that.db)
      }
      request.onupgradeneeded = function (event) {
        console.log('创建数据库表....')
        let db = request.result
        let objectStore
        if (!db.objectStoreNames.contains('task')) {
          console.log('创建主任务表: task')
          // 创建标识号的主键索引
          objectStore = db.createObjectStore('task', { keyPath: 'id', autoIncrement: true })
          objectStore.createIndex('name', 'name', { unique: false }) // 主任务名
          objectStore.createIndex('tag', 'tag', { unique: false }) // 标签
          objectStore.createIndex('is_done', 'is_done', { unique: false }) // 是否完成
          objectStore.createIndex('tag_done', ['tag', 'is_done'], { unique: false }) // 根据标签和是否完成
          // 其他字段：count(番茄钟数量)、remind_time(提醒时间)、sum_time(总用时)、desc(描述)
        }
        if (!db.objectStoreNames.contains('sub_task')) {
          console.log('创建子任务表: sub_task')
          objectStore = db.createObjectStore('sub_task', { keyPath: 'sub_id', autoIncrement: true })
          objectStore.createIndex('name', 'name', { unique: false }) // 主任务名
          objectStore.createIndex('id', 'id', { unique: false }) // 主任务ID
          objectStore.createIndex('sub_name', 'sub_name', { unique: false }) // 子任务名
          objectStore.createIndex('tag', 'tag', { unique: false }) // 标签
          objectStore.createIndex('is_done', 'is_done', { unique: false }) // 是否完成
          // 其他字段：sub_count(子任务番茄钟数量)
        }
        if (!db.objectStoreNames.contains('clock')) {
          console.log('创建番茄钟表: clock')
          objectStore = db.createObjectStore('clock', { keyPath: 'clock_id', autoIncrement: true })
          objectStore.createIndex('name', 'name', { unique: false }) // 任务名
          objectStore.createIndex('task_id', 'task_id', { unique: false }) // 任务ID
          objectStore.createIndex('is_main', 'is_main', { unique: false }) // 是否主任务
          objectStore.createIndex('done_date', 'done_date', { unique: false }) // 完成日期
          objectStore.createIndex('tag', 'tag', { unique: false }) // 标签
          // 其他字段：begin_time(开始时间)、end_time(结束时间)
        }
      }
    })

    // 创建数据库表
  },
  // 往指定数据表中添加数据
  db_add (tableName, item) {
    this.db.transaction([tableName], 'readwrite')
      .objectStore(tableName)
      .add(item)
  },

  // 创建主任务
  createTask (data) {
    this.db_add('task', data)
  },

  // 创建子任务
  createSubTask (data) {
    this.db_add('sub_task', data)
  },

  // 创建番茄钟
  createClock (data) {
    this.db_add('clock', data)
  },

  /**
   * 获取所有主任务
   */
  getAllTask () {
    let objectStore = this.db.transaction(['task']).objectStore('task')
    let request = objectStore.getAll()

    return new Promise((resolve, reject) => {
      request.onerror = function (event) {
        reject(new Error('事务失败'))
      }
      request.onsuccess = function (event) {
        resolve(request.result || [])
      }
    })
  },
  /**
   * 获取所有主任务
   * @param {boolean} isDone 是否完成
   */
  getTaskByIsDone (isDone) {
    let objectStore = this.db.transaction(['task']).objectStore('task')
    let request = objectStore.index('is_done').get(isDone)

    return new Promise((resolve, reject) => {
      request.onerror = function (event) {
        reject(new Error('事务失败'))
      }
      request.onsuccess = function (event) {
        resolve(request.result || [])
      }
    })
  }
}
