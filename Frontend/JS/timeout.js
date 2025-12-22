var inactivityTimer;
const INACTIVITY_TIMEOUT = 15 * 60 * 1000; 

// ===== FUNCIONES PRINCIPALES =====
function resetInactivityTimer() {
    console.log('🔄 Reseteando timer...');
    clearTimeout(inactivityTimer);
    
    inactivityTimer = setTimeout(() => {
        console.log('⏰ ¡TIEMPO EXCEDIDO! Mostrando alerta...');
        cerrarSesionAutomatica();
    }, INACTIVITY_TIMEOUT);
}

function setupInactivityTracking() {
    console.log('🔧 Configurando eventos de actividad...');
    
    // Eventos que indican actividad del usuario
    const events = [
        'mousedown', 'mousemove', 'click',
        'keydown', 'keyup', 'keypress',
        'scroll', 'touchstart', 'touchmove',
        'input', 'change', 'focus'
    ];
    
    // Agregar listeners
    events.forEach(event => {
        document.addEventListener(event, resetInactivityTimer, true);
    });
    
    // Iniciar el timer
    resetInactivityTimer();
    console.log('✅ Sistema de timeout activado');
}

async function cerrarSesionAutomatica() {
    console.log('🔄 Mostrando alerta de timeout...');
    
    try {
        const result = await Swal.fire({
            title: 'Sesión por expirar',
            text: 'Su sesión ha expirado por inactividad (15 minutos).',
            icon: 'warning',
            confirmButtonText: 'Cerrar sesión',
            confirmButtonColor: '#3085d6',
            cancelButtonText: 'Quedarme',
            showCancelButton: true,
            cancelButtonColor: '#6c757d',
            allowOutsideClick: false,
            allowEscapeKey: false,
            backdrop: 'rgba(0,0,0,0.5)'
        });
        
        if (result.isConfirmed) {
            console.log('👤 Usuario confirmó cierre de sesión');
            localStorage.removeItem('sirevif_token');
            localStorage.removeItem('sirevif_usuario');
            window.location.href = '/Frontend/HTML/login.html';
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            console.log('🔄 Usuario eligió quedarse');
            resetInactivityTimer(); // Reiniciar timer
        }
    } catch (error) {
        console.error('❌ Error en SweetAlert:', error);
        // Fallback: redirigir directamente
        localStorage.removeItem('sirevif_token');
        localStorage.removeItem('sirevif_usuario');
        window.location.href = '/Frontend/HTML/login.html';
    }
}

// ===== INICIALIZACIÓN =====
function initTimeoutSystem() {
    console.log('⏰ Inicializando sistema de timeout...');
    
    // 1. Verificar que SweetAlert2 esté cargado
    if (typeof Swal === 'undefined') {
        console.error('❌ SweetAlert2 no está cargado');
        setTimeout(initTimeoutSystem, 1000); // Reintentar en 1 segundo
        return;
    }
    
    // 2. Verificar sesión activa
    const token = localStorage.getItem('sirevif_token');
    if (!token) {
        console.log('⚠️ No hay sesión activa');
        return;
    }
    
    // 3. Inicializar sistema
    setupInactivityTracking();
    
    console.log('✅ Sistema de timeout inicializado correctamente');
}

// ===== EVENTOS =====
// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTimeoutSystem);
} else {
    // DOM ya está listo
    initTimeoutSystem();
}

// Para debugging en consola
window.debugTimeout = function() {
    console.log('🔍 DEBUG - Sistema de timeout:');
    console.log('- Timer activo:', inactivityTimer ? 'Sí' : 'No');
    console.log('- Tiempo configurado:', INACTIVITY_TIMEOUT / 1000, 'segundos');
    console.log('- SweetAlert2 cargado:', typeof Swal !== 'undefined');
    console.log('- Token en localStorage:', localStorage.getItem('sirevif_token') ? 'Sí' : 'No');
};