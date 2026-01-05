// ============================================
// USUARIOS - Funcionalidades combinadas (Frontend + Backend)
// ============================================

// URL base del gateway
const GATEWAY_URL = 'http://localhost:8080';

// Variables globales de estado UI
let modoEdicionUsuario = false;
let usuarioEditandoId = null;
let usuarioActualId = null; // Para identificar al usuario actual

// ===== FUNCIONES DE VERIFICACIÓN DE PERMISOS =====
function verificarPermisosAdministrador() {
    const usuarioStorage = localStorage.getItem('sirevif_usuario');
    if (!usuarioStorage) {
        console.error('❌ No hay información de usuario en localStorage');
        mostrarErrorAccesoDenegado();
        return false;
    }
    
    try {
        const usuarioData = JSON.parse(usuarioStorage);
        const rolId = usuarioData.rolId || usuarioData.rol_id || 0;
        
        console.log('🔐 Verificando permisos de administrador...');
        console.log('📋 Datos del usuario:', usuarioData);
        console.log('👑 rolId detectado:', rolId);
        
        // Guardar ID del usuario actual para verificación
        usuarioActualId = usuarioData.id;
        console.log('👤 ID del usuario actual:', usuarioActualId);
        
        // Solo rolId === 1 es administrador
        const esAdministrador = rolId === 1;
        
        if (!esAdministrador) {
            console.log('🚫 Usuario no es administrador (Rol:', rolId, ') - Acceso denegado');
            mostrarErrorAccesoDenegado();
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('❌ Error al verificar permisos:', error);
        mostrarErrorAccesoDenegado();
        return false;
    }
}

function mostrarErrorAccesoDenegado() {
    // Solo mostrar si estamos en la página de usuarios
    if (window.location.pathname.includes('usuarios.html')) {
        Swal.fire({
            title: 'Acceso denegado',
            text: 'No tienes permisos para acceder a esta sección. Solo los administradores (Rol 1) pueden gestionar usuarios.',
            icon: 'error',
            confirmButtonText: 'Volver al inicio',
            confirmButtonColor: '#4CAF50',
            allowOutsideClick: false,
            allowEscapeKey: false,
            showCloseButton: false
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = '/Frontend/HTML/index.html';
            }
        });
    }
}

// ===== FUNCIONES DE NOTIFICACIONES =====
async function mostrarExito(mensaje, titulo = '¡Éxito!') {
    return Swal.fire({
        title: titulo,
        text: mensaje,
        icon: 'success',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#4CAF50',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: true
    });
}

async function mostrarError(mensaje, titulo = 'Error') {
    return Swal.fire({
        title: titulo,
        text: mensaje,
        icon: 'error',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#f44336',
        showConfirmButton: true
    });
}

async function mostrarConfirmacion(pregunta, titulo = 'Confirmación', textoConfirmar = 'Sí', textoCancelar = 'No') {
    const result = await Swal.fire({
        title: titulo,
        text: pregunta,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: textoConfirmar,
        cancelButtonText: textoCancelar,
        cancelButtonColor: '#d33',
        confirmButtonColor: '#009a1dff',
        reverseButtons: true,
        focusCancel: true
    });
    return result.isConfirmed;
}

