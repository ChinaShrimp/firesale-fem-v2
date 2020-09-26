const path = require('path')
const {
  remote,
  ipcRenderer
} = require('electron')

const mainProcess = remote.require('./main.js')
const currentWindow = remote.getCurrentWindow()

const marked = require('marked');

const markdownView = document.querySelector('#markdown');
const htmlView = document.querySelector('#html');
const newFileButton = document.querySelector('#new-file');
const openFileButton = document.querySelector('#open-file');
const saveMarkdownButton = document.querySelector('#save-markdown');
const revertButton = document.querySelector('#revert');
const saveHtmlButton = document.querySelector('#save-html');
const showFileButton = document.querySelector('#show-file');
const openInDefaultButton = document.querySelector('#open-in-default');

const renderMarkdownToHtml = markdown => {
  htmlView.innerHTML = marked(markdown, {
    sanitize: true
  });
};

markdownView.addEventListener('keyup', event => {
  const currentContent = event.target.value;
  renderMarkdownToHtml(currentContent);

  updateUserInterface(currentContent !== originalContent)
})

let filePath = null
let originalContent = ''

const updateUserInterface = (isEdited) => {
  let title = '超级Markdown编辑器'

  if (filePath) {
    title = `${path.basename(filePath)} - ${title}`

    currentWindow.setRepresentedFilename(filePath)
  }

  if (isEdited) {
    title = `${title} *`
  }

  currentWindow.setTitle(title)
  currentWindow.setDocumentEdited(isEdited || false)

  saveMarkdownButton.disabled = !isEdited
  revertButton.disabled = !isEdited
}

updateUserInterface()

openFileButton.addEventListener('click', () => {
  dispatchToMainProcess('openFile', {}, (file, content) => {
    if (file && content) {
      markdownView.value = content
      renderMarkdownToHtml(content)

      filePath = file
      originalContent = content
    }

    updateUserInterface()
  })
})

const dispatchToMainProcess = (type, payload, cb) => {
  let replyTopic = type + "-reply"

  let target = ipcRenderer.on(replyTopic, (ev, ...args) => {
    cb(...args)

    target.removeListener(replyTopic)
  })

  mainProcess.dispatch({
    type,
    payload: {
      replyTopic,
      ...payload
    }
  })
}