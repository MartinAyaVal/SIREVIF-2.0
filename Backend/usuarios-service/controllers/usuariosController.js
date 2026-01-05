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

// Crear usuario - CON ASIGNACIÓN CORRECTA DE ROL_ID Y COMISARIA_ID
exports.createusuario = async (req, res) => {
    try {
        console.log("=".repeat(60));
        console.log("🆕 CREANDO USUARIO - ASIGNACIÓN DE ROLES CORRECTA");
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
            comisaria_rol
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

        // ===== ASIGNACIÓN CORRECTA DE ROL_ID Y COMISARIA_ID =====
        console.log("🎯 Asignando rol_id y comisaria_id según comisaria_rol:", comisaria_rol);
        
        // Mapeo de comisaria_rol a rol_id y comisaria_id
        const mapeoRoles = {
            'Administrador': { rolId: 1, comisariaId: null },
            'Comisaría Primera': { rolId: 2, comisariaId: 1 },
            'Comisaría Segunda': { rolId: 2, comisariaId: 2 },
            'Comisaría Tercera': { rolId: 2, comisariaId: 3 },
            'Comisaría Cuarta': { rolId: 2, comisariaId: 4 },
            'Comisaría Quinta': { rolId: 2, comisariaId: 5 },
            'Comisaría Sexta': { rolId: 2, comisariaId: 6 }
        };
        
        const configRol = mapeoRoles[comisaria_rol];
        
        if (!configRol) {
            console.log(`❌ comisaria_rol no reconocido: "${comisaria_rol}"`);
            return res.status(400).json({ 
                success: false,
                message: `Comisaría/rol no válido: ${comisaria_rol}` 
            });
        }
        
        const rolIdFinal = configRol.rolId;
        const comisariaIdFinal = configRol.comisariaId;
        
        console.log(`✅ Configuración asignada: rolId=${rolIdFinal}, comisariaId=${comisariaIdFinal} para "${comisaria_rol}"`);

        // ⭐⭐ HASH DE CONTRASEÑA - UNA SOLA VEZ ⭐⭐
        console.log("🔐 Generando hash de contraseña...");
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(passwordRaw, saltRounds);
        console.log(`✅ Hash generado: ${hashedPassword.substring(0, 30)}...`);

        // IMPORTANTE: Guardar documento como STRING
        const documentoString = documento.toString();
        console.log(`📝 Documento a guardar: ${documentoString}`);

        // Crear usuario con valores CORRECTOS
        const usuario = await Usuario.create({
            nombre: nombre,
            documento: documentoString,
            cargo: cargo,
            correo: correo,
            telefono: telefono,
            contraseña: hashedPassword,  // Hash ya generado
            comisaria_rol: comisaria_rol,
            rolId: rolIdFinal,  // ← VALOR CORRECTO según comisaria_rol
            comisariaId: comisariaIdFinal  // ← VALOR CORRECTO según comisaria_rol
        });

        const usuarioResponse = usuario.toJSON();
        delete usuarioResponse.contraseña;

        console.log(`✅ Usuario creado exitosamente: ${usuario.nombre}`);
        console.log(`📊 Datos guardados: rolId=${usuario.rolId}, comisariaId=${usuario.comisariaId}`);
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

// Actualizar usuario por Id - ACEPTA ACTUALIZACIONES PARCIALES
exports.updateusuario = async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log("\n" + "=".repeat(60));
        console.log(`🛠️  ACTUALIZANDO USUARIO ID: ${id}`);
        console.log("=".repeat(60));
        
        console.log("📥 REQ.BODY (parcial):", req.body);
        
        const usuario = await Usuario.findByPk(id);
        if(!usuario) {
            return res.status(404).json({ 
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Obtener contraseña de cualquier campo
        const password = req.body.contrasena || req.body.contraseña;

        // ===== ACEPTAR ACTUALIZACIONES PARCIALES =====
        // Solo actualizar campos que vienen en el request
        
        const updateData = {};
        
        // Campos que pueden actualizarse
        if (req.body.nombre !== undefined) updateData.nombre = req.body.nombre.trim();
        if (req.body.documento !== undefined) updateData.documento = req.body.documento.toString();
        if (req.body.cargo !== undefined) updateData.cargo = req.body.cargo.trim();
        if (req.body.correo !== undefined) updateData.correo = req.body.correo.trim();
        if (req.body.telefono !== undefined) updateData.telefono = req.body.telefono.trim();
        if (req.body.comisaria_rol !== undefined) {
            updateData.comisaria_rol = req.body.comisaria_rol.trim();
            
            // Asignar rol_id y comisaria_id según comisaria_rol
            const mapeoRoles = {
                'Administrador': { rolId: 1, comisariaId: null },
                'Comisaría Primera': { rolId: 2, comisariaId: 1 },
                'Comisaría Segunda': { rolId: 2, comisariaId: 2 },
                'Comisaría Tercera': { rolId: 2, comisariaId: 3 },
                'Comisaría Cuarta': { rolId: 2, comisariaId: 4 },
                'Comisaría Quinta': { rolId: 2, comisariaId: 5 },
                'Comisaría Sexta': { rolId: 2, comisariaId: 6 }
            };
            
            const configRol = mapeoRoles[req.body.comisaria_rol];
            if (configRol) {
                updateData.rolId = configRol.rolId;
                updateData.comisariaId = configRol.comisariaId;
            }
        }

        // Si hay nueva contraseña, hashearla
        if (password && password.trim() !== '') {
            console.log("🔐 Actualizando contraseña...");
            const saltRounds = 10;
            updateData.contraseña = await bcrypt.hash(password.trim(), saltRounds);
        }

        // Verificar que haya algo que actualizar
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No se proporcionaron datos para actualizar'
            });
        }

        console.log("🔄 Campos a actualizar:", updateData);
        
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
        
        // Mejor mensaje de error
        let mensajeError = 'Error al actualizar usuario';
        if (error.name === 'SequelizeValidationError') {
            mensajeError = 'Error de validación: ' + error.errors.map(err => err.message).join(', ');
        } else if (error.name === 'SequelizeUniqueConstraintError') {
            mensajeError = 'El correo o documento ya están registrados';
        }
        
        res.status(500).json({ 
            success: false,
            message: mensajeError, 
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