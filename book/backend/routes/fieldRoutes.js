const express = require("express");
const { getFields } = require("../controllers/fieldController");
const router = express.Router();

router.get("/", getFields);

module.exports = router;
