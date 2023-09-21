//EMPENO CONTROLLER
const Empeno = require('../models/Empenos');
const Pago = require('../models/Pagos');
const Joya = require('../models/Joyas');
const Cliente = require('../models/Clientes');
const moment = require('moment');




exports.getEmpenos = async (req, res, next) => {
    try {
        const sucursalId = req.session.sucursalId;
        const term = req.query.search || "";
        const page = +req.query.page || 1; 
        const LIMIT = 20;
        const OFFSET = (page - 1) * LIMIT;

        let empenosRaw;
        if (term) {
            empenosRaw = await Empeno.search(term, sucursalId, LIMIT, OFFSET);
        } else {
            empenosRaw = await Empeno.getAllBySucursal(sucursalId, LIMIT, OFFSET);
        }

        // Añadiendo la lógica de estado del empeño aquí
        for (let empeno of empenosRaw) {
            if (await Pago.hasRetiro(empeno.boleta_empeno)) {
                empeno.estado = "Retirado";
            } else {
                const lastPaymentDate = await Pago.getLastPaymentDate(empeno.boleta_empeno);
                const twoMonthsAgo = new Date();
                twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
                const empenoDate = new Date(empeno.fecha_ingreso);  // Convertir la fecha de ingreso del empeño a un objeto Date

                if (empenoDate > twoMonthsAgo) {
                    empeno.estado = "Al día";
                } else if (lastPaymentDate && lastPaymentDate > twoMonthsAgo) {
                    empeno.estado = "Al día";
                } else {
                    empeno.estado = "Atrasado";
                }
            }

            // Agrega el valor total de las joyas para este empeño
            empeno.totalValue = await Joya.getTotalValueByBoleta(empeno.boleta_empeno);
        }

        // Formatear las fechas
        const empenos = empenosRaw.map(empeno => {
            return {
                ...empeno,
                fecha_ingreso: formatDate(empeno.fecha_ingreso),
                fecha_registro: formatDate(empeno.fecha_registro)
            };
        });

        let totalEmpenos;
        if (term) {
            totalEmpenos = await Empeno.getTotalEmpenosFiltered(term, sucursalId);
        } else {
            totalEmpenos = await Empeno.getTotalEmpenos(sucursalId);
        }

        const totalPages = Math.ceil(totalEmpenos / LIMIT);

        // Formatear formato de números
        function formatNumberWithSpaces(num) {
            if (!num) return '0';
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        }


        res.render('empenos', {
            pageTitle: 'Empenos',
            empenos: empenos,
            role: req.session.user.role,
            currentPage: page,
            totalPages: totalPages,
            search: term,
            formatNumber: formatNumberWithSpaces

        });
    } catch (error) {
        console.log(error);
        next(error);
    }
};




//AGREGAR EMPEÑOS

exports.getAddEmpeno = (req, res, next) => {
    res.render('add-empeno', { pageTitle: 'Agregar Empeño', role: req.session.user.role });
};


exports.postAddEmpeno = async (req, res, next) => {
    try {
        const boleta = req.body.boleta;
        const cedula = req.body.cedula;

        // Ajuste de la fecha ingresada por el usuario
        const [year, month, day] = req.body.fechaIngreso.split('-').map(Number);
        const fechaIngreso = new Date(year, month - 1, day);

        const fechaRegistro = new Date(); // Esta es la fecha actual, no necesita ajuste
        const sucursalId = req.session.sucursalId;  // Suponiendo que has guardado el ID de la sucursal en la sesión

        const empeno = new Empeno(boleta, cedula, fechaIngreso, fechaRegistro, sucursalId);
        await empeno.save();

        res.redirect(`/registrar-joyas?boleta=${boleta}`);

    } catch (error) {
        console.error("Error al registrar empeño:", error);
        res.render('error', { mensaje: "Puede ser que el número de boleta ya exista", role: req.session.user.role });

    }
    
};

//OBTENER LA VISTA DE EDICIÓN DE EMPEÑOS
exports.getEditEmpeno = async (req, res, next) => {
    try {
        const boleta = req.params.boleta;  // Asumo que estás pasando la boleta como parámetro en la URL
        const empeno = await Empeno.getDetailsByBoleta(boleta);
        const role = req.session.role;

        if (!empeno) {
            // Si no se encuentra el empeño con la boleta dada, redirecciona o muestra un error
            return res.redirect('/empenos');
        }

        // Formatear la fecha usando moment
        empeno.fecha_ingreso = moment(empeno.fecha_ingreso).format('DD/MM/YY');

        res.render('editEmpeno', {
            empeno: empeno,
            pageTitle: 'Editar Empeño',
            role,
            // Otros datos que quieras pasar a la vista
        });

    } catch (error) {
        console.error("Error al obtener la página de edición del empeño:", error);
        next(error);
    }
};

