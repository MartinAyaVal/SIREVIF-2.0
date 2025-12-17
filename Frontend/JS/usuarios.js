// ===== VARIABLES GLOBALES =====
let usuariosRegistrados = [];
let modoEdicionUsuario = false;
let usuarioEditandoId = null;

// ===== FUNCIÓN PARA CERRAR FORMULARIO (GLOBAL) =====
function cerrarFormulario() {
    const formularioOverlay = document.getElementById('formularioOverlay');
    if (formularioOverlay) {
        formularioOverlay.style.display = 'none';
        resetFormulario();
    }
}

// ===== FUNCIÓN PARA RESETEAR FORMULARIO =====
function resetFormulario() {
    const formulario = document.getElementById('formularioUsuarios');
    if (formulario) {
        formulario.reset();
        
        // Resetear campos específicos
        const contraseñaInput = document.getElementById('contraseñaUsuario');
        if (contraseñaInput) {
            contraseñaInput.value = '';
            contraseñaInput.style.backgroundColor = 'rgb(229, 229, 229)';
            contraseñaInput.placeholder = '';
        }
        
        // Cambiar título según modo
        const titulo = document.querySelector('.headerF h2');
        if (titulo) {
            titulo.textContent = 'Registrar nuevo Usuario';
        }
        
        // Cambiar texto del botón
        const botonCrear = document.getElementById('crearUsuario');
        if (botonCrear) {
            botonCrear.textContent = 'Crear';
            botonCrear.id = 'crearUsuario';
        }
        
        // Resetear modo edición
        modoEdicionUsuario = false;
        usuarioEditandoId = null;
        
        // Restaurar generación automática de contraseña
        setupGeneracionContraseña();
    }
}

// ===== FUNCIÓN PARA MAPEAR ROL A rolId =====
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
    
    return mapeoRoles[comisaria] || 1; // Default a Administrador si no se encuentra
}

// ===== FUNCIÓN PARA CREAR USUARIO =====
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

// ===== FUNCIÓN PARA ACTUALIZAR USUARIO =====
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

// ===== FUNCIÓN PARA CAMBIAR ESTADO DEL USUARIO =====
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

// ===== FUNCIÓN PARA MANEJAR EL ENVÍO DEL FORMULARIO =====
function manejarEnvioFormulario(event) {
    event.preventDefault();
    
    // Obtener valores del formulario
    const nombre = document.getElementById('nombreUsuario').value.trim();
    const documento = document.getElementById('documentoUsuario').value.trim();
    const cargo = document.getElementById('cargoUsuario').value.trim();
    const correo = document.getElementById('correoUsuario').value.trim();
    const telefono = document.getElementById('telefonoUsuario').value.trim();
    const comisaria = document.getElementById('comisariaUsuario').value;
    const contraseña = document.getElementById('contraseñaUsuario').value.trim();
    
    // Validaciones básicas
    if (!nombre || !documento || !cargo || !correo || !telefono || !comisaria) {
        alert('Todos los campos son obligatorios');
        return;
    }
    
    if (documento.length < 7) {
        alert('El documento debe tener al menos 7 dígitos');
        return;
    }
    
    if (telefono.length < 10) {
        alert('El teléfono debe tener al menos 10 dígitos');
        return;
    }
    
    if (!correo.includes('@')) {
        alert('Ingrese un correo válido');
        return;
    }
    
    // En modo edición, la contraseña es opcional
    if (!modoEdicionUsuario && !contraseña) {
        alert('La contraseña es obligatoria para nuevo usuario');
        return;
    }
    
    // Obtener rolId según la comisaría seleccionada
    const rolId = obtenerRolIdPorComisaria(comisaria);
    
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
    
    // Solo incluir contraseña si se proporcionó una (en edición puede estar vacía)
    if (contraseña) {
        usuarioData.contraseña = contraseña;
    }
    
    console.log('📝 Datos del usuario a guardar:', usuarioData);
    
    // Mostrar loader
    showLoaderUsuario(modoEdicionUsuario ? 'Actualizando usuario...' : 'Creando usuario...');
    
    // Determinar si es creación o actualización
    if (modoEdicionUsuario && usuarioEditandoId) {
        // Actualizar usuario existente
        actualizarUsuario(usuarioEditandoId, usuarioData)
            .then(usuarioActualizado => {
                hideLoaderUsuario();
                alert('✅ Usuario actualizado exitosamente');
                cerrarFormulario();
                cargarUsuarios(); // Recargar lista de usuarios
            })
            .catch(error => {
                hideLoaderUsuario();
                alert('❌ Error al actualizar usuario: ' + error.message);
            });
    } else {
        // Crear nuevo usuario
        crearUsuario(usuarioData)
            .then(usuarioCreado => {
                hideLoaderUsuario();
                alert('✅ Usuario creado exitosamente');
                cerrarFormulario();
                cargarUsuarios(); // Recargar lista de usuarios
            })
            .catch(error => {
                hideLoaderUsuario();
                alert('❌ Error al crear usuario: ' + error.message);
            });
    }
}

