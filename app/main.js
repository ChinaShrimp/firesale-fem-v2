const fs = require('fs')
const {
    app,
    BrowserWindow,
    dialog
} = require('electron')

let mainWindow = null

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        show: false
    })

    mainWindow.loadFile(`${__dirname}/index.html`)

    mainWindow.once('ready-to-show', () => {
        mainWindow.show()
    })
})

console.log('Starting up...')

exports.dispatch = (action) => {
    const {
        type,
        payload
    } = action
    const {
        replyTopic
    } = payload;
    const result = null;

    const cb = (...args) => {
        if (replyTopic) {
            mainWindow.webContents.send(replyTopic, ...args)
        }
    }

    switch (type) {
        case 'openFile':
            result = getFileFromUser(payload, cb)
            break

        default:
            console.log("Unsupported Action Type")
    }
}

const getFileFromUser = ({
    properties,
    filters
}, cb) => {
    const files = dialog.showOpenDialog({
        properties: properties || ['openFile'],
        filters: filters || [{
                name: "Markdown Files",
                extensions: ['md', 'markdown']
            },
            {
                name: 'Text Files',
                extensions: ['text', 'txt']
            },
            {
                name: 'JSON Files',
                extensions: ['json']
            }
        ]
    })

    if (!files) cb()

    let file = files[0]
    const content = fs.readFileSync(file).toString()

    cb(file, content)
}