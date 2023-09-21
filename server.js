const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const authRoutes = require('./routes/authRoutes');
const clientesRoutes = require('./routes/clientesRoutes');
const empenosRoutes = require('./routes/empenosRoutes');
const joyasRoutes = require('./routes/joyasRoutes');
const pagosRoutes = require('./routes/pagosRoutes');


const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));  // Añadir esta línea para servir archivos estáticos

app.use(session({
    secret: 'tu_clave_secreta',
    resave: false,
    saveUninitialized: false
}));

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


app.listen(3000, () => {
    console.log('Servidor escuchando en el puerto 3000');
});
