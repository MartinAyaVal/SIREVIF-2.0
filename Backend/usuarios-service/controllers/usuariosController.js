const usuarios = require('../models/usuarios.js');
const bcrypt = require('bcrypt');

// Obtener todos los usuarios registrados
exports.getusuario = async (req, res) => {
    try {
        const usuario = await usuarios.findAll();
        res.json(usuario);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener usuarios: ", error})
    }
};

// Crear usuario
exports.createusuario = async (req, res) => {
    try {
        const { 
            nombre, 
            documento, 
            cargo,
            correo, 
            telefono, 
            contraseña, 
            comisaria_rol, 
            rolId 
        } = req.body;

        // Validar que la contraseña esté presente
        if (!contraseña) {
            return res.status(400).json({ 
                message: 'La contraseña es requerida' 
            });
        }

        // Hashear la contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(contraseña, saltRounds);

        const usuario = await usuarios.create({
            nombre: nombre,
            documento: documento,
            cargo: cargo,
            correo: correo,
            telefono: telefono,
            contraseña: hashedPassword,  // Contraseña hasheada
            comisaria_rol: comisaria_rol,
            rolId: rolId
        });

        // Opcional: No devolver la contraseña en la respuesta
        const usuarioResponse = usuario.toJSON();
        delete usuarioResponse.contraseña;

        res.status(201).json(usuarioResponse);
    } catch(error) {
        console.log('Error al crear usuario:', error);
        res.status(500).json({ 
            message: 'Error al crear usuario:', 
            error: error.message
        });
    }
};

// Obtener usuario por Id
exports.getusuariosById = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await usuarios.findByPk(id);
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
        const { 
            nombre, 
            documento, 
            cargo,
            correo, 
            telefono, 
            contraseña, 
            comisaria_rol, 
        } = req.body;

        const usuario = await usuarios.findByPk(id);
        if(!usuario) return res.status(404).json({ message: 'Usuario no encontrado'});

        // Si se actualiza la contraseña, hashearla
        let updateData = {
            nombre: nombre,
            documento: documento,
            cargo: cargo,   
            correo: correo,
            telefono: telefono,
            comisaria_rol: comisaria_rol,
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
        res.status(500).json({ message: 'Error al actualizar usuario', error})
    }
};

// Eliminar usuario por Id
exports.deleteusuario = async (req, res) => {
    try{
        const { id } = req.params;
        const usuario = await usuarios.findByPk(id);
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
        const usuario = await usuarios.findOne({ where: { correo } });
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
        
        const usuario = await usuarios.findByPk(id);
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