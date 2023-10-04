const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const flash = require('connect-flash');
const authRoutes = require('./routes/authRoutes');
const clientesRoutes = require('./routes/clientesRoutes');
const empenosRoutes = require('./routes/empenosRoutes');
const joyasRoutes = require('./routes/joyasRoutes');
const pagosRoutes = require('./routes/pagosRoutes');
const printRoutes = require('./routes/printRoutes');
const { PORT } = require('./config.js');

const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Configuración de la tienda de sesiones de MySQL
const sessionStore = new MySQLStore({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    // ... otras opciones si las necesitas
});

app.use(session({
    secret: 'tu_clave_secreta',
    resave: false,
    saveUninitialized: false,
    store: sessionStore  // Usa MySQL para almacenar las sesiones
}));

app.use((req, res, next) => {
    if (!req.session.role && req.path !== '/login') {
        return res.redirect('/login');
    }
    if (req.session && req.session.user) {
        res.locals.userName = req.session.user.nombre;
    }
    res.locals.role = req.session.role;
    next();
});

app.use(async (req, res, next) => {
    if(req.session && req.session.sucursal) {
        try {
            // Aquí debes poner el código necesario para cargar el logo de la base de datos
            // Este es solo un ejemplo y debes adaptarlo a tu implementación
            // Suponiendo que tienes un método para obtener el logo por el id de la sucursal
            const logo = await Sucursal.obtenerLogoPorId(req.session.sucursal.id);
            res.locals.sucursalLogo = logo;
        } catch (error) {
            console.error('Error al obtener el logo de la sucursal:', error);
        }
    }
    next();
});

app.use(flash());
app.use((req, res, next) => {
    res.locals.exito = req.flash('exito');
    res.locals.error = req.flash('error');
    next();
});

app.use(authRoutes);
app.use(clientesRoutes);
app.use(empenosRoutes);
app.use(joyasRoutes);
app.use(pagosRoutes);
app.use(printRoutes);

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
