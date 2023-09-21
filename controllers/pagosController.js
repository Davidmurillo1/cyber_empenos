//PAGOS CONTROLLER
const Pago = require('../models/Pagos');
const Empeno = require('../models/Empenos');
const moment = require('moment');




exports.getPagosRegister = async (req, res, next) => {
    try {
        const boleta = req.query.boleta || ""; // Obtener la boleta de la URL
        const cedulaDelCliente = await Empeno.getCedulaByBoleta(boleta);
        res.render('registrar-pagos', {
            boleta: boleta,
            cedulaDelCliente: cedulaDelCliente,
            role: req.session.user.role
        });
    } catch (error) {
        console.log(error);
        next(error);
    }
};



exports.postAddPago = async (req, res, next) => {
    try {
        const boleta = req.body.boleta;

        // Ajuste de la fecha ingresada por el usuario
        const [year, month, day] = req.body.fecha_pago.split('-').map(Number);
        const fecha_pago = new Date(year, month - 1, day);

        const fecha_registrada = new Date();;

        const tipo_pago = req.body.tipo_pago;
        const monto_pago = req.body.monto_pago;
        
        const newJoya = new Pago(boleta, fecha_pago, fecha_registrada, tipo_pago, monto_pago);
        await newJoya.save();

        req.flash('exito', 'Has registrado el pago correctamente.');
        res.redirect('/empeno/' + boleta);
    } catch (error) {
        console.error("No se pudo registrar el pago, inténtalo de nuevo.");
        req.flash('error', 'No se pudo registrar el pago correctamente.');
        res.redirect('/empeno/' + boleta);
    }
};

exports.getEditarPago = async (req, res, next) => {
    try {
        const pagoId = req.params.id; // Asumiendo que estás usando rutas como /editar-pago/:id
        const pago = await Pago.getPagoById(pagoId);
        const role = req.session.role;

        if (!pago) {
            return res.status(404).send("Pago no encontrado");
        }
        // Formatear formato de números
        function formatNumberWithSpaces(num) {
            if (!num) return '0';
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        }

        // Formatear la fecha usando moment
        pago.fecha_pago = moment(pago.fecha_pago).format('DD/MM/YY');

        res.render('editar-pago', {
            pageTitle: 'Editar Pago',
            pago: pago,
            role,
            formatNumber: formatNumberWithSpaces

        });
    } catch (error) {
        console.error("Error al obtener el pago para editar:", error);
        next(error);
    }
};

exports.postEditarPago = async (req, res, next) => {
    try {
        const pagoId = req.body.pagoId;  // Asegúrate de enviar el ID del pago desde el formulario
        const boleta = req.body.boleta; 

        // Validación de los datos
        if (!boleta || !req.body.tipo_pago || !req.body.fecha_pago || !req.body.monto_pago) {
            return res.status(400).send("Faltan datos necesarios para la operación.");
        }

        const fecha_registrada = new Date();

        const updatedPago = new Pago(
            boleta,
            req.body.fecha_pago,
            fecha_registrada,
            req.body.tipo_pago,
            req.body.monto_pago,
        );

        await updatedPago.updatePago(pagoId);
        
        req.flash('exito', 'Has editado el pago correctamente.');
        res.redirect('/empeno/' + boleta); // Asegúrate de que la ruta esté correcta
    } catch (error) {
        req.flash('error', 'Hubo un error en el momento de editar el pago, inténtalo de nuevo.');
        res.redirect('/empeno/' + boleta); // Asegúrate de que la ruta esté correcta
        console.error('Error al actualizar el pago:', error);
        next(error);
    }
};



exports.getEliminarPago = async (req, res, next) => {
    
    const role = req.session.role;
    try {
        const pagoId = req.params.pagoId; // Asegúrate de que el nombre del parámetro sea correcto
        
        const pago = await Pago.getPagoById(pagoId);

        function formatNumberWithSpaces(num) {
            if (!num) return '0';
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        }

         // Formatear la fecha usando moment
         pago.fecha_pago = moment(pago.fecha_pago).format('DD/MM/YY');

        res.render('eliminar-pago', {
            pageTitle: 'Eliminar Pago',
            role,
            pago,
            formatNumber: formatNumberWithSpaces
            // Puedes enviar más datos a la vista si es necesario
        });
    } catch (error) {
        console.error('Error al mostrar la vista Eliminar Pago:', error);
        next(error);
    }
};

exports.deletePago = async (req, res, next) => {
    try {
        const pagoId = req.body.id;  // Asumiendo que el ID del pago se pasa como dato el formulario
        const boleta = req.body.boleta;
        if (!pagoId || !boleta) {
            return res.status(400).send("Faltan datos necesarios para la operación.");
        }
        await Pago.deletePagoById(pagoId);
        

        // Puedes redirigir donde lo veas necesario, aquí te dejo un ejemplo redirigiendo a la página principal
        req.flash('exito', 'Has eliminado el pago correctamente.');
        res.redirect('/empeno/' + boleta);
    } catch (error) {
        req.flash('error', 'Hubo un error en el momento de eliminar el pago, inténtalo de nuevo.');
        res.redirect('/empeno/' + boleta);
        console.error('Error al eliminar la joya:', error);
        next(error);
    }
};





//FORMATO DE FECHAS
function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Enero es 0!
    const year = date.getFullYear().toString().substr(-2); // Obtiene solo los últimos 2 dígitos

    return `${day}/${month}/${year}`;
}