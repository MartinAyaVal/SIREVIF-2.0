const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const sequelize = require('../db/config.js');
const Usuario = require('../models/usuarios.js')(sequelize);

dotenv.config();
const SECRET = process.env.JWT_SECRET;

const loginUsuario = async (req, res) => {
    try {
        // 🐛 DEBUG: Ver qué llega al servidor
        console.log("=".repeat(50));
        console.log("📥 REQ.BODY completo:", req.body);
        console.log("📥 REQ.BODY stringified:", JSON.stringify(req.body, null, 2));
        console.log("📥 Headers:", req.headers);
        console.log("📥 Content-Type:", req.headers['content-type']);
        console.log("📥 Método:", req.method);
        console.log("📥 URL:", req.url);
        
        // IMPORTANTE: Express necesita body-parser para JSON
        // Si req.body está vacío, necesitas configurar middleware
        
        // Verificar si req.body está definido
        if (!req.body) {
            console.log("❌ ERROR: req.body está undefined o vacío");
            return res.status(400).json({ 
                error: "Datos no recibidos",
                message: "El cuerpo de la petición está vacío"
            });
        }
        
        // CORRECCIÓN: Usar "contrasena" (sin ñ) que es lo que envía el frontend
        const { documento, contrasena } = req.body;
        
        // 🐛 DEBUG: Ver valores individuales
        console.log("📥 Documento recibido:", documento);
        console.log("📥 Contraseña recibida:", contrasena);
        console.log("📥 Tipo de documento:", typeof documento);
        console.log("📥 Documento es null/undefined?", documento == null);
        console.log("📥 Contraseña es null/undefined?", contrasena == null);
        console.log("=".repeat(50));

        // Validar campos
        if (!documento || !contrasena) {
            console.log("❌ ERROR: Datos incompletos según validación");
            console.log("   documento:", documento);
            console.log("   contraseña:", contrasena);
            console.log("   documento falsy?", !documento);
            console.log("   contraseña falsy?", !contrasena);
            return res.status(400).json({ 
                error: "Datos incompletos",
                message: "Se requiere documento y contraseña"
            });
        }

        // Buscar usuario
        console.log("🔍 Buscando usuario con documento:", documento);
        const usuario = await Usuario.findOne({
            where: { 
                documento: documento.toString()
            }
        });

        if (!usuario) {
            console.log("❌ Usuario no encontrado para documento:", documento);
            return res.status(404).json({ 
                error: "Usuario no encontrado",
                message: "El documento no está registrado"
            });
        }

        console.log("✅ Usuario encontrado:", usuario.documento, "-", usuario.nombre);

        // Verificar si el usuario está activo
        if (usuario.estado === 'inactivo') {
            console.log("❌ Usuario inactivo:", usuario.documento);
            return res.status(403).json({ 
                error: "Usuario inactivo",
                message:`Tu cuenta está deshabilitada en este momento.
                        Contacta al administrador.`
            });
        }

        // Verificar contraseña
        console.log("🔐 Verificando contraseña...");
        const valid = await usuario.validarContraseña(contrasena);
        
        if (!valid) {
            console.log("❌ Contraseña incorrecta para usuario:", usuario.documento);
            return res.status(401).json({ 
                error: "Credenciales inválidas",
                message: "Contraseña incorrecta"
            });
        }

        console.log("✅ Contraseña válida");

        // Crear token JWT
        const token = jwt.sign(
            { 
                id: usuario.id,
                documento: usuario.documento,
                rolId: usuario.rolId 
            },
            SECRET,
            { expiresIn: '8h' }
        );

        console.log("✅ Login exitoso para:", usuario.documento);
        console.log("✅ Token generado");
        
        // Incluir estado en la respuesta
        res.json({
            success: true,
            message: "Login exitoso",
            token: token,
            usuario: { 
                id: usuario.id,
                documento: usuario.documento, 
                nombre: usuario.nombre,
                correo: usuario.correo,
                telefono: usuario.telefono,
                cargo: usuario.cargo,
                comisaria_rol: usuario.comisaria_rol,
                rolId: usuario.rolId,
                estado: usuario.estado
            }
        });
    } catch (error) {
        console.error("🔥 ERROR en loginUsuario:", error);
        console.error("🔥 Stack trace:", error.stack);
        res.status(500).json({ 
            error: "Error interno del servidor",
            message: error.message 
        });
    }
};  

module.exports = {
    loginUsuario
};