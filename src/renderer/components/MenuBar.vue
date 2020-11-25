<template>
  <div id="wrapper">
    <div id="top">sss</div>
    <div id="mid">sss</div>

    <div id="bottom">
      sss
      <span style="margin: 1%; font-size: 25px" @click="openSetting"
        ><i class="el-icon-setting"></i>
      </span>
    </div>

    <!--     
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane>
        <span slot="label" font-size="20px"><i class="el-icon-tickets"></i> </span>
        我的行程
      </el-tab-pane>
      <el-tab-pane>
        <span slot="label" font-size="20px"><i class="el-icon-time"></i> </span>
        番茄钟
      </el-tab-pane>
    </el-tabs> -->
  </div>
</template>

<script>
// 需要用到 electron
const { remote } = require('electron')
const { Menu, MenuItem } = remote
const { ipcRenderer } = require('electron')

export default {
  name: 'menu-bar',
  data () {
    return {
      activeName: 'second'
    }
  },
  methods: {
    handleClick (tab, event) {
      console.log(tab, event)
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

#wrapper {
  background: radial-gradient(
    ellipse at top left,
    rgba(255, 255, 255, 1) 40%,
    rgba(229, 229, 229, 0.9) 100%
  );
  height: 100vh;
  /* padding: 12px 16px; */
  width: 100vw;
}

#top {
  height: 12%;
  background-color: red;
}

#mid {
  height: 80%;
  background-color: blue;
}

#bottom {
  height: 8%;
  background-color: green;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
