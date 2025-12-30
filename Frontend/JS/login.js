const formulario = document.getElementById('formulario');
const boton = document.getElementById('boton');
const textoBoton = document.getElementById('textoBoton');
const loader = document.getElementById('loader');
const textoLoader = document.querySelector('.textoLoader');
const mensajeError = document.getElementById('mensajeError');
const mensajeExito = document.getElementById('mensajeExito');
        
const textosLoader = [
    "Autenticando usuario",
    "Verificando credenciales",
    "Conectando con el servidor"
];
        
let loaderStateIndex = 0;
let loaderInterval;

function mostrarLoader() {
    loader.style.display = 'flex';
    document.body.classList.add('loading-active');
    boton.classList.add('loading');
    boton.disabled = true;

    loaderInterval = setInterval(() => {
        loaderStateIndex = (loaderStateIndex + 1) % textosLoader.length;
        textoLoader.textContent = textosLoader[loaderStateIndex];
    }, 2000);
}
        
function ocultarLoader() {
    loader.style.display = 'none';
    document.body.classList.remove('loading-active');
    boton.classList.remove('loading');
    boton.disabled = false;
    clearInterval(loaderInterval);
    loaderStateIndex = 0;
    textoLoader.textContent = textosLoader[0];
}
        
function mostrarError(message) {
    mensajeError.innerHTML = message;
    mensajeError.style.display = 'block';
    mensajeExito.style.display = 'none';
}

// === VERIFICAR SESIÓN EXISTENTE ===
function verificarSesionExistente() {
    const token = localStorage.getItem('sirevif_token');
    const usuario = localStorage.getItem('sirevif_usuario');
    
    if (token && usuario) {
        try {
            const userData = JSON.parse(usuario);
            console.log('✅ Sesión activa encontrada para:', userData.nombre);
            setTimeout(() => {
                window.location.href = '/Frontend/HTML/index.html';
            }, 1000);
        } catch (e) {
            console.log('❌ Sesión corrupta, limpiando...');
            localStorage.removeItem('sirevif_token');
            localStorage.removeItem('sirevif_usuario');
        }
    }
}

