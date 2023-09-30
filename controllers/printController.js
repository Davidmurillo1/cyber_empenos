const puppeteer = require('puppeteer');
const moment = require('moment');
const { Buffer } = require('buffer');
const Empeno = require('../models/Empenos');
const Sucursal = require('../models/Sucursal');
const Joya = require('../models/Joyas');
const Cliente = require('../models/Clientes');
const Pago = require('../models/Pagos');


exports.getEmpenoPrint = async (req, res, next) => {
    try {
        const boleta = req.params.boleta;
        const empeno = await Empeno.getDetailsByBoleta(boleta);
        const cliente = await Cliente.findByCedula(empeno.cedula_cliente_empeno);
        const sucursal_id = req.session.sucursalId;
        const sucursal = await Sucursal.getSucursalNameById(sucursal_id);
        const logoBuffer = await Sucursal.obtenerLogoPorId(sucursal_id);
        const logoBase64 = logoBuffer.toString('base64');
        const valor = await Empeno.getEmpenoValue(boleta);
        const joyas = await Joya.getJoyasEmpeno(boleta);
        const userName = req.session.user.nombre;



        if (!empeno) {
            return res.status(404).send('Empeno no encontrado');
        }

        const htmlContent = `
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,opsz,wght@0,6..12,400;0,6..12,500;1,6..12,400&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
                body {
                    font-family: 'Nunito Sans', sans-serif; 
                    font-size: 18px;
                    margin: 0;
                    padding: 0;
                    width: 76mm;
                }
                .logo {
                    text-align: center;
                    margin-bottom:25px;
                }
                .empeno-details, .cliente-details, .joyas-list {
                    margin-bottom: 10px;
                    padding: 0 5px;
                }
                h1 {
                    font-size: 26px;
                    margin-top: 0;
                }
                li {
                    margin-bottom: 5px;
                }
                p, div {
                    margin: 0;
                    padding: 0;
                }
                .joyas-list {
                    display: block;
                }
                .footer {
                    text-align: center;
                    padding-top: 5px;
                }
            </style>
        </head>
        <body>
            <div class="logo">
                <img src="data:image/png;base64,${logoBase64}" width="155" />
            </div>
            <div class="empeno-details">
                <h1>Empeño #${empeno.boleta_empeno}</h1>
                <p>Boleta #: ${empeno.boleta_empeno}</p>
                <p>Fecha: ${moment(empeno.fecha_ingreso).format('DD/MM/YY')}</p>
                <p>Valor Total: ${valor}</p>
            </div>
            <div class="cliente-details">
                <p>Cliente: ${cliente.nombre_cliente}</p>
                <p>Cédula: ${cliente.cedula_cliente}</p>
                <p>Teléfono: ${cliente.telefono_cliente}</p>
            </div>
            <div class="joyas-list">
                <p>Lista de Joyas:</p>
                <ul>
                    ${joyas.map((joya, index) => `
                        <li>${index + 1}. ${joya.joya} - ${joya.descripcion} - ${joya.material} - ${joya.kilates} - Peso: ${joya.peso}g - Valor: ${joya.valor}</li>
                    `).join('')}
                </ul>

            </div>
            <div class="footer">
                <p>Atiende: ${userName}</p>
                <p>¡Estamos para servirle!</p>
            </div>
        </body>
        </html>
        `;

        const browser = await puppeteer.launch({ headless: 'new' });;
        const page = await browser.newPage();

        await page.setViewport({
            width: Math.round(76 * 2.83),  // Redondea el valor a un entero
            height: Math.round(1 * 2.83),  // Redondea el valor a un entero
        });

        await page.setContent(htmlContent);

        const contentHeight = await page.evaluate(() => document.body.scrollHeight);

        const pdf = await page.pdf({
            width: '76mm',
            height: `${(contentHeight / 2.83).toFixed(2)}mm`,
            printBackground: true,
            margin: {top: '1mm', right: '7mm', bottom: '5mm', left: '7mm'}
        });

        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename=recibo-de-empeno.pdf');
        res.send(pdf);

    } catch (error) {
        console.error(error);
        res.status(500).send('Error al generar el recibo');
    }
};

