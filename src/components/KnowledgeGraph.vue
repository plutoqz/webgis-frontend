<template>
    <div class="knowledge-graph-container">
      <div class="control-panel">
        <div class="import-section">
          <div class="import-buttons">
            <input 
              type="file" 
              id="nodeFile" 
              ref="nodeFile" 
              accept=".csv"
              @change="handleNodeImport"
              hidden
            >
            <label for="nodeFile" class="import-button node-import">
              <i class="fas fa-circle-nodes"></i>
              导入节点
            </label>
  
            <input 
              type="file" 
              id="linkFile" 
              ref="linkFile" 
              accept=".csv"
              @change="handleLinkImport"
              hidden
            >
            <label for="linkFile" class="import-button link-import">
              <i class="fas fa-link"></i>
              导入关系
            </label>
          </div>
  
          <div class="data-preview">
            <div class="preview-box nodes-preview">
              <h4>已加载节点 ({{ nodes.length }})</h4>
              <div class="preview-content">
                <div v-for="node in sampleNodes" :key="node.id">
                  {{ node.id }}: {{ node.name }}
                </div>
                <div v-if="nodes.length > 3">...</div>
              </div>
            </div>
  
            <div class="preview-box links-preview">
              <h4>已加载关系 ({{ links.length }})</h4>
              <div class="preview-content">
                <div v-for="(link, index) in sampleLinks" :key="index">
                  {{ link.source }} → {{ link.target }}
                </div>
                <div v-if="links.length > 3">...</div>
              </div>
            </div>
          </div>
        </div>
  
        <div class="control-section">
          <div class="control-group">
            <label>布局方式：</label>
            <select v-model="layoutType" @change="updateLayout">
              <option value="force">力导向布局</option>
              <option value="circular">环形布局</option>
              <option value="radial">辐射布局</option>
            </select>
          </div>
  
          <div class="control-group">
            <label>节点搜索：</label>
            <input 
              type="text" 
              v-model="searchTerm" 
              placeholder="输入节点名称或ID"
              @input="highlightNodes"
            >
          </div>
  
          <div class="control-group">
            <button class="action-button" @click="toggleFullscreen">
              <i :class="fullscreenIcon"></i>
              {{ fullscreenLabel }}
            </button>
            <button class="action-button danger" @click="clearData">
              <i class="fas fa-trash"></i>
              清空数据
            </button>
          </div>
        </div>
        <!-- 新增返回按钮 -->
      <button class="return-button" @click="handleReturn">
        <i class="fas fa-arrow-left"></i>
        返回地图
      </button>
      </div>
  
      <div ref="graphContainer" class="graph-view"></div>
      
      <div class="status-bar">
        <span v-if="loading" class="loading-status">
          <i class="fas fa-spinner fa-spin"></i>
          正在渲染图表...
        </span>
        <span class="node-count">{{ nodes.length }} 节点</span>
        <span class="link-count">{{ links.length }} 关系</span>
      </div>
    </div>
    
  </template>
  
  <script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import Papa from 'papaparse'
import { debounce } from 'lodash'
//import showKnowledgeGraph from './Map.vue'
// 图表实例
const chartInstance = ref(null)
const graphContainer = ref(null)

// 响应式数据
const nodes = ref([])
const links = ref([])
const layoutType = ref('force')
const searchTerm = ref('')
const loading = ref(false)
const isFullscreen = ref(false)

// 示例数据预览
const sampleNodes = computed(() => nodes.value.slice(0, 3))
const sampleLinks = computed(() => links.value.slice(0, 3))

// 全屏状态
const fullscreenIcon = computed(() => 
  isFullscreen.value ? 'fas fa-compress' : 'fas fa-expand'
)
const fullscreenLabel = computed(() => 
  isFullscreen.value ? '退出全屏' : '全屏显示'
)

