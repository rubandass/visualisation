var express = require('express');
var router = express.Router();

const countryController = require('../controllers/country');

router.get('/', countryController.index);

module.exports = router;

