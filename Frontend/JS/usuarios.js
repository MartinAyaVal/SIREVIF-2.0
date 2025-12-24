let usuariosRegistrados = [];
let modoEdicionUsuario = false;
let usuarioEditandoId = null;

// URL base del gateway
const GATEWAY_URL = 'http://localhost:8080';

// Ventana de notificacion de exito
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

// Ventana de notificacion de error
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

// Ventana de notificacion informativa
async function mostrarInfo(mensaje, titulo = 'Información') {
    return Swal.fire({
        title: titulo,
        text: mensaje,
        icon: 'info',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#4CAF50',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: true
    });
}

// Ventana de notificacion de advertencia
async function mostrarAdvertencia(mensaje, titulo = 'Advertencia') {
    return Swal.fire({
        title: titulo,
        text: mensaje,
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#ff9800',
        showConfirmButton: true
    });
}

// Ventana de notificacion para confirmación
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

// Ventana de notificacion para confirmación critica
async function mostrarConfirmacionCritica(pregunta, titulo = '¡Atención!', textoConfirmar = 'Sí, continuar', textoCancelar = 'Cancelar') {
    const result = await Swal.fire({
        title: titulo,
        html: `<div style="text-align: center; padding: 10px 0;">${pregunta}</div>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: textoConfirmar,
        cancelButtonText: textoCancelar,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        reverseButtons: true,
        focusCancel: true,
        customClass: {
            popup: 'swal-wide'
        }
    });
    return result.isConfirmed;
}

// Cerrar sesión
function cerrarSesion() {
    // Limpiar localStorage
    localStorage.removeItem('sirevif_token');
    localStorage.removeItem('sirevif_usuario');
    
    // Redirigir a login
    window.location.href = '/Frontend/HTML/login.html';
}

// Verificar si es el usuario actual.
function esUsuarioActual(id) {
    const usuarioStorage = localStorage.getItem('sirevif_usuario');
    if (!usuarioStorage) return false;
    
    try {
        const usuarioData = JSON.parse(usuarioStorage);
        return usuarioData.id === id;
    } catch (error) {
        return false;
    }
}

// Cerrar formulario
function cerrarFormulario() {
    const formularioOverlay = document.getElementById('formularioOverlay');
    if (formularioOverlay) {
        formularioOverlay.style.display = 'none';
        resetFormulario();
    }
}

// ===== FUNCIONES DE VALIDACIÓN VISUAL =====
function limpiarValidaciones() {
    // Limpiar todos los estilos de validación
    const inputs = document.querySelectorAll('#formularioUsuarios input, #formularioUsuarios select');
    inputs.forEach(input => {
        input.style.border = '';
        input.style.boxShadow = '';
    });
    
    // Ocultar todos los mensajes de error
    const mensajes = document.querySelectorAll('#formularioUsuarios .mensaje');
    mensajes.forEach(mensaje => {
        mensaje.style.display = 'none';
    });
}

function validarCampoObligatorio(input) {
    const valor = input.value.trim();
    const mensaje = input.nextElementSibling;
    
    if (!valor) {
        input.style.border = '2px solid #ff0000';
        input.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.27)';
        if (mensaje && mensaje.classList.contains('mensaje')) {
            mensaje.style.display = 'block';
        }
        return false;
    } else {
        input.style.border = '';
        input.style.boxShadow = '';
        if (mensaje && mensaje.classList.contains('mensaje')) {
            mensaje.style.display = 'none';
        }
        return true;
    }
}

function validarDocumento(input) {
    const valor = input.value.trim();
    const mensaje1 = input.nextElementSibling;
    const mensaje2 = mensaje1 ? mensaje1.nextElementSibling : null;
    
    if (!valor) {
        input.style.border = '2px solid #ff0000';
        input.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.27)';
        if (mensaje1 && mensaje1.classList.contains('mensaje')) {
            mensaje1.style.display = 'block';
        }
        return false;
    } else if (valor.length < 7) {
        input.style.border = '2px solid #ff0000';
        input.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.27)';
        if (mensaje2 && mensaje2.classList.contains('mensaje')) {
            mensaje2.style.display = 'block';
        }
        if (mensaje1 && mensaje1.classList.contains('mensaje')) {
            mensaje1.style.display = 'none';
        }
        return false;
    } else {
        input.style.border = '';
        input.style.boxShadow = '';
        if (mensaje1 && mensaje1.classList.contains('mensaje')) {
            mensaje1.style.display = 'none';
        }
        if (mensaje2 && mensaje2.classList.contains('mensaje')) {
            mensaje2.style.display = 'none';
        }
        return true;
    }
}

function validarTelefono(input) {
    const valor = input.value.trim();
    const mensaje1 = input.nextElementSibling;
    const mensaje2 = mensaje1 ? mensaje1.nextElementSibling : null;
    
    if (!valor) {
        input.style.border = '2px solid #ff0000';
        input.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.27)';
        if (mensaje1 && mensaje1.classList.contains('mensaje')) {
            mensaje1.style.display = 'block';
        }
        return false;
    } else if (valor.length < 10) {
        input.style.border = '2px solid #ff0000';
        input.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.27)';
        if (mensaje2 && mensaje2.classList.contains('mensaje')) {
            mensaje2.style.display = 'block';
        }
        if (mensaje1 && mensaje1.classList.contains('mensaje')) {
            mensaje1.style.display = 'none';
        }
        return false;
    } else {
        input.style.border = '';
        input.style.boxShadow = '';
        if (mensaje1 && mensaje1.classList.contains('mensaje')) {
            mensaje1.style.display = 'none';
        }
        if (mensaje2 && mensaje2.classList.contains('mensaje')) {
            mensaje2.style.display = 'none';
        }
        return true;
    }
}

function validarCorreo(input) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const valor = input.value.trim();
    const mensaje1 = input.nextElementSibling;
    const mensaje2 = mensaje1 ? mensaje1.nextElementSibling : null;
    
    if (!valor) {
        input.style.border = '2px solid #ff0000';
        input.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.27)';
        if (mensaje1 && mensaje1.classList.contains('mensaje')) {
            mensaje1.style.display = 'block';
        }
        return false;
    } else if (!regex.test(valor)) {
        input.style.border = '2px solid #ff0000';
        input.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.27)';
        if (mensaje2 && mensaje2.classList.contains('mensaje')) {
            mensaje2.style.display = 'block';
        }
        if (mensaje1 && mensaje1.classList.contains('mensaje')) {
            mensaje1.style.display = 'none';
        }
        return false;
    } else {
        input.style.border = '';
        input.style.boxShadow = '';
        if (mensaje1 && mensaje1.classList.contains('mensaje')) {
            mensaje1.style.display = 'none';
        }
        if (mensaje2 && mensaje2.classList.contains('mensaje')) {
            mensaje2.style.display = 'none';
        }
        return true;
    }
}

function validarSelect(select) {
    const valor = select.value;
    const mensaje = select.nextElementSibling;
    
    if (!valor) {
        select.style.border = '2px solid #ff0000';
        select.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.27)';
        if (mensaje && mensaje.classList.contains('mensaje')) {
            mensaje.style.display = 'block';
        }
        return false;
    } else {
        select.style.border = '';
        select.style.boxShadow = '';
        if (mensaje && mensaje.classList.contains('mensaje')) {
            mensaje.style.display = 'none';
        }
        return true;
    }
}

function validarContraseña(input) {
    const valor = input.value.trim();
    const mensaje = input.nextElementSibling;
    
    // Solo validar contraseña en modo creación (no en edición)
    if (modoEdicionUsuario) {
        if (mensaje && mensaje.classList.contains('mensaje')) {
            mensaje.style.display = 'none';
        }
        input.style.border = '';
        input.style.boxShadow = '';
        return true;
    }
    
    if (!valor) {
        input.style.border = '2px solid #ff0000';
        input.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.27)';
        if (mensaje && mensaje.classList.contains('mensaje')) {
            mensaje.style.display = 'block';
        }
        return false;
    } else {
        input.style.border = '';
        input.style.boxShadow = '';
        if (mensaje && mensaje.classList.contains('mensaje')) {
            mensaje.style.display = 'none';
        }
        return true;
    }
}

// ===== FUNCIÓN PARA MOSTRAR ERRORES DE VALIDACIÓN EN FORMULARIO =====
function mostrarErroresValidacion(camposInvalidos) {
    // Resaltar todos los campos inválidos
    camposInvalidos.forEach(campo => {
        if (campo.input) {
            campo.input.style.border = '2px solid #ff0000';
            campo.input.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.27)';
            
            // Mostrar mensajes de error específicos
            if (campo.mensajes) {
                campo.mensajes.forEach((mensaje, index) => {
                    if (mensaje) {
                        if (index === 0 && campo.esRequerido) {
                            mensaje.style.display = 'block';
                        } else if (index === 1 && campo.tieneLongitudMinima) {
                            mensaje.style.display = 'block';
                        } else if (index === 1 && campo.esCorreoInvalido) {
                            mensaje.style.display = 'block';
                        }
                    }
                });
            }
        }
    });
    
    // Hacer scroll al primer campo con error
    if (camposInvalidos.length > 0 && camposInvalidos[0].input) {
        camposInvalidos[0].input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        camposInvalidos[0].input.focus();
    }
}

// ===== VALIDACIÓN COMPLETA DEL FORMULARIO =====
function validarFormularioCompleto() {
    // Obtener referencias a los elementos del formulario
    const nombreInput = document.getElementById('nombreUsuario');
    const documentoInput = document.getElementById('documentoUsuario');
    const cargoInput = document.getElementById('cargoUsuario');
    const correoInput = document.getElementById('correoUsuario');
    const telefonoInput = document.getElementById('telefonoUsuario');
    const comisariaSelect = document.getElementById('comisariaUsuario');
    const contraseñaInput = document.getElementById('contraseñaUsuario');
    
    // Limpiar validaciones anteriores
    limpiarValidaciones();
    
    // Array para almacenar campos inválidos
    const camposInvalidos = [];
    
    // Validar cada campo
    if (!validarCampoObligatorio(nombreInput)) {
        const mensajes = Array.from(nombreInput.parentNode.querySelectorAll('.mensaje'));
        camposInvalidos.push({
            input: nombreInput,
            mensajes: mensajes,
            esRequerido: true
        });
    }
    
    if (!validarDocumento(documentoInput)) {
        const mensajes = Array.from(documentoInput.parentNode.querySelectorAll('.mensaje'));
        const tieneValor = documentoInput.value.trim() !== '';
        const tieneLongitudMinima = documentoInput.value.trim().length >= 7;
        
        camposInvalidos.push({
            input: documentoInput,
            mensajes: mensajes,
            esRequerido: !tieneValor,
            tieneLongitudMinima: tieneValor && !tieneLongitudMinima
        });
    }
    
    if (!validarCampoObligatorio(cargoInput)) {
        const mensajes = Array.from(cargoInput.parentNode.querySelectorAll('.mensaje'));
        camposInvalidos.push({
            input: cargoInput,
            mensajes: mensajes,
            esRequerido: true
        });
    }
    
    if (!validarCorreo(correoInput)) {
        const mensajes = Array.from(correoInput.parentNode.querySelectorAll('.mensaje'));
        const tieneValor = correoInput.value.trim() !== '';
        const esCorreoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoInput.value.trim());
        
        camposInvalidos.push({
            input: correoInput,
            mensajes: mensajes,
            esRequerido: !tieneValor,
            esCorreoInvalido: tieneValor && !esCorreoValido
        });
    }
    
    if (!validarTelefono(telefonoInput)) {
        const mensajes = Array.from(telefonoInput.parentNode.querySelectorAll('.mensaje'));
        const tieneValor = telefonoInput.value.trim() !== '';
        const tieneLongitudMinima = telefonoInput.value.trim().length >= 10;
        
        camposInvalidos.push({
            input: telefonoInput,
            mensajes: mensajes,
            esRequerido: !tieneValor,
            tieneLongitudMinima: tieneValor && !tieneLongitudMinima
        });
    }
    
    if (!validarSelect(comisariaSelect)) {
        const mensajes = Array.from(comisariaSelect.parentNode.querySelectorAll('.mensaje'));
        camposInvalidos.push({
            input: comisariaSelect,
            mensajes: mensajes,
            esRequerido: true
        });
    }
    
    // Validar contraseña solo en modo creación
    if (!modoEdicionUsuario && !validarContraseña(contraseñaInput)) {
        const mensajes = Array.from(contraseñaInput.parentNode.querySelectorAll('.mensaje'));
        camposInvalidos.push({
            input: contraseñaInput,
            mensajes: mensajes,
            esRequerido: true
        });
    }
    
    // Si hay errores, mostrarlos y retornar false
    if (camposInvalidos.length > 0) {
        mostrarErroresValidacion(camposInvalidos);
        return false;
    }
    
    return true;
}

// Mapeo de rolId dependiendo de Comisaria_rol
function obtenerRolIdPorComisaria(comisaria) {
    const mapeoRoles = {
        'Administrador': 1,
        'Comisaría Primera': 2,
        'Comisaría Segunda': 3,
        'Comisaría Tercera': 4,
        'Comisaría Cuarta': 5,
        'Comisaría Quinta': 6,
        'Comisaría Sexta': 7
    };
    
    const rolId = mapeoRoles[comisaria];
    console.log(`🔍 Obteniendo rolId para comisaría: "${comisaria}" -> ${rolId} (tipo: ${typeof rolId})`);
    
    // Asegurar que siempre retorne un número
    return rolId !== undefined ? rolId : 1;
}

// Mapeo de comisariaId dependiendo de Comisaria_rol
function obtenerComisariaIdPorComisaria(comisaria) {
    const mapeoComisarias = {
        'Administrador': 0,
        'Comisaría Primera': 1,
        'Comisaría Segunda': 2,
        'Comisaría Tercera': 3,
        'Comisaría Cuarta': 4,
        'Comisaría Quinta': 5,
        'Comisaría Sexta': 6
    };
    
    const comisariaId = mapeoComisarias[comisaria];
    console.log(`🔍 Obteniendo comisariaId para comisaría: "${comisaria}" -> ${comisariaId} (tipo: ${typeof comisariaId})`);
    
    // Asegurar que siempre retorne un número (no undefined)
    return comisariaId !== undefined ? comisariaId : 0;
}

// Generar contraseña automática
function generarContraseñaAutomatica() {
    if (modoEdicionUsuario) {
        return; // No generar en modo edición
    }
    
    const nombreInput = document.getElementById('nombreUsuario');
    const documentoInput = document.getElementById('documentoUsuario');
    const comisariaSelect = document.getElementById('comisariaUsuario');
    const contraseñaInput = document.getElementById('contraseñaUsuario');
    
    const nombre = nombreInput.value.trim();
    const documento = documentoInput.value.trim();
    const valor = comisariaSelect.value;
    
    // Limpiar validaciones anteriores
    limpiarValidaciones();
    
    // Validar campos requeridos y mostrar errores visuales
    let hayErrores = false;
    const camposInvalidos = [];
    
    if (!nombre) {
        validarCampoObligatorio(nombreInput);
        hayErrores = true;
        const mensajes = Array.from(nombreInput.parentNode.querySelectorAll('.mensaje'));
        camposInvalidos.push({
            input: nombreInput,
            mensajes: mensajes,
            esRequerido: true
        });
    }
    
    if (!documento) {
        validarDocumento(documentoInput);
        hayErrores = true;
        const mensajes = Array.from(documentoInput.parentNode.querySelectorAll('.mensaje'));
        camposInvalidos.push({
            input: documentoInput,
            mensajes: mensajes,
            esRequerido: true
        });
    }
    
    if (!valor) {
        validarSelect(comisariaSelect);
        hayErrores = true;
        const mensajes = Array.from(comisariaSelect.parentNode.querySelectorAll('.mensaje'));
        camposInvalidos.push({
            input: comisariaSelect,
            mensajes: mensajes,
            esRequerido: true
        });
    }
    
    // Si hay errores, mostrarlos y no generar contraseña
    if (hayErrores) {
        mostrarErroresValidacion(camposInvalidos);
        return;
    }
    
    // Mapear comisaria a código para la contraseña
    let comisariaCodigo = '0';
    const mapeoComisariasContraseña = {
        'Administrador': 'admin',
        'Comisaría Primera': '1',
        'Comisaría Segunda': '2',
        'Comisaría Tercera': '3',
        'Comisaría Cuarta': '4',
        'Comisaría Quinta': '5',
        'Comisaría Sexta': '6'
    };
    
    comisariaCodigo = mapeoComisariasContraseña[valor] || '0';
    
    // Generar contraseña: primer.nombre.documento.codigo
    const primerNombre = nombre.split(' ')[0].toLowerCase();
    const contraseñaGenerada = `${primerNombre}.${documento}.${comisariaCodigo}`;
    
    // Mostrar en el campo
    contraseñaInput.value = contraseñaGenerada;
    
    // Validar visualmente la contraseña (quitar errores si los tenía)
    validarContraseña(contraseñaInput);
    
    // Hacer focus en el campo de contraseña
    contraseñaInput.focus();
}

// ===== FUNCIONES DE API (USANDO GATEWAY) =====

// Crear nuevo usuario
async function crearUsuario(usuarioData) {
    try {
        const token = localStorage.getItem('sirevif_token');
        if (!token) {
            throw new Error('No hay sesión activa');
        }
        
        console.log('📤 Enviando usuario a crear:', usuarioData);
        console.log('🔍 Tipo de comisariaId:', typeof usuarioData.comisariaId);
        console.log('🔍 Valor de comisariaId:', usuarioData.comisariaId);
        
        const response = await fetch(`${GATEWAY_URL}/usuarios`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(usuarioData)
        });
        
        console.log('📥 Respuesta del servidor - Status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error del servidor:', errorText);
            let errorMessage = `Error ${response.status} al crear usuario`;
            
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (e) {
                // Si no es JSON, usar el texto como está
            }
            
            throw new Error(errorMessage);
        }
        
        const usuarioCreado = await response.json();
        console.log('✅ Usuario creado exitosamente:', usuarioCreado);
        
        return usuarioCreado;
        
    } catch (error) {
        console.error('❌ Error al crear usuario:', error);
        throw error;
    }
}

// Actualizar usuario
async function actualizarUsuario(id, usuarioData) {
    try {
        const token = localStorage.getItem('sirevif_token');
        if (!token) {
            throw new Error('No hay sesión activa');
        }
        
        console.log(`📤 Actualizando usuario ID: ${id}`, usuarioData);
        console.log(`🔍 comisariaId enviado: ${usuarioData.comisariaId} (tipo: ${typeof usuarioData.comisariaId})`);
        
        const response = await fetch(`${GATEWAY_URL}/usuarios/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(usuarioData)
        });
        
        console.log('📥 Respuesta del servidor - Status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error del servidor:', errorText);
            let errorMessage = `Error ${response.status} al actualizar usuario`;
            
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (e) {
                // Si no es JSON, usar el texto como está
            }
            
            throw new Error(errorMessage);
        }
        
        const usuarioActualizado = await response.json();
        console.log('✅ Usuario actualizado exitosamente:', usuarioActualizado);
        
        return usuarioActualizado;
        
    } catch (error) {
        console.error('❌ Error al actualizar usuario:', error);
        throw error;
    }
}

