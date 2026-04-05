const express = require('express')
const app = express()
const port = 8000

const router = require('./routing');
const dbConfig = require('./Config/dbConfig');

require('dotenv').config();
dbConfig();

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
app.use(express.json());

app.use(router)


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


