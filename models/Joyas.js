// models/Joyas.js
const db = require('./db');

class Joya {
    constructor(boleta, joya, descripcion, material, kilates, peso, valor) {
        this.boleta = boleta;
        this.joya = joya;
        this.descripcion = descripcion;
        this.material = material;
        this.kilates = kilates;
        this.peso = peso;
        this.valor = valor;
    }

    async save() {
        try {
            const result = await db.execute(
                'INSERT INTO joyas (boleta, joya, descripcion, material, kilates, peso, valor) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [this.boleta, this.joya, this.descripcion, this.material, this.kilates, this.peso, this.valor]
            );
            return result;
        } catch (error) {
            console.log("Error:", error);
            throw error;
        }
    }

    static async getTotalValueByBoleta(boleta) {
        try {
            const [rows] = await db.execute(
                'SELECT SUM(valor) as totalValue FROM joyas WHERE boleta = ?',
                [boleta]
            );
            return rows[0].totalValue;
        } catch (error) {
            console.error("Error al obtener el valor total de las joyas:", error);
            throw error;
        }
    }

    static async getJoyasEmpeno(boleta) {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM `joyas` WHERE boleta = ?',
                [boleta]
            );
            return rows; // Devuelve todas las joyas
        } catch (error) {
            console.error("Error al obtener las joyas:", error);
            throw error;
        }
    }

    static async getById(joyaId) {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM `joyas` WHERE id = ?',
                [joyaId]
            );
            return rows[0]; // Devuelve la joya específica
        } catch (error) {
            console.error("Error al obtener la joya:", error);
            throw error;
        }
    }

    async update(joyaId) {
        try {
            const result = await db.execute(
                'UPDATE joyas SET boleta = ?, joya = ?, descripcion = ?, material = ?, kilates = ?, peso = ?, valor = ? WHERE id = ?',
                [this.boleta, this.joya, this.descripcion, this.material, this.kilates, this.peso, this.valor, joyaId]
            );
            return result;
        } catch (error) {
            console.log("Error:", error);
            throw error;
        }
    }

    static async deleteById(joyaId) {
        try {
            const result = await db.execute(
                'DELETE FROM joyas WHERE id = ?',
                [joyaId]
            );
            return result;
        } catch (error) {
            console.log("Error al eliminar la joya:", error);
            throw error;
        }
    }

    
    
    
}


module.exports = Joya;
