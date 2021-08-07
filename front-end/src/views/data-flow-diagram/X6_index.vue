<template>
  <div class="flow-wrapper">
    <div class="left">
      <div ref="containerDom" class="container"></div>
    </div>
    <div class="right" @click="clear">
      <div ref="app2Dom"><!--这是画布--></div>
      <ul v-show="showShapeContextMenu" ref="cellContextMenuDom" class="menu">
        <li class="menu-item" @click.prevent="deleteShape">
          <span class="icon"><i>x</i></span>
          <span class="text">删除</span>
          <span class="hotkey">快捷键</span>
        </li>
        <li v-if="showShowDetailMenuItem" class="menu-item" @click.prevent="showDetail">
          <span class="icon"><i>i</i></span>
          <span class="text">查看详情</span>
          <span class="hotkey">快捷键</span>
        </li>
      </ul>
    </div>
  </div>

  <FunctionDetailVue
    v-model="visibleDetail"
    :currentFunctionInfo="currentFunctionInfo"
    :loadingDetail="loadingDetail"
  />
</template>

<script>
  import { onMounted, ref, watchEffect } from 'vue'
  import { Addon } from '@antv/x6/lib'
  import { FSBusiness } from '@/utils/fs-graph.js'
  import { shapeRightClickEvent, showShapeContextMenu } from '@/views/data-flow-diagram/store.js'
  import FunctionDetailVue from '@/views/function/components/FunctionDetail.vue'
  import { getInfo, getStats } from '@/api/func.js'

  const { FSBox, FSGraph } = FSBusiness
  const { Stencil } = Addon
  const MOCK_FUNC_LIST = ['func1', 'func2', 'func3']

  export default {
    components: { FunctionDetailVue },
    setup () {
      const app2Dom = ref(null)
      const containerDom = ref(null)
      const cellContextMenuDom = ref(null)
      const showShowDetailMenuItem = ref(false)
      const visibleDetail = ref(false)
      const loadingDetail = ref(false)
      const currentFunctionInfo = ref({})

      onMounted(() => {
        const graph = new FSGraph(app2Dom.value)
        const stencil = new Stencil({
          title: 'function type',
          target: graph,
          search (cell, keyword) {
            return cell.shape.indexOf(keyword) !== -1
          },
          placeholder: '',
          stencilGraphWidth: 200,
          stencilGraphHeight: 180,
          groups: [{ name: 'function', title: 'function group1' }]
        })

        containerDom.value.appendChild(stencil.container)

        const mockFuncNodeList = MOCK_FUNC_LIST.map((funcName) => new FSBox(funcName))

        stencil.load(mockFuncNodeList, 'function')
      })

      watchEffect(() => {
        if (showShapeContextMenu.value) {
          const { e, x: left, y: top, cell, view } = shapeRightClickEvent.value

          cellContextMenuDom.value.style.left = `${ left }px`
          cellContextMenuDom.value.style.top = `${ top }px`

          if (view?.isNodeView()) {
            showShowDetailMenuItem.value = true
          }
        }
      })

      const clear = () => {
        showShapeContextMenu.value = null
        shapeRightClickEvent.value = null
      }

      const deleteShape = () => {
        const { view } = shapeRightClickEvent.value

        view.cell.remove()
        showShapeContextMenu.value = false
        shapeRightClickEvent.value = {}
      }

      const showDetail = () => {
        const { e, x, y, cell, view } = shapeRightClickEvent.value
        console.log({ e, x, y, cell, view })
        const funcName = cell.store.data.attrs.text.text

        openDetailPanel(funcName)
      }

      /**
       * 这个要放到detail panel里, 不要
       */
      async function openDetailPanel (funcName) {
        try {
          visibleDetail.value = true
          _getInfo(funcName).then(() => {})
          _getStats(funcName).then(() => {})
        } catch (err) {
          console.log(err)
        } finally {
          loadingDetail.value = false
        }
      }

      async function _getInfo (funcName) {
        const res = await getInfo(funcName)
        if (!res) return
        const { inputSpecs = {} } = res
        const input = Object.keys(inputSpecs)
        currentFunctionInfo.value = { ...currentFunctionInfo.value, ...res, input }
      }

      async function _getStats (funcName) {
        const res = await getStats(funcName)
        if (!res) return
        currentFunctionInfo.value = { ...currentFunctionInfo.value, ...res }
      }

      return {
        clear,
        showDetail,
        deleteShape,
        app2Dom,
        containerDom,
        loadingDetail,
        visibleDetail,
        cellContextMenuDom,
        currentFunctionInfo,
        showShapeContextMenu,
        showShowDetailMenuItem
      }
    }
  }
</script>

<style lang="less">
  .flow-wrapper {
    display: flex;
    height: 100%;
    .left {
      display: flex;
      flex-flow: column;
      position: relative;
      flex: 0 200px;
      background: greenyellow;
      .container {
        position: relative;
        height: 100%;
      }
    }
    .right {
      flex: 1;
      position: relative;
    }
  }

  ul.menu {
    position: absolute;
    top: 100px;
    left: 500px;
    //width: 100px;
    background: white;
    padding: 5px 0;
    z-index: 999;
    font-size: 13px;
    li.menu-item {
      position: relative;
      cursor: pointer;
      display: flex;
      align-content: center;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      height: 28px;
      padding: 0 12px 0 30px;
      color: #595959;
      text-align: left;
      background: 0 0;
      border: none;
      outline: none;
      box-shadow: none;
      &:hover {
        color: #262626;
        background: #f5f5f5;
        .hotkey {
          opacity: 1;
        }
      }

      .icon {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        top: 50%;
        left: 6px;
        width: 24px;
        height: 24px;
        margin-top: -12px;
        font-size: 13px;
      }
      .text {
        padding-left: 2px;
        padding-right: 56px;
        overflow: hidden;
        font-size: 13px;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      .hotkey {
        opacity: 0.75;
      }
    }
  }
</style>
