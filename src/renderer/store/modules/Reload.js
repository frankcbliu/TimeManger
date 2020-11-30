import storage from '../../utils/storage.js'

const state = {
  reloadSound: (storage.getItem('clock-bg-sound') || 'dida.mp3'),
  workTime: storage.getItem('work-time') || 25,
  restTime: storage.getItem('rest-time') || 5,
  todoTasksSort: storage.getItem('todo-tasks-sort') || [],
  todoSubTasksSort: storage.getItem('todo-sub-tasks-sort') || [],
  clockStatus: 0,
  tomatoClockNumVersion: 0 // 番茄钟数量版本，有变化则需要刷新
}

function initLog () {
  const electronLog = require('electron-log')
  let log = electronLog.create('reload')
  let mlog = log.functions.log
  log.functions.log = function (...params) {
    mlog('[reload]', ...params)
  }
  return log.functions
}

const monsole = process.env.NODE_ENV === 'production' ? initLog() : console

const mutations = {
  CHANGE_SOUND (state, sound) {
    state.reloadSound = sound
  },
  CHANGE_WORK_TIME (state, workTime) {
    state.workTime = workTime
  },
  CHANGE_REST_TIME (state, restTime) {
    state.restTime = restTime
  },
  UPDATE_TODO_TASKS_SORT (state, todoTasksSort) {
    monsole.log('UPDATE_TODO_TASKS_SORT', JSON.stringify(todoTasksSort))
    state.todoTasksSort = todoTasksSort
    storage.setItem('todo-tasks-sort', todoTasksSort)
  },
  PUSH_TODO_TASKS_SORT (state, id) {
    monsole.log('PUSH_TODO_TASKS_SORT', id)
    let temp = state.todoTasksSort
    temp.push(id)
    state.todoTasksSort = temp
    storage.setItem('todo-tasks-sort', temp)
  },
  UPDATE_TODO_SUB_TASKS_SORT (state, todoSubTasksSort) { // 更新子任务缓存
    monsole.log('UPDATE_TODO_SUB_TASKS_SORT', JSON.stringify(todoSubTasksSort))
    state.todoSubTasksSort = todoSubTasksSort
    storage.setItem('todo-sub-tasks-sort', todoSubTasksSort)
  },
  PUSH_TODO_SUB_TASKS_SORT (state, [id, sid]) { // 添加新子任务缓存
    monsole.log('PUSH_TODO_SUB_TASKS_SORT', JSON.stringify([id, sid]))
    let temp = JSON.parse(JSON.stringify(state.todoSubTasksSort))
    temp[id].push(sid)
    state.todoSubTasksSort = temp
    storage.setItem('todo-sub-tasks-sort', temp)
  },
  RESET_CLOCK_STATUS (state) {
    state.clockStatus++
  },
  RESET_TOMATO_CLOCK_NUM (state) {
    state.tomatoClockNumVersion++
  }
}

const actions = {
  changeSound ({ commit }, sound) {
    commit('CHANGE_SOUND', sound)
  },
  changeWorkTime ({ commit }, workTime) {
    commit('CHANGE_WORK_TIME', workTime)
  },
  changeRestTime ({ commit }, restTime) {
    commit('CHANGE_REST_TIME', restTime)
  },
  updateTodoTasksSort ({ commit }, todoTasksSort) {
    commit('UPDATE_TODO_TASKS_SORT', todoTasksSort)
  },
  pushTodoTasksSort ({ commit }, id) {
    commit('PUSH_TODO_TASKS_SORT', id)
  },
  updateTodoSubTasksSort ({ commit }, todoSubTasksSort) {
    commit('UPDATE_TODO_SUB_TASKS_SORT', todoSubTasksSort)
  },
  pushTodoSubTasksSort ({ commit }, [id, sid]) {
    commit('PUSH_TODO_SUB_TASKS_SORT', [id, sid])
  },
  resetClockStatus ({ commit }) {
    commit('RESET_CLOCK_STATUS')
  },
  resetTomatoClockNum ({ commit }) {
    commit('RESET_TOMATO_CLOCK_NUM')
  }
}

export default {
  state,
  mutations,
  actions
}
