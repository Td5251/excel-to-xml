<template>


  

  <div class="nav-box" @dblclick="setWin('max')">
    <div class="input">
      <button class="value">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#7D8590" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9.75L12 3l9 6.75v9.75a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 19.5V9.75z" />
          <path d="M9 22V12h6v10" />
        </svg>
        首页
      </button>
    </div>

    <div class="option-box">
      <!-- 最小化按钮 -->
      <button class="fullscreen-btn minimize-btn" @click="setWin('min')">
        <svg viewBox="0 0 512 512" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
          <path d="M80 272H432c8.8 0 16-7.2 16-16s-7.2-16-16-16H80c-8.8 0-16 7.2-16 16s7.2 16 16 16z"
            fill="currentColor">
          </path>
        </svg>
        <span class="tooltip">Minimize</span>
      </button>

      <button class="fullscreen-btn fullscreen-toggle-btn" @click="setWin('max')">
        <svg viewBox="0 0 24 24" height="20" width="20" xmlns="http://www.w3.org/2000/svg" fill="currentColor"
          preserveAspectRatio="xMidYMid meet">
          <path
            d="M9 3H5a2 2 0 0 0-2 2v4h2V5h4V3zM15 3v2h4v4h2V5a2 2 0 0 0-2-2h-4zM5 15H3v4a2 2 0 0 0 2 2h4v-2H5v-4zM21 15h-2v4h-4v2h4a2 2 0 0 0 2-2v-4z" />
        </svg>
        <span class="tooltip">Fullscreen</span>
      </button>


      <!-- 关闭按钮 -->
      <button class="fullscreen-btn close-btn" @click="setWin('close')">
        <svg viewBox="0 0 384 512" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M310.6 150.6c6.2-6.2 6.2-16.4 0-22.6s-16.4-6.2-22.6 0L192 224 95.4 127.4c-6.2-6.2-16.4-6.2-22.6 0s-6.2 16.4 0 22.6L169.4 256 72.7 352.6c-6.2 6.2-6.2 16.4 0 22.6s16.4 6.2 22.6 0L192 288l96.6 96.6c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6L214.6 256l96-96z"
            fill="currentColor">
          </path>
        </svg>
        <span class="tooltip">Close</span>
      </button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { h, ref } from "vue";
import MyInfo from "../MyInfo/index.vue";
import $td from "../../../lib/td";
import { onMounted } from "vue";
import { MenuProps } from "ant-design-vue";
import { useRouter } from "vue-router";

let router = useRouter();

let info: any = ref();

let authType = ref("dy");


let getElectronApi = () => {
  return (window as any).primaryWindowAPI;
};


let setWin = (type: string) => {
  getElectronApi().setWin(type);
};

</script>

<style scoped>
/* .nav-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 100%;
  overflow: hidden;
  -webkit-app-region: drag;
}

.left {
  width: calc(100% - 80px);
  display: flex;
  flex-direction: column;
}

.right {
  width: 80px;
  display: flex;
  justify-content: end;
  -webkit-app-region: no-drag;
}

.right div {
  cursor: pointer;
  margin-left: 10px;
  color: #fff;
  -webkit-app-region: no-drag;
} */

.nav-box {
  display: flex;
  flex-direction: row;
  width: auto;
  background-color: #0d1117;
  justify-content: center;
  align-items: center;
  -webkit-app-region: drag;
}



.input {
  display: flex;
  flex-direction: row;
  width: auto;
  background-color: #0d1117;
  justify-content: center;
  align-items: center;
  /* position: relative;
  -webkit-app-region: drag; */
  /* -webkit-app-region: drag; */

}

.value {
  background-color: transparent;
  border: none;
  padding: 10px;
  color: white;
  display: flex;
  position: relative;
  gap: 5px;
  cursor: pointer;
  border-radius: 4px;
  margin: 0 10px 0 10px;
  -webkit-app-region: no-drag;
  font-size: 12px;
}

.value:not(:active):hover,
.value:focus {
  background-color: #21262c;
}

.value:focus,
.value:active {
  background-color: #1a1f24;
  outline: none;
}

.active {
  background-color: #1a1f24;
  outline: none;
}

.value::before {
  content: "";
  position: absolute;
  top: 5px;
  left: -10px;
  width: 5px;
  height: 80%;
  background-color: #2f81f7;
  border-radius: 5px;
  opacity: 0;
}

.value:focus::before,
.value:active::before {
  opacity: 1;
}

.value svg {
  width: 15px;
}


.option-box {
  width: 80px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-app-region: no-drag;
  z-index: 9999999;
  position: absolute;
  right: 1%;
}


.fullscreen-btn {
  width: 25px;
  height: 25px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
  color: white;
  /* 图标颜色 */
}

.fullscreen-btn svg {
  height: 100%;
  fill: white;
  /* 确保 SVG 图标为白色 */
}

.fullscreen-btn:hover {
  width: 30px;
  height: 30px;
  overflow: visible;
}

.tooltip {
  position: absolute;
  top: -40px;
  background-color: white;
  /* tooltip 背景改为白色 */
  color: black;
  /* 文字改为黑色以保证可读性 */
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 0.8em;
  transition: all 0.3s;
  opacity: 0;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
  /* 增加一点阴影提高对比 */
}

.fullscreen-btn:hover .tooltip {
  transform: translateY(2.5px);
  opacity: 1;
}
</style>
