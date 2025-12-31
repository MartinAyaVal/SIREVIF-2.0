const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const sequelize = require('../db/config.js');
const Usuario = require('../models/usuarios.js')(sequelize);
const bcrypt = require('bcryptjs');

dotenv.config();
const SECRET = process.env.JWT_SECRET || 'secreto_por_defecto_cambiar_en_produccion';

const loginUsuario = async (req, res) => {
    try {
        console.log("=".repeat(60));
        console.log("🔐 INICIO DE LOGIN");
        console.log("=".repeat(60));
        
        // DEBUG: Verificar request
        console.log("📥 REQ.BODY:", req.body);
        
        if (!req.body) {
            return res.status(400).json({ 
                success: false,
                message: "No se recibieron datos"
            });
        }
        
        // Obtener datos
        const { documento, contrasena, contraseña } = req.body;
        const password = contrasena || contraseña;
        
        console.log("📊 Datos recibidos:");
        console.log("  • Documento:", documento);
        console.log("  • Contraseña:", password ? "***" + password.substring(password.length - 3) : "NO");
        
        // Validaciones
        if (!documento) {
            return res.status(400).json({ 
                success: false,
                message: "Documento requerido"
            });
        }
        
        if (!password) {
            return res.status(400).json({ 
                success: false,
                message: "Contraseña requerida"
            });
        }
        
        const docString = documento.toString().trim();
        console.log("🔍 Buscando usuario:", docString);
        
        // Buscar usuario
        const usuario = await Usuario.findOne({
            where: { documento: docString }
        });

        if (!usuario) {
            console.log("❌ Usuario no encontrado");
            return res.status(404).json({ 
                success: false,
                message: "El usuario no se encuentra registrado"
            });
        }

        console.log("✅ Usuario encontrado:");
        console.log("  • ID:", usuario.id);
        console.log("  • Nombre:", usuario.nombre);
        console.log("  • Estado:", usuario.estado);
        console.log("  • Tiene contraseña:", usuario.contraseña ? "SÍ" : "NO");

        // Verificar estado
        if (usuario.estado === 'inactivo') {
            return res.status(403).json({ 
                success: false,
                message: "Tu usuario se encuentra inhabilitado. Contacta al administrador."
            });
        }

        // Verificar contraseña
        console.log("🔐 Verificando contraseña...");
        
        if (!usuario.contraseña) {
            console.log("⚠️  Usuario sin contraseña en BD");
            return res.status(401).json({ 
                success: false,
                message: "Contraseña no configurada"
            });
        }
        
        // ⭐⭐ COMPARACIÓN ÚNICA DE CONTRASEÑA ⭐⭐
        const passwordValid = await bcrypt.compare(password, usuario.contraseña);
        console.log("  • Resultado bcrypt.compare:", passwordValid ? "✅ VÁLIDA" : "❌ INVÁLIDA");
        
        if (!passwordValid) {
            console.log("❌ Contraseña incorrecta");
            return res.status(401).json({ 
                success: false,
                message: "Contraseña incorrecta"
            });
        }

        console.log("✅ Autenticación exitosa");
        
        // Crear token
        const tokenData = {
            id: usuario.id,
            documento: usuario.documento,
            rolId: usuario.rolId || 1,
            nombre: usuario.nombre || 'Usuario',
            comisariaId: usuario.comisariaId || 0
        };
        
        const token = jwt.sign(tokenData, SECRET, { expiresIn: '8h' });
        console.log("✅ Token JWT generado");

        // Respuesta
        const responseData = {
            success: true,
            message: "Login exitoso",
            token: token,
            usuario: {
                id: usuario.id,
                documento: usuario.documento,
                nombre: usuario.nombre,
                correo: usuario.correo || "",
                telefono: usuario.telefono || "",
                cargo: usuario.cargo || "",
                comisaria_rol: usuario.comisaria_rol || "",
                rolId: usuario.rolId || 1,
                comisariaId: usuario.comisariaId || 0,
                estado: usuario.estado
            }
        };
        
        console.log("📤 Enviando respuesta exitosa");
        console.log("=".repeat(60));
        
        res.json(responseData);
        
    } catch (error) {
        console.error("🔥 ERROR en loginUsuario:", error.message);
        
        res.status(500).json({ 
            success: false,
            message: "Error interno del servidor",
            error: error.message
        });
    }
};  

module.exports = {
    loginUsuario
};