// ===== FUNCIÓN ESPECIAL PARA ACCIONES CRÍTICAS =====
async function mostrarConfirmacionCritica(pregunta, titulo = '⚠️ Acción Crítica', advertencia = '') {
    const result = await Swal.fire({
        title: titulo,
        html: `
            <div style="text-align: center;">
                <p>${pregunta}</p>
                ${advertencia ? `<p style="color: #d32f2f; font-weight: bold; margin-top: 10px;">${advertencia}</p>` : ''}
            </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: 'Cancelar',
        cancelButtonColor: '#d33',
        confirmButtonColor: '#ff9800',
        reverseButtons: true,
        focusCancel: true,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showCloseButton: false,
        width: 500
    });
    return result.isConfirmed;
}

// ===== FUNCIONES DE SEGURIDAD MEJORADA =====

/**
 * Verifica si la acción se está realizando sobre el propio usuario
 */
function esAccionSobreMismoUsuario(idUsuarioAccion) {
    // Asegurar que idUsuarioAccion sea número para comparación
    const idAccion = parseInt(idUsuarioAccion);
    
    // Primero obtener el usuario actual
    const usuarioStorage = localStorage.getItem('sirevif_usuario');
    
    if (!usuarioStorage) {
        console.error('❌ No hay información de usuario en localStorage');
        return false;
    }
    
    try {
        const usuarioData = JSON.parse(usuarioStorage);
        const usuarioActualId = parseInt(usuarioData.id);
        
        console.log(`🔍 Comparando IDs:`);
        console.log(`   • ID de acción: ${idAccion} (tipo: ${typeof idAccion})`);
        console.log(`   • ID usuario actual: ${usuarioActualId} (tipo: ${typeof usuarioActualId})`);
        console.log(`   • Datos completos:`, usuarioData);
        
        return idAccion === usuarioActualId;
    } catch (error) {
        console.error('❌ Error al comparar usuarios:', error);
        return false;
    }
}

/**
 * Ejecuta cierre de sesión seguro después de acción crítica - VERSIÓN SIMPLIFICADA
 */
async function cerrarSesionDespuesAccionCritica(mensaje = 'Sesión cerrada por seguridad') {
    console.log('🔒 Ejecutando cierre de sesión inmediato...');
    
    // Cerrar sesión INMEDIATAMENTE sin mostrar mensaje adicional
    if (window.SIREVIF && window.SIREVIF.Sesion && typeof window.SIREVIF.Sesion.ejecutarCierreSesion === 'function') {
        console.log('✅ Usando función de cierre de sesión del sistema');
        window.SIREVIF.Sesion.ejecutarCierreSesion();
    } else {
        // Fallback directo
        console.log('⚠️ Usando fallback de cierre de sesión');
        localStorage.removeItem('sirevif_token');
        localStorage.removeItem('sirevif_usuario');
        window.location.href = '/Frontend/HTML/login.html';
    }
}

// ===== FUNCIONES DE INTERFAZ DE FORMULARIO =====
function abrirFormularioCreacion() {
    // Verificar permisos antes de abrir
    if (!verificarPermisosAdministrador()) {
        mostrarError('Solo los administradores pueden crear usuarios');
        return;
    }
    
    resetFormulario();
    
    // Obtener conteo actual de usuarios
    const usuariosActuales = window.usuariosActuales || [];
    const conteoUsuarios = contarUsuariosPorComisaria(usuariosActuales);
    
    // Actualizar opciones del select basado en el conteo
    actualizarOpcionesSelect(conteoUsuarios);
    
    document.getElementById('formularioOverlay').style.display = 'flex';
}

function cerrarFormulario() {
    const formularioOverlay = document.getElementById('formularioOverlay');
    if (formularioOverlay) {
        formularioOverlay.style.display = 'none';
        resetFormulario();
    }
}

function resetFormulario() {
    console.log('🔄 Reseteando formulario...');
    
    modoEdicionUsuario = false;
    usuarioEditandoId = null;
    
    // Restablecer valores del formulario
    const formulario = document.getElementById('formularioUsuarios');
    if (formulario) {
        formulario.reset();
        console.log('✅ Formulario reseteado');
    }
    
    // RE-HABILITAR CAMPOS BLOQUEADOS
    const nombreInput = document.getElementById('nombreUsuario');
    const documentoInput = document.getElementById('documentoUsuario');
    const comisariaSelect = document.getElementById('comisariaUsuario');
    
    if (nombreInput) {
        nombreInput.readOnly = false;
        nombreInput.style.backgroundColor = '';
        nombreInput.style.cursor = '';
        nombreInput.style.border = '';
        nombreInput.style.boxShadow = '';
    }
    
    if (documentoInput) {
        documentoInput.readOnly = false;
        documentoInput.style.backgroundColor = '';
        documentoInput.style.cursor = '';
        documentoInput.style.border = '';
        documentoInput.style.boxShadow = '';
    }
    
    if (comisariaSelect) {
        comisariaSelect.disabled = false;
        comisariaSelect.style.backgroundColor = '';
        comisariaSelect.style.cursor = '';
        comisariaSelect.style.border = '';
        comisariaSelect.style.boxShadow = '';
        
        // RESTAURAR TODAS LAS OPCIONES DEL SELECT
        Array.from(comisariaSelect.options).forEach(option => {
            if (option.value !== '') {
                const originalDisplay = option.getAttribute('data-original-display') || '';
                option.style.display = originalDisplay;
                option.disabled = false;
                option.style.color = '';
                option.style.backgroundColor = '';
                option.title = '';
                option.style.fontStyle = '';
            }
        });
        
        console.log('✅ Opciones del select restauradas');
    }
    
    // Restablecer título
    const titulo = document.querySelector('.headerF h2');
    if (titulo) {
        titulo.textContent = 'Registrar nuevo Usuario';
    }
    
    // Restablecer botón
    const boton = document.getElementById('crearUsuario');
    if (boton) {
        boton.textContent = 'Crear';
    }
    
    // Restablecer campo de contraseña
    const contraseñaInput = document.getElementById('contraseñaUsuario');
    if (contraseñaInput) {
        contraseñaInput.value = '';
        contraseñaInput.placeholder = '';
        contraseñaInput.required = true;
        contraseñaInput.readOnly = false;
        contraseñaInput.type = 'password';
        contraseñaInput.style.border = '';
        contraseñaInput.style.boxShadow = '';
    }
    
    // Restablecer iconos de mostrar/ocultar
    const mostrar = document.getElementById('mostrar');
    const ocultar = document.getElementById('ocultar');
    if (mostrar && ocultar) {
        mostrar.style.display = 'inline';
        ocultar.style.display = 'none';
    }
    
    // Limpiar validaciones
    limpiarValidaciones();
    
    console.log('✅ Formulario completamente reseteado');
}

// ===== SISTEMA DE VALIDACIÓN VISUAL =====

// Función para limpiar todas las validaciones visuales
function limpiarValidaciones() {
    const inputs = document.querySelectorAll('#formularioUsuarios input, #formularioUsuarios select');
    inputs.forEach(input => {
        input.style.border = '';
        input.style.boxShadow = '';
    });
    
    const mensajes = document.querySelectorAll('#formularioUsuarios .mensaje');
    mensajes.forEach(mensaje => {
        mensaje.style.display = 'none';
    });
}

// Función para resaltar campos vacíos (input)
function resaltarVacio(input) {
    if (!input) return false;
    
    const valor = input.value.trim();
    const tieneError = valor === '';
    
    if (tieneError) {
        input.style.border = '2px solid #ff0000';
        input.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.27)';

        // Mostrar mensaje de error inmediatamente después del input
        let mensaje = input.nextElementSibling;
        while (mensaje && !mensaje.classList.contains('mensaje')) {
            mensaje = mensaje.nextElementSibling;
        }
        
        if (mensaje && mensaje.classList.contains('mensaje')) {
            mensaje.style.display = 'block';
        }
    } else {
        input.style.border = '';
        input.style.boxShadow = '';

        // Ocultar mensaje de error
        let mensaje = input.nextElementSibling;
        while (mensaje && !mensaje.classList.contains('mensaje')) {
            mensaje = mensaje.nextElementSibling;
        }
        
        if (mensaje && mensaje.classList.contains('mensaje')) {
            mensaje.style.display = 'none';
        }
    }
    
    return tieneError;
}

// Función para resaltar selects vacíos
function resaltarSelectVacio(select) {
    if (!select) return false;
    
    const valor = select.value;
    const tieneError = valor === '' || valor === undefined || valor === null;
    
    if (tieneError) {
        select.style.border = '2px solid #ff0000';
        select.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.27)';

        // Mostrar mensaje de error
        let mensaje = select.nextElementSibling;
        while (mensaje && !mensaje.classList.contains('mensaje')) {
            mensaje = mensaje.nextElementSibling;
        }
        
        if (mensaje && mensaje.classList.contains('mensaje')) {
            mensaje.style.display = 'block';
        }
    } else {
        select.style.border = '';
        select.style.boxShadow = '';

        // Ocultar mensaje de error
        let mensaje = select.nextElementSibling;
        while (mensaje && !mensaje.classList.contains('mensaje')) {
            mensaje = mensaje.nextElementSibling;
        }
        
        if (mensaje && mensaje.classList.contains('mensaje')) {
            mensaje.style.display = 'none';
        }
    }
    
    return tieneError;
}

// Función para validar formato de correo
function validarCorreo(input) {
    if (!input) return false;
    
    const valor = input.value.trim();
    if (valor === '') return true; // Ya se maneja con resaltarVacio
    
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const esValido = regex.test(valor);
    
    // Buscar el mensaje de "correo válido" (segundo mensaje)
    let mensajes = input.parentElement.querySelectorAll('.mensaje');
    let mensajeCorreoValido = null;
    
    if (mensajes.length >= 2) {
        mensajeCorreoValido = mensajes[1]; // Segundo mensaje es el de correo válido
    }
    
    if (!esValido) {
        input.style.border = '2px solid #ff0000';
        input.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.27)';
        
        if (mensajeCorreoValido) {
            mensajeCorreoValido.style.display = 'block';
        }
        return false;
    } else {
        // Solo quitar borde rojo si el correo es válido
        // PERO mantenerlo si está vacío (ese es otro error)
        if (valor !== '') {
            input.style.border = '';
            input.style.boxShadow = '';
        }
        
        if (mensajeCorreoValido) {
            mensajeCorreoValido.style.display = 'none';
        }
        return true;
    }
}

// Función para validar mínimo de caracteres en documento
function verificarMinDocumento(input) {
    if (!input) return false;
    
    const valor = input.value;
    if (valor === '') return true; // Ya se maneja con resaltarVacio
    
    const tieneError = valor.length < 7;
    
    // Buscar el mensaje de "mínimo caracteres" (segundo mensaje)
    let mensajes = input.parentElement.querySelectorAll('.mensaje');
    let mensajeMinCaracteres = null;
    
    if (mensajes.length >= 2) {
        mensajeMinCaracteres = mensajes[1]; // Segundo mensaje es el de mínimo caracteres
    }
    
    if (tieneError) {
        input.style.border = '2px solid #ff0000';
        input.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.27)';

        if (mensajeMinCaracteres) {
            mensajeMinCaracteres.style.display = 'block';
        }
        return false;
    } else {
        // Solo quitar borde rojo si cumple el mínimo
        input.style.border = '';
        input.style.boxShadow = '';

        if (mensajeMinCaracteres) {
            mensajeMinCaracteres.style.display = 'none';
        }
        return true;
    }
}

// Función para validar mínimo de caracteres en teléfono
function verificarMinTelefono(input) {
    if (!input) return false;
    
    const valor = input.value;
    if (valor === '') return true; // Ya se maneja con resaltarVacio
    
    const tieneError = valor.length < 10;
    
    // Buscar el mensaje de "mínimo caracteres" (segundo mensaje)
    let mensajes = input.parentElement.querySelectorAll('.mensaje');
    let mensajeMinCaracteres = null;
    
    if (mensajes.length >= 2) {
        mensajeMinCaracteres = mensajes[1]; // Segundo mensaje es el de mínimo caracteres
    }
    
    if (tieneError) {
        input.style.border = '2px solid #ff0000';
        input.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.27)';

        if (mensajeMinCaracteres) {
            mensajeMinCaracteres.style.display = 'block';
        }
        return false;
    } else {
        // Solo quitar borde rojo si cumple el mínimo
        input.style.border = '';
        input.style.boxShadow = '';

        if (mensajeMinCaracteres) {
            mensajeMinCaracteres.style.display = 'none';
        }
        return true;
    }
}

// Función para validar todos los campos del formulario de usuarios
function validarFormularioUsuarioCompleto() {
    console.log('🔍 Iniciando validación de formulario de usuarios...');
    
    // Limpiar validaciones previas
    limpiarValidaciones();
    
    let tieneErrores = false;
    const camposErroneos = [];
    
    // ===== VALIDAR CAMPOS OBLIGATORIOS =====
    
    // 1. Nombre completo
    const nombreInput = document.getElementById('nombreUsuario');
    if (nombreInput && !modoEdicionUsuario) { // Solo validar en creación
        if (resaltarVacio(nombreInput)) {
            tieneErrores = true;
            camposErroneos.push('nombre');
        }
    }
    
    // 2. Documento
    const documentoInput = document.getElementById('documentoUsuario');
    if (documentoInput && !modoEdicionUsuario) { // Solo validar en creación
        if (resaltarVacio(documentoInput)) {
            tieneErrores = true;
            camposErroneos.push('documento (vacío)');
        }
        
        // Validar mínimo de caracteres
        if (!verificarMinDocumento(documentoInput) && documentoInput.value.trim() !== '') {
            tieneErrores = true;
            camposErroneos.push('documento (mínimo)');
        }
        
        // Validar que solo tenga números
        if (documentoInput.value.trim() !== '') {
            const soloNumeros = /^[0-9]+$/;
            if (!soloNumeros.test(documentoInput.value)) {
                documentoInput.style.border = '2px solid #ff0000';
                documentoInput.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.27)';
                tieneErrores = true;
                camposErroneos.push('documento (solo números)');
            }
        }
    }
    
    // 3. Cargo
    const cargoInput = document.getElementById('cargoUsuario');
    if (cargoInput) {
        if (resaltarVacio(cargoInput)) {
            tieneErrores = true;
            camposErroneos.push('cargo');
        }
    }
    
    // 4. Correo
    const correoInput = document.getElementById('correoUsuario');
    if (correoInput) {
        if (resaltarVacio(correoInput)) {
            tieneErrores = true;
            camposErroneos.push('correo (vacío)');
        }
        
        // Validar formato de correo
        if (!validarCorreo(correoInput) && correoInput.value.trim() !== '') {
            tieneErrores = true;
            camposErroneos.push('correo (formato)');
        }
    }
    
    // 5. Teléfono
    const telefonoInput = document.getElementById('telefonoUsuario');
    if (telefonoInput) {
        if (resaltarVacio(telefonoInput)) {
            tieneErrores = true;
            camposErroneos.push('teléfono (vacío)');
        }
        
        // Validar mínimo de caracteres
        if (!verificarMinTelefono(telefonoInput) && telefonoInput.value.trim() !== '') {
            tieneErrores = true;
            camposErroneos.push('teléfono (mínimo)');
        }
        
        // Validar que solo tenga números
        if (telefonoInput.value.trim() !== '') {
            const soloNumeros = /^[0-9]+$/;
            if (!soloNumeros.test(telefonoInput.value)) {
                telefonoInput.style.border = '2px solid #ff0000';
                telefonoInput.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.27)';
                tieneErrores = true;
                camposErroneos.push('teléfono (solo números)');
            }
        }
    }
    
    // 6. Comisaría/Rol (Select)
    const comisariaSelect = document.getElementById('comisariaUsuario');
    if (comisariaSelect && !modoEdicionUsuario) { // Solo validar en creación
        if (resaltarSelectVacio(comisariaSelect)) {
            tieneErrores = true;
            camposErroneos.push('comisaría');
        }
    }
    
    // 7. Contraseña (solo en creación)
    const contraseñaInput = document.getElementById('contraseñaUsuario');
    if (contraseñaInput && !modoEdicionUsuario) {
        if (resaltarVacio(contraseñaInput)) {
            tieneErrores = true;
            camposErroneos.push('contraseña');
        }
    }
    
    console.log(`✅ Validación completada. Errores: ${tieneErrores ? 'Sí' : 'No'}`, camposErroneos);
    return !tieneErrores;
}

// ===== FUNCIONES DE RENDERIZADO =====
function renderizarUsuarios(usuarios) {
    console.log('🎨 Renderizando usuarios:', usuarios ? usuarios.length : 0);
    
    // Limpiar todas las secciones
    document.querySelectorAll('.usuarios').forEach(seccion => {
        seccion.innerHTML = '';
    });
    
    if (!usuarios || usuarios.length === 0) {
        const primeraSeccion = document.querySelector('.usuarios');
        if (primeraSeccion) {
            primeraSeccion.innerHTML = '<p class="sin-usuarios">No hay usuarios registrados</p>';
        }
        
        // Actualizar contadores (todo en 0)
        const conteoVacio = {
            'Administrador': 0,
            'Comisaría Primera': 0,
            'Comisaría Segunda': 0,
            'Comisaría Tercera': 0,
            'Comisaría Cuarta': 0,
            'Comisaría Quinta': 0,
            'Comisaría Sexta': 0
        };
        actualizarContadorVisual(conteoVacio);
        actualizarOpcionesSelect(conteoVacio);
        
        return;
    }
    
    // Contar usuarios por comisaría
    const conteoUsuarios = contarUsuariosPorComisaria(usuarios);
    
    // Actualizar contadores visuales
    actualizarContadorVisual(conteoUsuarios);
    
    // Actualizar opciones del select (solo si no estamos en modo edición)
    if (!modoEdicionUsuario) {
        actualizarOpcionesSelect(conteoUsuarios);
    }
    
    // Agrupar usuarios por comisaría
    const usuariosPorComisaria = {};
    
    usuarios.forEach(usuario => {
        const comisaria = usuario.comisaria_rol || 'Sin asignar';
        
        if (!usuariosPorComisaria[comisaria]) {
            usuariosPorComisaria[comisaria] = [];
        }
        
        usuariosPorComisaria[comisaria].push(usuario);
    });
    
    // Mapeo de comisaría a sección
    const mapeoSecciones = {
        'Administrador': 'Administrador',
        'Comisaría Primera': 'Usuarios Comisaría Primera',
        'Comisaría Segunda': 'Usuarios Comisaría Segunda',
        'Comisaría Tercera': 'Usuarios Comisaría Tercera',
        'Comisaría Cuarta': 'Usuarios Comisaría Cuarta',
        'Comisaría Quinta': 'Usuarios Comisaría Quinta',
        'Comisaría Sexta': 'Usuarios Comisaría Sexta'
    };
    
    // Renderizar en cada sección
    Object.entries(usuariosPorComisaria).forEach(([comisaria, usuariosGrupo]) => {
        const tituloBuscado = mapeoSecciones[comisaria] || comisaria;
        const secciones = document.querySelectorAll('.seccionUsuarios');
        
        secciones.forEach(seccion => {
            const titulo = seccion.querySelector('.tituloSec');
            if (titulo && titulo.textContent.startsWith(tituloBuscado)) {
                const usuariosContainer = seccion.querySelector('.usuarios');
                if (usuariosContainer) {
                    usuariosGrupo.forEach(usuario => {
                        const tarjetaUsuario = crearTarjetaUsuario(usuario);
                        usuariosContainer.appendChild(tarjetaUsuario);
                    });
                }
            }
        });
    });
    
    console.log('✅ Usuarios renderizados con límites aplicados');
}

function crearTarjetaUsuario(usuario) {
    const div = document.createElement('div');
    div.className = 'usuario-tarjeta';
    div.dataset.id = usuario.id;
    
    const estadoClase = usuario.estado === 'inactivo' ? 'usuario-inactivo' : '';
    
    div.innerHTML = `
        <div class="contenedor-tabla ${estadoClase} usuario-card">
            <table class="tabla-usuario">
                <tr>
                    <td><strong>Nombre:</strong></td>
                    <td>${usuario.nombre || 'N/A'}</td>
                </tr>
                <tr>
                    <td><strong>Documento:</strong></td>
                    <td>${usuario.documento || 'N/A'}</td>
                </tr>
                <tr>
                    <td><strong>Cargo:</strong></td>
                    <td>${usuario.cargo || 'N/A'}</td>
                </tr>
                <tr>
                    <td><strong>Correo:</strong></td>
                    <td>${usuario.correo || 'N/A'}</td>
                </tr>
                <tr>
                    <td><strong>Teléfono:</strong></td>
                    <td>${usuario.telefono || 'N/A'}</td>
                </tr>
                <tr>
                    <td><strong>Comisaría:</strong></td>
                    <td>${usuario.comisaria_rol || 'Sin asignar'}</td>
                </tr>
                <tr>
                    <td><strong>Estado:</strong></td>
                    <td class="estado-usuario ${usuario.estado === 'inactivo' ? 'estado-inactivo' : 'estado-activo'}">
                        ${usuario.estado === 'inactivo' ? 'Inactivo' : 'Activo'}
                    </td>
                </tr>
            </table>
            <div class="columna-acciones">
                <button title="Editar usuario" class="btn-editar" data-id="${usuario.id}"> 
                    <img class="accionUsuario" src="/Frontend/images/editar.png" alt="Editar">
                </button>
                <button class="btn-estado" data-id="${usuario.id}" data-estado="${usuario.estado}">
                    ${usuario.estado === 'inactivo' ? 
                        '<img title="Habilitar usuario" class="accionUsuario" src="/Frontend/images/habilitar.png" alt="Habilitar">' : 
                        '<img title="Inhabilitar usuario" class="accionUsuario" src="/Frontend/images/inhabilitar.png" alt="Inhabilitar">'}
                </button>
                <button title="Eliminar usuario" class="btn-eliminar" data-id="${usuario.id}">
                    <img class="accionUsuario" src="/Frontend/images/borrar.png" alt="Eliminar">
                </button>
            </div>
        </div>
    `;
    
    return div;
}

function configurarFormularioEdicion(usuario) {
    modoEdicionUsuario = true;
    usuarioEditandoId = usuario.id;
    
    console.log(`📝 Configurando formulario para editar usuario ID: ${usuario.id}`, usuario);
    console.log(`👤 Es el mismo usuario? ${esAccionSobreMismoUsuario(usuario.id) ? 'SÍ (ACCIÓN CRÍTICA)' : 'NO'}`);
    
    // Llenar formulario con datos del usuario
    document.getElementById('nombreUsuario').value = usuario.nombre || '';
    document.getElementById('documentoUsuario').value = usuario.documento || '';
    document.getElementById('cargoUsuario').value = usuario.cargo || '';
    document.getElementById('correoUsuario').value = usuario.correo || '';
    document.getElementById('telefonoUsuario').value = usuario.telefono || '';
    document.getElementById('comisariaUsuario').value = usuario.comisaria_rol || '';
    
    // DESHABILITAR CAMPOS QUE NO SE PUEDEN EDITAR
    const nombreInput = document.getElementById('nombreUsuario');
    const documentoInput = document.getElementById('documentoUsuario');
    const comisariaSelect = document.getElementById('comisariaUsuario');
    
    if (nombreInput) {
        nombreInput.readOnly = true;
        nombreInput.style.backgroundColor = '#f5f5f5';
        nombreInput.style.cursor = 'not-allowed';
        nombreInput.style.border = '';
        nombreInput.style.boxShadow = '';
    }
    
    if (documentoInput) {
        documentoInput.readOnly = true;
        documentoInput.style.backgroundColor = '#f5f5f5';
        documentoInput.style.cursor = 'not-allowed';
        documentoInput.style.border = '';
        documentoInput.style.boxShadow = '';
    }
    
    if (comisariaSelect) {
        comisariaSelect.disabled = true;
        comisariaSelect.style.backgroundColor = '#f5f5f5';
        comisariaSelect.style.cursor = 'not-allowed';
        comisariaSelect.style.border = '';
        comisariaSelect.style.boxShadow = '';
    }
    
    // Configurar campo de contraseña para edición
    const contraseñaInput = document.getElementById('contraseñaUsuario');
    if (contraseñaInput) {
        contraseñaInput.value = '';
        
        // Mostrar advertencia si es el mismo usuario
        if (esAccionSobreMismoUsuario(usuario.id)) {
            contraseñaInput.placeholder = '⚠️ Cambiar tu contraseña cerrará tu sesión';
            contraseñaInput.title = 'Si cambias tu propia contraseña, tu sesión se cerrará automáticamente';
        } else {
            contraseñaInput.placeholder = 'Dejar vacío para mantener la contraseña actual';
        }
        
        contraseñaInput.required = false;
        contraseñaInput.style.border = '';
        contraseñaInput.style.boxShadow = '';
    }
    
    // Cambiar título y botón
    const titulo = document.querySelector('.headerF h2');
    if (titulo) {
        titulo.textContent = 'Editar Usuario';
    }
    
    const boton = document.getElementById('crearUsuario');
    if (boton) {
        boton.textContent = 'Actualizar Usuario';
    }
    
    // Mostrar formulario
    document.getElementById('formularioOverlay').style.display = 'flex';
    
    console.log('✅ Formulario configurado para edición (campos bloqueados)');
}

// ===== FUNCIONES DE API =====
async function cargarUsuarios() {
    try {
        const token = localStorage.getItem('sirevif_token');
        if (!token) {
            throw new Error('No hay sesión activa');
        }
        
        console.log('📋 Cargando usuarios desde:', `${GATEWAY_URL}/usuarios`);
        
        const response = await fetch(`${GATEWAY_URL}/usuarios`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📥 Respuesta status:', response.status);
        
        if (!response.ok) {
            // ... manejo de errores existente ...
        }
        
        const result = await response.json();
        console.log('✅ Respuesta completa:', result);
        
        // Manejar diferentes formatos de respuesta
        let usuariosArray;
        
        if (Array.isArray(result)) {
            usuariosArray = result;
        } else if (result.data && Array.isArray(result.data)) {
            usuariosArray = result.data;
        } else if (result.success && result.data) {
            usuariosArray = result.data;
        } else {
            console.warn('⚠️ Formato de respuesta inesperado:', result);
            usuariosArray = [];
        }
        
        console.log('✅ Usuarios cargados:', usuariosArray.length);
        
        // GUARDAR USUARIOS GLOBALMENTE PARA USAR EN EL FORMULARIO
        window.usuariosActuales = usuariosArray;
        
        renderizarUsuarios(usuariosArray);
        return usuariosArray;
        
    } catch (error) {
        console.error('❌ Error al cargar usuarios:', error);
        
        if (error.message.includes('sesión') || error.message.includes('token')) {
            await mostrarError(error.message, 'Sesión expirada');
            window.SIREVIF.Sesion.ejecutarCierreSesion();
        } else if (error.message.includes('Acceso denegado')) {
            await mostrarError(error.message, 'Permisos insuficientes');
            // No cerrar sesión, solo mostrar error
        } else {
            await mostrarError('Error al cargar usuarios: ' + error.message);
        }
        
        throw error;
    }
}

async function crearUsuario(usuarioData) {
    try {
        const token = localStorage.getItem('sirevif_token');
        if (!token) {
            throw new Error('No hay sesión activa');
        }
        
        console.log('📤 Creando usuario:', usuarioData);
        
        const response = await fetch(`${GATEWAY_URL}/usuarios`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(usuarioData)
        });
        
        console.log('📥 Respuesta crear usuario:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
        }
        
        const result = await response.json();
        
        if (result.success || result.id) {
            console.log('✅ Usuario creado exitosamente');
            return result;
        } else {
            throw new Error(result.message || 'Error al crear usuario');
        }
        
    } catch (error) {
        console.error('❌ Error al crear usuario:', error);
        throw error;
    }
}

async function actualizarUsuario(id, usuarioData) {
    try {
        const token = localStorage.getItem('sirevif_token');
        if (!token) {
            throw new Error('No hay sesión activa');
        }
        
        console.log(`📤 Actualizando usuario ID: ${id}`, usuarioData);
        
        const response = await fetch(`${GATEWAY_URL}/usuarios/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(usuarioData)
        });
        
        console.log('📥 Respuesta actualizar usuario:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
        }
        
        const result = await response.json();
        
        if (result.success || result.id) {
            console.log('✅ Usuario actualizado exitosamente');
            return result;
        } else {
            throw new Error(result.message || 'Error al actualizar usuario');
        }
        
    } catch (error) {
        console.error('❌ Error al actualizar usuario:', error);
        throw error;
    }
}

