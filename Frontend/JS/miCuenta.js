// ===== VARIABLES GLOBALES =====
let usuarioData = null;
let modoEdicion = false;
let datosOriginales = {};

// ===== FUNCIONES DEL LOADER =====
function showLoader(text = 'Cargando información...') {
    const loader = document.getElementById('loaderOverlay');
    const loaderText = document.getElementById('loaderText');
    if (loader && loaderText) {
        loader.style.display = 'flex';
        loaderText.textContent = text;
    }
}

function hideLoader() {
    const loader = document.getElementById('loaderOverlay');
    if (loader) {
        loader.style.display = 'none';
    }
}

// ===== FUNCIONES DE MENSAJES =====
function showSuccess(message) {
    const elem = document.getElementById('successMessage');
    const errorElem = document.getElementById('errorMessage');
    if (elem) {
        elem.textContent = message;
        elem.style.display = 'block';
        if (errorElem) errorElem.style.display = 'none';
        
        setTimeout(() => {
            elem.style.display = 'none';
        }, 5000);
    }
}

function showError(message) {
    const elem = document.getElementById('errorMessage');
    const successElem = document.getElementById('successMessage');
    if (elem) {
        elem.textContent = message;
        elem.style.display = 'block';
        if (successElem) successElem.style.display = 'none';
    }
}

// ===== CÓDIGO DE TOGGLE DE CONTRASEÑA MEJORADO =====
function setupPasswordToggle() {
    const passwordToggle = document.getElementById('passwordToggle');
    const mostrar = document.getElementById('mostrar');
    const ocultar = document.getElementById('ocultar');
    const input = document.getElementById('contraseñaUsuario');
    
    if (!passwordToggle || !mostrar || !ocultar || !input) {
        console.error('❌ Elementos del toggle no encontrados');
        return;
    }
    
    // Inicialmente ocultar el toggle (solo visible en modo edición)
    passwordToggle.style.display = 'none';
    
    // Función para mostrar contraseña
    mostrar.addEventListener('click', function() {
        input.type = 'text';
        mostrar.style.display = 'none';
        ocultar.style.display = 'inline';
    });
    
    // Función para ocultar contraseña
    ocultar.addEventListener('click', function() {
        input.type = 'password';
        mostrar.style.display = 'inline';
        ocultar.style.display = 'none';
    });
    
    console.log('✅ Toggle de contraseña configurado correctamente');
}

// Mostrar/Ocultar toggle según modo
function togglePasswordVisibility(mostrar) {
    const passwordToggle = document.getElementById('passwordToggle');
    if (passwordToggle) {
        passwordToggle.style.display = mostrar ? 'block' : 'none';
    }
}

// ===== FUNCIONES PRINCIPALES =====
async function cargarInformacionUsuario() {
    console.log('🔍 Iniciando carga de información del usuario...');
    showLoader();
    
    try {
        // Obtener token y datos del localStorage
        const token = localStorage.getItem('sirevif_token');
        const usuarioStorage = localStorage.getItem('sirevif_usuario');
        
        console.log('🔍 Token en localStorage:', token ? '✅ Presente' : '❌ Ausente');
        
        if (!token || !usuarioStorage) {
            console.error('❌ ERROR: No hay sesión activa en localStorage');
            throw new Error('No hay sesión activa. Por favor inicia sesión nuevamente.');
        }
        
        usuarioData = JSON.parse(usuarioStorage);
        
        // Verificación rápida del cargo
        console.log('🔍 Cargo en usuarioData:', usuarioData.cargo);
        console.log('🔍 Usuario completo:', usuarioData);
        
        // Cargar datos en el formulario - SIMPLIFICADO
        const campos = {
            'nombreUsuario': usuarioData.nombre || '',
            'documentoUsuario': usuarioData.documento || '',
            'correoUsuario': usuarioData.correo || '',
            'telefonoUsuario': usuarioData.telefono || '',
            'cargoUsuario': usuarioData.cargo || '', // Directo del backend
            'comisariaUsuario': usuarioData.comisaria_rol || '',
            'contraseñaUsuario': '••••••••'
        };
        
        // Llenar cada campo
        for (const [id, valor] of Object.entries(campos)) {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.value = valor;
                elemento.readOnly = true;
                console.log(`✅ Campo ${id}: "${valor}"`);
            } else {
                console.error(`❌ No se encontró el elemento con ID: ${id}`);
            }
        }
        
        // Ocultar toggle de contraseña al inicio
        togglePasswordVisibility(false);
        
        // Actualizar header
        const nombreHeader = document.getElementById('nombreUsuarioHeader');
        const comisariaHeader = document.getElementById('comisariaUsuarioHeader');
        
        if (nombreHeader) {
            let textoHeader = usuarioData.nombre || 'Usuario';
            if (usuarioData.cargo && usuarioData.cargo.trim() !== '') {
                textoHeader += ` - ${usuarioData.cargo}`;
            }
            nombreHeader.textContent = textoHeader;
            console.log('✅ Header nombre actualizado:', textoHeader);
        }
        
        if (comisariaHeader) {
            comisariaHeader.textContent = usuarioData.comisaria_rol || 'Comisaría';
        }
        
        // Guardar datos originales
        datosOriginales = {
            nombre: usuarioData.nombre || '',
            correo: usuarioData.correo || '',
            telefono: usuarioData.telefono || '',
            cargo: usuarioData.cargo || '',
            comisaria_rol: usuarioData.comisaria_rol || '',
        };
        
        console.log('✅ Datos originales guardados:', datosOriginales);
        hideLoader();
        
    } catch (error) {
        console.error('❌ Error al cargar usuario:', error);
        showError('Error al cargar información del usuario: ' + error.message);
        hideLoader();
        
        setTimeout(() => {
            window.location.href = '/Frontend/HTML/login.html';
        }, 3000);
    }
}

