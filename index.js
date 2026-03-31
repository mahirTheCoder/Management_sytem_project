const express = require('express')
const mongoose = require('mongoose');
// const router = express.Router()
const app = express()

const router = require('./routing');
const dbConfig = require('./Config/dbConfig');
const port = 8000

app.use(router)

 dbConfig()


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
