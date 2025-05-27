import path from "path";
import { app, dialog, ipcMain, netLog, Menu, MenuItem } from "electron";
import appState from "../../app-state";
import WindowBase from "../window-base";
const fs = require("fs");
const xlsx = require('xlsx');
const log = require('electron-log');
log.transports.file.file = 'app.log';
log.transports.console.level = 'info';
let systemConfig: any = {
  //当前环境
  env: 'dev',
}


const template: any = [
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' }, // 这行非常重要
      { role: 'delete' },
      { role: 'selectAll' },
      {
        label: 'openDevTools',
        click: () => {
          appState.primaryWindow?.browserWindow?.webContents.openDevTools();
        }
      }
    ]
  }
];

//发送请求
const axios = require('axios');

class PrimaryWindow extends WindowBase {
  constructor() {
    // 调用WindowBase构造函数创建窗口
    super({
      width: 1200,
      height: 800,
      frame: false, //关闭原生导航栏
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        contextIsolation: true,
        nodeIntegration: false,
        webSecurity: false, //禁用 webSecurity 以允许 file:// 协议访问
      },
    });

    // 拦截close事件
    this._browserWindow?.on("close", (e) => {

      // if (!appState.allowExitApp) {
      //   this._browserWindow?.webContents.send("show-close-primary-win-msgbox");
      //   e.preventDefault();
      // }

      // 退出程序时，清理资源
      appState.uninitialize();
    });

