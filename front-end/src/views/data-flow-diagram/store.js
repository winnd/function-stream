import { ref } from 'vue'

export const showShapeContextMenu = ref(false)
export const shapeRightClickEvent = ref({
  // type: 'port' || 'rect'       // 表示点击的是shape还是桩(port)
})
