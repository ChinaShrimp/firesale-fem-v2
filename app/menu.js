const { Menu, app } = require("electron");

const menuTemplate = [
  {
    label: "文件",
    submenu: [
      {
        label: "新建文件",
        accelerator: "CommandOrControl+N",
        click() {
          app.mainWindow.webContents.send("menu-newFile");
        },
      },
      {
        label: "打开文件",
        accelerator: "CommandOrControl+O",
        click() {
          app.mainWindow.webContents.send("menu-openFile");
        },
      },
      {
        label: "保存文件",
        accelerator: "CommandOrControl+S",
        click() {
          app.mainWindow.webContents.send("menu-saveFile");
        },
      },
      {
        label: "复制",
        role: "copy",
      },
      {
        label: "粘贴",
        role: "paste",
      },
      {
        label: "打开所在文件夹",
        click() {
          app.mainWindow.webContents.send("menu-showFileFolder");
        },
      },
      {
        label: "使用系统默认程序打开文件",
        click() {
          app.mainWindow.webContents.send("menu-openFileDefaultApplication");
        },
      },
    ],
  },
  {
    label: "导出",
    submenu: [
      {
        label: "导出HTML",
        click() {
          app.mainWindow.webContents.send("menu-exportHtml");
        },
      },
    ],
  },
];

if (process.platform === "darwin") {
  const applicationName = "超级Markdown编辑器";

  menuTemplate.unshift({
    label: applicationName,
    submenu: [
      {
        label: `关于${applicationName}`,
        role: "about",
      },
      {
        label: `退出${applicationName}`,
        role: "quit",
      },
    ],
  });
}

exports.applicationMenu = Menu.buildFromTemplate(menuTemplate);
