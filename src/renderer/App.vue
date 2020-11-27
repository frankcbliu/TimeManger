<template>
  <div id="app">
    <div class="triangle"></div>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'time_manager'
}
</script>

<style>
/* CSS */
@import url("https://fonts.googleapis.com/css?family=Source+Sans+Pro");

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  background: transparent;
}
body {
  /* background-color: #f2f1f2; */
  background: transparent;
  margin: 0;
  font-family: "Source Sans Pro", sans-serif;
}

.triangle {
  position: relative;
  width: 0;
  height: 0;
  border-right: 10px solid transparent;
  border-bottom: 10px solid #f2f1f2;
  border-left: 10px solid transparent;
  left: 50%;
  transform: translateX(-50%);
}
</style>
