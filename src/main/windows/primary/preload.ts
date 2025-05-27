import { contextBridge, ipcRenderer } from "electron";

/*
暴露primary窗口主进程的方法到primary窗口的渲染进程
*/
contextBridge.exposeInMainWorld("primaryWindowAPI", {
  sendMessage: (message: string) => ipcRenderer.send("message", message),
  openExternalLink: (url: string) =>
    ipcRenderer.send("open-external-link", url),
  clearAppConfiguration: () => ipcRenderer.send("clear-app-configuration"),

  asyncExitApp: () => ipcRenderer.invoke("async-exit-app"),
  minToTray: () => ipcRenderer.send("min-to-tray"),
  httpGetRequest: (url: string) => ipcRenderer.send("http-get-request", url),
  showPrimary: (type: any) => ipcRenderer.send("login-success", type),
  toLogin: () => ipcRenderer.send("to-login"),
  openRouter: (path: string) => ipcRenderer.send("open-router", path),
  setWin: (type: string) => ipcRenderer.send("set-win", type),
  exportExcel: (data: any) => ipcRenderer.send("export-excel", data),

  removeFileList: (data: any) => ipcRenderer.send("remove-file-list", data),
  //获取文件下载存储地址
  getDesktopPath: (fileName: any) =>
    ipcRenderer.send("get-desktop-path", fileName),
  //更新成功
  updateSuccess: () => ipcRenderer.send("update-success"),

  //清空更新文件
  clearUpdateFile: () => ipcRenderer.send("clear-update-file"),
  //获取更新缓存
  getUpdateCache: () => ipcRenderer.send("get-update-cache"),

  //打开登录界面
  showLoginPage: (param: any) => ipcRenderer.send("show-login-page", param),

  //一键登录
  autoLogin: (param: any) => ipcRenderer.send("auto-login", param),

  //保存页面信息
  closeOpenBrowser: (param: any) => ipcRenderer.send("close-open-browser", param),

  //发送登录验证码
  sendCaptcha: (param: any) => ipcRenderer.send("input-captcha", param),

  //执行视频评论
  executeVideoComment: (param: any) => ipcRenderer.send("execute-video-comment", param),

  //开始执行抖音
  startRunDy: (param: any) => ipcRenderer.send("start-run-dy", param),

  //停止运行抖音
  stopRunDy: (param: any) => ipcRenderer.send("stop-run-dy", param),

  //开始执行小红书
  startRunXhs: (param: any) => ipcRenderer.send("start-run-xhs", param),

  //停止运行小红书
  stopRunXhs: (param: any) => ipcRenderer.send("stop-run-xhs", param),

  //获取登录信息
  getLoginInfo: (param: any) => ipcRenderer.send("get-login-info", param),

  //停止执行
  stopExecute: (param: any) => ipcRenderer.send("stop-execute", param),
 //获取配置
  getConfig: () => ipcRenderer.send("get-config"),

  //设置配置
  setConfig: (param: any) => ipcRenderer.send("set-config", param),

  //处理excel
  handlerExcelFile: (param: any) => ipcRenderer.send("handler-excel-file", param),

  //监听消息
  onMessage: (callback) => {
    ipcRenderer.removeAllListeners("message");
    ipcRenderer.on("message", (event, message) => {
      callback(message);
    });
  },

  onShowExitAppMsgbox: (callback) =>
    ipcRenderer.on("show-exit-app-msgbox", () => {
      callback();
    }),
  onShowClosePrimaryWinMsgbox: (callback) => {
    ipcRenderer.removeAllListeners("show-close-primary-win-msgbox");
    ipcRenderer.on("show-close-primary-win-msgbox", () => {
      callback();
    })
  },
  //渲染进程监听主进程的事件
  onShowSuccessMsgbox: (callback) => {
    ipcRenderer.removeAllListeners("show-success-msgbox");
    ipcRenderer.on("show-success-msgbox", (event, message) => {
      callback(message);
    })
  },
  onShowErrorMsgbox: (callback) => {
    ipcRenderer.removeAllListeners("show-error-msgbox");
    ipcRenderer.on("show-error-msgbox", (event, message) => {
      callback(message);
    })
  },

  //渲染进程接收主进程传递的值
  onGetPrimaryValue: (callback) => {
    ipcRenderer.removeAllListeners("get-primary-value");
    ipcRenderer.on("get-primary-value", (event, value) => {
      callback(value);
    })
  },

  //将登录信息发送到渲染进程
  onGetLoginInfo: (callback) => {
    ipcRenderer.removeAllListeners("get-login-info");
    ipcRenderer.on("get-login-info", (event, value) => {
      callback(value);
    })
  },

  //将配置传递给渲染进程
  onGetConfig: (callback) =>
    ipcRenderer.on("get-config", (event, value) => {
      callback(value);
    }),


  //监听删除优惠券
  onDeleteCouponSuccess: (callback) => {
    ipcRenderer.removeAllListeners("delete-coupon-success");
    ipcRenderer.on("delete-coupon-success", (event, value) => {
      callback(value);
    })
  },

  //监听登录信息
  onLoginMessage: (callback) => {
    ipcRenderer.removeAllListeners("login-message");
    return ipcRenderer.on("login-message", (event, value) => {
      callback(value);
    })
  },
});
