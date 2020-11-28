'use strict'
/**
 * 本地文件缓存
 * 注意 main 线程和 renderer 线程并非一个实例
 * @link https://github.com/sindresorhus/electron-store
 */
const Store = require('electron-store')

const localStore = {
  store: new Store(),
  getItem: (key) => {
    return localStore.store.get(key)
  },
  setItem: (key, value) => {
    localStore.store.set(key, value)
  },
  getAll: () => {
    return localStore.store.store
  },
  removeItem: (key) => {
    localStore.store.delete(key)
  },
  clear: () => {
    localStore.store.clear()
  }
}

export default localStore