function activarModoEdicion() {
    console.log('🔧 Activando modo edición...');
    modoEdicion = true;
    
    // Mostrar toggle de contraseña
    togglePasswordVisibility(true);
    
    // Habilitar campos editables
    const camposEditables = [
        'correoUsuario',
        'telefonoUsuario', 
        'cargoUsuario',
        'contraseñaUsuario'
    ];
    
    camposEditables.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.classList.remove('read-only');
            field.classList.add('edit-mode');
            field.readOnly = false;
            
            // Para la contraseña, limpiar el campo al editar
            if (fieldId === 'contraseñaUsuario') {
                field.value = '';
                field.placeholder = 'Nueva contraseña (dejar vacío para no cambiar)';
                field.type = 'password';
                
                // Resetear iconos del toggle
                const mostrar = document.getElementById('mostrar');
                const ocultar = document.getElementById('ocultar');
                if (mostrar && ocultar) {
                    mostrar.style.display = 'inline';
                    ocultar.style.display = 'none';
                }
            }
        }
    });
    
    // Deshabilitar campos no editables
    const camposNoEditables = [
        'nombreUsuario',
        'documentoUsuario',
        'comisariaUsuario'
    ];
    
    camposNoEditables.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.classList.add('read-only');
            field.readOnly = true;
        }
    });
    
    // Mostrar/ocultar botones
    const editarBtn = document.getElementById('editarBtn');
    const cancelarBtn = document.getElementById('cancelarBtn');
    const guardarBtn = document.getElementById('guardarBtn');
    
    if (editarBtn) editarBtn.style.display = 'none';
    if (cancelarBtn) cancelarBtn.style.display = 'inline-block';
    if (guardarBtn) guardarBtn.style.display = 'inline-block';
    
    // Enfocar en el primer campo editable
    const primerCampo = document.getElementById('correoUsuario');
    if (primerCampo) primerCampo.focus();
}

