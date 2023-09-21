const express = require('express');
const clientesController = require('../controllers/clientesController');

const router = express.Router();

router.get('/clientes', clientesController.getAllClientes);
router.get('/addcliente', clientesController.getAddCliente);
router.post('/addCliente', clientesController.postAddCliente);
router.get('/edit-cliente/:cedula_cliente', clientesController.getEditCliente);
router.post('/edit-cliente', clientesController.postEditCliente);
router.get('/cliente-profile/:cedula', clientesController.getClienteProfile);

//ELIMINAR CLIENTES DE LA SUCURSAL SI NO TIENEN EMPEÑOS
router.post('/eliminar-cliente', clientesController.deleteClienteFromSucursal);
router.get('/eliminar-cliente/:cedula_cliente', clientesController.getDeleteCliente);






module.exports = router;

