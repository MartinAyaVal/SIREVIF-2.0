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
    "Conectando con el servidor",
    "Generando token de acceso"
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
    mensajeError.textContent = message;
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
            // Redirigir automáticamente si hay sesión
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

// === PRUEBA DE CONEXIÓN ===
async function probarConexion() {
    try {
        console.log('🔍 Probando conexión con gateway...');
        const response = await fetch('http://localhost:8080/health', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Gateway no responde: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Gateway OK:', data);
        return true;
        
    } catch (error) {
        console.error('❌ Error conectando con gateway:', error);
        mostrarError('No se puede conectar al Gateway. Verifica que esté corriendo en puerto 8080.');
        return false;
    }
}

// === MANEJADOR DE SUBMIT ===
async function manejarSubmit(e) {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🚀 Submit del formulario detectado');
    
    // Obtener valores del formulario
    const documento = document.getElementById('documento').value.trim();
    const contrasena = document.getElementById('contrasena').value;
    
    // Validar campos
    if (!documento || !contrasena) {
        mostrarError('Por favor ingresa documento y contraseña');
        return;
    }
    
    // Validar que documento sea numérico
    if (isNaN(documento) || documento.length < 5) {
        mostrarError('Documento inválido. Debe ser un número de cédula válido');
        return;
    }
    
    // Primero probar conexión
    const conexionOK = await probarConexion();
    if (!conexionOK) {
        return;
    }
    
    // Mostrar loader
    mostrarLoader();
    
    try {
        const payload = {
            documento: parseInt(documento),
            contrasena: contrasena
        };
        
        console.log('📤 Enviando al servidor:', { 
            documento: payload.documento, 
            contrasena: '***' + contrasena.substring(contrasena.length - 3) 
        });
        console.log('🌐 URL destino: http://localhost:8080/usuarios/auth/login');
        
        // Enviar petición al Gateway SIN timeout primero
        const response = await fetch('http://localhost:8080/usuarios/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
            // Sin timeout para ver qué pasa
        });
        
        console.log('📥 Respuesta HTTP status:', response.status);
        console.log('📥 Respuesta headers:', Object.fromEntries(response.headers.entries()));
        
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
            throw new Error('Respuesta inválida del servidor: ' + responseText.substring(0, 100));
        }
        
        if (response.ok && data.success) {
            // Guardar token y datos de usuario
            localStorage.setItem('sirevif_token', data.token);
            console.log('✅ Token guardado:', data.token.substring(0, 20) + '...');
            
            if (data.usuario) {
                console.log('👤 Datos del usuario:', data.usuario);
                localStorage.setItem('sirevif_usuario', JSON.stringify(data.usuario));
            } else {
                console.warn('⚠️ No se recibieron datos de usuario');
            }

            // Ingreso exitoso
            textoLoader.textContent = "¡Autenticación exitosa!";
            textoLoader.style.color = "#4CAF50";
            
            // Pequeña pausa para feedback visual
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Redirigir a index
            console.log('🔄 Redirigiendo a dashboard...');
            window.location.href = '/Frontend/HTML/index.html';
            
        } else {
            ocultarLoader();
            mostrarError(data.message || data.error || `Error ${response.status}: Error desconocido`);
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
    
    // Enfocar automáticamente en el campo documento
    const documentoInput = document.getElementById('documento');
    if (documentoInput) {
        documentoInput.focus();
        console.log('✅ Foco puesto en campo documento');
    }
    
    // Limpiar mensajes cuando el usuario empiece a escribir
    if (documentoInput) {
        documentoInput.addEventListener('input', () => {
            if (mensajeError) mensajeError.style.display = 'none';
            if (mensajeExito) mensajeExito.style.display = 'none';
        });
    }
    
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
    
    // DEBUG: Mostrar instrucciones
    console.log('🔧 Para probar manualmente, ejecuta en la consola:');
    console.log('   fetch("http://localhost:8080/usuarios/auth/login", {');
    console.log('     method: "POST",');
    console.log('     headers: {"Content-Type": "application/json"},');
    console.log('     body: JSON.stringify({documento: 12345678, contrasena: "test"})');
    console.log('   }).then(r => r.text()).then(console.log).catch(console.error)');
});

// Función global para pruebas
window.probarLogin = async function(documento, contrasena) {
    console.log('🧪 Probando login con:', documento);
    
    const response = await fetch('http://localhost:8080/usuarios/auth/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ documento, contrasena })
    });
    
    const text = await response.text();
    console.log('📥 Respuesta:', text);
    return text;
};