exports.getPagosPrint = async (req, res, next) => {
    try {
        const pagoId = req.params.id;
        const pago = await Pago.getPagoById(pagoId);
        const boleta = await pago.boleta;
        const empeno = await Empeno.getDetailsByBoleta(boleta);
        const cliente = await Cliente.findByCedula(empeno.cedula_cliente_empeno);
        const pagos = await Pago.getPagosByBoleta(boleta);
        const sucursal_id = req.session.sucursalId;
        const logoBuffer = await Sucursal.obtenerLogoPorId(sucursal_id);
        const sucursal = await Sucursal.getSucursalNameById(sucursal_id);
        const logo = await Sucursal.obtenerLogoPorId(sucursal_id);
        const logoBase64 = logoBuffer.toString('base64');
        const userName = req.session.user.nombre;
        const valor = await Empeno.getEmpenoValue(boleta);

        if (!pago) {
            return res.status(404).send('Pago no encontrado');
        }

        const htmlContent = `
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,opsz,wght@0,6..12,400;0,6..12,500;1,6..12,400&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
                body {
                    font-family: 'Nunito Sans', sans-serif; 
                    font-size: 18px;
                    margin: 0;
                    padding: 0;
                    width: 76mm;
                }
                .logo {
                    text-align: center;
                    margin-bottom:25px;
                }
                .empeno-details, .clientes-details, .pagos-details {
                    margin-bottom: 10px;
                    padding: 0 5px;
                }
                h1 {
                    font-size: 26px;
                    margin-top: 0;
                }
                li {
                    margin-bottom: 5px;
                }
                p, div {
                    margin: 0;
                    padding: 0;
                }
                .joyas-list {
                    display: block;
                }
                .footer {
                    text-align: center;
                    padding-top: 5px;
                }
            </style>
        </head>
        <body>
            <div class="logo">
                <img src="data:image/png;base64,${logoBase64}" width="155" />
            </div>
            <div class="empeno-details">
                <h1> Pago Empeño #${empeno.boleta_empeno}</h1>
                <p>Fecha: ${moment(empeno.fecha_ingreso).format('DD/MM/YY')}</p>
                <p>Valor Total: ¢${valor}</p>
            </div>
            <div class="clientes-details">
                <p>Cliente: ${cliente.nombre_cliente}</p>
                <p>Cédula: ${cliente.cedula_cliente}</p>
                <p>Teléfono: ${cliente.telefono_cliente}</p>
            </div>
            <div class="pagos-details">
                <p>Tipo: ${pago.tipo_pago}</p>
                <p>Mes Pagado: ${moment(pago.fecha_pago).format('DD/MM/YY')}</p>
                <p>Monto: ¢${pago.monto_pago}</p>
            </div>
            <div class="footer">
                <p>Atiende: ${userName}</p>
                <p>¡Estamos para servirle!</p>
            </div>
        </body>
        </html>
        `;

        const browser = await puppeteer.launch({ headless: 'new' });;
        const page = await browser.newPage();

        await page.setViewport({
            width: Math.round(76 * 2.83),  // Redondea el valor a un entero
            height: Math.round(1 * 2.83),  // Redondea el valor a un entero
        });

        await page.setContent(htmlContent);

        const contentHeight = await page.evaluate(() => document.body.scrollHeight);

        const pdf = await page.pdf({
            width: '76mm',
            height: `${(contentHeight / 2.83).toFixed(2)}mm`,
            printBackground: true,
            margin: {top: '1mm', right: '7mm', bottom: '5mm', left: '7mm'}
        });

        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename=recibo-de-empeno.pdf');
        res.send(pdf);

    } catch (error) {
        console.error(error);
        res.status(500).send('Error al generar el recibo');
    }
};

// exports.getPagosPrint = async (req, res, next) => {
//     try {
//         const pagoId = req.params.id;
//         const pago = await Pago.getPagoById(pagoId);
//         const sucursal_id = req.session.sucursalId;
//         const sucursal = await Sucursal.getSucursalNameById(sucursal_id);
//         const logo = await Sucursal.obtenerLogoPorId(sucursal_id);

//         if (!pago) {
//             return res.status(404).send('Pago no encontrado');
//         }

//         const fontSize = 8; // Tamaño de fuente reducido
//         const lineHeight = fontSize * 1.5; // Altura de línea basada en el tamaño de fuente
//         const lines = 20; // Número aproximado de líneas, ajustar según el contenido real
//         const heightInPoints = lines * lineHeight + marginInPoints * 2; // Alto calculado basado en el número de líneas y márgenes

//         const doc = new PDFDocument({
//             size: [widthInPoints, heightInPoints], // Se ajusta el alto y ancho
//             margin: marginInPoints // Se ajusta el margen
//         });

//         const logoWidth = 80; // Ancho del logo ajustado
//         const x = (widthInPoints - logoWidth) / 2;

//         const logoBase64 = `data:image/png;base64,${Buffer.from(logo).toString('base64')}`;
//         doc.image(logoBase64, x, marginInPoints, { width: logoWidth }) // Se ajusta la posición y tamaño del logo
//             .moveDown(0.5)
//             .fontSize(fontSize) // Se ajusta el tamaño de fuente
//             .text(`Empeño: Recibo de Pago`, { align: 'center' })
//             .text(moment(pago.fecha_registrada).format('DD/MM/YY'), { align: 'right' })
//             .moveDown();

//         doc.moveTo(marginInPoints, doc.y)
//             .lineTo(widthInPoints - marginInPoints, doc.y)
//             .stroke();

//         doc.moveDown()
//             .text(`ID del Pago: ${pago.id}`)
//             .moveDown(0.5)
//             .text(`Boleta del Empeño: ${pago.boleta}`)
//             .moveDown(0.5)
//             .text(`Tipo de Pago: ${pago.tipo_pago}`)
//             .moveDown(0.5)
//             .text(`Mes Pago: ${moment(pago.fecha_pago).format('DD/MM/YY')}`)
//             .moveDown(0.5)
//             .text(`Monto del Pago: ¢${pago.monto_pago}`)
//             .moveDown();

//         doc.moveTo(marginInPoints, doc.y)
//             .lineTo(widthInPoints - marginInPoints, doc.y)
//             .stroke();

//         doc.moveDown()
//             .text('Gracias por su pago!', { align: 'center' })
//             .moveDown();

//         const buffers = [];
//         doc.on('data', buffers.push.bind(buffers));
//         doc.on('end', () => {
//             const pdfData = Buffer.concat(buffers);
//             res.setHeader('Content-Type', 'application/pdf');
//             res.setHeader('Content-Disposition', 'inline; filename=recibo-de-pago-empeno.pdf');
//             res.send(pdfData);
//         });

//         doc.end();
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Error al generar el recibo');
//     }
// };
