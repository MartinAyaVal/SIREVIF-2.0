let usuariosRegistrados = [];
let modoEdicionUsuario = false;
let usuarioEditandoId = null;

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

// Modificacion de rolId dependiendo de Comisaria_rol
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
    
    console.log(`🔍 Obteniendo rolId para comisaría: "${comisaria}" -> ${mapeoRoles[comisaria] || 1}`);
    return mapeoRoles[comisaria] || 1;
}

// Crear nuevo usuario
async function crearUsuario(usuarioData) {
    try {
        const token = localStorage.getItem('sirevif_token');
        if (!token) {
            throw new Error('No hay sesión activa');
        }
        
        console.log('📤 Enviando usuario a crear:', usuarioData);
        
        const response = await fetch('http://localhost:8080/usuarios', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(usuarioData)
        });
        
        console.log('📥 Respuesta del servidor - Status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error ${response.status} al crear usuario`);
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
        
        const response = await fetch(`http://localhost:8080/usuarios/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(usuarioData)
        });
        
        console.log('📥 Respuesta del servidor - Status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error ${response.status} al actualizar usuario`);
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
        
        const response = await fetch(`http://localhost:8080/usuarios/${id}/estado`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ estado: nuevoEstado })
        });
        
        console.log('📥 Respuesta del servidor - Status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error ${response.status} al cambiar estado`);
        }
        
        const usuarioActualizado = await response.json();
        console.log('✅ Estado cambiado exitosamente:', usuarioActualizado);
        
        return usuarioActualizado;
        
    } catch (error) {
        console.error('❌ Error al cambiar estado:', error);
        throw error;
    }
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
    
    // Obtener rolId según la comisaría seleccionada
    const rolId = obtenerRolIdPorComisaria(comisaria);
    console.log(`🎯 Comisaría seleccionada: ${comisaria}, rolId calculado: ${rolId}`);
    console.log(`📝 Modo edición: ${modoEdicionUsuario}, ID editando: ${usuarioEditandoId}`);
    
    // Preparar datos del usuario
    const usuarioData = {
        nombre,
        documento: parseInt(documento),
        cargo,
        correo,
        telefono,
        comisaria_rol: comisaria,
        rolId 
    };
    
    if (contraseña) {
        usuarioData.contraseña = contraseña;
    }
    
    console.log('📝 Datos del usuario a guardar:', usuarioData);
    
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
                await mostrarError('Error al crear usuario: ' + error.message);
            });
    }
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

// Cargar usuarios
async function cargarUsuarios() {
    try {
        const token = localStorage.getItem('sirevif_token');
        if (!token) {
            throw new Error('No hay sesión activa');
        }
        
        const response = await fetch('http://localhost:8080/usuarios', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status} al cargar usuarios`);
        }
        
        usuariosRegistrados = await response.json();
        console.log('✅ Usuarios cargados:', usuariosRegistrados);
        
        // Verificar que los usuarios tengan comisaria_rol y rolId
        usuariosRegistrados.forEach(usuario => {
            console.log(`👤 ${usuario.nombre}: comisaria_rol=${usuario.comisaria_rol}, rolId=${usuario.rolId}`);
        });
        
        // Renderizar usuarios en las secciones correspondientes
        renderizarUsuarios();
        
    } catch (error) {
        console.error('❌ Error al cargar usuarios:', error);
        mostrarError('Error al cargar usuarios: ' + error.message);
    }
}

// ===== FUNCIÓN PARA RENDERIZAR USUARIOS =====
function renderizarUsuarios() {
    // Limpiar todas las secciones
    document.querySelectorAll('.usuarios').forEach(seccion => {
        seccion.innerHTML = '';
    });
    
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
    const btnEliminar = div.querySelector('.btn-liminar'); 
    
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
        const token = localStorage.getItem('sirevif_token');
        if (!token) {
            throw new Error('No hay sesión activa');
        }
        
        showLoaderUsuario('Eliminando usuario...');
        
        const response = await fetch(`http://localhost:8080/usuarios/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status} al eliminar usuario`);
        }
        
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
    console.log(`📋 Datos actuales: comisaria_rol=${usuario.comisaria_rol}, rolId=${usuario.rolId}`);
    
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
    
    // Deshabilitar generación automática de contraseña en modo edición
    const nombreInput = document.getElementById('nombreUsuario');
    const documentoInput = document.getElementById('documentoUsuario');
    const comisariaSelect = document.getElementById('comisariaUsuario');
    
    if (nombreInput && documentoInput && comisariaSelect) {
        // Remover event listeners de generación automática
        nombreInput.removeEventListener('input', generarContraseñaAutomatica);
        documentoInput.removeEventListener('input', generarContraseñaAutomatica);
        comisariaSelect.removeEventListener('change', generarContraseñaAutomatica);
    }
}

// Generar contraseña automaticamente
let generarContraseñaAutomatica = function() {};

function setupGeneracionContraseña() {
    const nombreInput = document.getElementById('nombreUsuario');
    const documentoInput = document.getElementById('documentoUsuario');
    const comisariaSelect = document.getElementById('comisariaUsuario');
    const contraseñaInput = document.getElementById('contraseñaUsuario');
    
    if (!nombreInput || !documentoInput || !comisariaSelect || !contraseñaInput) {
        return;
    }
    
    // Remover event listeners anteriores si existen
    nombreInput.removeEventListener('input', generarContraseñaAutomatica);
    documentoInput.removeEventListener('input', generarContraseñaAutomatica);
    comisariaSelect.removeEventListener('change', generarContraseñaAutomatica);

    // Redefinir la función
    generarContraseñaAutomatica = function() {
        // Solo generar en modo creación (no en edición)
        if (modoEdicionUsuario) return;
        
        const nombre = nombreInput.value.trim();
        const documento = documentoInput.value.trim();
        const valor = comisariaSelect.value;
        comisaria = 0;

        if (valor === 'Administrador'){
            comisaria = 'admin';
        } else if (valor === 'Comisaría Primera'){
            comisaria = 1;
        } else if (valor === 'Comisaría Segunda'){
            comisaria = 2;
        } else if (valor === 'Comisaría Tercera'){
            comisaria = 3;
        } else if (valor === 'Comisaría Cuarta'){
            comisaria = 4;
        } else if (valor === 'Comisaría Quinta'){
            comisaria = 5;
        } else  if (valor === 'Comisaría Sexta'){
            comisaria = 6;
        }
        console.log(comisaria)
        
        if (nombre && documento && comisaria) {
            const primero = nombre.split(' ')[0];
            const valor = `${primero}.${documento}.${comisaria}`.toLowerCase();
            contraseñaInput.value = valor;
            contraseñaInput.style.backgroundColor = 'rgb(229, 229, 229)';
            contraseñaInput.readOnly = true;
        } else {
            contraseñaInput.value = '';
            contraseñaInput.readOnly = false;
        }
    };
    
    nombreInput.addEventListener('input', generarContraseñaAutomatica);
    documentoInput.addEventListener('input', generarContraseñaAutomatica);
    comisariaSelect.addEventListener('change', generarContraseñaAutomatica);
    
    generarContraseñaAutomatica();
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
    setupGeneracionContraseña();
    setupToggleContraseña();
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