const sequelize = require('../db/config.js');
const Usuario = require('../models/usuarios.js')(sequelize);
const bcrypt = require('bcrypt');

// Obtener todos los usuarios registrados
exports.getusuario = async (req, res) => {
    try {
        const usuarios = await Usuario.findAll({
            attributes: { exclude: ['contraseña'] }  // No incluir contraseña
        });
        
        // DEVOLVER EN FORMATO ESPERADO POR FRONTEND
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

// Crear usuario
exports.createusuario = async (req, res) => {
    try {
        // DEPURACIÓN: Ver qué llega al backend
        console.log("=".repeat(60));
        console.log("📥 REQ.BODY COMPLETO:", req.body);
        console.log("📥 Campos recibidos:", Object.keys(req.body));
        console.log("📥 comisaria_rol:", req.body.comisaria_rol);
        console.log("📥 comisariaId:", req.body.comisariaId, "tipo:", typeof req.body.comisariaId);
        console.log("=".repeat(60));
        
        const { 
            nombre, 
            documento, 
            cargo,
            correo, 
            telefono, 
            contraseña, 
            comisaria_rol, 
            rolId,
            comisariaId  // <- IMPORTANTE: Extraer comisariaId
        } = req.body;

        // Validar campos requeridos
        if (!nombre || !documento || !cargo || !correo || !telefono || !comisaria_rol) {
            return res.status(400).json({ 
                message: 'Todos los campos son requeridos' 
            });
        }

        // Validar que la contraseña esté presente
        if (!contraseña) {
            return res.status(400).json({ 
                message: 'La contraseña es requerida' 
            });
        }

        // Validar comisariaId - si no viene, calcularlo
        let comisariaIdFinal = comisariaId;
        
        if (comisariaIdFinal === undefined || comisariaIdFinal === null) {
            console.log("⚠️ comisariaId no recibido, calculando desde comisaria_rol...");
            
            // Mapeo de comisaria_rol a comisariaId
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
        
        // Asegurar que comisariaIdFinal sea un número
        comisariaIdFinal = parseInt(comisariaIdFinal) || 0;
        console.log(`✅ comisariaId final (número): ${comisariaIdFinal}`);

        // Hashear la contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(contraseña, saltRounds);

        // Crear usuario con todos los campos
        const usuario = await Usuario.create({
            nombre: nombre,
            documento: parseInt(documento),
            cargo: cargo,
            correo: correo,
            telefono: telefono,
            contraseña: hashedPassword,
            comisaria_rol: comisaria_rol,
            rolId: parseInt(rolId) || 1,
            comisariaId: comisariaIdFinal  // <- Campo CRÍTICO
        });

        // Opcional: No devolver la contraseña en la respuesta
        const usuarioResponse = usuario.toJSON();
        delete usuarioResponse.contraseña;

        res.status(201).json(usuarioResponse);
    } catch(error) {
        console.log('❌ Error al crear usuario:', error.message);
        console.log('❌ Errores de validación:', error.errors);
        res.status(500).json({ 
            message: 'Error al crear usuario:', 
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
        if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado'});
        
        // Opcional: No devolver la contraseña en la respuesta
        const usuarioResponse = usuario.toJSON();
        delete usuarioResponse.contraseña;
        
        res.json(usuarioResponse);
    } catch(error) {
        res.status(500).json({ message: 'Error al encontrar usuario', error});
    }
}

// Actualizar usuario por Id
exports.updateusuario = async (req, res) => {
    try {
        const { id } = req.params;
        
        // ===== DEPURACIÓN MEJORADA (sin middleware) =====
        console.log("\n" + "=".repeat(70));
        console.log(`🛠️  ACTUALIZANDO USUARIO ID: ${id}`);
        console.log("=".repeat(70));
        console.log("📥 REQ.BODY RECIBIDO:");
        console.log(JSON.stringify(req.body, null, 2));
        
        console.log("\n🔍 VALORES ESPECÍFICOS:");
        console.log(`  • nombre: ${req.body.nombre}`);
        console.log(`  • documento: ${req.body.documento} (tipo: ${typeof req.body.documento})`);
        console.log(`  • cargo: ${req.body.cargo}`);
        console.log(`  • correo: ${req.body.correo}`);
        console.log(`  • telefono: ${req.body.telefono}`);
        console.log(`  • contrasena: ${req.body.contrasena || '(no enviada)'}`);
        console.log(`  • contraseña: ${req.body.contraseña || '(no enviada)'}`);
        console.log(`  • comisaria_rol: ${req.body.comisaria_rol}`);
        console.log(`  • rolId: ${req.body.rolId} (tipo: ${typeof req.body.rolId})`);
        console.log(`  • comisariaId: ${req.body.comisariaId} (tipo: ${typeof req.body.comisariaId})`);
        console.log("=".repeat(70) + "\n");
        // ===== FIN DEPURACIÓN =====
        
        const usuario = await Usuario.findByPk(id);
        if(!usuario) {
            return res.status(404).json({ 
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Extraer campos - aceptar ambos nombres para contraseña
        const password = req.body.contrasena || req.body.contraseña;

        // Validar campos requeridos
        if (!req.body.nombre || !req.body.documento || !req.body.cargo || !req.body.correo || !req.body.telefono) {
            return res.status(400).json({ 
                success: false,
                message: 'Faltan campos requeridos' 
            });
        }

        console.log("🔧 Procesando comisariaId...");
        
        // Manejar comisariaId
        let comisariaIdFinal = req.body.comisariaId;
        
        // Si NO viene comisariaId, calcularlo desde comisaria_rol
        if (comisariaIdFinal === undefined || comisariaIdFinal === null || comisariaIdFinal === '') {
            console.log("⚠️  No se recibió comisariaId, calculando...");
            
            // Mapeo de comisaria_rol a comisariaId
            const mapeoComisarias = {
                'Administrador': 0,
                'Comisaría 1': 1,
                'Comisaría 2': 2,
                'Comisaría 3': 3,
                'Comisaría 4': 4,
                'Comisaría 5': 5,
                'Comisaría 6': 6,
                'Comisaría Primera': 1,
                'Comisaría Segunda': 2,
                'Comisaría Tercera': 3,
                'Comisaría Cuarta': 4,
                'Comisaría Quinta': 5,
                'Comisaría Sexta': 6
            };
            
            if (req.body.comisaria_rol && mapeoComisarias[req.body.comisaria_rol] !== undefined) {
                comisariaIdFinal = mapeoComisarias[req.body.comisaria_rol];
                console.log(`✅ Calculado: comisariaId = ${comisariaIdFinal} para "${req.body.comisaria_rol}"`);
            } else {
                // Mantener el valor actual
                comisariaIdFinal = usuario.comisariaId;
                console.log(`✅ Manteniendo valor actual: comisariaId = ${comisariaIdFinal}`);
            }
        }
        
        // Convertir a número
        comisariaIdFinal = parseInt(comisariaIdFinal) || 0;
        console.log(`✅ comisariaId final: ${comisariaIdFinal}`);

        // Preparar datos para actualizar
        const updateData = {
            nombre: req.body.nombre.trim(),
            documento: parseInt(req.body.documento) || usuario.documento,
            cargo: req.body.cargo.trim(),
            correo: req.body.correo.trim(),
            telefono: req.body.telefono.trim(),
            comisaria_rol: (req.body.comisaria_rol || usuario.comisaria_rol).trim(),
            rolId: parseInt(req.body.rolId) || usuario.rolId || 1,
            comisariaId: comisariaIdFinal
        };

        console.log("📝 Datos a actualizar:");
        console.log(JSON.stringify(updateData, null, 2));

        // Solo actualizar contraseña si se proporciona una nueva
        if (password && password.trim() !== '') {
            console.log("🔐 Actualizando contraseña...");
            const saltRounds = 10;
            updateData.contraseña = await bcrypt.hash(password.trim(), saltRounds);
        } else {
            console.log("⚠️  No se cambió la contraseña");
        }

        // Realizar la actualización
        await usuario.update(updateData);
        
        console.log(`✅ Usuario ID ${id} actualizado correctamente`);
        console.log("=".repeat(70));

        // Preparar respuesta
        const usuarioResponse = usuario.toJSON();
        delete usuarioResponse.contraseña;

        res.json({
            success: true,
            message: "Usuario actualizado correctamente",
            data: usuarioResponse
        });
        
    } catch (error) {
        console.error('❌ ERROR en updateusuario:', error.message);
        console.error('❌ Stack trace:', error.stack);
        
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
        if(!usuario) return res.status(404).json({ message: 'Usuario no encontrado'});

        await usuario.destroy();
        res.json({ message: 'Usuario eliminado correctamente'})
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar usuario: ', error})
    }
}

// Función adicional para autenticación (si la necesitas)
exports.login = async (req, res) => {
    try {
        const { correo, contraseña } = req.body;

        // Buscar usuario por correo
        const usuario = await Usuario.findOne({ where: { correo } });
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Comparar contraseña hasheada
        const isPasswordValid = await bcrypt.compare(contraseña, usuario.contraseña);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        // Opcional: No devolver la contraseña en la respuesta
        const usuarioResponse = usuario.toJSON();
        delete usuarioResponse.contraseña;

        res.json({
            message: 'Login exitoso',
            usuario: usuarioResponse
        });
    } catch (error) {
        res.status(500).json({ message: 'Error en el login', error });
    }
};

// Cambiar estado del usuario
exports.cambiarEstadoUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;
        
        const usuario = await Usuario.findByPk(id);
        if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });
        
        // Validar estado
        if (!['activo', 'inactivo'].includes(estado)) {
            return res.status(400).json({ message: 'Estado inválido. Use "activo" o "inactivo"' });
        }
        
        await usuario.update({ estado });
        
        // No devolver la contraseña en la respuesta
        const usuarioResponse = usuario.toJSON();
        delete usuarioResponse.contraseña;
        
        res.json(usuarioResponse);
    } catch (error) {
        res.status(500).json({ message: 'Error al cambiar estado del usuario', error });
    }
};