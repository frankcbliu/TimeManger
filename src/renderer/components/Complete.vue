<template>
  <div id="wrapper">
    <div class="card" style="height:15%">
        
    </div>
  </div>
</template>

<script >

export default {
  name: 'complete',
  data () {
    return {

    }
  },
  mounted () {

  },
  methods: {

  }
}
</script>

<style scoped>

body {
  background-color: #ececec;
}

#wrapper {
  height: 100vh;
  width: 100vw;
}


#card {
  border-radius: 5px;
  background-color: #e3e3e3;
  padding: 2%;
  display: flex;
  flex-direction: column;
  margin-bottom: 2%;
}

#card > div {
  display: flex;
  flex-direction: row;
  width: 100%;
  align-items: center;
  font-size: 14px;
  color: #606266;
  font-weight: bold;
}
</style>