// ===== FUNCIONES DEL LOADER =====
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

// ===== FUNCIÓN PARA CARGAR USUARIOS =====
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
        
        // Renderizar usuarios en las secciones correspondientes
        renderizarUsuarios();
        
    } catch (error) {
        console.error('❌ Error al cargar usuarios:', error);
        alert('Error al cargar usuarios: ' + error.message);
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

// ===== FUNCIÓN PARA CREAR TARJETA DE USUARIO =====
function crearTarjetaUsuario(usuario) {
    const div = document.createElement('div');
    div.className = 'usuario-tarjeta';
    div.dataset.id = usuario.id;
    
    // Determinar clase CSS según estado
    const estadoClase = usuario.estado === 'inactivo' ? 'usuario-inactivo' : '';
    const estadoTexto = usuario.estado === 'inactivo' ? '(Inactivo)' : '(Activo)';
    const estadoIcono = usuario.estado === 'inactivo' ? '🔴' : '';
    
    div.innerHTML = `
        <div class="contenedor-tabla ${estadoClase} usuario-card">
            <table class="tabla-usuario">
                <tr>
                    <td><strong>Nombre:</strong></td>
                    <td>${usuario.nombre} ${estadoIcono}</td>
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
                    <td>${usuario.comisaria_rol}</td>
                </tr>
                <tr>
                    <td><strong>Estado:</strong></td>
                    <td class="estado-usuario ${usuario.estado === 'inactivo' ? 'estado-inactivo' : 'estado-activo'}">
                        ${usuario.estado === 'inactivo' ? 'Inactivo' : 'Activo'}
                    </td>
                </tr>
            </table>
            <div class="columna-acciones">
                <button class="btn-editar" data-id="${usuario.id}">✏️ Editar</button>
                <button class="btn-estado" data-id="${usuario.id}" data-estado="${usuario.estado}">
                    ${usuario.estado === 'inactivo' ? '✅ Activar' : '⛔ Inhabilitar'}
                </button>
                <button class="btn-eliminar" data-id="${usuario.id}">🗑️ Eliminar</button>
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
        btnEliminar.addEventListener('click', () => eliminarUsuario(usuario.id));
    }
    
    return div;
}

// ===== FUNCIÓN PARA MANEJAR EL CAMBIO DE ESTADO =====
async function cambiarEstadoUsuarioHandler(id, estadoActual) {
    const nuevoEstado = estadoActual === 'activo' ? 'inactivo' : 'activo';
    const accion = nuevoEstado === 'inactivo' ? 'inhabilitar' : 'activar';
    
    if (!confirm(`¿Está seguro de que desea ${accion} este usuario?`)) {
        return;
    }
    
    try {
        showLoaderUsuario(`${accion === 'inhabilitar' ? 'Inhabilitando' : 'Activando'} usuario...`);
        
        const usuarioActualizado = await cambiarEstadoUsuario(id, nuevoEstado);
        
        hideLoaderUsuario();
        alert(`✅ Usuario ${accion === 'inhabilitar' ? 'inhabilitado' : 'activado'} exitosamente`);
        
        // Recargar la lista de usuarios
        cargarUsuarios();
        
    } catch (error) {
        hideLoaderUsuario();
        alert(`❌ Error al ${accion} usuario: ${error.message}`);
    }
}

// ===== FUNCIÓN PARA EDITAR USUARIO =====
function editarUsuario(id) {
    const usuario = usuariosRegistrados.find(u => u.id === id);
    
    if (!usuario) {
        alert('Usuario no encontrado');
        return;
    }
    
    // Verificar si el usuario está activo para permitir edición
    if (usuario.estado === 'inactivo') {
        if (!confirm('Este usuario está inactivo. ¿Desea editarlo de todos modos?')) {
            return;
        }
    }
    
    // Activar modo edición
    modoEdicionUsuario = true;
    usuarioEditandoId = id;
    
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
        boton.id = 'crearUsuario'; // Mantener mismo ID para simplificar
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

// ===== FUNCIÓN PARA ELIMINAR USUARIO =====
async function eliminarUsuario(id) {
    const usuario = usuariosRegistrados.find(u => u.id === id);
    
    if (!usuario) {
        alert('Usuario no encontrado');
        return;
    }
    
    // Mensaje de confirmación especial para usuarios activos
    let mensajeConfirmacion = '¿Está seguro de eliminar este usuario?';
    if (usuario.estado === 'activo') {
        mensajeConfirmacion = 'Este usuario está activo. ¿Está seguro de eliminarlo? Considere inhabilitarlo en lugar de eliminarlo.';
    }
    
    if (!confirm(mensajeConfirmacion)) {
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
        alert('✅ Usuario eliminado exitosamente');
        cargarUsuarios(); // Recargar lista
        
    } catch (error) {
        hideLoaderUsuario();
        console.error('❌ Error al eliminar usuario:', error);
        alert('Error al eliminar usuario: ' + error.message);
    }
}

// ===== FUNCIONALIDAD DE GENERACIÓN AUTOMÁTICA DE CONTRASEÑA =====
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
        const comisaria = comisariaSelect.value;
        
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
    
    // Escuchar cambios en todos los campos relevantes
    nombreInput.addEventListener('input', generarContraseñaAutomatica);
    documentoInput.addEventListener('input', generarContraseñaAutomatica);
    comisariaSelect.addEventListener('change', generarContraseñaAutomatica);
    
    // Generar contraseña inicial si hay datos
    generarContraseñaAutomatica();
}

// ===== FUNCIONALIDAD TOGGLE VISIBILIDAD CONTRASEÑA =====
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

// ===== VALIDACIONES DE CAMPOS =====
function setupValidaciones() {
    // Validación de campos de texto (solo letras y espacios)
    document.querySelectorAll('input[type="text"]:not(.correo)').forEach(element => {
        element.addEventListener('input', function() {
            this.value = this.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
        });
    });
    
    // Validación de campos numéricos (solo números)
    document.querySelectorAll('input[type="number"]').forEach(element => {
        element.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '');
            if (this.value.length > 10) {
                this.value = this.value.slice(0, 10);
            }
        });
    });
}

// Funciones de validación existentes (mantener)
function resaltarVacío(input) {
    if (input.value.trim() === '') {
        input.style.border = '2px solid #ff0000';
        input.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.27)';
        const mensaje = input.nextElementSibling;
        if (mensaje && mensaje.classList.contains('mensaje')) {
            mensaje.style.display = 'block';
        }
    } else {
        input.style.border = '';
        input.style.boxShadow = '';
        const mensaje = input.nextElementSibling;
        if (mensaje && mensaje.classList.contains('mensaje')) {
            mensaje.style.display = 'none';
        }
    }
}

function validarCorreo(input) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const verificacion = regex.test(input.value);
    const mensaje = input.nextElementSibling.nextElementSibling;
    
    if (!verificacion) {
        input.style.border = '2px solid #ff0000';
        input.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.27)';
        if (mensaje && mensaje.classList.contains('mensaje')) {
            mensaje.style.display = 'block';
        }
    } else {
        input.style.border = '';
        input.style.boxShadow = '';
        if (mensaje && mensaje.classList.contains('mensaje')) {
            mensaje.style.display = 'none';
        }
    }
}

function verificarMinDocumento(input) {
    const mensaje = input.nextElementSibling.nextElementSibling;
    if (input.value.length < 7) {
        input.style.border = '2px solid #ff0000';
        input.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.27)';
        if (mensaje && mensaje.classList.contains('mensaje')) {
            mensaje.style.display = 'block';
        }
    } else {
        input.style.border = '';
        input.style.boxShadow = '';
        if (mensaje && mensaje.classList.contains('mensaje')) {
            mensaje.style.display = 'none';
        }
    }
}

function verificarMinTelefono(input) {
    const mensaje = input.nextElementSibling.nextElementSibling;
    if (input.value.length < 10) {
        input.style.border = '2px solid #ff0000';
        input.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.27)';
        if (mensaje && mensaje.classList.contains('mensaje')) {
            mensaje.style.display = 'block';
        }
    } else {
        input.style.border = '';
        input.style.boxShadow = '';
        if (mensaje && mensaje.classList.contains('mensaje')) {
            mensaje.style.display = 'none';
        }
    }
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 usuarios.js inicializado');
    
    // Verificar permisos de administrador
    const usuarioStorage = localStorage.getItem('sirevif_usuario');
    if (usuarioStorage) {
        try {
            const usuarioData = JSON.parse(usuarioStorage);
            const rolId = usuarioData.rolId;
            
            if (rolId !== 1) {
                alert('⛔ No tienes permisos para acceder a esta sección.');
                window.location.href = '/Frontend/HTML/index.html';
                return;
            }
        } catch (error) {
            console.error('Error al verificar permisos:', error);
            window.location.href = '/Frontend/HTML/login.html';
            return;
        }
    } else {
        window.location.href = '/Frontend/HTML/login.html';
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
    
    // Cierra el formulario al hacer clic en el botón cancelar (X)
    if (cancelarBtn) {
        cancelarBtn.addEventListener('click', cerrarFormulario);
    }
    
    // Cierra el formulario al hacer clic fuera del mismo
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