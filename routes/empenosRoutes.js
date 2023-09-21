// routes/empenosRoutes.js
const express = require('express');
const empenosController = require('../controllers/empenosController');

const router = express.Router();

router.get('/empenos', empenosController.getEmpenos);
router.get('/add-empeno', empenosController.getAddEmpeno);
router.post('/add-empeno', empenosController.postAddEmpeno);
router.get('/empeno/:boleta', empenosController.getEmpenoProfile);
router.get('/editempeno/:boleta', empenosController.getEditEmpeno);
router.post('/editempeno', empenosController.postEditEmpeno);

router.get('/delete-empeno/:boleta', empenosController.getDeleteEmpeno);
router.post('/delete-empeno', empenosController.deleteEmpeno);



module.exports = router;
