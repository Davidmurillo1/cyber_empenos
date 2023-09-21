const db = require('./db');
const bcrypt = require('bcryptjs');
const Sucursal = require('../models/Sucursal.js');

class User {
    constructor(id, username, password, role, nombre) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.role = role;
        this.nombre = nombre;
    }

    async comparePassword(candidatePassword) {
        return await bcrypt.compare(candidatePassword, this.password);
    }

    static async findByUsername(username) {
        const [rows] = await db.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (rows.length === 0) {
            return null;
        }

        const user = rows[0];
        return new User(user.id, user.username, user.password, user.role, user.nombre);
    }

    static async getSucursalesByUserId(userId) {
        const [sucursalIds] = await db.execute(
            'SELECT sucursal_id FROM usuario_sucursal WHERE usuario_id = ?',
            [userId]
        );
    
        const sucursales = [];
        for (let entry of sucursalIds) {
            const sucursalName = await Sucursal.getSucursalNameById(entry.sucursal_id);
            if (sucursalName) {
                sucursales.push({ id: entry.sucursal_id, nombre: sucursalName });
            }
        }
    
        console.log(`Sucursales para el usuario ${userId}:`, sucursales); // Agregamos un log aquí
    
        return sucursales;
    }
    

    static async create(username, password, role, nombre) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [result] = await db.execute(
            'INSERT INTO users (username, password, role, nombre) VALUES (?, ?, ?, ?)',
            [username, hashedPassword, role, nombre]
        );

        return result.insertId;
    }

    static async associateWithSucursal(userId, sucursalId) {
        await db.execute(
            'INSERT INTO usuario_sucursal (usuario_id, sucursal_id) VALUES (?, ?)',
            [userId, sucursalId]
        );
    }

    static async getAllWithSucursales() {
        const [users] = await db.execute('SELECT * FROM users');

        for (let user of users) {
            user.sucursales = await this.getSucursalesByUserId(user.id);
        }

        return users;
    }

    static async getSucursalesforUsersByUserId(userId) {
        const [rows] = await db.execute(
            'SELECT s.id, s.nombre FROM sucursales s JOIN usuario_sucursal us ON s.id = us.sucursal_id WHERE us.usuario_id = ?',
            [userId]
        );

        return rows;
    }
    
}

module.exports = User;






