import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useFooterStore = defineStore('footer', () => {
  const activeTab = ref('privados')
  return { activeTab }
})
