var express = require('express');
var router = express.Router();

const dataController = require('../controllers/data');

router.get('/', dataController.index);
router.delete('/', dataController.delete);
router.post('/update', dataController.update);

module.exports = router;

