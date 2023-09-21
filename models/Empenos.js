// models/Empenos.js
const db = require('./db');
const Pago = require('./Pagos');


class Empeno {
    constructor(boleta, cedula, fechaIngreso, fechaRegistro, sucursalId) {
        this.boleta = boleta;
        this.cedula = cedula;
        this.fechaIngreso = fechaIngreso;
        this.fechaRegistro = fechaRegistro;
        this.sucursalId = sucursalId;
    }

    static async getAllBySucursal(sucursalId, limit = 20, offset = 0) {
        try {
            const [rows] = await db.execute(
                `SELECT empenos.*, cliente.nombre_cliente AS cliente_nombre
                 FROM empenos
                 JOIN cliente ON empenos.cedula_cliente_empeno = cliente.cedula_cliente
                 WHERE empenos.sucursal_id = ?
                 ORDER BY empenos.fecha_registro DESC
                 LIMIT ? OFFSET ?`,
                [sucursalId, limit, offset]
            );
            return rows;
        } catch (error) {
            console.log("Error:", error);
            throw error;
        }
    }
    
    static async getTotalEmpenos(sucursalId) {
        try {
            const [rows] = await db.execute(
                `SELECT COUNT(*) as total
                 FROM empenos
                 WHERE empenos.sucursal_id = ?`,
                [sucursalId]
            );
            return rows[0].total;
        } catch (error) {
            console.log("Error:", error);
            throw error;
        }
    }

    static async search(term, sucursalId, limit = 20, offset = 0) {
        try {
            const searchWildcard = `%${term}%`;
            const [rows] = await db.execute(
                `SELECT empenos.*, cliente.nombre_cliente AS cliente_nombre
                 FROM empenos
                 JOIN cliente ON empenos.cedula_cliente_empeno = cliente.cedula_cliente
                 WHERE empenos.sucursal_id = ? AND (empenos.boleta_empeno LIKE ? OR empenos.cedula_cliente_empeno LIKE ? OR cliente.nombre_cliente LIKE ?)
                 ORDER BY empenos.fecha_registro DESC
                 LIMIT ? OFFSET ?`,
                [sucursalId, searchWildcard, searchWildcard, searchWildcard, limit, offset]
            );
            return rows;
        } catch (error) {
            console.log("Error:", error);
            throw error;
        }
    }
    
    static async getTotalEmpenosFiltered(term, sucursalId) {
        try {
            const searchWildcard = `%${term}%`;
            const [rows] = await db.execute(
                `SELECT COUNT(*) as total
                 FROM empenos
                 JOIN cliente ON empenos.cedula_cliente_empeno = cliente.cedula_cliente
                 WHERE empenos.sucursal_id = ? AND (empenos.boleta_empeno LIKE ? OR empenos.cedula_cliente_empeno LIKE ? OR cliente.nombre_cliente LIKE ?)`,
                [sucursalId, searchWildcard, searchWildcard, searchWildcard]
            );
            return rows[0].total;
        } catch (error) {
            console.log("Error:", error);
            throw error;
        }
    }


    //AÑADIR EMPEÑOS
    async save() {
        try {
            const result = await db.execute(
                'INSERT INTO empenos (boleta_empeno, cedula_cliente_empeno, fecha_ingreso, fecha_registro, sucursal_id) VALUES (?, ?, ?, ?, ?)',
                [this.boleta, this.cedula, this.fechaIngreso, this.fechaRegistro, this.sucursalId]
            );
            return result;
        } catch (error) {
            console.log("Error:", error);
            throw error;
        }
    }

    //CLIENTE PROFILE
    static async getAllByClienteCedula(cedula) {
        try {
            const [rows] = await db.execute(
                `SELECT * FROM empenos WHERE cedula_cliente_empeno = ?`,
                [cedula]
            );
            return rows;
        } catch (error) {
            console.log("Error:", error);
            throw error;
        }
    }

