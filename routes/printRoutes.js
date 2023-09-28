// routes/pagosRoutes.js
const express = require('express');
const printController = require('../controllers/printController');

const router = express.Router();

//IMPRIMIR PAGOS
router.get('/imprimir-pago/:id', printController.getPagosPrint);
router.get('/imprimir-empeno/:boleta', printController.getEmpenoPrint);

module.exports = router;