// Función para procesar el formulario de edición del empeño
exports.postEditEmpeno = async (req, res, next) => {
    try {
        const boleta = req.body.boleta;
        const fechaIngreso = req.body.fechaIngreso;
        const fechaRegistro = new Date();

        // Crear una instancia del empeño con los datos del formulario
        const empenoToUpdate = new Empeno(boleta, null, fechaIngreso, fechaRegistro, null);  // Asumo que cedula y sucursalId no se editan
        
        // Esperar a que la promesa se resuelva
        const cliente = await Empeno.getCedulaByBoleta(boleta);

        await empenoToUpdate.editEmpeno();

        // Establecer mensaje de éxito
        req.flash('exito', 'Se ha editado el empeño correctamente');

        // Redireccionar al perfil del cliente con la boleta como parámetro
        res.redirect('/cliente-profile/' + cliente);

    } catch (error) {
        // Establecer mensaje de error
        req.flash('error', 'No se ha podido editar el cliente, inténtalo de nuevo.');

        // Redireccionar al perfil del cliente con la boleta como parámetro
        res.redirect('/cliente-profile/' + Cliente);

        console.error("Error al editar el empeño:", error);
        next(error);
    }
};

//ELIMINAR EMPEÑOS
exports.getDeleteEmpeno = async (req, res, next) => {
    try {
        boleta = req.params.boleta;
        const empeno = await Empeno.getDetailsByBoleta(boleta);
        const role = req.session.role;
        res.render('deleteEmpenos', {
            pageTitle: 'Eliminar Empeño',
            role,
            boleta,
            empeno
        });
    } catch (error) {
        console.error("Error al intentar renderizar la vista deleteempenos:", error);
        next(error);
    }
};

exports.deleteEmpeno = async (req, res, next) => {
    let cliente; // Mueve la definición de cliente aquí para que esté accesible en el bloque catch

    try {
        const boleta = req.body.boleta;
        cliente = await Empeno.getCedulaByBoleta(boleta);

        if (!boleta) {
            return res.status(400).send("No se ha proporcionado una boleta válida.");
        }

        // Llamada al método de eliminación en el modelo
        await Empeno.deleteByBoleta(boleta);

        // Redirigir al perfil del cliente después de borrar el empeño
        req.flash('exito', 'Has eliminado el empeño correctamente.');
        res.redirect('/cliente-profile/' + cliente);

    } catch (error) {
        // Establecer mensaje de error
        req.flash('error', 'No se ha podido eliminar el empeño, inténtalo de nuevo.');

        if (cliente) {
            // Si cliente está definido, redirige al perfil del cliente
            res.redirect('/cliente-profile/' + cliente);
        } else {
            // Si cliente no está definido, redirige a alguna ruta predeterminada o página de error
            res.redirect('/cliente-profile/' + cliente); 
        }

        console.error("Error al borrar el empeño y datos relacionados:", error);
        next(error);
    }
};







function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Enero es 0!
    const year = date.getFullYear().toString().substr(-2); // Obtiene solo los últimos 2 dígitos

    return `${day}/${month}/${year}`;
}


//EMPEÑO PROFILE
exports.getEmpenoProfile = async (req, res, next) => {
    try {
        const boleta = req.params.boleta;
        
        // Recuperar la información pertinente del empeño usando el número de boleta
        const empenoDetails = await Empeno.getDetailsByBoleta(boleta);
        const empenoValue = await Empeno.getEmpenoValue(boleta);
        const estado = await Empeno.getEstadoByBoleta(boleta);

        //OBTENER DATOS DEL CLIENTE POR LA BOLETA
        const cliente = await Empeno.getCedulaByBoleta(boleta);
        const clientedata = await Cliente.findByCedula(cliente);
        
        //OBTENER LAS JOYAS
        const joyas = await Joya.getJoyasEmpeno(boleta) || [];
        joyas.forEach(joya => {
            joya.fecha_pago = moment(joya.fecha_pago).format('DD/MM/YY');
            joya.fecha_registrada = moment(joya.fecha_registrada).format('DD/MM/YY');
        });

        //OBTENER PAGOS
        const pagos = await Pago.getPagosByBoleta(boleta) || [];
        pagos.forEach(pago => {
            pago.fecha_pago = moment(pago.fecha_pago).format('DD/MM/YY');
            pago.fecha_registrada = moment(pago.fecha_registrada).format('DD/MM/YY');
        });

        // Formatea la fecha
        empenoDetails.fecha_ingreso = moment(empenoDetails.fecha_ingreso).format('DD/MM/YY');
        
        // Formatear formato de números
        function formatNumberWithSpaces(num) {
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        }
        
        res.render('empeno-profile', {
            empeno: empenoDetails,
            value: empenoValue,
            estado: estado,
            cliente: clientedata,
            joyas: joyas,
            pagos: pagos,
            pageTitle: 'Perfil del Empeño',
            role: req.session.role,
            formatNumber: formatNumberWithSpaces
        });
    } catch (error) {
        console.log(error);
        next(error);
    }
};



