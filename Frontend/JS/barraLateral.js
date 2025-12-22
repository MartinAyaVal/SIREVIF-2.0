/**
 * ARCHIVO: barraLateral.js (VERSIÓN FINAL)
 * DESCRIPCIÓN: Solo maneja la barra lateral desplegable
 * NOTA: El logout lo maneja cargarHeader.js
 */

console.log('🔧 Inicializando barraLateral.js (solo funcionalidad visual)...');

// ===== VARIABLES GLOBALES =====
let menuContraido = false;
let estadoBarraMobile = false;

// ===== FUNCIONES DE LA BARRA LATERAL =====

function configurarMenuHamburguesa() {
    const hamburguesa = document.getElementById('menuHamburguesa');
    
    if (!hamburguesa) {
        console.error('❌ No se encontró el menú hamburguesa');
        return;
    }
    
    hamburguesa.addEventListener('click', manejarClickHamburguesa);
    console.log('✅ Menú hamburguesa configurado');
}

function manejarClickHamburguesa() {
    const esMobile = window.innerWidth <= 768;
    
    if (esMobile) {
        toggleMenuMobile();
    } else {
        toggleBarraDesktop();
    }
}

function toggleBarraDesktop() {
    menuContraido = !menuContraido;
    
    console.log(`🔄 ${menuContraido ? 'Contrayendo' : 'Expandiendo'} barra lateral`);
    
    // Elementos a alternar
    const elementos = [
        'header', '.logo', '.hamburguesa', '.titulo', 'nav', 
        '.actual', '.botonSalir', '.medidas'
    ];
    
    elementos.forEach(selector => {
        const elemento = document.querySelector(selector);
        if (elemento) elemento.classList.toggle('contraer');
    });
    
    // Elementos múltiples
    document.querySelectorAll('.texto, .botonBarra, .imgBarra').forEach(el => {
        el.classList.toggle('contraer');
    });
    
    // Ajustar posiciones
    actualizarPosicionElementos(menuContraido);
    
    // Guardar estado
    localStorage.setItem('barraContraida', menuContraido);
}

function toggleMenuMobile() {
    const barra = document.getElementById('barra');
    if (!barra) return;
    
    estadoBarraMobile = !estadoBarraMobile;
    barra.classList.toggle('menu-abierto');
    document.body.style.overflow = estadoBarraMobile ? 'hidden' : 'auto';
}

function actualizarPosicionElementos(contraido) {
    const ajustes = [
        { selector: '.botonFiltrar', left: contraido ? '25%' : '' },
        { selector: '.botonRegistrar', left: contraido ? '52%' : '' },
        { selector: '.seccionBotonesComisarias', left: contraido ? '7%' : '', width: contraido ? '92%' : '' },
        { selector: '.botonesFiltrar', left: contraido ? '27%' : '', right: contraido ? '16%' : '' }
    ];
    
    ajustes.forEach(config => {
        const elemento = document.querySelector(config.selector);
        if (elemento) {
            elemento.style.left = contraido ? config.left : '';
            elemento.style.width = contraido ? config.width : '';
            elemento.style.right = contraido ? config.right : '';
        }
    });
}

function configurarBotonesNavegacionMobile() {
    document.querySelectorAll('.botonBarra, .actual').forEach(boton => {
        boton.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                const barra = document.getElementById('barra');
                if (barra && barra.classList.contains('menu-abierto')) {
                    barra.classList.remove('menu-abierto');
                    document.body.style.overflow = 'auto';
                }
            }
        });
    });
}

function configurarCierreClickExterno() {
    document.addEventListener('click', (event) => {
        if (window.innerWidth <= 768) {
            const barra = document.getElementById('barra');
            const hamburguesa = document.getElementById('menuHamburguesa');
            
            if (!barra || !hamburguesa) return;
            
            const clickEnBarra = barra.contains(event.target);
            const clickEnHamburguesa = hamburguesa.contains(event.target);
            
            if (!clickEnBarra && !clickEnHamburguesa && barra.classList.contains('menu-abierto')) {
                barra.classList.remove('menu-abierto');
                document.body.style.overflow = 'auto';
            }
        }
    });
}

function cargarEstadoBarra() {
    if (window.innerWidth > 768) {
        const barraContraida = localStorage.getItem('barraContraida') === 'true';
        
        if (barraContraida) {
            console.log('📂 Cargando barra contraída desde localStorage');
            toggleBarraDesktop(); // Esto la contraerá
        }
    }
}

function manejarResize() {
    if (window.innerWidth <= 768) {
        // Modo móvil: asegurar que no esté en modo contraído
        document.querySelectorAll('.contraer').forEach(el => {
            el.classList.remove('contraer');
        });
        menuContraido = false;
        actualizarPosicionElementos(false);
    } else {
        // Modo desktop: cerrar menú móvil si está abierto
        const barra = document.getElementById('barra');
        if (barra) {
            barra.classList.remove('menu-abierto');
            document.body.style.overflow = 'auto';
        }
    }
}

// ===== INICIALIZACIÓN =====

function inicializarBarraLateral() {
    console.log('🚀 Inicializando funcionalidad de barra lateral');
    
    configurarMenuHamburguesa();
    cargarEstadoBarra();
    configurarBotonesNavegacionMobile();
    configurarCierreClickExterno();
    window.addEventListener('resize', manejarResize);
    manejarResize();
    
    console.log('✅ Barra lateral lista (logout manejado por cargarHeader.js)');
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarBarraLateral);
} else {
    inicializarBarraLateral();
}

// Función para cerrar sesión
function cerrarSesion() {
    // Limpiar localStorage
    localStorage.removeItem('sirevif_token');
    localStorage.removeItem('sirevif_usuario');
    
    // Redirigir a login
    window.location.href = '/Frontend/HTML/login.html';
}

// En el evento DOMContentLoaded de barraLateral.js, modifica el logoutBtn:
document.getElementById('logoutBtn').addEventListener('click', function(e) {
    e.preventDefault();
    
    // Mostrar confirmación
    if (confirm('¿Está seguro de que desea cerrar sesión?')) {
        cerrarSesion();
    }
});