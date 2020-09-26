const fs = require("fs");
const { app, BrowserWindow, dialog } = require("electron");

let mainWindow = null;

app.on("ready", () => {
  mainWindow = new BrowserWindow({
    show: false,
  });

  mainWindow.loadFile(`${__dirname}/index.html`);

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });
});

console.log("Starting up...");

exports.dispatch = (action) => {
  const { type, payload } = action;
  const { replyTopic } = payload;
  const result = null;

  const cb = (...args) => {
    if (replyTopic) {
      mainWindow.webContents.send(replyTopic, ...args);
    }
  };

  switch (type) {
    case "openFile":
      result = getFileFromUser(payload, cb);
      break;

    case "saveFile":
      saveFileFromUser(payload, cb);
      break;

    case "saveHtmlFile":
      saveHtmlFileFromUser(payload, cb);
      break;

    default:
      console.log("Unsupported Action Type");
  }
};

const getFileFromUser = ({ properties, filters }, cb) => {
  const files = dialog.showOpenDialog({
    properties: properties || ["openFile"],
    filters: filters || [
      {
        name: "Markdown Files",
        extensions: ["md", "markdown"],
      },
      {
        name: "Text Files",
        extensions: ["text", "txt"],
      },
      {
        name: "JSON Files",
        extensions: ["json"],
      },
    ],
  });

  if (!files) cb();

  let file = files[0];
  const content = fs.readFileSync(file).toString();

  app.addRecentDocument(file);

  cb(file, content);
};

const saveHtmlFileFromUser = ({ file, content }, cb) => {
  let savedHtmlFile = dialog.showSaveDialog({
    title: "导出HTML",
    defaultPath: app.getAppPath("desktop"),
    filters: [
      {
        name: "HTML文件",
        extensions: ["html"],
      },
    ],
  });

  if (!savedHtmlFile) cb(false);

  fs.writeFileSync(savedHtmlFile, content);

  cb(true);
};

const saveFileFromUser = ({ file, content }, cb) => {
  let savedFile = file;

  if (!savedFile) {
    savedFile = dialog.showSaveDialog({
      title: "保存文件",
      defaultPath: app.getAppPath("desktop"),
      filters: [
        {
          name: "Markdown文件",
          extensions: ["md", "markdown"],
        },
      ],
    });
  }

  if (!savedFile) {
    cb(false, null);
  }

  fs.writeFileSync(savedFile, content);

  cb(true, savedFile);
};