// === PRUEBA DE CONEXIÓN - MEJORADA ===
async function probarConexion() {
    try {
        console.log('🔍 Probando conexión con gateway...');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch('http://localhost:8080/health', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            },
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`Gateway HTTP ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Gateway OK:', data);
        
        const userServiceHealth = await fetch('http://localhost:8080/usuarios/health', {
            signal: controller.signal
        });
        
        if (!userServiceHealth.ok) {
            throw new Error('Servicio de usuarios no disponible');
        }
        
        const userServiceData = await userServiceHealth.json();
        console.log('✅ Servicio de usuarios OK:', userServiceData);
        
        return true;
        
    } catch (error) {
        console.error('❌ Error conectando con gateway:', error);
        mostrarError('Sin conexión al servidor');
        return false;
    }
}

// === FUNCIÓN PARA VALIDAR DOCUMENTO ===
function validarDocumento(documento) {
    // Remover cualquier caracter no numérico
    documento = documento.replace(/[^0-9]/g, '');
    
    // Validar longitud
    if (documento.length < 5 || documento.length > 10) {
        return {
            valido: false,
            mensaje: 'El documento debe tener entre 5 y 10 dígitos'
        };
    }
    
    // Validar que sea solo números
    if (!/^\d+$/.test(documento)) {
        return {
            valido: false,
            mensaje: 'El documento solo puede contener números'
        };
    }
    
    return {
        valido: true,
        documento: documento
    };
}

// === FUNCIÓN PARA LIMITAR DOCUMENTO ===
function limitarDocumento(input) {
    if (input.value.length > 10) {
        input.value = input.value.slice(0, 10);
    }
    
    // Solo permitir números
    input.value = input.value.replace(/[^0-9]/g, '');
}

// === MANEJADOR DE SUBMIT - MEJORADO ===
async function manejarSubmit(e) {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🚀 Submit del formulario detectado');
    
    // Obtener valores del formulario
    const documento = document.getElementById('documento').value.trim();
    const contrasena = document.getElementById('contrasena').value;
    
    console.log('📝 Datos del formulario:');
    console.log('  • Documento:', documento);
    console.log('  • Contraseña:', contrasena ? '***' + contrasena.substring(contrasena.length - 3) : 'VACÍA');
    
    // Validar campos vacíos
    if (!documento || !contrasena) {
        mostrarError('Por favor ingresa documento y contraseña');
        return;
    }
    
    // Validar documento con función específica
    const validacionDocumento = validarDocumento(documento);
    if (!validacionDocumento.valido) {
        mostrarError(validacionDocumento.mensaje);
        return;
    }
    
    // Validar contraseña
    if (contrasena.length < 4) {
        mostrarError('La contraseña debe tener al menos 4 caracteres');
        return;
    }
    
    // Primero probar conexión
    console.log('🔌 Probando conexión con servidor...');
    const conexionOK = await probarConexion();
    if (!conexionOK) {
        return;
    }
    
    // Mostrar loader
    mostrarLoader();
    
    try {
        // ENVIAR DOCUMENTO COMO STRING
        const payload = {
            documento: validacionDocumento.documento,
            contrasena: contrasena
        };
        
        console.log('📤 Enviando al servidor:', { 
            documento: payload.documento, 
            tipo_documento: typeof payload.documento,
            contrasena: '***' + contrasena.substring(contrasena.length - 3) 
        });
        console.log('🌐 URL destino: http://localhost:8080/usuarios/auth/login');
        
        // Enviar petición con timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        
        const response = await fetch('http://localhost:8080/usuarios/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log('📥 Respuesta HTTP status:', response.status);
        
        // Leer respuesta como texto primero
        const responseText = await response.text();
        console.log('📥 Respuesta completa:', responseText);
        
        let data;
        try {
            data = JSON.parse(responseText);
            console.log('📥 Respuesta JSON parseada:', {
                success: data.success,
                message: data.message,
                tokenLength: data.token ? data.token.length : 'no token',
                usuario: data.usuario ? data.usuario.nombre : 'no usuario'
            });
        } catch (parseError) {
            console.error('❌ Error parseando respuesta:', parseError);
            console.error('❌ Texto completo:', responseText);
            ocultarLoader();
            mostrarError('Respuesta inválida del servidor. Contacta al administrador.');
            return;
        }
        
        if (response.ok && data.success) {
            // VALIDAR DATOS RECIBIDOS
            if (!data.token) {
                throw new Error('No se recibió token de autenticación');
            }
            
            if (!data.usuario) {
                console.warn('⚠️ No se recibieron datos de usuario completos');
                data.usuario = {
                    documento: payload.documento,
                    nombre: 'Usuario',
                    rolId: 0,
                    comisariaId: 0
                };
            }
            
            // Guardar token y datos de usuario
            localStorage.setItem('sirevif_token', data.token);
            console.log('✅ Token guardado en localStorage');
            
            console.log('👤 Datos del usuario:', data.usuario);
            localStorage.setItem('sirevif_usuario', JSON.stringify(data.usuario));

            // Ingreso exitoso
            textoLoader.textContent = "¡Autenticación exitosa!";
            textoLoader.style.color = "#4CAF50";
            
            // Pequeña pausa para feedback visual
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Redirigir a index
            console.log('🔄 Redirigiendo a dashboard...');
            window.location.href = '/Frontend/HTML/index.html';
            
        } else {
            ocultarLoader();
            
            let errorMessage = 'Error de autenticación';
            if (data && data.message) {
                errorMessage = data.message;
            } else if (response.status === 401) {
                errorMessage = 'Documento o contraseña incorrectos';
            } else if (response.status === 404) {
                errorMessage = 'Usuario no encontrado. Verifica tu documento.';
            } else if (data && data.error) {
                errorMessage = data.error;
            }
            
            mostrarError(errorMessage);
            console.error('❌ Error en respuesta:', data);
        }
        
    } catch (error) {
        ocultarLoader();
        console.error('❌ Error de conexión completo:', error);
        console.error('❌ Error name:', error.name);
        console.error('❌ Error message:', error.message);
        
        if (error.name === 'AbortError') {
            mostrarError('Tiempo de espera agotado. El servidor no responde.');
        } else if (error.message.includes('Failed to fetch')) {
            mostrarError('Error de conexión. Verifica:<br>1. Gateway corriendo en puerto 8080<br>2. Servicio de usuarios en puerto 3005<br>3. No hay bloqueos de firewall');
        } else if (error.message.includes('NetworkError')) {
            mostrarError('Error de red. Verifica tu conexión a internet.');
        } else {
            mostrarError(`Error: ${error.message}`);
        }
    }
}

// === INICIALIZACIÓN ===
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ login.js inicializado');
    
    // Verificar sesión existente
    verificarSesionExistente();
    
    // Configurar formulario
    if (formulario) {
        formulario.addEventListener('submit', manejarSubmit);
        console.log('✅ Event listener del formulario configurado');
    } else {
        console.error('❌ No se encontró el formulario con ID "formulario"');
    }
    
    // Configurar campo documento
    const documentoInput = document.getElementById('documento');
    if (documentoInput) {
        // Enfocar automáticamente
        documentoInput.focus();
        console.log('✅ Foco puesto en campo documento');
        
        // Limpiar mensajes cuando el usuario empiece a escribir
        documentoInput.addEventListener('input', function() {
            if (mensajeError) mensajeError.style.display = 'none';
            if (mensajeExito) mensajeExito.style.display = 'none';
            
            // Limitar documento a 10 dígitos y solo números
            limitarDocumento(this);
            
            // Aplicar validación en tiempo real
            const validacion = validarDocumento(this.value);
            if (!validacion.valido && this.value.length > 0) {
                this.style.borderColor = '#d32f2f';
                this.style.boxShadow = '0 0 0 4px rgba(211, 47, 47, 0.1)';
            } else {
                this.style.borderColor = '';
                this.style.boxShadow = '';
            }
        });
        
        // Prevenir pegar texto no numérico
        documentoInput.addEventListener('paste', function(e) {
            e.preventDefault();
            const pastedText = (e.clipboardData || window.clipboardData).getData('text');
            const numbersOnly = pastedText.replace(/[^0-9]/g, '');
            document.execCommand('insertText', false, numbersOnly);
        });
        
        // Validar documento al salir del campo
        documentoInput.addEventListener('blur', function() {
            if (this.value.trim() !== '') {
                const validacion = validarDocumento(this.value);
                if (!validacion.valido) {
                    mostrarError(validacion.mensaje);
                }
            }
        });
        
        // Prevenir teclas no numéricas
        documentoInput.addEventListener('keydown', function(e) {
            // Permitir: backspace, delete, tab, escape, enter
            if ([46, 8, 9, 27, 13, 110].indexOf(e.keyCode) !== -1 ||
                // Permitir: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                (e.keyCode === 65 && e.ctrlKey === true) ||
                (e.keyCode === 67 && e.ctrlKey === true) ||
                (e.keyCode === 86 && e.ctrlKey === true) ||
                (e.keyCode === 88 && e.ctrlKey === true) ||
                // Permitir: home, end, left, right
                (e.keyCode >= 35 && e.keyCode <= 39)) {
                return;
            }
            
            // Asegurar que sea un número
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                e.preventDefault();
            }
        });
    }
    
    // Configurar campo contraseña
    const contrasenaInput = document.getElementById('contrasena');
    if (contrasenaInput) {
        contrasenaInput.addEventListener('input', () => {
            if (mensajeError) mensajeError.style.display = 'none';
            if (mensajeExito) mensajeExito.style.display = 'none';
        });
        
        // Permitir login con Enter en la contraseña
        contrasenaInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                console.log('⌨️ Enter presionado en contraseña');
                formulario.dispatchEvent(new Event('submit'));
            }
        });
    }
    
    // Configurar iconos de mostrar/ocultar contraseña
    const mostrarBtn = document.getElementById('mostrar');
    const ocultarBtn = document.getElementById('ocultar');
    
    if (mostrarBtn && ocultarBtn && contrasenaInput) {
        // Mostrar contraseña
        mostrarBtn.addEventListener('click', function() {
            contrasenaInput.type = 'text';
            mostrarBtn.style.display = 'none';
            ocultarBtn.style.display = 'inline';
        });
        
        // Ocultar contraseña
        ocultarBtn.addEventListener('click', function() {
            contrasenaInput.type = 'password';
            ocultarBtn.style.display = 'none';
            mostrarBtn.style.display = 'inline';
        });
    }
    
    // DEBUG: Mostrar instrucciones
    console.log('🔧 Para probar manualmente, ejecuta en la consola:');
    console.log('   window.probarLogin(12345678, "test123")');
    
    // Mostrar información de la versión
    console.log('📱 Login SIREVIF 2.0 - Versión mejorada');
    console.log('   • Documento limitado a 10 dígitos');
    console.log('   • Iconos locales para mostrar/ocultar contraseña');
    console.log('   • Validación mejorada en tiempo real');
});

// Función global para pruebas
window.probarLogin = async function(documento, contrasena) {
    console.log('🧪 Probando login con:', documento);
    
    const response = await fetch('http://localhost:8080/usuarios/auth/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ documento: documento.toString(), contrasena })
    });
    
    const text = await response.text();
    console.log('📥 Respuesta:', text);
    return text;
};

// Exportar funciones para uso global
window.limitarDocumento = limitarDocumento;
window.validarDocumento = validarDocumento;