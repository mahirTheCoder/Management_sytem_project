const mongoose = require('mongoose');


const dbConfig = ()=>{
  return  mongoose.connect(process.env.DB_URL, )
  .then(() => console.log('Connected!'));


}

module.exports = dbConfig;