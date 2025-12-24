const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();
const SECRET = process.env.JWT_SECRET || 'secreto_por_defecto_cambiar_en_produccion';

const autenticarToken = (req, res, next) => {
    try {
        console.log(`[Auth] 🔐 Verificando token para: ${req.method} ${req.originalUrl}`);
        
        // Obtener token del header Authorization
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer TOKEN"

        if (!token) {
            console.log('[Auth] ❌ Token no proporcionado');
            return res.status(401).json({
                success: false,
                error: 'Acceso no autorizado',
                message: 'Token de autenticación no proporcionado',
                help: 'Incluye el token en el header: Authorization: Bearer <tu_token>'
            });
        }

        // Verificar token
        jwt.verify(token, SECRET, (err, usuarioDecodificado) => {
            if (err) {
                console.log('[Auth] ❌ Token inválido:', err.message);
                
                let mensaje = 'Token de autenticación inválido';
                if (err.name === 'TokenExpiredError') {
                    mensaje = 'El token ha expirado, vuelve a iniciar sesión';
                } else if (err.name === 'JsonWebTokenError') {
                    mensaje = 'Token mal formado';
                }
                
                return res.status(403).json({
                    success: false,
                    error: 'Token inválido',
                    message: mensaje
                });
            }
            
            console.log(`[Auth] ✅ Token válido para usuario: ${usuarioDecodificado.documento} (ID: ${usuarioDecodificado.id}, Rol: ${usuarioDecodificado.rolId})`);
            
            // Agregar información del usuario al request
            req.usuario = {
                id: usuarioDecodificado.id,
                documento: usuarioDecodificado.documento,
                rolId: usuarioDecodificado.rolId,
                nombre: usuarioDecodificado.nombre || 'Usuario',
                comisariaId: usuarioDecodificado.comisariaId || 0
            };
            
            // Pasar información a headers para los microservicios
            res.set('X-User-ID', usuarioDecodificado.id || '');
            res.set('X-User-Documento', usuarioDecodificado.documento || '');
            res.set('X-User-Rol', usuarioDecodificado.rolId || '');
            res.set('X-User-Nombre', usuarioDecodificado.nombre || '');
            res.set('X-User-Comisaria', usuarioDecodificado.comisariaId || 0);
            
            next();
        });
    } catch (error) {
        console.error('[Auth] 🔥 Error en autenticación:', error);
        res.status(500).json({
            success: false,
            error: 'Error de autenticación',
            message: 'Error interno al verificar la autenticación'
        });
    }
};

module.exports = {
    autenticarToken
};