// 文件处理
const handleFileImport = (file, type) => {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true, // 新增：跳过空行
      transformHeader: h => h.trim().toLowerCase(), // 规范化列名
      transform: value => value.trim(), // 自动去除值两端的空格
      error: (err) => {
        console.error('[CSV解析错误]', err)
        alert(`文件解析失败: ${err.message}`)
      },
      complete: (results) => {
        // 统一列名为小写
        results.data = results.data.map(item => {
          const newItem = {}
          Object.keys(item).forEach(key => {
            newItem[key.toLowerCase()] = item[key] // 列名转小写
          })
          return newItem
        })
        const data = results.data//.filter(item => item.id) // 过滤有效数据行

        if (type === 'node') {
          nodes.value = data.map(node => ({
            id: node.id.trim(),
            name: node.name.trim(),
            //symbolSize: Math.random() * 30 + 10,
            symbolSize:30,
            category: (node.category || 'default').trim()
          }))
        } else if (type === 'link') {
          links.value = data
          //.filter(link => link.source && link.target) // 新增过滤条件
          .map(link => ({
            source: link.source.trim(),
            target: link.target.trim(),
            label: (link.relation || 'relation').trim()
          }))
        }
        resolve()
      }
    })
  })
}

const handleNodeImport = async (e) => {
  const file = e.target.files[0]
  if (file) {
    loading.value = true
    await handleFileImport(file, 'node')
    updateChart()
    loading.value = false
  }
}

const handleLinkImport = async (e) => {
  const file = e.target.files[0]
  if (file) {
    loading.value = true
    await handleFileImport(file, 'link')
    console.log('Loaded Links:', links.value) // 调试输出
    updateChart()
    loading.value = false
  }
}

// 图表操作
const initChart = () => {
  chartInstance.value = echarts.init(graphContainer.value)
  updateChart()
  window.addEventListener('resize', () => chartInstance.value.resize())
}

const updateChart = () => {
  // 生成有效的分类数据
  const categories = [...new Set(nodes.value.map(node => node.category || 'default'))]
    .map(category => ({ name: category }))


  const option = {
    tooltip: {},
    legend: {
      show: categories.length > 1, // 当有多个分类时才显示图例
      data: categories.map(c => c.name)
    },
    series: [{
      type: 'graph',
      layout: layoutType.value,
      data: nodes.value,
      links: links.value,
      roam: true,
      categories: categories, // 添加分类定义
      label: {
        show: true,
        position: 'right',
        formatter: '{b}'
      },
      lineStyle: {
        color: 'source',
        curveness: 0.3
      },
      emphasis: {
        focus: 'adjacency',
        lineStyle: {
          width: 3
        }
      },
      // 添加关系标签配置
      edgeLabel: {
        show: true,
        formatter: function(params) {
          return params.data.label;
        },
        position: 'middle',
        fontSize: 12,
        color: '#000'
      }
    }]
  }
  chartInstance.value.setOption(option,true);

}

const handleReturn=()=>{
  
}

const updateLayout = () => {
  loading.value = true
  updateChart()
  setTimeout(() => {
    loading.value = false
  }, 300)
}

// 节点搜索
const highlightNodes = debounce(() => {
  const keyword = searchTerm.value.toLowerCase()
  nodes.value.forEach(node => {
    node.itemStyle = {
      color: node.name.toLowerCase().includes(keyword) ? '#ff5722' : '#2196F3'
    }
  })
  updateChart()
}, 300)

// 全屏切换
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  graphContainer.value.classList.toggle('fullscreen')
  chartInstance.value.resize()
}

// 清空数据
const clearData = () => {
  nodes.value = []
  links.value = []
  searchTerm.value = ''
  chartInstance.value.clear()
}

// 生命周期
onMounted(initChart)
onBeforeUnmount(() => {
  if (chartInstance.value) {
    chartInstance.value.dispose()
  }
})
</script>
  
  <style scoped lang="scss">
@import '../assets/styles/components/kg';
  </style>