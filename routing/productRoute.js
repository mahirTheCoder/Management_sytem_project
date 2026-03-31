const express = require("express");
const { login } = require("../controllers/auth");
const { products } = require("../controllers/prodocts");
const router = express.Router();

router.post ('/allProducts ' , products)


module.exports = router;