// Modificar estado de usuario 
async function cambiarEstadoUsuario(id, nuevoEstado) {
    try {
        const token = localStorage.getItem('sirevif_token');
        if (!token) {
            throw new Error('No hay sesión activa');
        }
        
        console.log(`🔄 Cambiando estado del usuario ID: ${id} a ${nuevoEstado}`);
        
        const response = await fetch(`${GATEWAY_URL}/usuarios/${id}/estado`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ estado: nuevoEstado })
        });
        
        console.log('📥 Respuesta del servidor - Status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error del servidor:', errorText);
            let errorMessage = `Error ${response.status} al cambiar estado`;
            
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (e) {
                // Si no es JSON, usar el texto como está
            }
            
            throw new Error(errorMessage);
        }
        
        const usuarioActualizado = await response.json();
        console.log('✅ Estado cambiado exitosamente:', usuarioActualizado);
        
        return usuarioActualizado;
        
    } catch (error) {
        console.error('❌ Error al cambiar estado:', error);
        throw error;
    }
}

// Eliminar usuario
async function eliminarUsuario(id) {
    try {
        const token = localStorage.getItem('sirevif_token');
        if (!token) {
            throw new Error('No hay sesión activa');
        }
        
        console.log(`🗑️ Eliminando usuario ID: ${id}`);
        
        const response = await fetch(`${GATEWAY_URL}/usuarios/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📥 Respuesta del servidor - Status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error del servidor:', errorText);
            let errorMessage = `Error ${response.status} al eliminar usuario`;
            
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (e) {
                // Si no es JSON, usar el texto como está
            }
            
            throw new Error(errorMessage);
        }
        
        console.log('✅ Usuario eliminado exitosamente');
        return true;
        
    } catch (error) {
        console.error('❌ Error al eliminar usuario:', error);
        throw error;
    }
}

// Cargar usuarios
async function cargarUsuarios() {
    try {
        const token = localStorage.getItem('sirevif_token');
        if (!token) {
            console.error('❌ No hay token en localStorage');
            throw new Error('No hay sesión activa. Por favor, inicie sesión nuevamente.');
        }
        
        console.log('🔑 Token encontrado:', token.substring(0, 20) + '...');
        console.log('🌐 Cargando usuarios desde gateway...');
        
        const response = await fetch(`${GATEWAY_URL}/usuarios`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📥 Status de respuesta:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error en respuesta:', errorText);
            
            // Si es error 401 o 403, probablemente el token expiró
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('sirevif_token');
                localStorage.removeItem('sirevif_usuario');
                throw new Error('Su sesión ha expirado. Por favor, inicie sesión nuevamente.');
            }
            
            let errorMessage = `Error ${response.status} al cargar usuarios`;
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (e) {
                // Si no es JSON, usar el texto como está
            }
            
            throw new Error(errorMessage);
        }
        
        const usuarios = await response.json();
        console.log('✅ Usuarios cargados:', usuarios.length, 'usuarios');
        
        // Verificar que los usuarios tengan comisaria_rol, rolId y comisariaId
        usuarios.forEach(usuario => {
            console.log(`👤 ${usuario.nombre}: comisaria_rol=${usuario.comisaria_rol}, rolId=${usuario.rolId}, comisariaId=${usuario.comisariaId}`);
        });
        
        usuariosRegistrados = usuarios;
        renderizarUsuarios();
        
    } catch (error) {
        console.error('❌ Error completo en cargarUsuarios:', error);
        
        // Si es error de sesión, redirigir al login
        if (error.message.includes('sesión') || error.message.includes('token')) {
            await mostrarError(error.message, 'Sesión expirada').then(() => {
                cerrarSesion();
            });
        } else {
            await mostrarError('Error al cargar usuarios: ' + error.message);
        }
    }
}

// ===== FUNCIÓN PARA RENDERIZAR USUARIOS =====
function renderizarUsuarios() {
    // Limpiar todas las secciones
    document.querySelectorAll('.usuarios').forEach(seccion => {
        seccion.innerHTML = '';
    });
    
    // Si no hay usuarios, mostrar mensaje
    if (usuariosRegistrados.length === 0) {
        const primeraSeccion = document.querySelector('.usuarios');
        if (primeraSeccion) {
            primeraSeccion.innerHTML = '<p class="sin-usuarios">No hay usuarios registrados</p>';
        }
        return;
    }
    
    // Agrupar usuarios por comisaría
    const usuariosPorComisaria = {};
    
    usuariosRegistrados.forEach(usuario => {
        const comisaria = usuario.comisaria_rol || 'Sin asignar';
        
        if (!usuariosPorComisaria[comisaria]) {
            usuariosPorComisaria[comisaria] = [];
        }
        
        usuariosPorComisaria[comisaria].push(usuario);
    });
    
    // Renderizar cada grupo
    for (const [comisaria, usuarios] of Object.entries(usuariosPorComisaria)) {
        // Buscar la sección correspondiente
        const secciones = document.querySelectorAll('.seccionUsuarios');
        let seccionEncontrada = null;
        
        secciones.forEach(seccion => {
            const titulo = seccion.querySelector('.tituloSec');
            if (titulo && titulo.textContent.includes(comisaria)) {
                const usuariosContainer = seccion.querySelector('.usuarios');
                if (usuariosContainer) {
                    seccionEncontrada = usuariosContainer;
                }
            }
        });
        
        // Si no encontró sección específica, usar la primera disponible
        if (!seccionEncontrada && document.querySelector('.usuarios')) {
            seccionEncontrada = document.querySelector('.usuarios');
        }
        
        if (seccionEncontrada) {
            usuarios.forEach(usuario => {
                const tarjetaUsuario = crearTarjetaUsuario(usuario);
                seccionEncontrada.appendChild(tarjetaUsuario);
            });
        }
    }
}

// Crear tarjeta de usuario
function crearTarjetaUsuario(usuario) {
    const div = document.createElement('div');
    div.className = 'usuario-tarjeta';
    div.dataset.id = usuario.id;
    
    // Determinar clase CSS según estado
    const estadoClase = usuario.estado === 'inactivo' ? 'usuario-inactivo' : '';
    
    div.innerHTML = `
        <div class="contenedor-tabla ${estadoClase} usuario-card">
            <table class="tabla-usuario">
                <tr>
                    <td><strong>Nombre:</strong></td>
                    <td>${usuario.nombre}</td>
                </tr>
                <tr>
                    <td><strong>Documento:</strong></td>
                    <td>${usuario.documento}</td>
                </tr>
                <tr>
                    <td><strong>Cargo:</strong></td>
                    <td>${usuario.cargo}</td>
                </tr>
                <tr>
                    <td><strong>Correo:</strong></td>
                    <td>${usuario.correo}</td>
                </tr>
                <tr>
                    <td><strong>Teléfono:</strong></td>
                    <td>${usuario.telefono}</td>
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
                <button title="Editar usuario" class="btn-editar" data-id="${usuario.id}"> <img class="accionUsuario" src="/Frontend/images/editar.png"></button>
                <button class="btn-estado" data-id="${usuario.id}" data-estado="${usuario.estado}">
                    ${usuario.estado === 'inactivo' ? '<img title="Habilitar usuario" class="accionUsuario" src="/Frontend/images/habilitar.png">' : '<img title="Inhabilitar usuario" class="accionUsuario" src="/Frontend/images/inhabilitar.png">'}
                </button>
                <button title="Eliminar usuario" class="btn-eliminar" data-id="${usuario.id}"><img class="accionUsuario" src="/Frontend/images/borrar.png"></button>
            </div>
        </div>
    `;
    
    // Agregar event listeners a los botones
    const btnEditar = div.querySelector('.btn-editar');
    const btnEstado = div.querySelector('.btn-estado');
    const btnEliminar = div.querySelector('.btn-eliminar');
    
    if (btnEditar) {
        btnEditar.addEventListener('click', () => editarUsuario(usuario.id));
    }
    
    if (btnEstado) {
        btnEstado.addEventListener('click', () => cambiarEstadoUsuarioHandler(usuario.id, usuario.estado));
    }
    
    if (btnEliminar) {
        btnEliminar.addEventListener('click', () => eliminarUsuarioHandler(usuario.id));
    }
    
    return div;
}

// Envío de formulario
async function manejarEnvioFormulario(event) {
    event.preventDefault();
    
    // Validar formulario completo
    if (!validarFormularioCompleto()) {
        // No mostrar alerta de SweetAlert2, solo las validaciones visuales
        return;
    }
    
    // Obtener referencias a los elementos del formulario
    const nombreInput = document.getElementById('nombreUsuario');
    const documentoInput = document.getElementById('documentoUsuario');
    const cargoInput = document.getElementById('cargoUsuario');
    const correoInput = document.getElementById('correoUsuario');
    const telefonoInput = document.getElementById('telefonoUsuario');
    const comisariaSelect = document.getElementById('comisariaUsuario');
    const contraseñaInput = document.getElementById('contraseñaUsuario');
    
    // Obtener valores
    const nombre = nombreInput.value.trim();
    const documento = documentoInput.value.trim();
    const cargo = cargoInput.value.trim();
    const correo = correoInput.value.trim();
    const telefono = telefonoInput.value.trim();
    const comisaria = comisariaSelect.value;
    const contraseña = contraseñaInput.value.trim();
    
    // Obtener rolId y comisariaId según la comisaría seleccionada
    const rolId = obtenerRolIdPorComisaria(comisaria);
    const comisariaId = obtenerComisariaIdPorComisaria(comisaria);
    
    console.log(`🎯 Comisaría seleccionada: ${comisaria}`);
    console.log(`📋 rolId calculado: ${rolId} (tipo: ${typeof rolId})`);
    console.log(`🏢 comisariaId calculado: ${comisariaId} (tipo: ${typeof comisariaId})`);
    console.log(`📝 Modo edición: ${modoEdicionUsuario}, ID editando: ${usuarioEditandoId}`);
    
    // Preparar datos del usuario (incluyendo comisariaId)
    const usuarioData = {
        nombre,
        documento: parseInt(documento),
        cargo,
        correo,
        telefono,
        comisaria_rol: comisaria,
        rolId: rolId,
        comisariaId: comisariaId  // ✅ NUEVO: Incluir comisariaId (ya es número)
    };
    
    // Asegurar que comisariaId sea un número
    if (usuarioData.comisariaId === undefined || usuarioData.comisariaId === null) {
        usuarioData.comisariaId = 0;
        console.log('⚠️ comisariaId era undefined/null, asignando valor por defecto: 0');
    }
    
    if (contraseña) {
        usuarioData.contraseña = contraseña;
    }
    
    console.log('📝 Datos del usuario a guardar:', usuarioData);
    console.log('🔍 Verificación final - comisariaId:', usuarioData.comisariaId, 'tipo:', typeof usuarioData.comisariaId);
    
    showLoaderUsuario(modoEdicionUsuario ? 'Actualizando usuario...' : 'Creando usuario...');
    
    // Determinar si es creación o actualización
    if (modoEdicionUsuario && usuarioEditandoId) {
        // Verificar si se está editando el usuario actual Y si se cambió la contraseña
        const esMiUsuario = esUsuarioActual(usuarioEditandoId);
        const contraseñaCambiada = contraseña && contraseña.length > 0;
        
        // Actualizar usuario existente
        actualizarUsuario(usuarioEditandoId, usuarioData)
            .then(async (usuarioActualizado) => {
                hideLoaderUsuario();
                console.log('✅ Usuario actualizado:', usuarioActualizado);
                console.log('📋 Comisaría actualizada:', usuarioActualizado.comisaria_rol);
                console.log('📋 rolId actualizado:', usuarioActualizado.rolId);
                console.log('🏢 comisariaId actualizado:', usuarioActualizado.comisariaId);
                
                // Si el usuario actual cambió su contraseña, cerrar sesión
                if (esMiUsuario && contraseñaCambiada) {
                    await mostrarExito('Usuario actualizado exitosamente. Su contraseña ha sido cambiada, por favor inicie sesión nuevamente.', 'Contraseña actualizada');
                    setTimeout(() => {
                        cerrarSesion();
                    }, 1500);
                    return;
                }
                
                await mostrarExito('Usuario actualizado exitosamente');
                cerrarFormulario();
                cargarUsuarios(); // Recargar lista de usuarios
            })
            .catch(async (error) => {
                hideLoaderUsuario();
                console.error('❌ Error completo al actualizar:', error);
                await mostrarError('Error al actualizar usuario: ' + error.message);
            });
    } else {
        // Crear nuevo usuario
        crearUsuario(usuarioData)
            .then(async (usuarioCreado) => {
                hideLoaderUsuario();
                await mostrarExito('Usuario creado exitosamente');
                cerrarFormulario();
                cargarUsuarios(); // Recargar lista de usuarios
            })
            .catch(async (error) => {
                hideLoaderUsuario();
                console.error('❌ Error completo al crear:', error);
                await mostrarError('Error al crear usuario: ' + error.message);
            });
    }
}

// Modificar estado de usuario
async function cambiarEstadoUsuarioHandler(id, estadoActual) {
    const nuevoEstado = estadoActual === 'activo' ? 'inactivo' : 'activo';
    const accion = nuevoEstado === 'inactivo' ? 'inhabilitar' : 'activar';
    
    // Verificar si es el usuario actual
    const esMiUsuario = esUsuarioActual(id);
    
    if (esMiUsuario && nuevoEstado === 'inactivo') {
        // Confirmación para inhabilitar si propio usuario
        const confirmado = await mostrarConfirmacionCritica(
            'Está a punto de inhabilitar SU PROPIA cuenta.<br><br><strong>¿Está seguro?</strong><br><br>Esto cerrará su sesión inmediatamente.',
            '⚠️ ATENCIÓN CRÍTICA',
            'Sí, inhabilitar mi cuenta',
            'Cancelar'
        );
        
        if (!confirmado) {
            return;
        }
    } else {
        // Confirmación general
        const confirmado = await mostrarConfirmacion(
            `¿Está seguro de que desea ${accion} este usuario?`,
            'Confirmar acción',
            `Sí, ${accion}`,
            'Cancelar'
        );
        
        if (!confirmado) {
            return;
        }
    }
    
    try {
        showLoaderUsuario(`${accion === 'inhabilitar' ? 'Inhabilitando' : 'Activando'} usuario...`);
        
        const usuarioActualizado = await cambiarEstadoUsuario(id, nuevoEstado);
        
        hideLoaderUsuario();
        
        // Cerrar sesion si la cuenta ingresada es inhabilitada
        if (esMiUsuario && nuevoEstado === 'inactivo') {
            await mostrarExito('Usuario inhabilitado exitosamente. Su sesión se cerrará automáticamente.', 'Cuenta inhabilitada');
            setTimeout(() => {
                cerrarSesion();
            }, 1500);
            return;
        } else {
            await mostrarExito(`Usuario ${accion === 'inhabilitar' ? 'inhabilitado' : 'activado'} exitosamente`);
        }
        
        // Recargar la lista de usuarios
        cargarUsuarios();
        
    } catch (error) {
        hideLoaderUsuario();
        await mostrarError(`Error al ${accion} usuario: ${error.message}`);
    }
}

// Eliminar usuario
async function eliminarUsuarioHandler(id) {
    const usuario = usuariosRegistrados.find(u => u.id === id);
    
    if (!usuario) {
        await mostrarError('Usuario no encontrado');
        return;
    }
    
    // Verificar si es el usuario actual
    const esMiUsuario = esUsuarioActual(id);
    
    // Mensaje de confirmación según el caso
    let pregunta, titulo, textoConfirmar;
    
    if (esMiUsuario) {
        // Confirmación al eliminar su propio usuario
        titulo = '⚠️ ADVERTENCIA CRÍTICA';
        pregunta = 'Está a punto de eliminar SU PROPIA cuenta.<br><br><strong>¿Está absolutamente seguro?</strong><br><br>Esta acción es:<br>• <strong>IRREVERSIBLE</strong><br>• Cerrará su sesión inmediatamente<br>• Perderá acceso permanentemente';
        textoConfirmar = 'Sí, eliminar mi cuenta';
    } else if (usuario.estado === 'activo') {
        // Confirmación al eliminar un usuario que se encuentra activo
        titulo = 'Confirmar eliminación';
        pregunta = 'Este usuario está <strong>ACTIVO</strong>.<br><br>¿Está seguro de eliminarlo?<br><br><em>Sugerencia: Considere inhabilitarlo en lugar de eliminarlo.</em>';
        textoConfirmar = 'Sí, eliminar';
    } else {
        // Confirmación general
        titulo = 'Confirmar eliminación';
        pregunta = '¿Está seguro de eliminar este usuario?';
        textoConfirmar = 'Sí, eliminar';
    }
    
    const confirmado = await mostrarConfirmacionCritica(
        pregunta,
        titulo,
        textoConfirmar,
        'Cancelar'
    );
    
    if (!confirmado) {
        return;
    }
    
    try {
        showLoaderUsuario('Eliminando usuario...');
        
        await eliminarUsuario(id);
        
        hideLoaderUsuario();
        
        // Cerrar sesion si se eliminó el usuario actual
        if (esMiUsuario) {
            await mostrarExito('Usuario eliminado exitosamente. Su sesión se cerrará automáticamente.', 'Cuenta eliminada');
            setTimeout(() => {
                cerrarSesion();
            }, 1500);
            return;
        } else {
            await mostrarExito('Usuario eliminado exitosamente');
        }
        
        cargarUsuarios(); 
        
    } catch (error) {
        hideLoaderUsuario();
        console.error('❌ Error al eliminar usuario:', error);
        await mostrarError('Error al eliminar usuario: ' + error.message);
    }
}

// Editar usuario
async function editarUsuario(id) {
    const usuario = usuariosRegistrados.find(u => u.id === id);
    
    if (!usuario) {
        await mostrarError('Usuario no encontrado');
        return;
    }
    
    // Confirmar edicion en caso de que el usuario este inactivo
    if (usuario.estado === 'inactivo') {
        const confirmado = await mostrarConfirmacion(
            'Este usuario está INACTIVO. ¿Desea editarlo de todos modos?',
            'Usuario inactivo',
            'Sí, editar',
            'Cancelar'
        );
        
        if (!confirmado) {
            return;
        }
    }
    
    // Activar modo edición
    modoEdicionUsuario = true;
    usuarioEditandoId = id;
    
    console.log(`📝 Editando usuario ID: ${id}`);
    console.log(`📋 Datos actuales: comisaria_rol=${usuario.comisaria_rol}, rolId=${usuario.rolId}, comisariaId=${usuario.comisariaId}`);
    
    // Llenar formulario con datos del usuario
    document.getElementById('nombreUsuario').value = usuario.nombre || '';
    document.getElementById('documentoUsuario').value = usuario.documento || '';
    document.getElementById('cargoUsuario').value = usuario.cargo || '';
    document.getElementById('correoUsuario').value = usuario.correo || '';
    document.getElementById('telefonoUsuario').value = usuario.telefono || '';
    document.getElementById('comisariaUsuario').value = usuario.comisaria_rol || '';
    
    // Configurar campo de contraseña para edición
    const contraseñaInput = document.getElementById('contraseñaUsuario');
    if (contraseñaInput) {
        contraseñaInput.value = '';
        contraseñaInput.placeholder = 'Nueva contraseña (dejar vacío para no cambiar)';
        contraseñaInput.style.backgroundColor = '#ffffff';
        contraseñaInput.readOnly = false;
    }
    
    // Cambiar título
    const titulo = document.querySelector('.headerF h2');
    if (titulo) {
        titulo.textContent = 'Editar Usuario';
    }
    
    // Cambiar botón
    const boton = document.getElementById('crearUsuario');
    if (boton) {
        boton.textContent = 'Actualizar Usuario';
        boton.id = 'crearUsuario';
    }
    
    // Abrir formulario
    document.getElementById('formularioOverlay').style.display = 'flex';
}

// Loader
function showLoaderUsuario(text = 'Procesando...') {
    const loader = document.getElementById('loaderUsuario');
    const loaderText = document.getElementById('loaderUsuarioText');
    if (loader && loaderText) {
        loader.style.display = 'flex';
        loaderText.textContent = text;
    }
}

function hideLoaderUsuario() {
    const loader = document.getElementById('loaderUsuario');
    if (loader) {
        loader.style.display = 'none';
    }
}

// Mostrar u ocultar contraseña por medio de ícono
function setupToggleContraseña() {
    const mostrar = document.getElementById('mostrar');
    const ocultar = document.getElementById('ocultar');
    const input = document.getElementById('contraseñaUsuario');
    
    if (!mostrar || !ocultar || !input) return;
    
    // Remover event listeners anteriores
    mostrar.removeEventListener('click', mostrarContraseña);
    ocultar.removeEventListener('click', ocultarContraseña);
    
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

// Configurar botón para generar contraseña
function setupBotonGenerarContraseña() {
    const botonGenerar = document.getElementById('generarContraseñaBtn');
    if (botonGenerar) {
        botonGenerar.addEventListener('click', generarContraseñaAutomatica);
    }
}

// Validación de campos
function setupValidaciones() {
    // Validación de campos de texto (solo letras y espacios)
    document.querySelectorAll('input[type="text"]:not(.correo)').forEach(element => {
        element.addEventListener('input', function() {
            this.value = this.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
            // Validar en tiempo real
            if (this.id === 'nombreUsuario' || this.id === 'cargoUsuario') {
                validarCampoObligatorio(this);
            }
        });
    });
    
    // Validación de campos numéricos (solo números)
    document.querySelectorAll('input[type="number"]').forEach(element => {
        element.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '');
            if (this.value.length > 10) {
                this.value = this.value.slice(0, 10);
            }
            // Validar en tiempo real
            if (this.id === 'documentoUsuario') {
                validarDocumento(this);
            } else if (this.id === 'telefonoUsuario') {
                validarTelefono(this);
            }
        });
    });
    
    // Validación de correo en tiempo real
    const correoInput = document.getElementById('correoUsuario');
    if (correoInput) {
        correoInput.addEventListener('input', function() {
            validarCorreo(this);
        });
    }
    
    // Validación de select en tiempo real
    const comisariaSelect = document.getElementById('comisariaUsuario');
    if (comisariaSelect) {
        comisariaSelect.addEventListener('change', function() {
            validarSelect(this);
        });
    }
    
    // Validación de contraseña en tiempo real (solo en modo creación)
    const contraseñaInput = document.getElementById('contraseñaUsuario');
    if (contraseñaInput) {
        contraseñaInput.addEventListener('input', function() {
            validarContraseña(this);
        });
    }
}

// Reset formulario
function resetFormulario() {
    modoEdicionUsuario = false;
    usuarioEditandoId = null;
    
    // Restablecer valores del formulario
    document.getElementById('formularioUsuarios').reset();
    
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
        contraseñaInput.style.backgroundColor = '#ffffff';
        contraseñaInput.readOnly = false;
        contraseñaInput.type = 'password';
    }
    
    // Asegurar que el icono de mostrar contraseña esté en estado inicial
    const mostrar = document.getElementById('mostrar');
    const ocultar = document.getElementById('ocultar');
    if (mostrar && ocultar) {
        mostrar.style.display = 'inline';
        ocultar.style.display = 'none';
    }
    
    // Limpiar validaciones
    limpiarValidaciones();
}

// Inicializacion
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 usuarios.js inicializado');
    
    // Verificar permisos de administrador
    const usuarioStorage = localStorage.getItem('sirevif_usuario');
    if (usuarioStorage) {
        try {
            const usuarioData = JSON.parse(usuarioStorage);
            const rolId = usuarioData.rolId;
            
            if (rolId !== 1) {
                mostrarError('No tienes permisos para acceder a esta sección.', 'Acceso denegado').then(() => {
                    window.location.href = '/Frontend/HTML/index.html';
                });
                return;
            }
        } catch (error) {
            console.error('Error al verificar permisos:', error);
            mostrarError('Error al verificar permisos de usuario', 'Error de sesión').then(() => {
                window.location.href = '/Frontend/HTML/login.html';
            });
            return;
        }
    } else {
        mostrarInfo('No hay sesión activa', 'Sesión requerida').then(() => {
            window.location.href = '/Frontend/HTML/login.html';
        });
        return;
    }
    
    // Configurar funcionalidades de abrir/cerrar formulario
    const abrirFormularioBtn = document.getElementById('abrirFormulario');
    const fondo = document.getElementById('formularioOverlay');
    const cancelarBtn = document.querySelector('.botonCancelar');
    
    // Abre el formulario al hacer clic en el botón "Crear Nuevo Usuario"
    if (abrirFormularioBtn) {
        abrirFormularioBtn.addEventListener('click', function() {
            document.getElementById('formularioOverlay').style.display = 'flex';
            resetFormulario();
        });
    }
    
    // Cierra el formulario al hacer clic en el icono de X
    if (cancelarBtn) {
        cancelarBtn.addEventListener('click', cerrarFormulario);
    }
    
    // Cierra el formulario al hacer clic en el fondo
    if (fondo) {
        fondo.addEventListener('click', function(e) {
            if (e.target === fondo) {
                cerrarFormulario();
            }
        });
    }
    
    // Configurar funcionalidades
    setupToggleContraseña();
    setupBotonGenerarContraseña();
    setupValidaciones();
    
    // Cargar usuarios al iniciar
    cargarUsuarios();
    
    // Configurar botón de crear/actualizar
    const botonCrear = document.getElementById('crearUsuario');
    if (botonCrear) {
        botonCrear.addEventListener('click', function(event) {
            event.preventDefault();
            manejarEnvioFormulario(event);
        });
    }
    
    // También configurar el submit del formulario por si acaso
    const formulario = document.getElementById('formularioUsuarios');
    if (formulario) {
        formulario.addEventListener('submit', function(event) {
            event.preventDefault();
            manejarEnvioFormulario(event);
        });
    }
});

// Polifill para Element.prototype.matches
if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.msMatchesSelector || 
                                Element.prototype.webkitMatchesSelector;
}

// Polifill para Element.prototype.closest
if (!Element.prototype.closest) {
    Element.prototype.closest = function(s) {
        var el = this;
        if (!document.documentElement.contains(el)) return null;
        do {
            if (el.matches(s)) return el;
            el = el.parentElement || el.parentNode;
        } while (el !== null && el.nodeType === 1);
        return null;
    };
}