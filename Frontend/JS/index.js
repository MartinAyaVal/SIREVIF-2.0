// Funcionalidad mostrar inputs para buscar en medidas de protección
document.getElementById('filtrar').addEventListener('click', () => {
    const botones = document.querySelector('.botonesFiltrar');
    const filtrar = document.querySelector('.botonFiltrar');
    const registrar = document.querySelector('.botonRegistrar');

    if(botones.style.display === 'none' || botones.style.display === '') {
        botones.style.display = 'flex';
        filtrar.style.top = '8%';
        registrar.style.top = '8%';
    } else {
        botones.style.display = 'none';
        filtrar.style.top = '';
        registrar.style.top = '';
    } 
});

// Funcionalidad abrir y cerrar formulario de registro
document.addEventListener('DOMContentLoaded', function() {
    const abrirFormularioBtn = document.getElementById('abrirFormulario');
    const fondo = document.getElementById('formularioOverlay');
    const cancelarBtn = document.querySelector('.botonCancelar');
            
    // Abre el formulario al hacer clic en el botón "Registrar nueva medida de protección"
    abrirFormularioBtn.addEventListener('click', function() {
        formularioOverlay.style.display = 'flex';
    });
            
    // Cierra el formulario
    function cerrarFormulario() {
        formularioOverlay.style.display = 'none';
    }
            
    // Cierra el formulario al hacer clic en el botón cancelar (X)
    cancelarBtn.addEventListener('click', cerrarFormulario);
            
    // Cierra el formulario al hacer clic fuera del mismo
    fondo.addEventListener('click', function(e) {
        if (e.target === fondo) {
            cerrarFormulario();
        }
    });
});