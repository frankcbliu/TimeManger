import datetime from './datetime.js'
/**
 * indexedDB.js，浏览器本地数据库操作
 */

function initLog () {
  const electronLog = require('electron-log')
  let log = electronLog.create('indexedDB')
  let mlog = log.functions.log
  log.functions.log = function (...params) {
    mlog('[indexedDB]', ...params)
  }
  return log.functions
}

const monsole = process.env.NODE_ENV === 'production' ? initLog() : console
// const monsole = initLog()

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
      monsole.log("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.")
    }

    if (this.db) {
      return
    }

    let request = this.indexedDB.open('timeManager', 2)
    let that = this
    return new Promise((resolve, reject) => {
      request.onsuccess = function (event) {
        that.db = event.target.result
        resolve(that.db)
      }
      request.onupgradeneeded = function (event) {
        monsole.log('----------------------创建数据库表----------------------')
        let db = request.result
        let objectStore
        // 创建数据库表
        if (!db.objectStoreNames.contains('task')) {
          monsole.log('创建主任务表: task')
          // 创建标识号的主键索引
          objectStore = db.createObjectStore('task', { keyPath: 'id', autoIncrement: true })
          objectStore.createIndex('name', 'name', { unique: false }) // 主任务名
          objectStore.createIndex('tag', 'tag', { unique: false }) // 标签
          objectStore.createIndex('is_done', 'is_done', { unique: false }) // 是否完成
          objectStore.createIndex('tag_done', ['tag', 'is_done'], { unique: false }) // 根据标签和是否完成
          objectStore.createIndex('done_date', 'done_date', { unique: false }) // 完成日期
          // 其他字段：count(番茄钟数量)、remind_time(提醒时间)、sum_time(总用时)、desc(描述)
        }
        if (!db.objectStoreNames.contains('sub_task')) {
          monsole.log('创建子任务表: sub_task')
          objectStore = db.createObjectStore('sub_task', { keyPath: 'sub_id', autoIncrement: true })
          objectStore.createIndex('name', 'name', { unique: false }) // 主任务名
          objectStore.createIndex('id', 'id', { unique: false }) // 主任务ID
          objectStore.createIndex('sub_name', 'sub_name', { unique: false }) // 子任务名
          objectStore.createIndex('tag', 'tag', { unique: false }) // 标签
          objectStore.createIndex('is_done', 'is_done', { unique: false }) // 是否完成
          // 其他字段：sub_count(子任务番茄钟数量)
        }
        if (!db.objectStoreNames.contains('clock')) {
          monsole.log('创建番茄钟表: clock')
          objectStore = db.createObjectStore('clock', { keyPath: 'clock_id', autoIncrement: true })
          objectStore.createIndex('name', 'name', { unique: false }) // 任务名
          objectStore.createIndex('task_id', 'task_id', { unique: false }) // 任务ID
          objectStore.createIndex('is_main', 'is_main', { unique: false }) // 是否主任务
          objectStore.createIndex('done_date', 'done_date', { unique: false }) // 完成日期
          objectStore.createIndex('tag', 'tag', { unique: false }) // 标签
          // 其他字段：begin_time(开始时间)、end_time(结束时间)
        }
        monsole.log('------------------------结束建表------------------------')
      }
    })
  },

  clear () {
    // if (process.env.NODE_ENV === 'development') {
    var req = window.indexedDB.deleteDatabase('timeManager')
    req.onsuccess = function () {
      monsole.log('成功删除数据库')
    }
    // }
  },
  // 往指定数据表中添加数据
  db_add (tableName, item) {
    let objectStore = this.db.transaction([tableName], 'readwrite').objectStore(tableName)
    let request = objectStore.add(item)

    return new Promise((resolve, reject) => {
      request.onerror = function (event) {
        reject(new Error('往指定数据表中添加数据失败'))
      }
      request.onsuccess = function (event) {
        resolve(request.result) // 返回值为新数据的主键值
      }
    })
  },

  /**********************************************************************
   *                               创建操作                              *
   **********************************************************************/

  // 创建主任务
  async createTask (data) {
    let id = await this.db_add('task', data)
    monsole.log('createTask: id: ', id, ' data: ', JSON.stringify(data))
    return id
  },

  // 创建子任务
  async createSubTask (data) {
    let subId = await this.db_add('sub_task', data)
    monsole.log('createSubTask: subId: ', subId, ' data: ', JSON.stringify(data))
    return subId
  },

  // 创建番茄钟
  createClock (data) {
    monsole.log('createClock: data: ', JSON.stringify(data))
    // 结束时间
    data['end_time'] = datetime.getNowDateTime()
    data['done_date'] = datetime.getNowDate()
    return this.db_add('clock', data)
  },

  /**********************************************************************
   *                               删除操作                              *
   **********************************************************************/
  /**
   * 删除子任务
   * @param {Number} subId
   */
  deleteSubTask (subId) {
    monsole.log('deleteSubTask: subId: ', subId)
    let objectStore = this.db.transaction(['sub_task'], 'readwrite').objectStore('sub_task')
    let request = objectStore.delete(subId)

    return new Promise((resolve, reject) => {
      request.onerror = function (event) {
        reject(new Error('根据 subID 删除子任务失败'))
      }
      request.onsuccess = function (event) {
        resolve('删除成功！')
      }
    })
  },

  /**
   * 删除主任务
   * @param {Number} id
   */
  deleteTask (id) {
    monsole.log('deleteTask: id: ', id)
    let objectStore = this.db.transaction(['task'], 'readwrite').objectStore('task')
    let request = objectStore.delete(id)

    return new Promise((resolve, reject) => {
      request.onerror = function (event) {
        reject(new Error('根据id删除数据失败'))
      }
      request.onsuccess = function (event) {
        resolve('删除成功！')
      }
    })
  },

  /**
   * 删除番茄钟
   * @param {Number}} clockId
   */
  deleteClock (clockId) {
    monsole.log('deleteClock: clockId: ', clockId)
    let objectStore = this.db.transaction(['clock'], 'readwrite').objectStore('clock')
    let request = objectStore.delete(clockId)

    return new Promise((resolve, reject) => {
      request.onerror = function (event) {
        reject(new Error('根据id删除数据失败'))
      }
      request.onsuccess = function (event) {
        resolve('删除成功！')
      }
    })
  },

  /**********************************************************************
   *                               查询操作                              *
   **********************************************************************/

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
   * 根据参数获取主任务
   * @param {String} key
   * @param {*} value
   */
  getTaskByParam (key, value) {
    let objectStore = this.db.transaction(['task']).objectStore('task')
    let request = objectStore.index(key).getAll(value)
    return new Promise((resolve, reject) => {
      request.onerror = function (event) {
        reject(new Error('根据参数获取主任务失败'))
      }
      request.onsuccess = function (event) {
        resolve(request.result || [])
      }
    })
  },

  /**
   * 根据展示的日期范围获取主任务
   * @param {String} key
   * @param {*} value
   */
  getTaskByShowDoneDay (day) {
    let objectStore = this.db.transaction(['task']).objectStore('task')
    let endDate = datetime.getDateTimeStamp()
    let beginDate = datetime.getDateTimeStamp(day)
    let range = IDBKeyRange.bound(beginDate, endDate)
    let request = objectStore.index('done_date').openCursor(range)
    let res = []

    return new Promise((resolve, reject) => {
      request.onerror = function (event) {
        reject(new Error('根据参数获取主任务失败'))
      }
      request.onsuccess = function (event) {
        var cursor = event.target.result
        if (cursor) {
          res.push(cursor.value)
          cursor.continue()
        } else {
          resolve(res)
        }
      }
    })
  },

  /**
   * 根据主任务id获取子任务
   * @param {Number} id id
   */
  getSubTaskById (id) {
    let objectStore = this.db.transaction(['sub_task']).objectStore('sub_task')
    let request = objectStore.index('id').getAll(id)
    return new Promise((resolve, reject) => {
      request.onerror = function (event) {
        reject(new Error('根据主任务id获取子任务失败'))
      }
      request.onsuccess = function (event) {
        resolve(request.result || [])
      }
    })
  },

  /**********************************************************************
   *                               更新操作                              *
   **********************************************************************/

  /**
   * 修改主任务属性
   * @param {Number} id
   * @param {Object} paramObject
   */
  setTaskParam (id, paramObject) {
    let objectStore = this.db.transaction(['task'], 'readwrite').objectStore('task')
    let request = objectStore.get(id)

    return new Promise((resolve, reject) => {
      request.onerror = function (event) {
        reject(new Error('根据id获取数据失败'))
      }
      request.onsuccess = function (event) {
        var data = event.target.result
        // 更新你想修改的数据
        for (let key in paramObject) {
          data[key] = paramObject[key]
        }
        // 把更新过的对象放回数据库
        var requestUpdate = objectStore.put(data)
        requestUpdate.onerror = function (event) {
          reject(new Error('更新数据失败'))
        }
        requestUpdate.onsuccess = function (event) {
          resolve('数据更新成功')
        }
      }
    })
  },

  /**
   * 修改子任务属性
   * @param {Number} subId
   * @param {Object} paramObject
   */
  setSubTaskParam (subId, paramObject) {
    let objectStore = this.db.transaction(['sub_task'], 'readwrite').objectStore('sub_task')
    let request = objectStore.get(subId)

    return new Promise((resolve, reject) => {
      request.onerror = function (event) {
        reject(new Error('根据id获取数据失败'))
      }
      request.onsuccess = function (event) {
        var data = event.target.result
        // 更新你想修改的数据
        for (let key in paramObject) {
          data[key] = paramObject[key]
        }
        // 把更新过的对象放回数据库
        var requestUpdate = objectStore.put(data)
        requestUpdate.onerror = function (event) {
          reject(new Error('更新数据失败'))
        }
        requestUpdate.onsuccess = function (event) {
          resolve('数据更新成功')
        }
      }
    })
  },

  /**
   * 给主任务增加番茄钟数量和时间
   * @param {Number} id
   * @param {Number} cost 单位：分钟
   */
  bindClockTask (id, cost) {
    monsole.log('bindClockTask: ', id, cost)
    let objectStore = this.db.transaction(['task'], 'readwrite').objectStore('task')
    let request = objectStore.get(id)
    return new Promise((resolve, reject) => {
      request.onerror = function (event) {
        reject(new Error('根据id获取数据失败'))
      }
      request.onsuccess = function (event) {
        var data = event.target.result
        monsole.log('bindClockTask: ', JSON.stringify(data))
        data.count = data.count + 1
        data.sum_time = cost + data.sum_time
        // 把更新过的对象放回数据库
        var requestUpdate = objectStore.put(data)
        requestUpdate.onerror = function (event) {
          reject(new Error('更新数据失败'))
        }
        requestUpdate.onsuccess = function (event) {
          resolve(data)
        }
      }
    })
  },

  /**
   * 给子任务增加番茄钟数量, 给对应的主任务增加番茄钟数量和时间
   * @param {Number} subId
   * @param {Number} cost 单位：分钟
   */
  bindClockSubTask (subId, cost) {
    monsole.log('bindClockSubTask: subId', subId, ' cost: ', cost)
    let that = this
    let objectStore = this.db.transaction(['sub_task'], 'readwrite').objectStore('sub_task')
    let request = objectStore.get(subId)
    return new Promise((resolve, reject) => {
      request.onerror = function (event) {
        reject(new Error('根据id获取数据失败'))
      }
      request.onsuccess = function (event) {
        var data = event.target.result
        data.sub_count++ // 增加子任务番茄钟数量
        that.bindClockTask( // 绑定主任务
          data.id,
          cost
        ).then((res) => {
        })
        // 把更新过的对象放回数据库
        var requestUpdate = objectStore.put(data)
        requestUpdate.onerror = function (event) {
          reject(new Error('更新数据失败'))
        }
        requestUpdate.onsuccess = function (event) {
          resolve(data)
        }
      }
    })
  }

  /**********************************************************************
   *                               END                                  *
   **********************************************************************/

}

