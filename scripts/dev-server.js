const childProcess = require("child_process");
const path = require("path");
const fs = require("fs");
const { EOL } = require("os");
const vite = require("vite");
const chalk = require("chalk");
const chokidar = require("chokidar");
const electron = require("electron");
const compileTs = require("./private/tsc");

let viteServer = null;
let electronProcess = null;
let electronProcessLocker = false;
let rendererPort = 0;
let envStr = process.argv[2];

async function startRenderer () {
  viteServer = await vite.createServer({
    configFile: path.join(__dirname, "../src/renderer/vite.config.js"),
    mode: envStr,
  });

  return viteServer.listen();
}

async function startElectron () {
  if (electronProcess) {
    // single instance lock
    return;
  }

  try {
    await compileTs(path.join(__dirname, "..", "src"));
  } catch {
    console.log(chalk.redBright("Could not start Electron because of the above typescript error(s)."));
    electronProcessLocker = false;
    return;
  }

  const args = [path.join(__dirname, "..", "build", "main", "main.js"), rendererPort, envStr];
  const electronPath = electron;
  electronProcess = childProcess.spawn(electronPath, args);
  electronProcessLocker = false;

  electronProcess.stdout.on("data", (data) => {
    if (data == EOL)
      return;

    process.stdout.write(chalk.blueBright("[Electron] ") + chalk.white(data.toString()));
  });

  electronProcess.stderr.on("data", (data) => {
    process.stderr.write(chalk.blueBright("[Electron] ") + chalk.white(data.toString()));
  });

  electronProcess.on("exit", () => stop());
}

function restartElectron () {
  if (electronProcess) {
    electronProcess.removeAllListeners("exit");
    electronProcess.kill();
    electronProcess = null;
  }

  if (!electronProcessLocker) {
    electronProcessLocker = true;
    startElectron();
  }
}

function copyStaticFiles () {
  copyMainSubFiles("static");
}

/*
注意：Electron的工作目录是 build/main 而不是 src/main
tsc不能复制编译后的JS静态文件，所以需要手动复制编译后的文件到build/main
*/
function copyMainSubFiles (subPath) {
  fs.cpSync(path.join(__dirname, "../src/main", subPath), path.join(__dirname, "../build/main", subPath), { recursive: true });
}

function stop () {
  viteServer.close();
  process.exit();
}

async function start () {
  console.log(`${chalk.greenBright("=========================================")}`);
  console.log(`${chalk.greenBright("Starting excel-to-xml Server...")}`);
  console.log(`${chalk.greenBright("=========================================")}`);

  const devServer = await startRenderer();
  rendererPort = devServer.config.server.port;

  copyStaticFiles();
  await startElectron();

  const mainFolder = path.join(__dirname, "../src/main");
  console.log(mainFolder);
  chokidar.watch(mainFolder, {
    cwd: mainFolder,
  })
    .on("change", (mainFolder) => {
      console.log(`${chalk.blueBright("[electron] ")}Change in ${mainFolder}. reloading... 🚀`);

      if (mainFolder.startsWith(path.join("static", "/")))
        copyMainSubFiles(mainFolder);

      restartElectron();
    });
}

start();
