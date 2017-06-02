const dotenv = require('dotenv')
const express = require('express')
const fileUpload = require('express-fileupload')
const uuid = require('uuid/v4')
const Dropbox = require('dropbox')

dotenv.config()

const dbx = new Dropbox({ accessToken: process.env.DROPBOX_TOKEN })
const app = express()

app.use(fileUpload())

app.get('/', (req, res) => {
  res.sendfile('client/index.html')
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
    res.send(response)
  })
  .catch((error) => {
    res.send(error)
  })
})

const port = process.env.PORT || 5000
app.listen(port, () => {
  console.log('Listening on ' + port)
})