function desactivarModoEdicion() {
    console.log('🔧 Desactivando modo edición...');
    modoEdicion = false;
    
    // Ocultar toggle de contraseña
    togglePasswordVisibility(false);
    
    // Restaurar valores originales
    const correoField = document.getElementById('correoUsuario');
    const telefonoField = document.getElementById('telefonoUsuario');
    const cargoField = document.getElementById('cargoUsuario');
    const passwordField = document.getElementById('contraseñaUsuario');
    
    if (correoField) correoField.value = datosOriginales.correo || '';
    if (telefonoField) telefonoField.value = datosOriginales.telefono || '';
    if (cargoField) cargoField.value = datosOriginales.cargo || '';
    if (passwordField) {
        passwordField.value = '••••••••';
        passwordField.placeholder = '';
        passwordField.type = 'password';
    }
    
    // Restaurar todos los campos a readonly
    const todosLosCampos = document.querySelectorAll('#formularioUsuarios input');
    todosLosCampos.forEach(field => {
        field.classList.remove('edit-mode');
        field.classList.remove('error-input');
        field.classList.add('read-only');
        field.readOnly = true;
    });
    
    // Mostrar/ocultar botones
    const editarBtn = document.getElementById('editarBtn');
    const cancelarBtn = document.getElementById('cancelarBtn');
    const guardarBtn = document.getElementById('guardarBtn');
    
    if (editarBtn) editarBtn.style.display = 'inline-block';
    if (cancelarBtn) cancelarBtn.style.display = 'none';
    if (guardarBtn) guardarBtn.style.display = 'none';
    
    // Limpiar mensajes
    const successMsg = document.getElementById('successMessage');
    const errorMsg = document.getElementById('errorMessage');
    
    if (successMsg) successMsg.style.display = 'none';
    if (errorMsg) errorMsg.style.display = 'none';
}

async function guardarCambios() {
    console.log('💾 Guardando cambios...');
    showLoader('Guardando cambios...');
    
    try {
        const token = localStorage.getItem('sirevif_token');
        if (!token) throw new Error('No hay sesión activa');
        
        // Obtener valores del formulario
        const correoField = document.getElementById('correoUsuario');
        const telefonoField = document.getElementById('telefonoUsuario');
        const cargoField = document.getElementById('cargoUsuario');
        const passwordField = document.getElementById('contraseñaUsuario');
        
        if (!correoField || !telefonoField || !cargoField || !passwordField) {
            throw new Error('No se encontraron todos los campos del formulario');
        }
        
        const datosActualizados = {
            correo: correoField.value.trim(),
            telefono: telefonoField.value.trim(),
            cargo: cargoField.value.trim(),
            contraseña: passwordField.value.trim()
        };
        
        console.log('📤 Datos a actualizar:', datosActualizados);
        
        // Validaciones
        if (!datosActualizados.correo || !datosActualizados.telefono) {
            throw new Error('Correo y teléfono son obligatorios');
        }
        
        if (!datosActualizados.correo.includes('@')) {
            throw new Error('Correo electrónico inválido');
        }
        
        if (datosActualizados.telefono.length !== 10 || isNaN(datosActualizados.telefono)) {
            throw new Error('Teléfono debe tener exactamente 10 dígitos');
        }
        
        // El cargo puede estar vacío
        if (datosActualizados.cargo && datosActualizados.cargo.trim() === '') {
            datosActualizados.cargo = '';
        }
        
        // Si la contraseña está vacía o es el placeholder, no enviarla
        if (!datosActualizados.contraseña || datosActualizados.contraseña === '••••••••') {
            delete datosActualizados.contraseña;
        } else if (datosActualizados.contraseña.length < 6) {
            throw new Error('La contraseña debe tener al menos 6 caracteres');
        }
        
        // Enviar al backend (actualizar usuario)
        if (!usuarioData || !usuarioData.id) {
            throw new Error('No se encontró ID del usuario');
        }
        
        console.log(`📤 Enviando PUT a: http://localhost:8080/usuarios/${usuarioData.id}`);
        const response = await fetch(`http://localhost:8080/usuarios/${usuarioData.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(datosActualizados)
        });
        
        console.log('📥 Respuesta del servidor - Status:', response.status);
        const data = await response.json();
        console.log('📥 Respuesta del servidor - Data:', data);
        
        if (!response.ok) {
            throw new Error(data.message || `Error ${response.status} al actualizar usuario`);
        }
        
        // Actualizar localStorage con nuevos datos
        usuarioData.correo = datosActualizados.correo;
        usuarioData.telefono = datosActualizados.telefono;
        usuarioData.cargo = datosActualizados.cargo || '';
        
        // Si el backend devuelve datos actualizados, usarlos
        if (data && data.id) {
            usuarioData = data;
            console.log('✅ Usuario actualizado con datos del backend:', usuarioData);
        }
        
        localStorage.setItem('sirevif_usuario', JSON.stringify(usuarioData));
        
        // Actualizar header
        const nombreHeader = document.getElementById('nombreUsuarioHeader');
        if (nombreHeader) {
            let textoHeader = usuarioData.nombre || 'Usuario';
            if (usuarioData.cargo && usuarioData.cargo.trim() !== '') {
                textoHeader += ` - ${usuarioData.cargo}`;
            }
            nombreHeader.textContent = textoHeader;
        }
        
        // Desactivar modo edición
        desactivarModoEdicion();
        
        // Actualizar datos originales
        datosOriginales = {
            correo: datosActualizados.correo,
            telefono: datosActualizados.telefono,
            cargo: datosActualizados.cargo || '',
            comisaria_rol: usuarioData.comisaria_rol,
            nombre: usuarioData.nombre
        };
        
        hideLoader();
        showSuccess('✅ Información actualizada correctamente');
        console.log('✅ Cambios guardados exitosamente');
        
    } catch (error) {
        console.error('❌ Error al guardar:', error);
        hideLoader();
        showError(error.message || 'Error al guardar cambios');
    }
}

// ===== FUNCIÓN PARA RECARGAR DATOS DESDE BACKEND =====
async function forzarRecargaDesdeBackend() {
    console.log('🔄 Forzando recarga de datos desde backend...');
    showLoader('Actualizando información...');
    
    try {
        const token = localStorage.getItem('sirevif_token');
        if (!token) throw new Error('No hay sesión activa');
        
        // Obtener ID del usuario
        const usuarioStorage = localStorage.getItem('sirevif_usuario');
        if (!usuarioStorage) throw new Error('No hay datos de usuario');
        
        const usuarioDataTemp = JSON.parse(usuarioStorage);
        const userId = usuarioDataTemp.id;
        
        if (!userId) {
            console.error('❌ No se encontró ID de usuario');
            showError('No se pudo identificar al usuario');
            return;
        }
        
        // Hacer petición al backend para obtener datos actualizados
        console.log(`🔄 Consultando usuario con ID: ${userId}`);
        const response = await fetch(`http://localhost:8080/usuarios/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status} al obtener datos del usuario`);
        }
        
        const usuarioActualizado = await response.json();
        console.log('✅ Datos obtenidos del backend:', usuarioActualizado);
        
        // Guardar en localStorage
        localStorage.setItem('sirevif_usuario', JSON.stringify(usuarioActualizado));
        
        // Recargar la información
        await cargarInformacionUsuario();
        
        showSuccess('✅ Información actualizada desde el servidor');
        
    } catch (error) {
        console.error('❌ Error al forzar recarga:', error);
        showError('No se pudo actualizar la información: ' + error.message);
    } finally {
        hideLoader();
    }
}

