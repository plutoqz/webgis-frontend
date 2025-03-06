<!-- 上传postgresql -->
<template>
    <div class="upload-container">
      <input type="file" @change="UploadFile" ref="fileInput" accept=".geojson,.kml,.shp" />
      <button @click="uploadFile" :disabled="!file">上传文件</button>
      <div v-if="uploadStatus" class="status-message">{{ uploadStatus }}</div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import { inject } from 'vue';
  
  export default {
    setup() {
      const map = inject('map');
      return { map };
    },
    data() {
      return {
        file: null,
        uploadStatus: ''
      };
    },
    methods: {
      UploadFile(event) {
        this.file = event.target.files[0];
      },
      async uploadFile() {
        const formData = new FormData();
        formData.append('file', this.file);
        
        try {
          const response = await axios.post('http://localhost:8000/api/upload/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          
          this.uploadStatus = '文件上传成功！';
          this.$emit('layer-added', response.data.layer_id);
          this.clearInput();
        } catch (error) {
          this.uploadStatus = '上传失败：' + error.response.data.error;
        }
      },
      async uploadToPostgresql() {
    if (!this.file) {
      this.uploadStatus = '请选择一个文件！';
      return;
    }

    const formData = new FormData();
    formData.append('file', this.file);

    try {
      const response = await axios.post('http://localhost:8000/api/upload-to-postgresql/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      this.uploadStatus = '文件已成功上传到 PostgreSQL 数据库！';
      this.$emit('layer-added', response.data.layer_id);
      this.clearInput();
    } catch (error) {
      this.uploadStatus = '上传到 PostgreSQL 失败：' + error.response.data.error;
    }
  },
      clearInput() {
        this.file = null;
        this.$refs.fileInput.value = '';
      }
    }
  };
  </script>
  
  <style lang="scss">
  .upload-container {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 1000;
    background: rgba(255, 255, 255, 0.9);
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  
    input[type="file"] {
      margin-bottom: 10px;
    }
  
    button {
      background: #4CAF50;
      color: white;
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      
      &:disabled {
        background: #cccccc;
        cursor: not-allowed;
      }
    }
  
    .status-message {
      margin-top: 10px;
      color: #666;
      font-size: 0.9em;
    }
  }
  </style>