async function cambiarEstadoUsuario(id, nuevoEstado) {
    try {
        const token = localStorage.getItem('sirevif_token');
        if (!token) {
            throw new Error('No hay sesión activa');
        }
        
        console.log(`📤 Cambiando estado usuario ID: ${id} a: ${nuevoEstado}`);
        
        const response = await fetch(`${GATEWAY_URL}/usuarios/${id}/estado`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ estado: nuevoEstado })
        });
        
        console.log('📥 Respuesta HTTP:', response.status, response.statusText);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error en respuesta:', errorText);
            throw new Error(`Error ${response.status}: ${errorText}`);
        }
        
        const result = await response.json();
        console.log('📥 Resultado JSON:', result);
        
        // DEPURACIÓN: Ver estructura de la respuesta
        console.log('🔍 Estructura de respuesta:');
        console.log('  - success:', result.success);
        console.log('  - id:', result.id);
        console.log('  - data:', result.data);
        console.log('  - message:', result.message);
        
        return result;
        
    } catch (error) {
        console.error('❌ Error en cambiarEstadoUsuario:', error);
        throw error;
    }
}

async function eliminarUsuario(id) {
    try {
        const token = localStorage.getItem('sirevif_token');
        if (!token) {
            throw new Error('No hay sesión activa');
        }
        
        const response = await fetch(`${GATEWAY_URL}/usuarios/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
        }
        
        const result = await response.json();
        
        if (result.success || result.message) {
            return result;
        } else {
            throw new Error(result.message || 'Error al eliminar usuario');
        }
        
    } catch (error) {
        console.error('❌ Error al eliminar usuario:', error);
        throw error;
    }
}

async function obtenerUsuarioPorId(id) {
    try {
        const token = localStorage.getItem('sirevif_token');
        if (!token) throw new Error('No hay sesión activa');
        
        console.log(`🔍 Obteniendo usuario ID: ${id}`);
        
        const response = await fetch(`${GATEWAY_URL}/usuarios/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: No se pudo obtener el usuario`);
        }
        
        const result = await response.json();
        console.log('✅ Usuario obtenido:', result);
        
        // Manejar diferentes formatos de respuesta
        if (result.success && result.data) {
            return result.data;
        } else if (result.id) {
            return result;
        } else {
            throw new Error('Formato de respuesta inválido');
        }
        
    } catch (error) {
        console.error('❌ Error al obtener usuario:', error);
        throw error;
    }
}

// ===== MANEJADORES DE EVENTOS MEJORADOS CON SEGURIDAD =====
async function manejarEnvioFormulario(event) {
    event.preventDefault();
    
    console.log('📝 Procesando envío de formulario...');
    console.log('Modo edición:', modoEdicionUsuario);
    console.log('ID editando:', usuarioEditandoId);
    console.log('Es el mismo usuario?', esAccionSobreMismoUsuario(usuarioEditandoId));
    
    // ===== VALIDACIÓN DE LÍMITES POR COMISARÍA (SOLO EN CREACIÓN) =====
    if (!modoEdicionUsuario) {
        const comisariaSelect = document.getElementById('comisariaUsuario');
        const comisariaSeleccionada = comisariaSelect ? comisariaSelect.value : '';
        
        if (comisariaSeleccionada) {
            // Obtener usuarios actuales y contar por comisaría
            const usuariosActuales = window.usuariosActuales || [];
            const conteoUsuarios = contarUsuariosPorComisaria(usuariosActuales);
            const conteoActual = conteoUsuarios[comisariaSeleccionada] || 0;
            
            console.log(`📊 Validando límite para ${comisariaSeleccionada}: ${conteoActual}/2`);
            
            if (conteoActual >= 2) {
                await mostrarError(
                    `No se puede crear más usuarios para <strong>${comisariaSeleccionada}</strong>.<br><br>` +
                    `Límite máximo alcanzado: <strong>2 usuarios</strong>.<br>` +
                    `Actualmente tienes: <strong>${conteoActual} usuarios</strong> registrados.`,
                    '🚫 Límite Alcanzado'
                );
                
                // Resaltar el select
                if (comisariaSelect) {
                    comisariaSelect.style.border = '2px solid #f44336';
                    comisariaSelect.style.boxShadow = '0 0 10px rgba(244, 67, 54, 0.3)';
                    
                    // Scroll al campo
                    setTimeout(() => {
                        comisariaSelect.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        comisariaSelect.focus();
                    }, 100);
                }
                
                return; // Detener el envío del formulario
            }
        }
    }
    
    // ===== VALIDACIÓN VISUAL COMPLETA =====
    if (!validarFormularioUsuarioCompleto()) {
        console.log('❌ Validación visual fallida');
        
        // Hacer scroll al primer error SIN mostrar ventana emergente
        setTimeout(() => {
            const primerError = document.querySelector('#formularioUsuarios input[style*="red"], #formularioUsuarios select[style*="red"]') ||
                               document.querySelector('#formularioUsuarios input[style*="rgb(255, 0, 0)"], #formularioUsuarios select[style*="rgb(255, 0, 0)"]');
            
            if (primerError) {
                primerError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                primerError.focus();
            }
        }, 50);
        
        return; // Detener el envío del formulario
    }
    
    console.log('✅ Validación visual completada - Sin errores');
    
    // Obtener valores del formulario
    const nombre = document.getElementById('nombreUsuario').value.trim();
    const documento = document.getElementById('documentoUsuario').value.trim();
    const cargo = document.getElementById('cargoUsuario').value.trim();
    const correo = document.getElementById('correoUsuario').value.trim();
    const telefono = document.getElementById('telefonoUsuario').value.trim();
    const comisaria = document.getElementById('comisariaUsuario').value;
    const contraseña = document.getElementById('contraseñaUsuario').value.trim();
    
    // Preparar datos para enviar
    const usuarioData = {
        nombre,
        documento,
        cargo,
        correo,
        telefono,
        comisaria_rol: comisaria
    };
    
    // Solo incluir contraseña si se proporcionó una nueva
    if (contraseña) {
        usuarioData.contraseña = contraseña;
    }
    
    console.log('📤 Datos a enviar:', usuarioData);
    
    try {
        if (modoEdicionUsuario && usuarioEditandoId) {
            // ===== ACCIÓN CRÍTICA: Cambiar contraseña propia =====
            const esMismoUsuario = esAccionSobreMismoUsuario(usuarioEditandoId);
            const estaCambiandoContraseña = contraseña !== '';
            
            if (esMismoUsuario && estaCambiandoContraseña) {
                console.log('⚠️ ADVERTENCIA: Administrador cambiando su propia contraseña');
                
                // Mostrar confirmación especial
                const confirmado = await mostrarConfirmacionCritica(
                    '¿Está seguro de cambiar su propia contraseña?',
                    'Cambio de Contraseña',
                    '⚠️ Esta acción cerrará tu sesión automáticamente por seguridad.'
                );
                
                if (!confirmado) {
                    console.log('❌ Cambio de contraseña cancelado por el usuario');
                    return;
                }
                
                console.log('✅ Confirmado: Cambiando contraseña propia');
            }
            
            // MODO EDICIÓN: Actualizar usuario existente
            console.log(`🔄 Actualizando usuario ID: ${usuarioEditandoId}`);
            
            const result = await actualizarUsuario(usuarioEditandoId, usuarioData);
            
            if (result.success || result.id) {
                if (esMismoUsuario && estaCambiandoContraseña) {
                    await mostrarExito('Contraseña actualizada. Cerrando sesión...', 'Cambio Exitoso');
                    
                    // Cerrar formulario
                    cerrarFormulario();
                    
                    // Cerrar sesión inmediatamente
                    setTimeout(() => {
                        if (window.SIREVIF && window.SIREVIF.Sesion) {
                            window.SIREVIF.Sesion.ejecutarCierreSesion();
                        } else {
                            localStorage.removeItem('sirevif_token');
                            localStorage.removeItem('sirevif_usuario');
                            window.location.href = '/Frontend/HTML/login.html';
                        }
                    }, 800);
                    
                    return; // Salir de la función
                } else {
                    await mostrarExito('Usuario actualizado exitosamente');
                    cerrarFormulario();
                    await cargarUsuarios(); // Recargar para actualizar contadores
                }
            } else {
                throw new Error(result.message || 'Error desconocido al actualizar');
            }
            
        } else {
            // MODO CREACIÓN: Crear nuevo usuario
            if (!contraseña) {
                // Esto ya debería estar validado por validarFormularioUsuarioCompleto()
                // Pero por si acaso, verificamos aquí también
                resaltarVacio(document.getElementById('contraseñaUsuario'));
                return;
            }
            
            console.log('🆕 Creando nuevo usuario');
            usuarioData.contraseña = contraseña;
            
            // Verificación final del límite (por si acaso)
            const usuariosActuales = window.usuariosActuales || [];
            const conteoUsuarios = contarUsuariosPorComisaria(usuariosActuales);
            const conteoActual = conteoUsuarios[comisaria] || 0;
            
            if (conteoActual >= 2) {
                await mostrarError(
                    `No se puede crear el usuario. Límite máximo (2 usuarios) alcanzado para ${comisaria}.`,
                    'Límite Alcanzado'
                );
                return;
            }
            
            const result = await crearUsuario(usuarioData);
            
            if (result.success || result.id) {
                await mostrarExito('Usuario creado exitosamente');
                cerrarFormulario();
                await cargarUsuarios(); // Recargar para actualizar contadores
            } else {
                throw new Error(result.message || 'Error desconocido al crear');
            }
        }
    } catch (error) {
        console.error('❌ Error al procesar usuario:', error);
        
        // Mensaje específico para errores de límite
        if (error.message.includes('límite') || error.message.includes('Límite')) {
            await mostrarError(error.message, 'Límite Alcanzado');
        } else {
            await mostrarError('Error: ' + error.message);
        }
    }
}

async function cambiarEstadoUsuarioHandler(id, estadoActual) {
    const nuevoEstado = estadoActual === 'activo' ? 'inactivo' : 'activo';
    const accion = nuevoEstado === 'inactivo' ? 'inhabilitar' : 'activar';
    const esMismoUsuario = esAccionSobreMismoUsuario(id);
    
    console.log(`🔄 Cambiando estado usuario ID: ${id}`);
    
    // Configurar mensajes según si es acción sobre sí mismo
    let confirmado = false;
    
    if (esMismoUsuario && nuevoEstado === 'inactivo') {
        confirmado = await mostrarConfirmacionCritica(
            '¿Está seguro de que desea inhabilitar su propia cuenta?',
            'Inhabilitar Cuenta Propia',
            '⚠️ Al realizar esta acción su sesión se cerrará automáticamente y no podrá volver a ingresar hasta que la cuenta sea habilitada nuevamente.'
        );
        
        if (!confirmado) {
            console.log('❌ Inhabilitación cancelada');
            return;
        }
    } else {
        confirmado = await mostrarConfirmacion(
            `¿Está seguro de que desea ${accion} este usuario?`,
            'Confirmar acción'
        );
        
        if (!confirmado) return;
    }
    
    try {
        console.log(`📤 Cambiando estado a: ${nuevoEstado}`);
        const result = await cambiarEstadoUsuario(id, nuevoEstado);
        
        if (result.success === true || result.id || result.data) {
            if (esMismoUsuario && nuevoEstado === 'inactivo') {
                console.log('🔒 Inhabilitación propia confirmada - cerrando sesión');
                await mostrarExito('Cuenta inhabilitada. Cerrando sesión...');
                
                // Cerrar sesión inmediatamente
                setTimeout(() => {
                    if (window.SIREVIF && window.SIREVIF.Sesion) {
                        window.SIREVIF.Sesion.ejecutarCierreSesion();
                    } else {
                        localStorage.removeItem('sirevif_token');
                        localStorage.removeItem('sirevif_usuario');
                        window.location.href = '/Frontend/HTML/login.html';
                    }
                }, 800);
            } else {
                await mostrarExito(`Usuario ${accion === 'inhabilitar' ? 'inhabilitado' : 'activado'} exitosamente`);
                await cargarUsuarios();
            }
        } else {
            throw new Error(result.message || 'Error al cambiar estado');
        }
    } catch (error) {
        console.error(`❌ Error al ${accion} usuario:`, error);
        await mostrarError(`Error: ${error.message}`);
    }
}

async function eliminarUsuarioHandler(id) {
    const esMismoUsuario = esAccionSobreMismoUsuario(id);
    
    console.log(`🗑️  Eliminando usuario ID: ${id}`);
    
    // Configurar mensajes según si es acción sobre sí mismo
    let confirmado = false;
    
    if (esMismoUsuario) {
        confirmado = await mostrarConfirmacionCritica(
            '¿Está seguro de eliminar su propia cuenta permanentemente?',
            'Eliminar Cuenta Propia',
            '⚠️ Esta acción cerrará su sesión automáticamente y no podrá volver a ingresar con las credenciales actuales.'
        );
        
        if (!confirmado) {
            console.log('❌ Eliminación cancelada');
            return;
        }
    } else {
        confirmado = await mostrarConfirmacion(
            '¿Está seguro de eliminar este usuario? Esta acción no se puede deshacer.',
            'Confirmar eliminación'
        );
        
        if (!confirmado) return;
    }
    
    try {
        console.log(`📤 Enviando solicitud de eliminación para usuario ID: ${id}`);
        const result = await eliminarUsuario(id);
        
        console.log('📥 Resultado de eliminación:', result);
        
        // Verificar diferentes formatos de respuesta
        const exito = result.success === true || result.message;
        
        if (exito) {
            if (esMismoUsuario) {
                // ... cierre de sesión si es el mismo usuario ...
            } else {
                await mostrarExito('Usuario eliminado exitosamente');
                // Recargar usuarios para actualizar contadores
                await cargarUsuarios();
            }
        }
    } catch (error) {
        console.error('❌ Error al eliminar usuario:', error);
        await mostrarError('Error: ' + error.message);
    }
}

async function editarUsuarioHandler(id) {
    try {
        console.log(`🖊️  Editando usuario ID: ${id}`);
        
        // Obtener datos del usuario
        const usuario = await obtenerUsuarioPorId(id);
        console.log('📋 Datos del usuario para editar:', usuario);
        
        // Configurar formulario con datos del usuario
        configurarFormularioEdicion(usuario);
        
    } catch (error) {
        console.error('❌ Error al cargar usuario para editar:', error);
        await mostrarError('Error al cargar usuario: ' + error.message);
    }
}

// ===== CONFIGURACIÓN DE INTERFAZ =====
function setupToggleContraseña() {
    const mostrar = document.getElementById('mostrar');
    const ocultar = document.getElementById('ocultar');
    const input = document.getElementById('contraseñaUsuario');
    
    if (!mostrar || !ocultar || !input) return;
    
    function mostrarContraseña() {
        input.type = 'text';
        mostrar.style.display = 'none';
        ocultar.style.display = 'inline';
    }
    
    function ocultarContraseña() {
        input.type = 'password';
        mostrar.style.display = 'inline';
        ocultar.style.display = 'none';
    }
    
    mostrar.addEventListener('click', mostrarContraseña);
    ocultar.addEventListener('click', ocultarContraseña);
}

function setupValidaciones() {
    // Validación de solo letras para nombre y cargo
    document.getElementById('nombreUsuario')?.addEventListener('input', function() {
        this.value = this.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
        if (!modoEdicionUsuario) {
            resaltarVacio(this);
        }
    });
    
    document.getElementById('cargoUsuario')?.addEventListener('input', function() {
        this.value = this.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
        resaltarVacio(this);
    });
    
    // Validación de solo números para documento y teléfono
    document.getElementById('documentoUsuario')?.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
        if (this.value.length > 10) this.value = this.value.slice(0, 10);
        if (!modoEdicionUsuario) {
            resaltarVacio(this);
            verificarMinDocumento(this);
        }
    });
    
    document.getElementById('telefonoUsuario')?.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
        if (this.value.length > 10) this.value = this.value.slice(0, 10);
        resaltarVacio(this);
        verificarMinTelefono(this);
    });
    
    // Validación de correo en tiempo real
    document.getElementById('correoUsuario')?.addEventListener('blur', function() {
        if (this.value.trim() !== '') {
            validarCorreo(this);
        } else {
            resaltarVacio(this);
        }
    });
    
    document.getElementById('correoUsuario')?.addEventListener('input', function() {
        resaltarVacio(this);
    });
    
    // Validación de select
    document.getElementById('comisariaUsuario')?.addEventListener('change', function() {
        if (!modoEdicionUsuario) {
            resaltarSelectVacio(this);
        }
    });
    
    // Validación de contraseña en tiempo real (solo creación)
    document.getElementById('contraseñaUsuario')?.addEventListener('input', function() {
        if (!modoEdicionUsuario) {
            resaltarVacio(this);
        }
    });
}

function generarContraseñaAutomatica() {
    if (modoEdicionUsuario) {
        mostrarError('En modo edición, la contraseña se genera automáticamente');
        return;
    }
    
    const nombre = document.getElementById('nombreUsuario').value.trim();
    const documento = document.getElementById('documentoUsuario').value.trim();
    const comisaria = document.getElementById('comisariaUsuario').value;
    const contraseñaInput = document.getElementById('contraseñaUsuario');
    
    if (!nombre || !documento || !comisaria) {
        // Resaltar los campos que faltan
        if (!nombre) resaltarVacio(document.getElementById('nombreUsuario'));
        if (!documento) resaltarVacio(document.getElementById('documentoUsuario'));
        if (!comisaria) resaltarSelectVacio(document.getElementById('comisariaUsuario'));
        return;
    }
    
    const mapeoComisarias = {
        'Administrador': 'admin',
        'Comisaría Primera': '1',
        'Comisaría Segunda': '2',
        'Comisaría Tercera': '3',
        'Comisaría Cuarta': '4',
        'Comisaría Quinta': '5',
        'Comisaría Sexta': '6'
    };
    
    const comisariaCodigo = mapeoComisarias[comisaria] || '0';
    const primerNombre = nombre.split(' ')[0].toLowerCase();
    const contraseñaGenerada = `${primerNombre}.${documento}.${comisariaCodigo}`;
    
    contraseñaInput.value = contraseñaGenerada;
    contraseñaInput.focus();
    resaltarVacio(contraseñaInput);
}

function asignarEventListenersTarjetas() {
    console.log('🎯 Configurando listeners para tarjetas de usuarios...');
    
    // Usar event delegation para manejar clics en botones
    document.addEventListener('click', async function(event) {
        const target = event.target;
        
        // Buscar el botón más cercano (o el elemento dentro del botón)
        let btn = target.closest('.btn-editar, .btn-estado, .btn-eliminar');
        
        // Si el clic fue en la imagen dentro del botón, subir al botón padre
        if (!btn && (target.classList.contains('accionUsuario') || target.tagName === 'IMG')) {
            btn = target.closest('button');
        }
        
        if (!btn) return;
        
        const id = btn.dataset.id;
        if (!id) {
            console.error('❌ No se encontró ID en el botón');
            return;
        }
        
        console.log(`🖱️  Botón clickeado: ${btn.className}, ID: ${id}`);
        
        event.preventDefault();
        
        if (btn.classList.contains('btn-editar')) {
            console.log('📝 Editando usuario ID:', id);
            await editarUsuarioHandler(id);
        } else if (btn.classList.contains('btn-estado')) {
            const estadoActual = btn.dataset.estado;
            console.log('🔄 Cambiando estado usuario ID:', id, 'Estado actual:', estadoActual);
            await cambiarEstadoUsuarioHandler(id, estadoActual);
        } else if (btn.classList.contains('btn-eliminar')) {
            console.log('🗑️  Eliminando usuario ID:', id);
            await eliminarUsuarioHandler(id);
        }
    });
}

function inicializarInterfaz() {
    console.log('🚀 Inicializando interfaz de usuarios...');
    
    // Botón abrir formulario
    const abrirFormularioBtn = document.getElementById('abrirFormulario');
    if (abrirFormularioBtn) {
        abrirFormularioBtn.addEventListener('click', abrirFormularioCreacion);
    }
    
    // Botón cancelar formulario
    const cancelarBtn = document.querySelector('.botonCancelar');
    if (cancelarBtn) {
        cancelarBtn.addEventListener('click', cerrarFormulario);
    }
    
    // Cerrar formulario al hacer clic fuera
    const fondo = document.getElementById('formularioOverlay');
    if (fondo) {
        fondo.addEventListener('click', function(e) {
            if (e.target === fondo) {
                cerrarFormulario();
            }
        });
    }
    
    // Botón generar contraseña
    const botonGenerar = document.getElementById('generarContraseñaBtn');
    if (botonGenerar) {
        botonGenerar.addEventListener('click', generarContraseñaAutomatica);
    }
    
    // Botón crear/actualizar usuario
    const botonCrear = document.getElementById('crearUsuario');
    if (botonCrear) {
        botonCrear.addEventListener('click', manejarEnvioFormulario);
    }
    
    // Configurar mostrar/ocultar contraseña
    setupToggleContraseña();
    
    // Configurar validaciones en tiempo real
    setupValidaciones();
    
    // Asignar listeners a tarjetas de usuarios
    asignarEventListenersTarjetas();
    
    console.log('✅ Interfaz configurada correctamente');
}

function inicializarUsuarios() {
    console.log('🚀 Sistema de usuarios inicializando...');
    
    // 🔒 Verificar permisos de administrador ANTES de hacer nada
    if (!verificarPermisosAdministrador()) {
        // Si no es admin, no inicializar nada
        console.log('🚫 Usuario no es administrador - Sistema de usuarios no inicializado');
        return false;
    }
    
    // Solo si es admin, continuar con la inicialización
    console.log('✅ Usuario es administrador - Inicializando sistema...');
    
    // Inicializar interfaz
    inicializarInterfaz();
    
    // Cargar usuarios
    setTimeout(() => {
        cargarUsuarios();
    }, 100);
    
    console.log('✅ Sistema de usuarios inicializado (solo administrador)');
    return true;
}

/**
 * Función de depuración para verificar el estado de sesión
 */
function verificarEstadoSesion() {
    const token = localStorage.getItem('sirevif_token');
    const usuarioStorage = localStorage.getItem('sirevif_usuario');
    
    console.log('🔍 Estado actual de sesión:');
    console.log('  • Token presente:', token ? 'SÍ' : 'NO');
    console.log('  • Usuario en localStorage:', usuarioStorage ? 'SÍ' : 'NO');
    
    if (usuarioStorage) {
        try {
            const usuario = JSON.parse(usuarioStorage);
            console.log('  • ID usuario actual:', usuario.id);
            console.log('  • Nombre:', usuario.nombre);
            console.log('  • Rol ID:', usuario.rolId || usuario.rol_id);
        } catch (e) {
            console.log('  • Error al parsear usuario:', e.message);
        }
    }
}

/**
 * Función para debuggear datos de usuario
 */
function debugUsuarioActual() {
    const usuarioStorage = localStorage.getItem('sirevif_usuario');
    const token = localStorage.getItem('sirevif_token');
    
    console.log('🔍 DEBUG - Datos de usuario actual:');
    console.log('  • Token presente:', token ? `SÍ (${token.substring(0, 20)}...)` : 'NO');
    console.log('  • Usuario en localStorage:', usuarioStorage ? 'SÍ' : 'NO');
    
    if (usuarioStorage) {
        try {
            const usuario = JSON.parse(usuarioStorage);
            console.log('  • Datos completos:', usuario);
            console.log('  • ID:', usuario.id);
            console.log('  • Tipo de ID:', typeof usuario.id);
            console.log('  • Nombre:', usuario.nombre);
            console.log('  • Rol ID:', usuario.rolId || usuario.rol_id);
        } catch (e) {
            console.log('  • Error al parsear:', e.message);
        }
    }
    
    return usuarioStorage ? JSON.parse(usuarioStorage) : null;
}

// ===== FUNCIÓN PARA CONTAR USUARIOS POR COMISARÍA =====
function contarUsuariosPorComisaria(usuarios) {
    const conteo = {
        'Administrador': 0,
        'Comisaría Primera': 0,
        'Comisaría Segunda': 0,
        'Comisaría Tercera': 0,
        'Comisaría Cuarta': 0,
        'Comisaría Quinta': 0,
        'Comisaría Sexta': 0
    };
    
    if (usuarios && Array.isArray(usuarios)) {
        usuarios.forEach(usuario => {
            const comisaria = usuario.comisaria_rol;
            if (comisaria && conteo.hasOwnProperty(comisaria)) {
                conteo[comisaria]++;
            }
        });
    }
    
    console.log('📊 Conteo de usuarios por comisaría:', conteo);
    return conteo;
}

// ===== FUNCIÓN PARA ACTUALIZAR OPCIONES DEL SELECT =====
function actualizarOpcionesSelect(conteoUsuarios) {
    const select = document.getElementById('comisariaUsuario');
    if (!select) return;
    
    console.log('🔄 Actualizando opciones del select basado en conteo:', conteoUsuarios);
    
    // Para cada opción del select
    Array.from(select.options).forEach(option => {
        if (option.value === '') return; // Saltar opción vacía
        
        const conteo = conteoUsuarios[option.value] || 0;
        const haAlcanzadoLimite = conteo >= 2;
        
        // Guardar estado original si no existe
        if (!option.hasAttribute('data-original-display')) {
            option.setAttribute('data-original-display', option.style.display);
        }
        
        // Ocultar/deshabilitar si alcanzó el límite
        if (haAlcanzadoLimite && !modoEdicionUsuario) {
            option.style.display = 'none';
            option.disabled = true;
            option.style.color = '#999';
            option.style.backgroundColor = '#f5f5f5';
            
            // Agregar tooltip
            option.title = `Límite alcanzado (${conteo}/2 usuarios)`;
        } else {
            // Restaurar opción
            const originalDisplay = option.getAttribute('data-original-display') || '';
            option.style.display = originalDisplay;
            option.disabled = false;
            option.style.color = '';
            option.style.backgroundColor = '';
            option.title = '';
        }
        
        console.log(`   • ${option.value}: ${conteo}/2 ${haAlcanzadoLimite ? '❌ LÍMITE' : '✅ DISPONIBLE'}`);
    });
    
    // Si la opción seleccionada actual está oculta, seleccionar la primera disponible
    if (select.value && select.options[select.selectedIndex].style.display === 'none') {
        const primeraDisponible = Array.from(select.options).find(opt => 
            opt.value && opt.style.display !== 'none' && !opt.disabled
        );
        if (primeraDisponible) {
            select.value = primeraDisponible.value;
            console.log(`🔄 Cambiando selección a: ${primeraDisponible.value}`);
        } else {
            select.value = '';
            console.log('⚠️ No hay opciones disponibles');
        }
    }
}

// ===== FUNCIÓN PARA ACTUALIZAR CONTADOR VISUAL =====
function actualizarContadorVisual(conteoUsuarios) {
    console.log('📋 Actualizando contadores visuales...');
    
    // Mapeo de comisaría a sección
    const mapeoSecciones = {
        'Administrador': 'Administrador',
        'Comisaría Primera': 'Usuarios Comisaría Primera',
        'Comisaría Segunda': 'Usuarios Comisaría Segunda',
        'Comisaría Tercera': 'Usuarios Comisaría Tercera',
        'Comisaría Cuarta': 'Usuarios Comisaría Cuarta',
        'Comisaría Quinta': 'Usuarios Comisaría Quinta',
        'Comisaría Sexta': 'Usuarios Comisaría Sexta'
    };
    
    // Actualizar cada sección
    Object.entries(mapeoSecciones).forEach(([comisaria, tituloSeccion]) => {
        const conteo = conteoUsuarios[comisaria] || 0;
        const limiteAlcanzado = conteo >= 2;
        
        // Buscar la sección
        const secciones = document.querySelectorAll('.seccionUsuarios');
        secciones.forEach(seccion => {
            const titulo = seccion.querySelector('.tituloSec');
            if (titulo && titulo.textContent === tituloSeccion) {
                // Remover contador anterior si existe
                const contadorAnterior = titulo.querySelector('.contador-usuarios');
                if (contadorAnterior) {
                    contadorAnterior.remove();
                }
                
                // Crear nuevo contador
                const contador = document.createElement('span');
                contador.className = `contador-usuarios ${limiteAlcanzado ? 'contador-limitado' : 'contador-normal'}`;
                contador.textContent = ` (${conteo}/2)`;
                contador.title = limiteAlcanzado ? 'Límite alcanzado' : `${2 - conteo} espacios disponibles`;
                
                titulo.appendChild(contador);
                
                console.log(`   • ${comisaria}: ${conteo}/2 ${limiteAlcanzado ? '🔴' : '🟢'}`);
            }
        });
    });
}

// Agrega esta función al objeto global para poder llamarla desde consola
window.debugUsuario = debugUsuarioActual;

// ===== HACER FUNCIONES GLOBALES =====
window.renderizarUsuarios = renderizarUsuarios;
window.cargarUsuarios = cargarUsuarios;
window.mostrarExito = mostrarExito;
window.mostrarError = mostrarError;
window.mostrarConfirmacion = mostrarConfirmacion;
window.mostrarConfirmacionCritica = mostrarConfirmacionCritica;
window.inicializarUsuarios = inicializarUsuarios;
window.configurarFormularioEdicion = configurarFormularioEdicion;
window.validarFormularioUsuarioCompleto = validarFormularioUsuarioCompleto;
window.cerrarFormulario = cerrarFormulario;
window.verificarPermisosAdministrador = verificarPermisosAdministrador;
window.esAccionSobreMismoUsuario = esAccionSobreMismoUsuario;
window.cerrarSesionDespuesAccionCritica = cerrarSesionDespuesAccionCritica;

console.log('✅ usuarios.js cargado - Sistema de seguridad mejorada activado');

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarUsuarios);
} else {
    setTimeout(inicializarUsuarios, 100);
}