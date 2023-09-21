const Clientes = require('../models/Clientes');
const Empeno = require('../models/Empenos');
const Pago = require('../models/Pagos');
const moment = require('moment');



exports.getAllClientes = async (req, res, next) => {
    try {
        const sucursalId = req.session.sucursalId;
        const term = req.query.search || "";  // Si hay un término de búsqueda en la URL, úsalo. Si no, usa una cadena vacía.
        const page = +req.query.page || 1;  // Esto convierte la página en un número y usa 1 si no está definido.
        const LIMIT = 20;
        const OFFSET = (page - 1) * LIMIT;

        let clientes;
        if (term) {
            // Si hay un término de búsqueda, busca clientes basados en ese término.
            clientes = await Clientes.search(term, sucursalId, LIMIT, OFFSET);
        } else {
            // Si no hay un término de búsqueda, obtén todos los clientes.
            clientes = await Clientes.getAllBySucursal(sucursalId, LIMIT, OFFSET);
        }

        let totalClientes;
        if (term) {
            totalClientes = await Clientes.getTotalClientesFiltered(term, sucursalId);
        } else {
            totalClientes = await Clientes.getTotalClientes(sucursalId);
        }

        // Aquí añadimos la lógica para obtener la cantidad de empeños para cada cliente
        for (let cliente of clientes) {
            cliente.empenosCount = await Empeno.getEmpenosCountByClienteSucursal(cliente.cedula_cliente, sucursalId);
        }

        const totalPages = Math.ceil(totalClientes / LIMIT);

        res.render('clientes', { 
            clientes: clientes, 
            pageTitle: 'Clientes', 
            role: req.session.user.role, 
            currentPage: page,
            totalPages: totalPages,
            search: term  // Esto te permite mantener el término de búsqueda en el input después de que se haya realizado la búsqueda.
        });

    } catch (error) {
        console.error("Error al obtener clientes:", error);
        res.status(500).send("Error al obtener clientes");
    }
};



exports.getAddCliente = (req, res, next) => {
    res.render('addCliente', { pageTitle: 'Agregar Cliente',role: req.session.user.role });
};

exports.postAddCliente = async (req, res, next) => {
    try {
        const { cedula_cliente, nombre_cliente, telefono_cliente } = req.body;
        const cliente = new Clientes(cedula_cliente, nombre_cliente, telefono_cliente);
        await cliente.save(req.session.sucursalId);
        res.redirect('/clientes');
    } catch (error) {
        console.error("Error al agregar cliente:", error);
        res.status(500).send("Error al agregar cliente");
    }
};

//EDITAR CLIENTE
exports.getEditCliente = async (req, res, next) => {
    const cedula_cliente = req.params.cedula_cliente;
    try {
        const cliente = await Clientes.findByCedula(cedula_cliente);
        if (!cliente) {
            return res.redirect('/clientes');
        }
        res.render('editCliente', { pageTitle: 'Editar Cliente', cliente: cliente, role: req.session.user.role });
    } catch (error) {
        console.error("Error al obtener cliente para editar:", error);
        next(error);  // Esto es una buena práctica para manejar errores en Express.
    }
};
exports.postEditCliente = async (req, res, next) => {
    try {
        const oldCedula = req.params.cedula_cliente; // Obtiene la cédula original del parámetro de la URL
        const { cedula_cliente, nombre_cliente, telefono_cliente } = req.body;
        const cliente = new Clientes(cedula_cliente, nombre_cliente, telefono_cliente);
        await cliente.edit(req.session.sucursalId, oldCedula); // Pasa la cédula original como argumento
        res.redirect('/clientes');
    } catch (error) {
        console.error("Error al editar cliente:", error);
        res.status(500).send("Error al editar cliente");
    }
};

//ELIMINARCLIENTE
exports.getDeleteCliente = async (req, res, next) => {
    const cedula_cliente = req.params.cedula_cliente;
    try {
        const cliente = await Clientes.findByCedula(cedula_cliente);
        if (!cliente) {
            return res.redirect('/clientes');
        }
        res.render('deleteCliente', { pageTitle: 'Eliminar Cliente', cliente: cliente, role: req.session.user.role });
    } catch (error) {
        console.error("Error al obtener cliente para editar:", error);
        next(error);  // Esto es una buena práctica para manejar errores en Express.
    }
};
exports.deleteClienteFromSucursal = async (req, res, next) => {
    try {
        const cedula = req.body.cedula_cliente;
        const sucursalId = req.session.sucursalId;  // Asume que tienes el ID de la sucursal en la sesión.

        if (!(await Clientes.hasEmpenosInSucursal(cedula, sucursalId))) {
            await Clientes.deleteFromSucursal(cedula, sucursalId);
            req.flash('exito', 'Se ha eliminado el cliente correctamente');
            res.redirect('/clientes');
        } else {
            // Si el cliente tiene empeños en esta sucursal.
            req.flash('error', 'Error al eliminar al cliente, revisa que no tenga algún empeño registrado.');
            res.redirect('/clientes');
        }
    } catch (error) {
        console.error("Error al intentar eliminar al cliente de la sucursal:", error);
        next(error);
    }
};





//CLIENTE PROFILE
exports.getClienteProfile = async (req, res, next) => {
    try {
        const cedula = req.params.cedula;
        
        // Obtener la información del cliente basada en la cédula
        const cliente = await Clientes.findByCedula(cedula);
        
        // Obtener todos los empeños asociados a esa cédula
        const empenos = await Empeno.getAllByClienteCedula(cedula);

        const twoMonthsAgo = moment().subtract(2, 'months');

        // Añadir la lógica de estado y valor a cada empeño
        for (let empeno of empenos) {
            const empenoDate = moment(empeno.fecha_ingreso);

            // Usando moment para comparar fechas
            if (empenoDate.isAfter(twoMonthsAgo)) {
                empeno.estado = "Al día";
            } else if (await Pago.hasRetiro(empeno.boleta_empeno)) {
                empeno.estado = "Retirado";
            } else {
                const lastPaymentDate = await Pago.getLastPaymentDate(empeno.boleta_empeno);
                if (lastPaymentDate && moment(lastPaymentDate).isAfter(twoMonthsAgo)) {
                    empeno.estado = "Al día";
                } else {
                    empeno.estado = "Atrasado";
                }
            }

            // Obtener el valor total de cada empeño
            empeno.valor_total = await Empeno.getEmpenoValue(empeno.boleta_empeno);

            // Formatear las fechas de los empeños
            empeno.fecha_ingreso = empenoDate.format('DD-MM-YYYY');

            
            
        }

        // Formatear formato de números
        function formatNumberWithSpaces(num) {
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        }
        res.render('cliente-profile', {
            cliente: cliente,
            empenos: empenos,
            pageTitle: 'Perfil del Cliente',
            role: req.session.user.role,
            formatNumber: formatNumberWithSpaces
        });
    } catch (error) {
        console.log(error);
        next(error);
    }
};






