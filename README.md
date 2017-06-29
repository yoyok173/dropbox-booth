# Dropbox Booth

This is the repository of the Dropbox Booth Server. It's a NodeJS Server with Express and Socket.io. The server provide a REST API to communicate with Dropbox and send websocket messages for completed file uploads.

The Server works excellent with the [ionic-booth](https://github.com/marcuskirsch/ionic-booth) app.


## Getting Started

To get started, clone this repo, and run `npm install` in the root directory. You need to configure the server now. Rename the `example.env` to `.env` and update the variables.

```
DROPBOX_TOKEN=dropboxtoken
PORT=5000
USERNAME=user
PASSWORD=pwd
```

After this run `npm start`. This will start the server. You need to open your browser at `http://localhost:5000/` and enter the username and password (e.g. `user`, `pwd`).

### Get Dropbox Token
Open this Link [Dropbox Token Generator](https://dropbox.github.io/dropbox-api-v2-explorer/#auth_token/from_oauth1) and click "Get Token".

## Configure Client

To upload files to a specific Dropbox folder you need to change the foldername in the ajax-call at `client/index.html`.

## Endpoints

### GET

**Get all files of a Dropbox folder**

`/dropbox/:folder_path`

You can see the full documentation from Dropbox [here](https://dropbox.github.io/dropbox-api-v2-explorer/#files_list_folder).

**Get a temporary link of a Dropbox file**

`/dropbox/:folder_path/:file_name`

To download a file directly from Dropbox you need a temporary link. You can see the full documentation from Dropbox [here](https://dropbox.github.io/dropbox-api-v2-explorer/#files_get_temporary_link).

### POST
**Post a image to a Dropbox folder**

`/dropbox/:folder_path`

This will resize the image to max-width of 1920 pixel and rotate it to default orientation. After this will the upload starts. If this is completed, the server emit a websocket message `image_uploaded` with some Dropbox upload information.

You can see the full documentation from Dropbox [here](https://dropbox.github.io/dropbox-api-v2-explorer/#files_upload).
