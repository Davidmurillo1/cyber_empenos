//EMPENO CONTROLLER
const Joya = require('../models/Joyas');
const Empeno = require('../models/Empenos');
const moment = require('moment');




exports.getJoyasRegister = async (req, res, next) => {
    try {
        const boleta = req.query.boleta || ""; // Obtener la boleta de la URL
        const cedulaDelCliente = await Empeno.getCedulaByBoleta(boleta);
        res.render('registrar-joyas', {
            boleta: boleta,
            cedulaDelCliente: cedulaDelCliente,
            role: req.session.user.role
        });
    } catch (error) {
        console.log(error);
        next(error);
    }
};



exports.postAddJoya = async (req, res, next) => {
    try {
        const boleta = req.body.boleta;
        const joya = req.body.joya;
        const descripcion = req.body.descripcion;
        const material = req.body.material;
        const kilates = req.body.kilates;
        let peso = req.body.peso;
        peso = parseFloat(peso.replace(',', '.'));
        const valor = req.body.valor;

        const newJoya = new Joya(boleta, joya, descripcion, material, kilates, peso, valor);
        await newJoya.save();

        req.flash('exito', 'Has registrado la joya correctamente.');
        res.redirect('/empeno/' + boleta);
    } catch (error) {
        console.error("No se pudo registrar la joya, inténtalo de nuevo.");
        req.flash('error', 'No se pudo registrar la joya correctamente.');
        res.redirect('/empeno/' + boleta);
    }
};

exports.getEditarJoya = async (req, res, next) => {
    try {
        const joyaId = req.params.id; // Asumiendo que estás usando rutas como /editar-joya/:id
        const joya = await Joya.getById(joyaId);
        const role = req.session.role;

        if (!joya) {
            return res.status(404).send("Joya no encontrada");
        }


        res.render('editarJoya', {
            pageTitle: 'Editar Joya',
            joya: joya,
            role
        });
    } catch (error) {
        console.error("Error al obtener la joya para editar:", error);
        next(error);
    }
};

exports.postEditarJoya = async (req, res, next) => {
    try {
        const joyaId = req.body.joyaId;  // Asegúrate de enviar el ID de la joya desde el formulario
        const boleta = req.body.boleta;

        const updatedJoya = new Joya(
            req.body.boleta,
            req.body.joya,
            req.body.descripcion,
            req.body.material,
            req.body.kilates,
            req.body.peso,
            req.body.valor
        );

        await updatedJoya.update(joyaId);

        res.redirect('empeno/' + boleta);
    } catch (error) {
        console.error('Error al actualizar la joya:', error);
        next(error);
    }
};


exports.getEliminarJoya = async (req, res, next) => {
    
    const role = req.session.role;
    try {
        const joyaId = req.params.joyaId; // Asegúrate de que el nombre del parámetro sea correcto
        
        const joya = await Joya.getById(joyaId);

        function formatNumberWithSpaces(num) {
            if (!num) return '0';
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        }

        res.render('eliminarJoya', {
            pageTitle: 'Eliminar Joya',
            role,
            joya,
            formatNumber: formatNumberWithSpaces
            // Puedes enviar más datos a la vista si es necesario
        });
    } catch (error) {
        console.error('Error al mostrar la vista eliminarCliente:', error);
        next(error);
    }
};

exports.deleteJoya = async (req, res, next) => {
    try {
        const joyaId = req.body.joyaId;  // Asumiendo que el ID de la joya se pasa como un parámetro en la URL
        const boleta = req.body.boleta;
        if (!joyaId || !boleta) {
            return res.status(400).send("Faltan datos necesarios para la operación.");
        }
        await Joya.deleteById(joyaId);
        

        // Puedes redirigir donde lo veas necesario, aquí te dejo un ejemplo redirigiendo a la página principal
        res.redirect('/empeno/' + boleta);
    } catch (error) {
        console.error('Error al eliminar la joya:', error);
        next(error);
    }
};