// ===== FUNCIÓN DE LOGOUT =====
function logout() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        localStorage.removeItem('sirevif_token');
        localStorage.removeItem('sirevif_usuario');
        window.location.href = '/Frontend/HTML/login.html';
    }
}

// ===== FUNCIÓN DE DEPURACIÓN PARA CONSOLA =====
window.depurarUsuarioData = function() {
    console.log('=== DEPURACIÓN DE USUARIO DATA ===');
    const usuarioStorage = localStorage.getItem('sirevif_usuario');
    if (!usuarioStorage) {
        console.log('❌ No hay datos de usuario en localStorage');
        return;
    }
    
    const usuarioData = JSON.parse(usuarioStorage);
    console.log('Datos completos:', usuarioData);
    
    console.log('=== PROPIEDADES ===');
    for (const key in usuarioData) {
        console.log(`${key}: ${usuarioData[key]} (tipo: ${typeof usuarioData[key]})`);
    }
    
    return usuarioData;
};

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 miCuenta.js inicializado correctamente');
    
    // Configurar toggle de contraseña
    setupPasswordToggle();
    
    // Cargar información al inicio
    cargarInformacionUsuario();
    
    // Botón editar
    const editarBtn = document.getElementById('editarBtn');
    if (editarBtn) {
        editarBtn.addEventListener('click', activarModoEdicion);
    }
    
    // Botón cancelar
    const cancelarBtn = document.getElementById('cancelarBtn');
    if (cancelarBtn) {
        cancelarBtn.addEventListener('click', desactivarModoEdicion);
    }
    
    // Botón guardar
    const guardarBtn = document.getElementById('guardarBtn');
    if (guardarBtn) {
        guardarBtn.addEventListener('click', guardarCambios);
    }
    
    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
});