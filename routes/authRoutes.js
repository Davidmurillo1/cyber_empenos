const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();






router.get('/inicio', authController.redirectToDashboard);

router.get('/', (req, res) => {
    res.redirect('/login');
});

router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.get('/dashboard/admin', authController.getDashboardAdmin);
router.get('/dashboard/empleado', authController.getDashboardEmpleado);

//USUARIOS
router.get('/usuarios', authController.getUsuarios);
router.get('/register', authController.getRegister);
router.post('/register', authController.postRegister);
//SELECCIONAR SUCURSAL
router.get('/select-sucursal', authController.getSelectSucursal);
router.post('/set-sucursal', authController.postSelectSucursal);


module.exports = router;

