const sequelize = require('../db/config.js');
const Usuario = require('../models/usuarios.js')(sequelize);
const bcrypt = require('bcryptjs');

// Obtener todos los usuarios registrados
exports.getusuario = async (req, res) => {
    try {
        const usuarios = await Usuario.findAll({
            attributes: { exclude: ['contraseña'] }
        });
        
        res.json({
            success: true,
            message: "Usuarios obtenidos correctamente",
            data: usuarios,
            count: usuarios.length
        });
        
        console.log(`✅ Usuarios enviados: ${usuarios.length}`);
    } catch (error) {
        console.error('❌ Error al obtener usuarios:', error);
        res.status(500).json({ 
            success: false,
            message: "Error al obtener usuarios", 
            error: error.message
        });
    }
};

// Crear usuario - HASH AQUÍ SOLAMENTE
exports.createusuario = async (req, res) => {
    try {
        console.log("=".repeat(60));
        console.log("🆕 CREANDO USUARIO - HASH ÚNICO");
        console.log("=".repeat(60));
        
        console.log("📥 REQ.BODY COMPLETO:", req.body);
        
        const { 
            nombre, 
            documento, 
            cargo,
            correo, 
            telefono, 
            // Obtener contraseña de cualquier campo posible
            contrasena,
            contraseña,
            comisaria_rol, 
            rolId,
            comisariaId
        } = req.body;

        // Validar campos requeridos
        if (!nombre || !documento || !cargo || !correo || !telefono || !comisaria_rol) {
            return res.status(400).json({ 
                success: false,
                message: 'Todos los campos son requeridos' 
            });
        }

        // Obtener la contraseña (aceptar ambos nombres)
        const passwordRaw = contrasena || contraseña;
        
        console.log("🔐 Contraseña recibida:", passwordRaw ? `"${passwordRaw}" (${passwordRaw.length} chars)` : "NO RECIBIDA");
        
        if (!passwordRaw) {
            return res.status(400).json({ 
                success: false,
                message: 'La contraseña es requerida' 
            });
        }

        let comisariaIdFinal = comisariaId;
        
        if (comisariaIdFinal === undefined || comisariaIdFinal === null) {
            console.log("⚠️ comisariaId no recibido, calculando desde comisaria_rol...");
            
            const mapeoComisarias = {
                'Administrador': 0,
                'Comisaría Primera': 1,
                'Comisaría Segunda': 2,
                'Comisaría Tercera': 3,
                'Comisaría Cuarta': 4,
                'Comisaría Quinta': 5,
                'Comisaría Sexta': 6
            };
            
            comisariaIdFinal = mapeoComisarias[comisaria_rol] || 0;
            console.log(`✅ comisariaId calculado: ${comisariaIdFinal} para "${comisaria_rol}"`);
        }
        
        comisariaIdFinal = parseInt(comisariaIdFinal) || 0;

        // ⭐⭐ HASH DE CONTRASEÑA - UNA SOLA VEZ ⭐⭐
        console.log("🔐 Generando hash de contraseña...");
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(passwordRaw, saltRounds);
        console.log(`✅ Hash generado: ${hashedPassword.substring(0, 30)}...`);

        // IMPORTANTE: Guardar documento como STRING
        const documentoString = documento.toString();
        console.log(`📝 Documento a guardar: ${documentoString}`);

        // Crear usuario
        const usuario = await Usuario.create({
            nombre: nombre,
            documento: documentoString,
            cargo: cargo,
            correo: correo,
            telefono: telefono,
            contraseña: hashedPassword,  // Hash ya generado
            comisaria_rol: comisaria_rol,
            rolId: parseInt(rolId) || 1,
            comisariaId: comisariaIdFinal
        });

        const usuarioResponse = usuario.toJSON();
        delete usuarioResponse.contraseña;

        console.log(`✅ Usuario creado exitosamente: ${usuario.nombre}`);
        console.log("=".repeat(60));

        res.status(201).json({
            success: true,
            message: "Usuario creado exitosamente",
            data: usuarioResponse
        });
        
    } catch(error) {
        console.log('❌ Error al crear usuario:', error.message);
        console.log('❌ Errores de validación:', error.errors);
        res.status(500).json({ 
            success: false,
            message: 'Error al crear usuario',
            error: error.message,
            details: error.errors ? error.errors.map(err => ({ 
                campo: err.path, 
                mensaje: err.message 
            })) : []
        });
    }
};

