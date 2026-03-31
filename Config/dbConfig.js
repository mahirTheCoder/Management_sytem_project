const mongoose = require('mongoose');


const dbConfig = ()=>{
  return  mongoose.connect('mongodb+srv://Auths:XxtE9nw9V3Jo0lRw@cluster0.mjewgzf.mongodb.net/routing?appName=Cluster0')
  .then(() => console.log('Connected!'));


}

module.exports = dbConfig;