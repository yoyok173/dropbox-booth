const dotenv = require('dotenv')
const express = require('express')
const cors = require('cors')
const http = require('http')
const io = require('socket.io')
const fileUpload = require('express-fileupload')
const uuid = require('uuid/v4')
const Dropbox = require('dropbox')
const path = require('path')
const auth = require('basic-auth')
const imagick = require('imagemagick')

dotenv.config()

const dbx = new Dropbox({ accessToken: process.env.DROPBOX_TOKEN })
const app = express()
const server = http.Server(app)
const channel = io(server)

app.use(cors())
app.use(fileUpload())

app.use(express.static(process.cwd(), {
  maxage: 2592000000 // set max-cache to 30d
}))

app.use((req, res, next) => {
  let credentials = auth(req)

  if (!credentials || credentials.name !== process.env.USERNAME || credentials.pass !== process.env.PASSWORD) {
    res.statusCode = 401
    res.setHeader('WWW-Authenticate', 'Basic realm="denied"')
    res.send('Access denied')
  } else {
    next()
  }
})

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/client/index.html'))
})

app.get('/dropbox', (req, res) => {
  dbx.filesListFolder({path: ''})
  .then((response) => {
    res.send(response)
  })
  .catch((error) => {
    res.send(error)
  })
})

app.get('/dropbox/:folder_path', (req, res) => {
  dbx.filesListFolder({path: '/' + req.params.folder_path})
  .then((response) => {
    res.send(response)
  })
  .catch((error) => {
    res.send(error)
  })
})

app.get('/dropbox/:folder_path/:file_name', (req, res) => {
  dbx.filesGetTemporaryLink({
    path: '/' + req.params.folder_path + '/' + req.params.file_name
  })
  .then((response) => res.send(response))
  .catch(res.send)
})

app.post('/dropbox/:folder_path', (req, res) => {
  let fileType = req.files.image.name.split('.')[req.files.image.name.split('.').length - 1]

  imagick.resize({
    srcData: req.files.image.data,
    width: 1920
  }, (err, stdout, stderr) => {
    if (err) {
      res.statusCode = 500
      res.send(err)
    }

    dbx.filesUpload({
      path: '/' + req.params.folder_path + '/' + uuid() + '.' + fileType,
      contents: new Buffer(stdout, 'binary')
    })
    .then((response) => {
      channel.emit('image_uploaded', response)
      res.send(response)
    })
    .catch((error) => {
      res.send(error)
    })
  })
})

// Socket handling start
channel.on('connection', (socket) => {
  console.log('app connected')

  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
})

const port = process.env.PORT || 5000
server.listen(port, () => {
  console.log('Listening on ' + port)
})
