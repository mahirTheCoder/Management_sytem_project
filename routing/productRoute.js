const express = require("express");
const { products } = require("../controllers/prodocts");
const router = express.Router();

router.get("/allProducts", products);

module.exports = router;
