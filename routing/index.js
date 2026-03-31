const express = require("express");
const { login } = require("../controllers/auth");
const router = express.Router();

const authroute = require('./authRoute')
const productRoute = require('./productRoute')



router.use ('/auth', authroute)
router.use('/products', productRoute)


module.exports = router;    