const sequelize = require('../db/config.js');
const Usuario = require('../models/usuarios.js')(sequelize);
const bcrypt = require('bcrypt');

// Obtener todos los usuarios registrados
exports.getusuario = async (req, res) => {
    try {
        const usuario = await Usuario.findAll();
        res.json(usuario);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener usuarios: ", error})
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
        
        // DEPURACIÓN
        console.log("=".repeat(60));
        console.log(`📥 Actualizando usuario ID: ${id}`);
        console.log("📥 REQ.BODY:", req.body);
        console.log("📥 comisariaId recibido:", req.body.comisariaId, "tipo:", typeof req.body.comisariaId);
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

        const usuario = await Usuario.findByPk(id);
        if(!usuario) return res.status(404).json({ message: 'Usuario no encontrado'});

        // Manejar comisariaId - si no viene, mantener el existente o calcular
        let comisariaIdFinal = comisariaId;
        
        if (comisariaIdFinal === undefined || comisariaIdFinal === null) {
            console.log("⚠️ comisariaId no recibido en actualización...");
            
            if (comisaria_rol) {
                // Si hay nueva comisaria_rol, calcular comisariaId
                const mapeoComisarias = {
                    'Administrador': 0,
                    'Comisaría Primera': 1,
                    'Comisaría Segunda': 2,
                    'Comisaría Tercera': 3,
                    'Comisaría Cuarta': 4,
                    'Comisaría Quinta': 5,
                    'Comisaría Sexta': 6
                };
                
                comisariaIdFinal = mapeoComisarias[comisaria_rol] || usuario.comisariaId;
                console.log(`✅ comisariaId calculado para actualización: ${comisariaIdFinal}`);
            } else {
                // Mantener el comisariaId existente
                comisariaIdFinal = usuario.comisariaId;
                console.log(`✅ Manteniendo comisariaId existente: ${comisariaIdFinal}`);
            }
        }
        
        // Asegurar que sea número
        comisariaIdFinal = parseInt(comisariaIdFinal) || 0;

        // Preparar datos de actualización
        let updateData = {
            nombre: nombre,
            documento: parseInt(documento),
            cargo: cargo,   
            correo: correo,
            telefono: telefono,
            comisaria_rol: comisaria_rol || usuario.comisaria_rol,
            rolId: parseInt(rolId) || usuario.rolId,
            comisariaId: comisariaIdFinal  // <- Campo CRÍTICO
        };

        if (contraseña) {
            const saltRounds = 10;
            updateData.contraseña = await bcrypt.hash(contraseña, saltRounds);
        }

        await usuario.update(updateData);

        // Opcional: No devolver la contraseña en la respuesta
        const usuarioResponse = usuario.toJSON();
        delete usuarioResponse.contraseña;

        res.json(usuarioResponse)
    } catch (error) {
        console.log('❌ Error al actualizar usuario:', error);
        res.status(500).json({ 
            message: 'Error al actualizar usuario', 
            error: error.message,
            details: error.errors ? error.errors.map(err => err.message) : []
        })
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