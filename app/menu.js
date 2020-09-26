const {
  app,
  Menu
} = require("electron");

const menuTemplate = [{
  label: "文件",
  submenu: [{
    label: "打开文件",
    click() {
      console.log("打开文件菜单被点击");
    }
  }]
}];

if (process.platform === "darwin") {
  const applicationName = "超级Markdown编辑器";

  menuTemplate.unshift({
    label: applicationName,
    submenu: [{
      label: `关于${applicationName}`
    }, {
      label: `退出${applicationName}`,
      click() {
        app.quit()
      }
    }]
  });
}

exports.applicationMenu = Menu.buildFromTemplate(menuTemplate);