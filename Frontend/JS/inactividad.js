let inactivityTimer;
const INACTIVITY_TIMEOUT = 1 * 1000; // 15 minutos

// Tiempo limite por inactividad
function resetInactivityTimer() {
    clearTimeout(inactivityTimer);

    inactivityTimer = setTimeout(() => {
        console.log('⏰ Tiempo de inactividad excedido');
        cerrarSesionAutomatica('Su sesión ha expirado por inactividad (15 minutos).');
    }, INACTIVITY_TIMEOUT);
}

function setupInactivityTracking() {
    // Eventos que resetean el timer
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
        document.addEventListener(event, resetInactivityTimer, { passive: true });
    });
    
    // Iniciar el timer
    resetInactivityTimer();
    
    console.log('⏰ Sistema de timeout por inactividad activado (15 minutos)');
}

// Cerrar sesión
async function cerrarSesionAutomatica(mensaje = 'Su sesión ha expirado por inactividad (15 minutos).') {
    await Swal.fire({
        title: 'Sesión por expirar',
        text: mensaje,
        icon: 'warning',
        confirmButtonText: 'Cerrar sesión',
        confirmButtonColor: '#3085d6',
        cancelButtonText: 'Quedarme',
        showCancelButton: true,
        cancelButtonColor: '#6c757d',
        allowOutsideClick: false,
        allowEscapeKey: false,
        customClass: {
            popup: 'swal-timeout'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // Limpiar localStorage
            localStorage.removeItem('sirevif_token');
            localStorage.removeItem('sirevif_usuario');
            
            // Redirigir a login
            window.location.href = '/Frontend/HTML/login.html';
        } else if (result.isDismissed && result.dismiss === Swal.DismissReason.cancel) {
            // El usuario eligió quedarse, resetear el timer
            console.log('🔄 Usuario eligió quedarse, reiniciando timer de inactividad');
            resetInactivityTimer();
            
            // Mostrar mensaje de confirmación simple
            Swal.fire({
                title: 'Timer reiniciado',
                text: 'Su sesión ha sido extendida.',
                icon: 'success',
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false
            });
        }
    });
}

// Verificar si es el usuario actual (si necesitas esta función)
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

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Página cargada');
    
    // Verificar sesión (si es necesario)
    const token = localStorage.getItem('sirevif_token');
    if (!token) {
        window.location.href = '/Frontend/HTML/login.html';
        return;
    }
    
    // Configurar timeout por inactividad
    setupInactivityTracking();
    
    // Tu código específico de la página aquí...
    // cargarDatosUsuario();
    // configurarEventListeners();
    // etc.
});