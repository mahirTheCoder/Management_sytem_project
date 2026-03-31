const express = require('express')
const mongoose = require('mongoose');
// const router = express.Router()
const app = express()

const router = require('./routing')
const port = 8000

app.use(router)


mongoose.connect('mongodb+srv://Auths:XxtE9nw9V3Jo0lRw@cluster0.mjewgzf.mongodb.net/routing?appName=Cluster0')
  .then(() => console.log('Connected!'));



 


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