    static async getCedulaByBoleta(boleta) {
        try {
            const [rows, fields] = await db.execute('SELECT cedula_cliente_empeno FROM empenos WHERE boleta_empeno = ?', [boleta]);
            if (rows.length === 0) {
                return null;
            }
            return rows[0].cedula_cliente_empeno;
        } catch (error) {
            throw error;
        }
    }
    static async getIdByBoleta(boleta) {
        try {
            const [rows, fields] = await db.execute('SELECT id FROM empenos WHERE boleta_empeno = ?', [boleta]);
            if (rows.length === 0) {
                return null;
            }
            return rows[0].id;
        } catch (error) {
            throw error;
        }
    }
    static async getEmpenoValue(boleta) {
        try {
            const [rows] = await db.execute(
                `SELECT SUM(valor) AS total 
                 FROM joyas 
                 WHERE boleta = ?`,
                [boleta]
            );
            return rows[0].total || 0;  // Retorna 0 si no hay valor (por ejemplo, si no hay joyas asociadas al empeño).
        } catch (error) {
            console.error("Error al obtener el valor total del empeño:", error);
            throw error;
        }
    }

    static async getEmpenosCountByClienteSucursal(cedula, sucursalId) {
        try {
            const [rows] = await db.execute(`
                SELECT COUNT(*) as total 
                FROM empenos
                WHERE cedula_cliente_empeno = ? AND sucursal_id = ?
            `, [cedula, sucursalId]);
            return rows[0].total;
        } catch (error) {
            console.log("Error:", error);
            throw error;
        }
    }


    //EMPENO PROFILE
    static async getDetailsByBoleta(boleta) {
        try {
            const [rows] = await db.execute(
                `SELECT * FROM empenos WHERE boleta_empeno = ?`,
                [boleta]
            );
            if (rows.length === 0) {
                return null;
            }
            return rows[0];
        } catch (error) {
            console.error("Error al obtener detalles del empeño:", error);
            throw error;
        }
    }

    static async getEstadoByBoleta(boleta) {
        try {
            // Primero verifica si el empeño ha sido retirado
            if (await Pago.hasRetiro(boleta)) {
                return "Retirado";
            }

            // Obtiene la fecha de ingreso y la última fecha de pago para ese empeño
            const [rows] = await db.execute('SELECT fecha_ingreso FROM empenos WHERE boleta_empeno = ?', [boleta]);
            
            if (rows.length === 0) {
                throw new Error("Empeño no encontrado");
            }
            
            const fechaIngreso = new Date(rows[0].fecha_ingreso);
            const lastPaymentDate = await Pago.getLastPaymentDate(boleta);
            const twoMonthsAgo = new Date();
            twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

            // Lógica para determinar el estado basado en la fecha de ingreso y la última fecha de pago
            if (fechaIngreso > twoMonthsAgo) {
                return "Al día";
            } else if (lastPaymentDate && lastPaymentDate > twoMonthsAgo) {
                return "Al día";
            } else {
                return "Atrasado";
            }

        } catch (error) {
            console.error("Error al obtener el estado del empeño:", error);
            throw error;
        }
    }


    //EDITAR EMPEÑOS
    async editEmpeno() {
        try {
            const result = await db.execute(
                `UPDATE empenos 
                 SET boleta_empeno = ?, 
                     fecha_ingreso = ?, 
                     fecha_registro = ? 
                 WHERE boleta_empeno = ?`,
                [this.boleta, this.fechaIngreso, this.fechaRegistro, this.boleta]
            );
            return result;
        } catch (error) {
            console.log("Error al editar el empeño:", error);
            throw error;
        }
    }

    //ELIMINAR EMPEÑOS
    static async deleteByBoleta(boleta) {
        const connection = await db.getConnection();
        try {
            // Comenzamos una transacción. Es importante asegurarse de que todas las operaciones sean exitosas antes de finalizar la transacción.
            await connection.beginTransaction();

            // 1. Elimina las joyas asociadas al empeño
            await connection.execute(
                `DELETE FROM joyas WHERE boleta = ?`,
                [boleta]
            );

            // 2. Elimina los pagos asociados al empeño
            await connection.execute(
                `DELETE FROM pagos WHERE boleta = ?`,
                [boleta]
            );

            // 3. Ahora que las joyas y pagos han sido eliminados, elimina el empeño
            const result = await connection.execute(
                `DELETE FROM empenos WHERE boleta_empeno = ?`,
                [boleta]
            );

            // Si todo salió bien, confirma la transacción
            await connection.commit();

            return result;
        } catch (error) {
            // Si algo sale mal, revierte la transacción
            await connection.rollback();
            console.error("Error al eliminar el empeño:", error);
            throw error;
        } finally {
            connection.release();
        }
    }


    
    
    
    

    
    

    
    
}



module.exports = Empeno;