/**
 *                             _ooOoo_
 *                            o8888888o
 *                            88" . "88
 *                            (| -_- |)
 *                            O\  =  /O
 *                         ____/`---'\____
 *                       .'  \\|     |//  `.
 *                      /  \\|||  :  |||//  \
 *                     /  _||||| -:- |||||-  \
 *                     |   | \\\  -  /// |   |
 *                     | \_|  ''\---/''  |   |
 *                     \  .-\__  `-`  ___/-. /
 *                   ___`. .'  /--.--\  `. . __
 *                ."" '<  `.___\_<|>_/___.'  >'"".
 *               | | :  `- \`.;`\ _ /`;.`/ - ` : | |
 *               \  \ `-.   \_ __\ /__ _/   .-` /  /
 *          ======`-.____`-.___\_____/___.-`____.-'======
 *                             `=---='
 *          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 *                     佛祖保佑        永无BUG
 *            佛曰:
 *                   写字楼里写字间，写字间里程序员；
 *                   程序人员写程序，又拿程序换酒钱。
 *                   酒醒只在网上坐，酒醉还来网下眠；
 *                   酒醉酒醒日复日，网上网下年复年。
 *                   但愿老死电脑间，不愿鞠躬老板前；
 *                   奔驰宝马贵者趣，公交自行程序员。
 *                   别人笑我忒疯癫，我笑自己命太贱；
 *                   不见满街漂亮妹，哪个归得程序员？
*/
