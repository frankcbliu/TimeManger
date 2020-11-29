import storage from '../../utils/storage.js'

const state = {
  reloadSound: 'dida.mp3', // (storage.getItem('clock-bg-sound') || 'dida.mp3')
  workTime: storage.getItem('work-time') || 25,
  restTime: storage.getItem('rest-time') || 5,
  todoTasksSort: storage.getItem('todo-tasks-sort') || []
}

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
    console.log('更新')
    // setTimeout(() => {
    //   state.todoTasksSort = todoTasksSort
    //   setTimeout(() => {
    //     console.log('更新之后')
    //   })
    // }, 1000)
    storage.setItem('todo-tasks-sort', todoTasksSort)
  },
  PUSH_TODO_TASKS_SORT (state, id) {
    let temp = state.todoTasksSort
    temp.push(id)
    state.todoTasksSort = temp
    storage.setItem('todo-tasks-sort', temp)
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
  }
}

export default {
  state,
  mutations,
  actions
}
