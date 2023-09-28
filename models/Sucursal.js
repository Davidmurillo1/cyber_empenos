const db = require('./db');

class Sucursal {
    static async getAll() {
        try {
            const [rows] = await db.query('SELECT * FROM sucursales');
            return rows;  // Esto debería ser un array de sucursales
        } catch (error) {
            console.log("Error:", error);
            throw error;
        }
    }
    

    static async getSucursalNameById(sucursal_id) {
        const [rows] = await db.execute('SELECT nombre FROM sucursales WHERE id = ?', [sucursal_id]);
        if (rows.length > 0) {
            return rows[0].nombre;
        }
        return null;
    }

    static async obtenerLogoPorId(sucursal_id) {
        const [rows] = await db.execute('SELECT logo FROM sucursales WHERE id = ?', [sucursal_id]);
        if (rows.length > 0) {
            return rows[0].logo;
        }
        return null;
    }
    // ... (otros métodos que puedas necesitar en el futuro, como create, delete, update, etc.)
}

module.exports = Sucursal;
