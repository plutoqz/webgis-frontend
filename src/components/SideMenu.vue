<template>
    <div class="side-menu">
      <div class="menu-header">
        <h3>功能菜单</h3>
        <button class="close-btn" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <ul>
        <li @click="handleClick('upload')">
          <i class="fas fa-chart-file"></i>
          打开文件
        </li>
        <li @click="handleClick('analysis')">
          <i class="fas fa-chart-area"></i>
          空间分析
        </li>
        <li @click="handleClick('toPostgresql')">
          <i class="fas fa-map-toPostgresql"></i>
          上传文件
        </li>
        <li @click="handleClick('export')">
          <i class="fas fa-file-export"></i>
          数据导出
        </li>
      </ul>
    </div>
  </template>
  
  <script setup>
  const emit = defineEmits(['close', 'menuAction'])
  
  const handleClick = (action) => {
    console.log('执行操作:', action)
    emit('close') // 操作后自动关闭菜单
    emit('menuAction', action); // 发出一个新的事件
  }
  </script>
  
  <style scoped lang="scss">
  @import '../assets/styles/components/menu';
  </style>