<template>
    <div class="map-container">
    <!-- 地图容器 -->
    <div ref="mapEl" class="ol-map"></div>
    <!-- 图层管理按钮 -->
    <button class="layers-btn" @click="toggleLayersPanel">
      <i class="fas fa-map-layers"></i> 图层管理
    </button>

    <!-- 图层管理面板 -->
    <div class="layers-panel" v-if="showLayersPanel">
      <h4>图层管理</h4>
      <ul>
        <!-- 底图选项 -->
        <li v-for="(layer, index) in layerConfig" :key="index">
          <label>
            <input
              type="checkbox"
              :checked="layer.visible"
              @change="toggleLayerVisibility(layer)"
            />
            {{ layer.name }}
            <i :class="layer.icon"></i>
          </label>
        </li>
      </ul>
    </div>
    </div>
    
    
      <!-- 文件上传组件 -->
      <FileUpload :map="map" @layerAdded="handleLayerAdded" ref="fileUpload" />
      <!-- 上传postgresql -->
      
    <!-- 菜单触发按钮 -->
    <button 
      class="menu-trigger"
      @click="toggleMenu"
    >
      <i class="fas fa-layer-group"></i>
      菜单
    </button>
    
    <!-- 侧边菜单 -->
    <SideMenu 
      v-if="showMenu" 
      @close="showMenu = false"
      @menuAction="handleMenuAction"
     />
</template>
  
<script setup>
import { ref, onMounted } from 'vue'
import SideMenu from './SideMenu.vue'
import FileUpload from './upload.vue'
//import UploadFile from './FileUpload.vue'
import Map from 'ol/Map'
import View from 'ol/View'
import OSM from 'ol/source/OSM'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector';
import { fromLonLat } from 'ol/proj';
import { defaults as defaultControls, Zoom, Attribution,Rotate  } from 'ol/control';

// 地图实例
const mapEl = ref(null)
let map = null

// 图层管理状态
const showLayersPanel = ref(false);
// 存储所有图层的配置
const layerConfig = ref([
  {
    name: 'OSM 底图',
    type: 'base',
    visible: true,
    icon: 'fas fa-globe',
    layer: null, // OpenLayers 图层实例
  },
]);
  // 文件上传组件的引用
const fileUpload = ref(null);
  
// 菜单状态
const showMenu = ref(false)
const toggleMenu = () => {
  showMenu.value = !showMenu.value
}


  
// 初始化地图
onMounted(() => {
  // 创建底图图层
  const baseLayer = new TileLayer({
    source: new OSM(),
  });
  layerConfig.value[0].layer = baseLayer;

  map = new Map({
    target: mapEl.value,
    layers: [
      baseLayer
    ],
    view: new View({
      center: fromLonLat([113, 28.2]),  // 长沙坐标
      zoom: 12
    }),
    //controls: [new Zoom(), new Attribution()], // 添加控件
    controls: defaultControls({
      // 禁用默认的缩放按钮和版权信息
      zoom: false,
      attribution: false,
      Rotate : false,
  })
    })
    
  // 移除旋转控件
  const rotateControl = map.getControls().getArray().find(control => control instanceof Rotate);
  if (rotateControl) {
    map.getControls().remove(rotateControl);
  }

  

  window.addEventListener('resize', () => {
    map.updateSize(); // 更新地图尺寸
  });

  // 点击地图关闭菜单
  map.on('click', () => {
    if(showMenu.value) showMenu.value = false
  })

})

// 处理侧边菜单的操作
const handleMenuAction = (action) => {
  console.log('收到操作:', action);
  if (action === 'upload') {
    // 手动打开文件选择框
    fileUpload.value.openFileSelector();
  } 
  if(action==='toPostgresql'){
    // 调用 FileUpload 组件的 uploadToPostgresql 方法
    //fileUpload.value.uploadToPostgresql();

  }
  else if (action === 'removeUploads') {
    // 清除所有矢量图层
    removeAllVectorLayers();
  }
};

// 处理文件上传后的逻辑(上传postgresql)
const handleFileUploaded = (fileData) => {
  console.log('文件上传成功:', fileData)

  // 从后端获取文件的 URL
  const fileUrl = fileData.file.url

  // 创建矢量图层
  const vectorLayer = new VectorLayer({
    source: new VectorSource({
      url: fileUrl,
      format: new GeoJSON(),
    }),
  })

  // 添加到图层管理
  layerConfig.value.push({
    name: fileData.name,
    type: 'vector',
    visible: true,
    icon: 'fas fa-map',
    layer: vectorLayer,
  })

  // 将矢量图层添加到地图
  map.addLayer(vectorLayer)
}
// 移除所有矢量图层
const removeAllVectorLayers = () => {
  console.log('移除所有矢量图层');
  layerConfig.value = layerConfig.value.filter(
    (layer) => layer.type === 'base'
  );
  layerConfig.value.forEach((layer) => {
    map.removeLayer(layer.layer);
  });
  layerConfig.value = [layerConfig.value[0]];
};

// 处理上传的矢量图层（本地到前端）
const handleLayerAdded = (vectorLayer) => {
  // 确保 vectorLayer.source 是有效的
  if (!vectorLayer.values_.source) {
    console.error('矢量图层源无效:', vectorLayer);
    return;
  }
  
  // 生成图层配置信息
  const layerName = `矢量图层 ${vectorLayer.values_.source.getRevision()}`;
  const layerIcon = 'fas fa-map';

  // 添加到 layerConfig
  layerConfig.value.push({
    name: layerName,
    type: 'vector',
    visible: true,
    icon: layerIcon,
    layer: vectorLayer,
  });

  // 将矢量图层添加到地图
  map.addLayer(vectorLayer);
};

// 切换图层的可见性
const toggleLayerVisibility = (layer) => {
  console.log('切换图层可见性:', layer);
  layer.layer.setVisible(!layer.layer.getVisible());
  layer.visible = !layer.visible;
};

// 显示/隐藏图层管理面板
const toggleLayersPanel = () => {
  showLayersPanel.value = !showLayersPanel.value;
};
</script>
  
<style scoped lang="scss">
@import '../assets/styles/components/map';
</style>