<!-- App.vue -->
<template>
  <div id="app">
      <!-- 路由出口，用于显示匹配到的组件 -->
      <router-view />
    
  </div>
</template>

<script setup>
// 删除默认的HelloWorld导入
//import Map from './components/Map.vue'
</script>

<style>
#app {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}
</style>