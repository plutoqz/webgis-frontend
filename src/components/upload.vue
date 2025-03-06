<!-- 打开本地文件 -->
<template>
    <div class="upload-container">
      <input
        type="file"
        ref="fileInputRef"
        @change="handleFileUpload"
        class="custom-upload"
        accept=".json,.geojson,.kml,.gpx"
      />
      <div class="preview-tip"></div>
    </div>
</template>
  
  <script>
  import { Vector as VectorSource } from 'ol/source';
  import { Vector as VectorLayer } from 'ol/layer';
  import { GeoJSON, KML, GPX } from 'ol/format';
  
  export default {
    props: {
      Map: Object, // 从父组件传递地图实例/upload-container
    },
    methods: {
      openFileSelector() {
        // 手动触发文件输入框的点击事件
        this.$refs.fileInputRef.click();
      },
      handleFileUpload(event) {
        const file = event.target.files[0];
        const reader = new FileReader();
  
        reader.onload = (e) => {
          const format = this.getFileFormat(file.name);
          const features = new format().readFeatures(e.target.result, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857',
          });
  
          const vectorSource = new VectorSource({ features });
          const vectorLayer = new VectorLayer({ source: vectorSource });
          // 确保 vectorLayer.source 是有效的
          if (!vectorLayer.values_.source) {
            console.error('矢量图层源无效:', vectorLayer);
            return;
          }
          // 确保 vectorLayer.source 是有效的
          console.log('矢量图层源:', vectorLayer.values_.source);
          
          // 添加图层到地图
          //this.map.addLayer(vectorLayer);
          this.$emit('layerAdded', vectorLayer);
        };
  
        reader.readAsText(file);
      },
      getFileFormat(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        return {
          geojson: GeoJSON,
          kml: KML,
          gpx: GPX,
        }[ext] || GeoJSON;
      },
    },
  };
  </script>
  
  <style lang="scss">
  @import '../assets/styles/components/upload.scss';
  </style>