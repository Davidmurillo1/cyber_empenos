// routes/pagosRoutes.js
const express = require('express');
const pagosController = require('../controllers/pagosController');

const router = express.Router();

router.get('/registrar-pagos', pagosController.getPagosRegister);
router.post('/registrar-pagos', pagosController.postAddPago);

// Ruta para mostrar el formulario de edición de joya
router.get('/editar-pago/:id', pagosController.getEditarPago);

// Ruta para manejar el envío del formulario de edición de joya
router.post('/editar-pago', pagosController.postEditarPago);

//Ruta para manejar el envío del formulario de eliminación de la joya.
router.get('/eliminar-pago/:pagoId', pagosController.getEliminarPago);
router.post('/eliminar-pago', pagosController.deletePago);

module.exports = router;