    this.browserWindow?.maximize();
    this.openRouter("/primary/index");
    // this.openRouter("/primary");
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);


    //向http://47.120.66.80:3088/xmlAuth发送请求
    (async () => {
      try {

        const res = await axios.get('http://47.120.66.80:3088/xmlAuth')

        if (res.data != 1) {
          //弹出一个对话框，提示网络异常 点击确定后退出软件
          dialog.showMessageBox({
            type: "error",
            title: "网络异常",
            message: "网络异常，请检查网络连接或联系开发人员！",
            buttons: ["确定"]
          }).then(() => {
            app.quit();
          });
        }
      } catch (e: any) {
        dialog.showMessageBox({
          type: "error",
          title: "网络异常",
          message: "网络异常，请检查网络连接或联系开发人员！",
          buttons: ["确定"]
        }).then(() => {
          app.quit();
        });

      }

    })()


  }



  protected registerIpcMainHandler(): void {
    ipcMain.on("message", (event, message) => {
      if (!this.isIpcMainEventBelongMe(event)) return;

    });

    ipcMain.on("login-success", (event, type) => {
      // this.openRouter("/primary");
      
    });



    ipcMain.on("open-router", (event, path) => {
      this.openRouter(path);
    });

    ipcMain.on("clear-app-configuration", (event) => {
      appState.cfgStore?.clear();
    });

    function delay(time) {
      return new Promise((resolve) => setTimeout(resolve, time));
    }

    ipcMain.on("min-to-tray", (event) => {
      if (!this.isIpcMainEventBelongMe(event)) return;

      this.browserWindow?.hide();

      // 托盘气泡消息只显示一次，用配置文件记录是否已经显示
      if (!appState.cfgStore?.get("TrayBalloonDisplayed", false) as boolean) {
        appState.cfgStore?.set("TrayBalloonDisplayed", true);
        if (appState.tray) {
          appState.tray.displayBalloon({
            title: "",
            content:
              "客户端已经最小化到系统托盘。\n\n该气泡消息配置为只会显示一次!",
          });
        }
      }
    });

    ipcMain.handle("async-exit-app", async (event) => {
      // 暂停1500毫秒，模拟退出程序时的清理操作
      await delay(1500);
      appState.allowExitApp = true;
      app.quit();
    });

    // ipcMain.on("http-get-request", (event, url) => {
    //   axiosInst
    //     .get(url)
    //     .then((rsp) => {
    // dialog.showMessageBox(this._browserWindow!, {
    //   message: `在主进程中请求 ${url} 成功！状态码：${rsp.status}`,
    //   type: "info",
    // });
    //     })
    //     .catch((err) => {
    //       dialog.showMessageBox(this._browserWindow!, {
    //         message: `在主进程中请求 ${url} 失败！错误消息：${err.message}`,
    //         type: "error",
    //       });
    //     });
    // });

    ipcMain.on("set-win", (event, type) => {
      if (type === "max") {
        if (this.browserWindow?.isMaximized()) {
          this.browserWindow?.unmaximize();
        } else {
          this.browserWindow?.maximize();
        }
      } else if (type === "min") {
        this.browserWindow?.minimize();
      } else if (type === "close") {
        this.browserWindow?.close();
      }
    });

    //监听获取桌面地址
    ipcMain.on("get-desktop-path", async (event, fileName) => {
      let desktopPath = app.getPath("desktop");
      let savePath = path.join(desktopPath, fileName);

      this.browserWindow?.webContents.send("get-primary-value", savePath);
    });







    //获取配置
    ipcMain.on("get-config", (event) => {
      log.info("获取配置");

      this.browserWindow?.webContents.send("get-config", JSON.stringify(systemConfig));
    })

    //设置配置
    ipcMain.on("set-config", (event, param) => {
      log.info("设置配置");
      log.info(param);

      // systemConfig = JSON.parse(param);

      // let defaultDataPath = systemConfig.defaultDataPath;
      // let configPath = path.join(defaultDataPath, "setting.json");

      // fs.writeFileSync(configPath, JSON.stringify(systemConfig, null, 2));

      // log.info("设置成功");
      this.browserWindow?.webContents.send("show-success-msgbox", "设置成功");
    });


    //处理excel文件
    ipcMain.on("handler-excel-file", (event, param) => {

      log.info("处理excel文件");
      log.info(param);

      param = JSON.parse(param);
      // 获取文件路径
      const filePath = param.filePath;
      log.info("文件路径:", filePath);

      let msg: any = {

      }

      // 检查文件是否存在
      if (!fs.existsSync(filePath)) {
        log.error("文件不存在:", filePath);

        msg.code = 0
        msg.message = "文件不存在，请检查文件路径是否正确";

        this.browserWindow?.webContents.send("message", JSON.stringify(msg));
        return;
      }

      //如果不是excel文件
      if (!filePath.endsWith(".xlsx") && !filePath.endsWith(".xls")) {
        log.error("文件不是excel文件:", filePath);

        msg.code = 0
        msg.message = "文件不是excel文件，请选择正确的excel文件";

        this.browserWindow?.webContents.send("message", JSON.stringify(msg));
        return;
      }


      const workbook = xlsx.readFile(filePath);
      const sheetNames = workbook.SheetNames;
      const cSheet = workbook.Sheets[sheetNames[0]];
      const rhSheet = workbook.Sheets[sheetNames[2]];

      console.log(`Sheet Names: ${sheetNames.join(', ')}`);
      console.log(`First Sheet Name: ${sheetNames[0]}`);
      console.log(`Third Sheet Name: ${sheetNames[2]}`);

      if (!cSheet || !rhSheet) {

        msg.code = 0
        msg.message = "温度或湿度数据表格不存在，请检查excel文件是否正确";

        this.browserWindow?.webContents.send("message", JSON.stringify(msg));
        return;
      }


      try {

        //温度第一行数据
        const tData = xlsx.utils.sheet_to_json(cSheet, { header: 1 });

        //湿度第一行数据
        const rhData = xlsx.utils.sheet_to_json(rhSheet, { header: 1 });

        const tagIdList = tData[1].slice(1);
        console.log(tagIdList.length);


        const result: any = []
        let id = 0
        for (let i = 2; i < tData.length; i++) {

          let tRow = tData[i];
          let rRow = rhData[i];

          let time = tRow[0];



          //time时间段所有机器的温度和湿度
          for (let j = 1; j <= tagIdList.length; j++) {

            let tagId = tagIdList[j - 1]

            let te = tRow[j];

            if (te == '--') {
              te = "0.00"
            }



            let rh = rRow[j];

            if (rh == '--') {
              rh = "0.00"
            }

            let record = {
              time,
              tagId,
              te,
              rh,
              id: ++id
            }

            result.push(record);
          }

        }

        log.info("处理excel文件成功:", result.length);
        msg.code = 1
        msg.message = "处理excel文件成功";


        let xml = '<Root>\n';
        for (const item of result) {
          xml += `  <Record ID="${item.id}" TagID="${item.tagId}" TE="${item.te}" RH="${item.rh}" Time="${item.time}" />\n`;
        }
        xml += '</Root>';


        //拿到桌面地址
        let desktopPath = app.getPath("desktop");
        // 写入到文件
        const fs = require('fs');
        //随机生成一个文件名
        let fileName = new Date().getTime() + ".xml"
        let savePath = path.join(desktopPath, fileName);

        fs.writeFileSync(savePath, xml, 'utf8');

        msg.fileName = fileName;
        this.browserWindow?.webContents.send("message", JSON.stringify(msg));


      } catch (e: any) {

        log.error("处理excel文件失败:", e.message);

        msg.code = 0
        msg.message = "处理excel文件失败，请检查excel文件是否正确";

        this.browserWindow?.webContents.send("message", JSON.stringify(msg));

      }

    });

  }

}


//获取上个月月初和月末
const getFirstAndLastDayOfLastMonth = () => {
  // 当前时间
  const now = new Date();

  // 上个月的第一天
  const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // 上个月的最后一天
  const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0); // 设置日期为0，会自动调整为上个月最后一天

  return {
    firstDayOfLastMonth: firstDayOfLastMonth,
    lastDayOfLastMonth: lastDayOfLastMonth
  }
}


//获取昨天日期
const getYesterday = () => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  return yesterday;
}

// 格式化为 YYYY-MM-DD 格式
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};


// 捕获全局的 uncaughtException 错误
process.on('uncaughtException', (error) => {
  // console.error('捕获到未处理的错误:', error);
  // 可以选择在这里处理错误，比如日志记录，或者显示自定义错误信息
  // 但防止默认弹框：
  // 阻止 Electron 默认的错误弹框显示
  // 注意：在生产环境中，最好不要继续抛出异常，避免导致应用崩溃
  // 可以选择退出或记录错误
  // app.exit(1); // 可以退出应用
  log.error("捕获到未处理的错误:", error);

});

process.on('unhandledRejection', (reason, promise) => {

  log.error("捕获到未处理的错误:", reason);

});



export default PrimaryWindow;
