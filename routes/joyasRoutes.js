// routes/joyasRoutes.js
const express = require('express');
const joyasController = require('../controllers/joyasController');

const router = express.Router();

router.get('/registrar-joyas', joyasController.getJoyasRegister);
router.post('/registrar-joyas', joyasController.postAddJoya);
// Ruta para mostrar el formulario de edición de joya
router.get('/editar-joya/:id', joyasController.getEditarJoya);

// Ruta para manejar el envío del formulario de edición de joya
router.post('/editar-joya', joyasController.postEditarJoya);

//Ruta para manejar el envío del formulario de eliminación de la joya.
router.get('/eliminar-joya/:joyaId', joyasController.getEliminarJoya);
router.post('/eliminar-joya', joyasController.deleteJoya);

module.exports = router;