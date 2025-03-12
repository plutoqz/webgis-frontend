import { defineStore } from 'pinia'

  // 使用工厂函数定义store // [!code focus]
export const useKGStore = (pinia) => { // [!code focus]
    return defineStore('knowledgeGraph', { // [!code focus]
      state: () => ({
        nodes: [],
        links: [],
        layoutType: 'force',
        lastPosition: null // 新增：保存最后视图位置
      }),
      actions: {
        // 新增：保存图表位置状态
        saveViewport(position) {
          this.lastPosition = position
        }
      },
      persist: {
        paths: ['nodes', 'links', 'layoutType', 'lastPosition']
      }
    })(pinia) // [!code focus]
  }