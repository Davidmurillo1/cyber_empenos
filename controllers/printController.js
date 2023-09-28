const PDFDocument = require('pdfkit');
const moment = require('moment');
const { Buffer } = require('buffer');
const Pago = require('../models/Pagos');
const Sucursal = require('../models/Sucursal');

const mmToPoints = (mm) => mm * 2.83465;
const widthInPoints = mmToPoints(76);

exports.getPagosPrint = async (req, res, next) => {
    try {
        const pagoId = req.params.id;
        const pago = await Pago.getPagoById(pagoId);
        const sucursal_id = req.session.sucursalId;
        const sucursal = await Sucursal.getSucursalNameById(sucursal_id);
        const logo = await Sucursal.obtenerLogoPorId(sucursal_id);

        if (!pago) {
            return res.status(404).send('Pago no encontrado');
        }

        const doc = new PDFDocument({
            size: [widthInPoints, Infinity], // Altura inicial infinita
            margin: 10
        });

        const logoBase64 = `data:image/png;base64,${Buffer.from(logo).toString('base64')}`;
        const logoWidth = 60;
        const x = (widthInPoints - logoWidth) / 2;

        doc.image(logoBase64, x, 15, { width: logoWidth })
            .moveDown(2)
            .fontSize(12)
            .text(`Empeño: Recibo de Pago`, { align: 'center' })
            .fontSize(8)
            .text(moment(pago.fecha_registrada).format('DD/MM/YY'), { align: 'right' })
            .moveDown(0.5);

        doc.moveTo(10, doc.y)
            .lineTo(widthInPoints - 10, doc.y)
            .stroke();

        doc.moveDown(0.5)
            .fontSize(12)
            .text(`ID del Pago: ${pago.id}`)
            .moveDown(0.5)
            .text(`Boleta del Empeño: ${pago.boleta}`)
            .moveDown(0.5)
            .text(`Tipo de Pago: ${pago.tipo_pago}`)
            .moveDown(0.5)
            .text(`Mes Pago: ${moment(pago.fecha_pago).format('DD/MM/YY')}`)
            .moveDown(0.5)
            .text(`Monto del Pago: ¢${pago.monto_pago}`)
            .moveDown(0.5);

        doc.moveTo(10, doc.y)
            .lineTo(widthInPoints - 10, doc.y)
            .stroke();

        doc.moveDown(0.5)
            .fontSize(8)
            .text('Gracias por su pago!', { align: 'center' });

        // Calcula la altura final del documento basándote en la posición y del último elemento añadido
        const heightInPoints = doc.y + 10; // Añade un margen inferior de 10 puntos

        // Ajusta la altura del documento
        doc.addPage({
            size: [widthInPoints, heightInPoints]
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename=recibo-de-pago-empeno.pdf');

        doc.pipe(res);
        doc.end();
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al generar el recibo');
    }
};



exports.getEmpenoPrint = async (req, res, next) => {
    try {
        const boleta = req.params.boleta;
        const empeno = await Pago.getDetailsByBoleta(boleta);
        const cedula = empeno.cedula_cliente_empeno;
        const cliente = await Empeno.getAllByClienteCedula(cedula);
        const sucursal_id = req.session.sucursalId;
        const sucursal = await Sucursal.getSucursalNameById(sucursal_id);
        const logo = await Sucursal.obtenerLogoPorId(sucursal_id);
        const valor = await Empeno.getEmpenoValue(boleta);
        const joyas = await Joyas.getJoyasEmpeno(boleta);

        if (!empeno) {
            return res.status(404).send('Empeno no encontrado');
        }

        const doc = new PDFDocument({
            size: [widthInPoints, Infinity], // Altura inicial infinita
            margin: 10
        });

        const logoBase64 = `data:image/png;base64,${Buffer.from(logo).toString('base64')}`;
        const logoWidth = 60; // Ancho del logo
        const x = (widthInPoints - logoWidth) / 2; // Calcula la posición x para centrar el logo

        // Encabezado
        doc.image(logoBase64, x, 15, { width: logoWidth }) // Usa la posición x calculada para centrar el logo
            .moveDown(2)
            .fontSize(12)
           .text(`Datos del Empeño`, { align: 'center' })
           .fontSize(8)
           .text(moment(empeno.fecha_registro).format('DD/MM/YY'), { align: 'right' })
           .moveDown(0.5);

        // Línea divisoria
        doc.moveTo(10, doc.y)
           .lineTo(widthInPoints - 10, doc.y)
           .stroke();

         // Detalles del Cliente
         doc.moveDown(0.5)
         .fontSize(12)
         .text(`Cliente: ${cliente.nombre_cliente}`)
         .moveDown(0.5)
         .text(`Cédula: ${cliente.cedula_cliente}`)
         .moveDown(0.5)
         .text(`Teléfono: ${cliente.telefono_cliente}`)
         .moveDown(0.5)

        
        // Línea divisoria
        doc.moveTo(10, doc.y)
           .lineTo(widthInPoints - 10, doc.y)
           .stroke();

        // Detalles del Empeno
        doc.moveDown(0.5)
           .fontSize(12)
           .text(`Empeno #: ${empeno.id}`)
           .moveDown(0.5)
           .text(`Boleta del Empeño: ${empeno.boleta_empeno}`)
           .moveDown(0.5)
           .text(`Fecha: ${empeno.fecha_ingreso}.format('DD/MM/YY')}`)
           .moveDown(0.5)
           .text(`Valor Total: ${valor}`)
           .moveDown(0.5)
           .text(`Monto del Pago: ¢${pago.monto_pago}`)
           .moveDown(0.5);

        // Línea divisoria
        doc.moveTo(10, doc.y)
           .lineTo(widthInPoints - 10, doc.y)
           .stroke();

        // Detalles de la joya
        doc.moveDown(0.5)
           .fontSize(10)
           .text('Lista de Joyas:', { underline: true });
        
        joyas.forEach((joya, index) => {
            doc.text(`${index + 1}. ${joya.joya} - ${joya.descripcion} - ${joya.material} - ${joya.kilates} - ${joya.peso} - ${joya.valor}`, { indent: 10 });
            doc.moveDown(0.5);
        });


        //Firmas
        doc.moveDown(0.5)
            .fontSize(12)
            .text(`Atiende: ${cliente.nombre_cliente}`)

        // Pie de página
        doc.moveDown(0.5)
           .fontSize(8)
           .text('Gracias por su pago!', { align: 'center' })
        // Configurar la respuesta HTTP
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename=recibo-de-pago-empeno.pdf');

        // Finalizar el documento y enviarlo en la respuesta
        doc.pipe(res);
        doc.end();
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al generar el recibo');
    }
};

