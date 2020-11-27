import storage from '../../utils/storage.js'

const state = {
  reloadSound: (storage.getItem('clock-bg-sound') || 'dida.mp3'),
  workTime: storage.getItem('work-time') || 25,
  restTime: storage.getItem('rest-time') || 5
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
  }
}

export default {
  state,
  mutations,
  actions
}
