const dotenv = require('dotenv')
const express = require('express')
const http = require('http')
const io = require('socket.io')
const fileUpload = require('express-fileupload')
const uuid = require('uuid/v4')
const Dropbox = require('dropbox')
const path = require('path')

dotenv.config()

const dbx = new Dropbox({ accessToken: process.env.DROPBOX_TOKEN })
const app = express()
const server = http.Server(app)
const channel = io(server)

app.use(fileUpload())

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

app.post('/dropbox/:folder_path', (req, res) => {
  let fileType = req.files.image.name.split('.')[req.files.image.name.split('.').length - 1]

  dbx.filesUpload({
    path: '/' + req.params.folder_path + '/' + uuid() + '.' + fileType,
    contents: req.files.image.data
  })
  .then((response) => {
    channel.emit('image_uploaded', response)
    res.send(response)
  })
  .catch((error) => {
    res.send(error)
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
