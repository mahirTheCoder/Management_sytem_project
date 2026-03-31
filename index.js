const express = require('express')
const app = express()
const port = 8000

const router = require('./routing');
const dbConfig = require('./Config/dbConfig');

const dotenv = require('dotenv')
dotenv.config()

app.use(router)



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
