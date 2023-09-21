// models/Pagos.js
const db = require('./db');

class Pago {
    constructor(boleta, fecha_pago, fecha_registrada, tipo_pago, monto_pago) {
        this.boleta = boleta;
        this.fecha_pago = fecha_pago;
        this.fecha_registrada = fecha_registrada;
        this.tipo_pago = tipo_pago;
        this.monto_pago = monto_pago;
    }

    async save() {
        try {
            const result = await db.execute(
                'INSERT INTO pagos (boleta, fecha_pago, fecha_registrada, tipo_pago, monto_pago) VALUES (?, ?, ?, ?, ?)',
                [this.boleta, this.fecha_pago, this.fecha_registrada, this.tipo_pago, this.monto_pago]
            );
            return result;
        } catch (error) {
            console.log("Error:", error);
            throw error;
        }
    }

    // Método para verificar si existe un retiro para una boleta específica
    static async hasRetiro(boleta) {
        try {
            const [rows, fields] = await db.execute('SELECT * FROM pagos WHERE boleta = ? AND tipo_pago = "Retiro"', [boleta]);
            return rows.length > 0; // devuelve true si hay un retiro, false de lo contrario
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    // Método para obtener la fecha del último pago de una boleta específica
    static async getLastPaymentDate(boleta) {
        try {
            const [rows, fields] = await db.execute('SELECT fecha_pago FROM pagos WHERE boleta = ? ORDER BY fecha_pago DESC LIMIT 1', [boleta]);
            if (rows.length > 0) {
                return new Date(rows[0].fecha_pago); // devuelve la fecha del último pago
            }
            return null; // si no hay pagos, devuelve null
        } catch (error) {
            console.log(error);
            throw error;
        }
    }


    static async getPagosByBoleta(boleta) {
        try {
            const [rows] = await db.execute(
                `SELECT * FROM pagos WHERE boleta = ?`,  // Cambia "boleta_empeno" si tu columna tiene otro nombre
                [boleta]
            );
            return rows;
        } catch (error) {
            console.log("Error al obtener los pagos para la boleta:", error);
            throw error;
        }
    }

    static async getPagoById(pagoId) {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM `pagos` WHERE id = ?',
                [pagoId]
            );
            return rows[0]; // Devuelve la joya específica
        } catch (error) {
            console.error("Error al obtener el pago:", error);
            throw error;
        }
    }

    async updatePago(pagoId) {
        try {
            const result = await db.execute(
                'UPDATE pagos SET boleta = ?, fecha_pago = ?, fecha_registrada = ?, tipo_pago = ?, monto_pago = ? WHERE id = ?',
                [this.boleta, this.fecha_pago, this.fecha_registrada, this.tipo_pago, this.monto_pago, pagoId]
            );
            return result;
        } catch (error) {
            console.log("Error:", error);
            throw error;
        }
    }
    

    static async deletePagoById(pagoId) {
        try {
            const result = await db.execute(
                'DELETE FROM pagos WHERE id = ?',
                [pagoId]
            );
            return result;
        } catch (error) {
            console.log("Error al eliminar el pago:", error);
            throw error;
        }
    }




    

}



module.exports = Pago;
