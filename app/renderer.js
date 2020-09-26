const path = require("path");
const { remote, ipcRenderer, shell } = require("electron");

const mainProcess = remote.require("./main.js");
const currentWindow = remote.getCurrentWindow();

const marked = require("marked");

const markdownView = document.querySelector("#markdown");
const htmlView = document.querySelector("#html");
const newFileButton = document.querySelector("#new-file");
const openFileButton = document.querySelector("#open-file");
const saveMarkdownButton = document.querySelector("#save-markdown");
const revertButton = document.querySelector("#revert");
const saveHtmlButton = document.querySelector("#save-html");
const showFileButton = document.querySelector("#show-file");
const openInDefaultButton = document.querySelector("#open-in-default");

const renderMarkdownToHtml = (markdown) => {
  htmlView.innerHTML = marked(markdown, {
    sanitize: true,
  });
};

markdownView.addEventListener("keyup", (event) => {
  const currentContent = event.target.value;
  renderMarkdownToHtml(currentContent);

  updateUserInterface(currentContent !== originalContent);
});

let filePath = null;
let originalContent = "";

const saveMarkdownFile = () => {
  dispatchToMainProcess(
    "saveFile",
    {
      file: filePath,
      content: markdownView.value,
    },
    (success, file) => {
      if (success) {
        if (file !== filePath) {
          filePath = file;
        }

        originalContent = markdownView.value;

        updateUserInterface();
      }
    }
  );
};
saveMarkdownButton.addEventListener("click", saveMarkdownFile);
ipcRenderer.on("menu-saveFile", saveMarkdownFile);

const exportHtmlFile = () => {
  dispatchToMainProcess(
    "saveHtmlFile",
    {
      file: filePath,
      content: htmlView.innerHTML,
    },
    () => {}
  );
};
saveHtmlButton.addEventListener("click", exportHtmlFile);
ipcRenderer.on("menu-exportHtml", exportHtmlFile);

const newMarkdownFile = () => {
  filePath = null;
  originalContent = "";
  markdownView.value = "";

  renderMarkdownToHtml(originalContent);

  updateUserInterface();
};
newFileButton.addEventListener("click", newMarkdownFile);
ipcRenderer.on("menu-newFile", newMarkdownFile);

const updateUserInterface = (isEdited) => {
  let title = "超级Markdown编辑器";

  if (filePath) {
    title = `${path.basename(filePath)} - ${title}`;

    currentWindow.setRepresentedFilename(filePath);
  }

  if (isEdited) {
    title = `${title} *`;
  }

  currentWindow.setTitle(title);
  currentWindow.setDocumentEdited(isEdited || false);

  saveMarkdownButton.disabled = !isEdited;
  revertButton.disabled = !isEdited;

  showFileButton.disabled = !filePath;
  openInDefaultButton.disabled = !filePath;
};

const showFileFolder = () => {
  if (!filePath) return;

  shell.showItemInFolder(filePath);
};
showFileButton.addEventListener("click", showFileFolder);
ipcRenderer.on("menu-showFileFolder", showFileFolder);

const openFileUsingDefaultApplication = () => {
  if (!filePath) return;

  shell.openItem(filePath);
};
openInDefaultButton.addEventListener("click", openFileUsingDefaultApplication);
ipcRenderer.on(
  "menu-openFileDefaultApplication",
  openFileUsingDefaultApplication
);

const openMarkdownFile = () => {
  dispatchToMainProcess("openFile", {}, (file, content) => {
    if (file && content) {
      markdownView.value = content;
      renderMarkdownToHtml(content);

      filePath = file;
      originalContent = content;
    }

    updateUserInterface();
  });
};
openFileButton.addEventListener("click", openMarkdownFile);
ipcRenderer.on("menu-openFile", openMarkdownFile);

const dispatchToMainProcess = (type, payload, cb) => {
  let replyTopic = type + "-reply";

  let target = ipcRenderer.on(replyTopic, (ev, ...args) => {
    cb(...args);

    target.removeAllListeners(replyTopic);
  });

  mainProcess.dispatch({
    type,
    payload: {
      replyTopic,
      ...payload,
    },
  });
};

updateUserInterface();

document.addEventListener("dragstart", (ev) => ev.preventDefault());
document.addEventListener("dragover", (ev) => ev.preventDefault());
document.addEventListener("dragleave", (ev) => ev.preventDefault());
document.addEventListener("drop", (ev) => ev.preventDefault());

const getDraggedFile = (ev) => ev.dataTransfer.items[0];
const getDroppedFile = (ev) => ev.dataTransfer.files[0];
const fileTypeIsSupported = (file) => {
  return ["text/plain", "text/markdown"].includes(file.type);
};

markdownView.addEventListener("dragover", (ev) => {
  let file = getDraggedFile(ev);

  if (fileTypeIsSupported(file)) {
    markdownView.classList.add("drag-over");
  } else {
    markdownView.classList.add("drag-error");
  }
});

markdownView.addEventListener("dragleave", (ev) => {
  let file = getDraggedFile(ev);

  if (fileTypeIsSupported(file)) {
    markdownView.classList.remove("drag-over");
  } else {
    markdownView.classList.remove("drag-error");
  }
});

markdownView.addEventListener("drop", (ev) => {
  let file = getDroppedFile(ev);

  if (fileTypeIsSupported(file)) {
    markdownView.classList.remove("drag-over");

    dispatchToMainProcess(
      "openSpecifiedFile",
      {
        file: file.path,
      },
      (file, content) => {
        if (file && content) {
          markdownView.value = content;
          renderMarkdownToHtml(content);

          filePath = file;
          originalContent = content;
        }

        updateUserInterface();
      }
    );
  } else {
    markdownView.classList.remove("drag-error");
    alert("文件类型不支持");
  }
});
