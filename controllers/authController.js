const User = require('../models/User');
const Sucursal = require('../models/Sucursal');


exports.redirectToDashboard = (req, res, next) => {
    const userRole = req.session.user.role; // Asume que el rol del usuario está almacenado en la sesión

    switch(userRole) {
        case 'admin':
            res.redirect('/dashboard/Admin');
            break;
        case 'empleado':
            res.redirect('/dashboard/empleado');
            break;
        default:
            res.redirect('/login'); // Redirige a un dashboard por defecto o página de inicio
    }
};



exports.getLogin = (req, res) => {
    res.render('login', { error: null });
};

exports.postLogin = async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findByUsername(username);
    if (user && await user.comparePassword(password)) {
        req.session.user = user;
        // Redirige al usuario a la selección de sucursal
        res.redirect('/select-sucursal');
    } else {
        res.render('login', { error: 'Usuario o contraseña incorrecta' });
    }
};

exports.getDashboardAdmin = async (req, res) => {
    const sucursalName = await Sucursal.getSucursalNameById(req.session.sucursalId);
    res.render('dashboardAdmin', {
        pageTitle: 'Dashboard Administrador',
        path: '/dashboardAdmin',
        userName: req.session.user.nombre,
        sucursalName: sucursalName
    });
};

exports.getDashboardEmpleado = async (req, res) => {
    const sucursalName = await Sucursal.getSucursalNameById(req.session.sucursalId);
    res.render('dashboardEmpleado', {
        pageTitle: 'Dashboard',
        path: '/dashboardEmpleado',
        userName: req.session.user.nombre,
        sucursalName: sucursalName
    });
};

exports.getSelectSucursal = async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    
    // Obtener las sucursales asociadas al usuario que ha iniciado sesión
    const sucursales = await User.getSucursalesByUserId(req.session.user.id);
    
    res.render('selectSucursal', { sucursales });
};

exports.postSelectSucursal = (req, res) => {
    req.session.sucursalId = req.body.sucursalId;
    if (req.session.user.role === 'admin') {
        res.redirect('/dashboard/admin');
    } else {
        res.redirect('/dashboard/empleado');
    }
};

//GESTIÓN DE USUARIOS
exports.getRegister = async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
    }
    const sucursales = await Sucursal.getAll();
    res.render('register', { sucursales, role: req.session.user.role });
};

exports.postRegister = async (req, res) => {
    const { username, password, role, nombre, sucursales } = req.body;

    try {
        const userId = await User.create(username, password, role, nombre);
        
        // Asociar el usuario con las sucursales seleccionadas
        for (let sucursalId of sucursales) {
            await User.associateWithSucursal(userId, sucursalId);
        }
        req.flash('exito', 'Has creado el usuario exitosamente.')
        res.redirect('/usuarios');
    } catch (error) {
        console.log('Error durante el registro:', error);
        res.redirect('/register');
    }
};


exports.getUsuarios = async (req, res) => {
    try {
        
        const usersWithSucursales = await User.getAllWithSucursales();
        const sucursales = await Sucursal.getAll();
        res.render('usuarios', { users: usersWithSucursales, role: req.session.role, sucursales });
    } catch (error) {
        console.log('Error al obtener usuarios:', error);
        res.redirect('/dashboard/admin');
    }
};

//FIN DE GESTIÓN DE USUARIOS