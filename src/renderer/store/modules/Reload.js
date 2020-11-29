import storage from '../../utils/storage.js'

const state = {
  reloadSound: (storage.getItem('clock-bg-sound') || 'dida.mp3'),
  workTime: storage.getItem('work-time') || 25,
  restTime: storage.getItem('rest-time') || 5,
  todoTasksSort: storage.getItem('todo-tasks-sort') || [],
  clockStatus: 0
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
    state.todoTasksSort = todoTasksSort
    storage.setItem('todo-tasks-sort', todoTasksSort)
  },
  PUSH_TODO_TASKS_SORT (state, id) {
    let temp = state.todoTasksSort
    temp.push(id)
    state.todoTasksSort = temp
    storage.setItem('todo-tasks-sort', temp)
  },
  RESET_CLOCK_STATUS (state) {
    state.clockStatus++
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
  resetClockStatus ({ commit }) {
    commit('RESET_CLOCK_STATUS')
  }
}

export default {
  state,
  mutations,
  actions
}
