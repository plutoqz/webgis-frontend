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
                <div v-for="node in nodes" :key="node.id">
                  {{ node.id }}: {{ node.name }}
                </div>
                
              </div>
            </div>
            <div class="preview-box links-preview">
              <h4>已加载关系 ({{ links.length }})</h4>
              <div class="preview-content">
                <div v-for="(link, index) in links" :key="index">
                  {{ link.source }} → {{ link.target }}
                </div>
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
import { ref, reactive, computed, onMounted, onBeforeUnmount,defineEmits  } from 'vue'
import * as echarts from 'echarts'
import Papa from 'papaparse'
import { debounce } from 'lodash'
import { useKGStore } from '../stores/kgStore'

//import showKnowledgeGraph from './Map.vue'
// 图表实例
const chartInstance = ref(null)
const graphContainer = ref(null)
// 定义自定义事件
const emit = defineEmits(['close']);
// 响应式数据
const nodes = ref([])
const links = ref([])
const layoutType = ref('force')
const searchTerm = ref('')
const loading = ref(false)
const isFullscreen = ref(false)


// 全屏状态
const fullscreenIcon = computed(() => 
  isFullscreen.value ? 'fas fa-compress' : 'fas fa-expand'
)
const fullscreenLabel = computed(() => 
  isFullscreen.value ? '退出全屏' : '全屏显示'
)
// 在onMounted中初始化Store和图表
onMounted(async () => {
  // 确保Pinia已初始化
  const store = useKGStore() // 正确访问
  
  // 初始化图表
  chartInstance.value = echarts.init(graphContainer.value)
  
  // 恢复持久化数据
  if (store.nodes.length > 0 || store.links.length > 0) {
    await updateChart(store.nodes, store.links)
  }
  // 窗口大小监听
  //window.addEventListener('resize', handleResize)
  updateChart();
})

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
            label: (link.relation || 'relation').trim(),
            originalLabel:(link.relation || 'relation').trim()
          }))
        }
        resolve()
      }
    })
  })
}

const handleNodeImport = async (e) => {
  //const store = useKGStore() 
  const file = e.target.files[0]
  if (file) {
    loading.value = true
    await handleFileImport(file, 'node')
    updateChart()
    loading.value = false
  }
  //store.setNodes(parsedNodes)
  //await updateChart(store.nodes, store.links)
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

const updateChart = () => {
  // 生成有效的分类数据
  const categories = [...new Set(nodes.value.map(node => node.category || 'default'))].map(category => ({ name: category }))
  //配置项
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
      edgeSymbol: ["circle", "arrow"], // 箭头
      draggable: true, // 节点是否可拖拽，只在使用力引导布局(layout: 'force',)的时候有用
      focusNodeAdjacency: true, // 是否在鼠标移到节点上的时候突出显示节点以及节点的边和邻接节点。
      categories: categories, // 添加分类定义
      label: {
        show: true,
        position: 'right',
        formatter: '{b}'
      },
      lineStyle: {
        color: 'source',
        width:2,
        curveness: 0.3
      },
      force:{
        repulsion: 2500, // 节点斥力
        gravity: 0.5, // 所有节点受到的向中心的引力因子。该值越大节点越往中心点靠拢。
        edgeLength: [10, 50], // 边的两个节点之间的距离
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
  // 触发 close 事件，通知父组件关闭知识图谱
  emit('close');
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
  const keyword = searchTerm.value.toLowerCase();
  const matchedNodes = [];
  const matchedLinks = [];
  // 遍历节点，找到匹配的节点并记录
  nodes.value.forEach(node => {
    const isMatched = node.name.toLowerCase().includes(keyword) || node.id.toString().includes(keyword);
    if (isMatched) {
      matchedNodes.push(node);
    }
  });
  
  links.value.forEach(link=>{
    const sourceNode = nodes.value.find(node => node.id === link.source);
    const targetNode = nodes.value.find(node => node.id === link.target);
    if (sourceNode && matchedNodes.includes(sourceNode) || targetNode && matchedNodes.includes(targetNode)) {
      matchedLinks.push(link);
    }
  });
  // 高亮匹配的节点和相关的边
  nodes.value.forEach(node => {
    if (keyword === '') {
      // 如果搜索框为空，恢复默认颜色
      delete node.itemStyle;
    } else {
      
      // 如果是匹配的节点，高亮显示
      node.itemStyle = {
        color: matchedNodes.includes(node) ? '#f6416c' : '#defcf9'
      };
    }
  });

  // 高亮与匹配节点相关的边
  links.value.forEach(link => {
    if(keyword === ''){
      delete link.lineStyle;
      link.label = link.originalLabel; // 恢复原始标签
    }else{
      // 如果是与匹配节点相关的边，高亮显示
      link.lineStyle = {
        color: matchedLinks.includes(link) ? '#f6416c' : '#ffffff'
      };
      // 如果不是与匹配节点相关的边，移除文字说明
      if (!matchedLinks.includes(link)) {
        link.label = '';
      }
    }
  });

  updateChart();
}, 300);


// 全屏切换
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  graphContainer.value.classList.toggle('fullscreen')
  chartInstance.value.resize()
}

// 清空数据
const clearData = () => {
  if (chartInstance.value) {
    chartInstance.value.clear();
  }
  nodes.value = []
  links.value = []
  searchTerm.value = ''
}

// 组件卸载
onBeforeUnmount(() => {
  if (chartInstance.value) {
    chartInstance.value.dispose()
  }
})
</script>
  
  <style scoped lang="scss">
@import '../assets/styles/components/kg';
  </style>