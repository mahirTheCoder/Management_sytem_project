const mongoose = require('mongoose');


const dbConfig = ()=>{
  return  mongoose.connect(process.env.MONGO_URI, )
  .then(() => console.log('Connected!'));



}

module.exports = dbConfig;