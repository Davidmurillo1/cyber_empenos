const db = require('./db');

module.exports = class Clientes {
    constructor(cedula_cliente, nombre_cliente, telefono_cliente) {
        this.cedula_cliente = cedula_cliente;
        this.nombre_cliente = nombre_cliente;
        this.telefono_cliente = telefono_cliente;
    }

    async save(sucursalId) {
        // Verificar si el cliente ya existe en la tabla general
        const [existingCliente] = await db.execute('SELECT * FROM cliente WHERE cedula_cliente = ?', [this.cedula_cliente]);

        if (existingCliente.length === 0) {
            await db.execute('INSERT INTO cliente (cedula_cliente, nombre_cliente, telefono_cliente) VALUES (?, ?, ?)', [this.cedula_cliente, this.nombre_cliente, this.telefono_cliente]);
        }

        // Verificar si el cliente ya está registrado en la sucursal específica
        const [existingClienteInSucursal] = await db.execute('SELECT * FROM clientes_sucursales WHERE cedula_cliente = ? AND sucursal_id = ?', [this.cedula_cliente, sucursalId]);

        if (existingClienteInSucursal.length === 0) {
            await db.execute('INSERT INTO clientes_sucursales (cedula_cliente, sucursal_id) VALUES (?, ?)', [this.cedula_cliente, sucursalId]);
        }
    }

    static async getAllBySucursal(sucursalId, limit = 20, offset = 0) {
        const [rows] = await db.execute(`
            SELECT cliente.cedula_cliente, cliente.nombre_cliente, cliente.telefono_cliente 
            FROM cliente 
            JOIN clientes_sucursales ON cliente.cedula_cliente = clientes_sucursales.cedula_cliente 
            WHERE clientes_sucursales.sucursal_id = ?
            ORDER BY cliente.fecha_registro DESC
            LIMIT ? OFFSET ?
        `, [sucursalId, limit, offset]);
        return rows;
    }
    
    
    

    //EDITAR CLIENTES
    async edit(sucursalId) {
        // Editar cliente en la tabla general
        await db.execute('UPDATE cliente SET nombre_cliente = ?, telefono_cliente = ? WHERE cedula_cliente = ?', [this.nombre_cliente, this.telefono_cliente, this.cedula_cliente]);

        // Aquí, no hay necesidad de editar la tabla "clientes_sucursales" ya que sólo contiene relaciones, no datos del cliente en sí.
    }

    static async findByCedula(cedula) {
        const [rows] = await db.execute('SELECT * FROM cliente WHERE cedula_cliente = ?', [cedula]);
        if (rows.length === 0) {
            return null;
        }
        return rows[0];
    }

    //BUSCAR CLIENTES
    static async getTotalClientes(sucursalId) {
        const [rows] = await db.execute(`
            SELECT COUNT(*) as total 
            FROM cliente 
            JOIN clientes_sucursales 
            ON cliente.cedula_cliente = clientes_sucursales.cedula_cliente 
            WHERE clientes_sucursales.sucursal_id = ?
        `, [sucursalId]);
        return rows[0].total;
    }
    
    static async search(term, sucursalId, limit = 20, offset = 0) {
        const [rows] = await db.execute(`
            SELECT cliente.cedula_cliente, cliente.nombre_cliente, cliente.telefono_cliente 
            FROM cliente 
            JOIN clientes_sucursales ON cliente.cedula_cliente = clientes_sucursales.cedula_cliente 
            WHERE (cliente.nombre_cliente LIKE ? OR cliente.cedula_cliente LIKE ?) AND clientes_sucursales.sucursal_id = ?
            LIMIT ? OFFSET ?
        `, [`%${term}%`, `%${term}%`, sucursalId, limit, offset]);
        return rows;
    }
    
    

    static async getTotalClientesFiltered(term, sucursalId) {
        const [rows] = await db.execute(`
            SELECT COUNT(*) as total 
            FROM cliente 
            JOIN clientes_sucursales 
            ON cliente.cedula_cliente = clientes_sucursales.cedula_cliente 
            WHERE cliente.nombre_cliente LIKE ? AND clientes_sucursales.sucursal_id = ?
        `, [`%${term}%`, sucursalId]);
        return rows[0].total;
    }

    //BORRAR CLIENTES SI NO TIENE EMPEÑOS
    static async hasEmpenosInSucursal(cedula, sucursalId) {
        try {
            const [rows] = await db.execute(`
                SELECT COUNT(*) as total 
                FROM empenos
                WHERE cedula_cliente_empeno = ? AND sucursal_id = ?
            `, [cedula, sucursalId]);
            return rows[0].total > 0;
        } catch (error) {
            console.log("Error:", error);
            throw error;
        }
    }
    
    static async deleteFromSucursal(cedula, sucursalId) {
        try {
            await db.execute('DELETE FROM clientes_sucursales WHERE cedula_cliente = ? AND sucursal_id = ?', [cedula, sucursalId]);
        } catch (error) {
            console.log("Error:", error);
            throw error;
        }
    }
    
    


}







