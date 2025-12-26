[file name]: authController.js
[file content begin]
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
        
        // DEPURACIÓN COMPLETA
        console.log("📥 REQ.BODY completo:", req.body);
        console.log("📥 Tipo de body:", typeof req.body);
        console.log("📥 Headers Content-Type:", req.headers['content-type']);
        
        if (!req.body) {
            console.log("❌ ERROR: req.body está undefined o vacío");
            return res.status(400).json({ 
                success: false,
                error: "Datos no recibidos",
                message: "El cuerpo de la petición está vacío"
            });
        }
        
        // Aceptar ambos nombres de campo (con y sin ñ)
        const { documento, contrasena, contraseña } = req.body;
        
        // Usar cualquiera de los dos campos
        const password = contrasena || contraseña;
        
        console.log("📥 Datos recibidos:");
        console.log("  • Documento:", documento, "(tipo:", typeof documento + ")");
        console.log("  • Contrasena (sin ñ):", contrasena ? "***" + contrasena.substring(contrasena.length - 3) : "NO RECIBIDO");
        console.log("  • Contraseña (con ñ):", contraseña ? "***" + contraseña.substring(contraseña.length - 3) : "NO RECIBIDO");
        console.log("  • Password a usar:", password ? "***" + password.substring(password.length - 3) : "NO HAY PASSWORD");
        
        // Validar campos requeridos
        if (!documento) {
            console.log("❌ ERROR: Documento no recibido");
            return res.status(400).json({ 
                success: false,
                error: "Documento requerido",
                message: "Por favor ingresa tu número de documento"
            });
        }
        
        if (!password) {
            console.log("❌ ERROR: Contraseña no recibida");
            return res.status(400).json({ 
                success: false,
                error: "Contraseña requerida",
                message: "Por favor ingresa tu contraseña"
            });
        }
        
        // Convertir documento a string para búsqueda (la BD lo guarda como string)
        const docString = documento.toString().trim();
        console.log("🔍 Buscando usuario con documento (como string):", docString);
        
        // Buscar usuario en la base de datos
        const usuario = await Usuario.findOne({
            where: { 
                documento: docString
            }
        });

        if (!usuario) {
            console.log("❌ ERROR: Usuario no encontrado en BD");
            console.log("   Documento buscado:", docString);
            
            // Verificar qué documentos existen en la BD
            const todosUsuarios = await Usuario.findAll({
                attributes: ['id', 'documento', 'nombre'],
                limit: 5
            });
            console.log("   Usuarios en BD:", todosUsuarios.map(u => ({id: u.id, doc: u.documento, nombre: u.nombre})));
            
            return res.status(404).json({ 
                success: false,
                error: "Usuario no encontrado",
                message: "El documento no está registrado en el sistema"
            });
        }

        console.log("✅ Usuario encontrado en BD:");
        console.log("   ID:", usuario.id);
        console.log("   Documento:", usuario.documento);
        console.log("   Nombre:", usuario.nombre);
        console.log("   Estado:", usuario.estado);
        console.log("   Contraseña en BD:", usuario.contraseña ? "Hash: ***" + usuario.contraseña.substring(usuario.contraseña.length - 5) : "NO TIENE CONTRASEÑA");
        console.log("   Longitud hash:", usuario.contraseña ? usuario.contraseña.length : 0);

        // Verificar si el usuario está activo
        if (usuario.estado === 'inactivo') {
            console.log("❌ ERROR: Usuario inactivo");
            return res.status(403).json({ 
                success: false,
                error: "Usuario inactivo",
                message: "Tu cuenta está deshabilitada. Contacta al administrador."
            });
        }

        // VERIFICACIÓN DE CONTRASEÑA - MÉTODO MEJORADO
        console.log("🔐 Verificando contraseña...");
        console.log("   Password recibida (longitud):", password.length);
        console.log("   Hash almacenado (longitud):", usuario.contraseña ? usuario.contraseña.length : 0);
        
        let valid = false;
        
        try {
            // Si el usuario no tiene contraseña en BD (caso especial para desarrollo)
            if (!usuario.contraseña || usuario.contraseña.trim() === '') {
                console.log("⚠️  ¡ATENCIÓN! El usuario no tiene contraseña en BD");
                console.log("   Creando contraseña automáticamente...");
                
                // Crear hash para este usuario
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);
                
                // Actualizar la contraseña en la BD
                await usuario.update({ contraseña: hashedPassword });
                console.log("✅ Contraseña creada y guardada en BD");
                
                valid = true;
            } else {
                // Usar el método del modelo si existe
                if (usuario.validarContraseña) {
                    console.log("   Usando método validarContraseña del modelo...");
                    valid = await usuario.validarContraseña(password);
                } else {
                    console.log("⚠️  Método validarContraseña no existe, usando bcrypt directamente...");
                    valid = await bcrypt.compare(password, usuario.contraseña);
                }
            }
            
        } catch (bcryptError) {
            console.error("❌ Error en verificación de contraseña:", bcryptError.message);
            valid = false;
        }
        
        console.log("🔐 Resultado de validación:", valid ? "✅ CONTRASEÑA VÁLIDA" : "❌ CONTRASEÑA INVÁLIDA");
        
        if (!valid) {
            console.log("❌ ERROR: Contraseña incorrecta");
            
            // Información adicional para debugging
            console.log("   Password recibida (primeros 10 chars):", password.substring(0, 10) + "...");
            console.log("   Hash en BD (primeros 20 chars):", usuario.contraseña ? usuario.contraseña.substring(0, 20) + "..." : "N/A");
            
            return res.status(401).json({ 
                success: false,
                error: "Credenciales inválidas",
                message: "Contraseña incorrecta. Verifica tus datos."
            });
        }

        console.log("✅ Autenticación exitosa");
        
        // Crear token JWT
        const tokenData = {
            id: usuario.id,
            documento: usuario.documento,
            rolId: usuario.rolId || 1,
            nombre: usuario.nombre || 'Usuario',
            comisariaId: usuario.comisariaId || 0
        };
        
        console.log("📝 Datos para token JWT:", tokenData);
        
        const token = jwt.sign(
            tokenData,
            SECRET,
            { expiresIn: '8h' }
        );

        console.log("✅ Token JWT generado (primeros 20 chars):", token.substring(0, 20) + "...");
        
        // Preparar respuesta
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
                estado: usuario.estado || 'activo'
            }
        };
        
        console.log("📤 Enviando respuesta exitosa");
        console.log("=".repeat(60));
        
        res.json(responseData);
        
    } catch (error) {
        console.error("🔥 ERROR CRÍTICO en loginUsuario:");
        console.error("   Mensaje:", error.message);
        console.error("   Stack:", error.stack);
        console.error("   Error completo:", error);
        console.log("=".repeat(60));
        
        res.status(500).json({ 
            success: false,
            error: "Error interno del servidor",
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
};  

module.exports = {
    loginUsuario
};
[file content end]