// Obtener usuario por Id
exports.getusuariosById = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await Usuario.findByPk(id);
        if (!usuario) return res.status(404).json({ 
            success: false,
            message: 'Usuario no encontrado'
        });
        
        const usuarioResponse = usuario.toJSON();
        delete usuarioResponse.contraseña;
        
        res.json({
            success: true,
            data: usuarioResponse
        });
    } catch(error) {
        res.status(500).json({ 
            success: false,
            message: 'Error al encontrar usuario', 
            error: error.message
        });
    }
}

// Actualizar usuario por Id
exports.updateusuario = async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log("\n" + "=".repeat(60));
        console.log(`🛠️  ACTUALIZANDO USUARIO ID: ${id}`);
        console.log("=".repeat(60));
        
        console.log("📥 REQ.BODY:", req.body);
        
        const usuario = await Usuario.findByPk(id);
        if(!usuario) {
            return res.status(404).json({ 
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Obtener contraseña de cualquier campo
        const password = req.body.contrasena || req.body.contraseña;

        if (!req.body.nombre || !req.body.documento || !req.body.cargo || !req.body.correo || !req.body.telefono) {
            return res.status(400).json({ 
                success: false,
                message: 'Faltan campos requeridos' 
            });
        }

        // Procesar comisariaId
        let comisariaIdFinal = req.body.comisariaId;
        
        if (comisariaIdFinal === undefined || comisariaIdFinal === null || comisariaIdFinal === '') {
            const mapeoComisarias = {
                'Administrador': 0,
                'Comisaría 1': 1, 'Comisaría Primera': 1,
                'Comisaría 2': 2, 'Comisaría Segunda': 2,
                'Comisaría 3': 3, 'Comisaría Tercera': 3,
                'Comisaría 4': 4, 'Comisaría Cuarta': 4,
                'Comisaría 5': 5, 'Comisaría Quinta': 5,
                'Comisaría 6': 6, 'Comisaría Sexta': 6
            };
            
            if (req.body.comisaria_rol && mapeoComisarias[req.body.comisaria_rol] !== undefined) {
                comisariaIdFinal = mapeoComisarias[req.body.comisaria_rol];
            } else {
                comisariaIdFinal = usuario.comisariaId;
            }
        }
        
        comisariaIdFinal = parseInt(comisariaIdFinal) || 0;

        // Datos a actualizar
        const updateData = {
            nombre: req.body.nombre.trim(),
            documento: req.body.documento.toString(),
            cargo: req.body.cargo.trim(),
            correo: req.body.correo.trim(),
            telefono: req.body.telefono.trim(),
            comisaria_rol: (req.body.comisaria_rol || usuario.comisaria_rol).trim(),
            rolId: parseInt(req.body.rolId) || usuario.rolId || 1,
            comisariaId: comisariaIdFinal
        };

        // Si hay nueva contraseña, hashearla
        if (password && password.trim() !== '') {
            console.log("🔐 Actualizando contraseña...");
            const saltRounds = 10;
            updateData.contraseña = await bcrypt.hash(password.trim(), saltRounds);
        }

        await usuario.update(updateData);
        
        console.log(`✅ Usuario actualizado correctamente`);
        console.log("=".repeat(60));

        const usuarioResponse = usuario.toJSON();
        delete usuarioResponse.contraseña;

        res.json({
            success: true,
            message: "Usuario actualizado correctamente",
            data: usuarioResponse
        });
        
    } catch (error) {
        console.error('❌ ERROR en updateusuario:', error.message);
        
        res.status(500).json({ 
            success: false,
            message: 'Error al actualizar usuario', 
            error: error.message
        });
    }
};

// Eliminar usuario por Id
exports.deleteusuario = async (req, res) => {
    try{
        const { id } = req.params;
        const usuario = await Usuario.findByPk(id);
        if(!usuario) return res.status(404).json({ 
            success: false,
            message: 'Usuario no encontrado'
        });

        await usuario.destroy();
        res.json({ 
            success: true,
            message: 'Usuario eliminado correctamente'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error al eliminar usuario', 
            error: error.message
        });
    }
}

// Cambiar estado del usuario
exports.cambiarEstadoUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;
        
        const usuario = await Usuario.findByPk(id);
        if (!usuario) return res.status(404).json({ 
            success: false,
            message: 'Usuario no encontrado' 
        });
        
        if (!['activo', 'inactivo'].includes(estado)) {
            return res.status(400).json({ 
                success: false,
                message: 'Estado inválido. Use "activo" o "inactivo"' 
            });
        }
        
        await usuario.update({ estado });
        
        const usuarioResponse = usuario.toJSON();
        delete usuarioResponse.contraseña;
        
        res.json({
            success: true,
            message: "Estado actualizado",
            data: usuarioResponse
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error al cambiar estado del usuario', 
            error: error.message
        });
    }
};