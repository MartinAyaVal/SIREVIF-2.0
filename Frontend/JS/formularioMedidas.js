// Función para calcular la edad según la fecha de nacimiento
function calcularEdad(fechaNacimiento, edad) {
    
    if (!fechaNacimiento) {
        edad.value = '0';
        return;
    }
    
    const fechaNac = new Date(fechaNacimiento);
    const hoy = new Date();
    
    let valorEdad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
        valorEdad--;
    }
    
    if (fechaNac > hoy || valorEdad < 0) {
        edad.value = 'Fecha inválida';
        edad.style.color = 'red';
        edad.style.border = '2px solid #ff0000';
        edad.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.27)';
    } else {
        edad.value = valorEdad;
        edad.style.color = 'black';
        edad.style.border = '1px solid #aaa';
        edad.style.boxShadow = 'none';
    }
}

// Calcular edad de la victima basado en la fecha de nacimiento
document.getElementById('fechaNacimientoV').addEventListener('change', function() {
    const edad = document.getElementById('edadV');
    const fecha = this.value
    calcularEdad(fecha, edad);
});

// Calcular edad del victimario basado en la fecha de nacimiento
document.getElementById('fechaNacimientoVr').addEventListener('change', function() {
    const edad = document.getElementById('edadVr');
    const fecha = this.value
    calcularEdad(fecha, edad);
});

// Calcular edad de victima extra 1 basado en la fecha de nacimiento
document.getElementById('fechaNacimientoVE1').addEventListener('change', function() {
    const edad = document.getElementById('edadVE1');
    const fecha = this.value
    calcularEdad(fecha, edad);
});

// Calcular edad de victima extra 2 basado en la fecha de nacimiento
document.getElementById('fechaNacimientoVE2').addEventListener('change', function() {
    const edad = document.getElementById('edadVE2');
    const fecha = this.value
    calcularEdad(fecha, edad);
});

// Calcular edad de victima extra 1 basado en la fecha de nacimiento
document.getElementById('fechaNacimientoVE3').addEventListener('change', function() {
    const edad = document.getElementById('edadVE3');
    const fecha = this.value
    calcularEdad(fecha, edad);
});

// Calcular edad de victima extra 1 basado en la fecha de nacimiento
document.getElementById('fechaNacimientoVE4').addEventListener('change', function() {
    const edad = document.getElementById('edadVE4');
    const fecha = this.value
    calcularEdad(fecha, edad);
});

// Calcular edad de victima extra 1 basado en la fecha de nacimiento
document.getElementById('fechaNacimientoVE5').addEventListener('change', function() {
    const edad = document.getElementById('edadVE5');
    const fecha = this.value
    calcularEdad(fecha, edad);
});

// Funcionalidad mostrar campos "otro tipo de documento".
function otroDocumento(dato1, dato2) {
    const valor = this.value;
    console.log('Tipo de documento:');
    console.log(valor);
    const cual = document.querySelectorAll(dato1);
    const tabla = document.querySelector(dato2); 
    
    if (valor === 'otro') { 
        cual.forEach(fila => {
            fila.style.display = 'table-cell'; 
        });
        if (tabla) {
            tabla.style.width = '25%';
        }
        
        if (cual.length > 1) {
            cual[1].scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }
    } else {
        cual.forEach(fila => {
            fila.style.display = ''; 
        });
        if (tabla) {
            tabla.style.width = '';
        }
    }
}

// Mostrar "otro tipo de documento" para víctima
const tipoV = document.getElementById('tipoDocumentoV');
tipoV.addEventListener('change', function() {
    otroDocumento.call(this, '.otroDocumentoV', '.tablaF4V td');
});

// Mostrar "otro tipo de documento" para víctimario
const tipoVR = document.getElementById('tipoDocumentoVR');
tipoVR.addEventListener('change', function() {
    otroDocumento.call(this, '.otroDocumentoVR', '.tablaF4VR td');
});

// Funcionalidad mostrar opción para elegir cantidad de víctimas extras
const mostrarS = document.getElementById('mostrar');
mostrarS.addEventListener('change', function() {
    const valor = this.value;
    console.log('¿Desea ingresar más víctimas?');
    console.log(valor)
    const cantidad = document.querySelectorAll('.cantidad');
    const seccion = document.querySelector('.extras');
    
    if (valor === 'si') { 
        cantidad.forEach(fila => {
            fila.style.display = 'table-row'; 
        });
        cantidad[1].scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    } else {
        seccion.style.display = 'none';
        cantidad.forEach(fila => {
            fila.style.display = 'none';
        });
        this.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }
});

// Funcionalidad mostrar campos de identificación LGTBI
function lgtbi(dato1, dato2) {
   const valor = this.value;
    console.log('Tipo de documento:');
    console.log(valor);
    const info = document.querySelectorAll(dato1);
    const tabla = document.querySelector(dato2);
    
    if (valor === 'si') { 
        info.forEach(fila => {
            fila.style.display = 'table-cell'; 
        });
        tabla.style.width = '25%';
        info[1].scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    } else {
        info.forEach(fila => {
            fila.style.display = ''; 
        });
        tabla.style.width = '';
    } 
}

// Mostrar input para otra identificación de LGTBI
function cuallgtbi(dato1, dato2) {
   const valor = this.value;
    console.log('Tipo de documento:');
    console.log(valor);
    const info = document.querySelectorAll(dato1);
    const tabla = document.querySelector(dato2);
    
    if (valor === 'otro') { 
        info.forEach(fila => {
            fila.style.display = 'table-cell'; 
        });
        tabla.style.width = '25%';
        info[1].scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    } else {
        info.forEach(fila => {
            fila.style.display = ''; 
        });
        tabla.style.width = '';
    } 
}

const cualGeneroV = document.getElementById('generoVictima');
cualGeneroV.addEventListener('change', function() {
    cuallgtbi.call(this, '.cualGeneroVictima', '.tablaInfoGeneroVictima td');
});

const cualGeneroVr = document.getElementById('generoVictimario');
cualGeneroVr.addEventListener('change', function() {
    cuallgtbi.call(this, '.cualGeneroVictimario', '.tablaInfoGeneroVictimario td');
});

// Mostrar input para otra identificación de LGTBI para victimas extras
function cuallgtbi2(dato) {
   const valor = this.value;
    console.log('Tipo de documento:');
    console.log(valor);
    const info = document.querySelectorAll(dato);
    
    if (valor === 'otro') { 
        info.forEach(fila => {
            fila.style.display = 'table-cell'; 
        });
        info[1].scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    } else {
        info.forEach(fila => {
            fila.style.display = ''; 
        });
    } 
}

const cualGeneroV2 = document.getElementById('cualVE1');
cualGeneroV2.addEventListener('change', function() {
    cuallgtbi2.call(this, '.otroGeneroVE1');
}); 

const cualGeneroV3 = document.getElementById('cualVE2');
cualGeneroV3.addEventListener('change', function() {
    cuallgtbi2.call(this, '.otroGeneroVE2');
}); 

const cualGeneroV4 = document.getElementById('cualVE3');
cualGeneroV4.addEventListener('change', function() {
    cuallgtbi2.call(this, '.otroGeneroVE3');
}); 

const cualGeneroV5 = document.getElementById('cualVE4');
cualGeneroV5.addEventListener('change', function() {
    cuallgtbi2.call(this, '.otroGeneroVE4');
}); 

const cualGeneroV6 = document.getElementById('cualVE5');
cualGeneroV6.addEventListener('change', function() {
    cuallgtbi2.call(this, '.otroGeneroVE5');
}); 

// Funcionalidad mostrar campos de identificación LGTBI para víctimas extras
function lgtbiExtras(dato) {
    const valor = this.value;
    console.log('Tipo de documento:');
    console.log(valor)
    const cual = document.querySelectorAll(dato);
    
    if (valor === 'si') { 
        cual.forEach(fila => {
            fila.style.display = 'table-cell'; 
        });
    } else {
        cual.forEach(fila => {
            fila.style.display = ''; 
        });
    }
}

// Mostrar campo de identificación LGTBI para víctima
const generoVictima = document.getElementById('perteneceVictima');
generoVictima.addEventListener('change', function() {
    lgtbi.call(this, '.perteneceVictima', '.tablaInfoGeneroVictima td');
});

// Mostrar campo de identificación LGTBI para victimario
const generoVictimario = document.getElementById('perteneceVictimario');
generoVictimario.addEventListener('change', function() {
    lgtbi.call(this, '.perteneceVictimario', '.tablaInfoGeneroVictimario td');
});

// Mostrar campo de identificación LGTBI para victima extra 1
const generoVR1 = document.getElementById('perteneceVE1');
generoVR1.addEventListener('change', function() {
    lgtbiExtras.call(this, '.perteneceVE1');
});

// Mostrar campo de identificación LGTBI para victima extra 2
const generoVR2 = document.getElementById('perteneceVE2');
generoVR2.addEventListener('change', function() {
    lgtbiExtras.call(this, '.perteneceVE2');
});
// Mostrar campo de identificación LGTBI para victima extra 3
const generoVR3 = document.getElementById('perteneceVE3');
generoVR3.addEventListener('change', function() {
    lgtbiExtras.call(this, '.perteneceVE3');
});

// Mostrar campo de identificación LGTBI para victima extra 4
const generoVR4 = document.getElementById('perteneceVE4');
generoVR4.addEventListener('change', function() {
    lgtbiExtras.call(this, '.perteneceVE4');
});

// Mostrar campo de identificación LGTBI para victima extra 5
const generoVR5 = document.getElementById('perteneceVE5');
generoVR5.addEventListener('change', function() {
    lgtbiExtras.call(this, '.perteneceVE5');
});

// Funcionalidad mostrar secciones para ingresar información de víctimas extras
const cantidadV = document.getElementById('cantidad');
cantidadV.addEventListener('change', function() {
    const seccion = document.querySelector('.extras');
    const victimasExtras = document.querySelectorAll('.victimaExtra');
    
    const valor = this.value;
    console.log('¿Cuántas víctimas extras desea ingresar?');
    console.log(valor)
    
    if (valor === '1') {
        seccion.style.display = 'block';
        seccion.style.display = 'block';
        const victima1 = document.getElementById('victimaExtra1');
        const victima2 = document.getElementById('victimaExtra2');
        const victima3 = document.getElementById('victimaExtra3');
        const victima4 = document.getElementById('victimaExtra4');
        const victima5 = document.getElementById('victimaExtra5');
        victima1.style.display = 'block';
        victima2.style.display = 'none';
        victima3.style.display = 'none';
        victima4.style.display = 'none';
        victima5.style.display = 'none';
        victima1.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    } else if (valor === '2') {
       seccion.style.display = 'block';
        const victima1 = document.getElementById('victimaExtra1');
        const victima2 = document.getElementById('victimaExtra2');
        const victima3 = document.getElementById('victimaExtra3');
        const victima4 = document.getElementById('victimaExtra4');
        const victima5 = document.getElementById('victimaExtra5');
        victima1.style.display = 'block';
        victima2.style.display = 'block';
        victima3.style.display = 'none';
        victima4.style.display = 'none';
        victima5.style.display = 'none';
        victima1.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    } else if (valor === '3') {
        seccion.style.display = 'block';
        const victima1 = document.getElementById('victimaExtra1');
        const victima2 = document.getElementById('victimaExtra2');
        const victima3 = document.getElementById('victimaExtra3');
        const victima4 = document.getElementById('victimaExtra4');
        const victima5 = document.getElementById('victimaExtra5');
        victima1.style.display = 'block';
        victima2.style.display = 'block';
        victima3.style.display = 'block';
        victima4.style.display = 'none';
        victima5.style.display = 'none';
        victima1.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    } else if (valor === '4') {
        seccion.style.display = 'block';
        const victima1 = document.getElementById('victimaExtra1');
        const victima2 = document.getElementById('victimaExtra2');
        const victima3 = document.getElementById('victimaExtra3');
        const victima4 = document.getElementById('victimaExtra4');
        const victima5 = document.getElementById('victimaExtra5');
        victima1.style.display = 'block';
        victima2.style.display = 'block';
        victima3.style.display = 'block';
        victima4.style.display = 'block';
        victima5.style.display = 'none';
        victima1.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    } else if (valor === '5') {
        seccion.style.display = 'block';
        const victima1 = document.getElementById('victimaExtra1');
        const victima2 = document.getElementById('victimaExtra2');
        const victima3 = document.getElementById('victimaExtra3');
        const victima4 = document.getElementById('victimaExtra4');
        const victima5 = document.getElementById('victimaExtra5');
        victima1.style.display = 'block';
        victima2.style.display = 'block';
        victima3.style.display = 'block';
        victima4.style.display = 'block';
        victima5.style.display = 'block';
        victima1.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    } else {
        seccion.style.display = 'none';
    }
});

// Validación del número de medida (máximo 3 dígitos)
document.getElementById('numeroMedida').addEventListener('keypress', function(e) {
    const input = document.getElementById('numeroMedida');

    if (e.key === 'Enter') {
        const valor = Number(input.value);
        console.log(valor + 0);
    }
});

// Función para validar número de medida (máximo 3 dígitos)
function numeroMedida(input) {
    input.value = input.value.replace(/[^0-9]/g, '');
    if (input.value.length > 3) {
        input.value = input.value.slice(0, 3); 
    }
}

// Validación en tiempo real del número de medida
document.getElementById('numeroMedida').addEventListener('input', function(e) {
    numeroMedida(this); 
});

// Función para validar números de documento (máximo 10 caracteres, mínimo 7, solo números)
function documento(input) {
    // Filtrar solo números (0-9)
    input.value = input.value.replace(/[^0-9]/g, '');
    
    // Limitar a 10 caracteres máximo
    if (input.value.length > 10) {
        input.value = input.value.slice(0, 10); 
    } 
    
    // Validar mínimo de 7 caracteres
    if(input.value.length < 7 && input.value.length > 0) {
        input.style.border = '2px solid #ff0000';
        input.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.53)';
    } else {
        input.style.border = ''; 
        input.style.boxShadow = '';
    }
}

// Validación en tiempo real del documento de la víctima
const docVictima = document.getElementById('documentoV');
if (docVictima) {
    docVictima.addEventListener('input', function(e) {
        documento(this); 
    });
}

// Validación en tiempo real del documento del victimario
const docVictimario = document.getElementById('documentoVictimario');
if (docVictimario) {
    docVictimario.addEventListener('input', function(e) {
        documento(this); 
    });
}

// Validación en tiempo real del documento de víctimas extras
for (let i = 1; i <= 5; i++) {
    const docExtra = document.getElementById(`documentoVE${i}`);
    if (docExtra) {
        docExtra.addEventListener('input', function(e) {
            documento(this); 
        });
    }
}

// Validación de campos de texto (solo letras y espacios)
document.querySelectorAll('input[type="text"]:not(.direccion)').forEach(element => {
    element.addEventListener('input', function() {
        this.value = this.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
        
        const mensaje = this.nextElementSibling;
        if (this.value.trim() === '') {
            this.style.border = '2px solid #ff0000';
            this.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.27)';
            if (mensaje && mensaje.classList.contains('mensajeTexto')) {
                mensaje.style.display = 'block';
            }
        } else {
            this.style.border = '';
            this.style.boxShadow = '';
            if (mensaje && mensaje.classList.contains('mensajeTexto')) {
                mensaje.style.display = 'none';
            }
        }
    });
});

// Funcion para resaltar espacion vacíos de formulario.
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
};

// Función para valdiar formato de correo en campo de formulario.
function validarCorreo(input) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const verificacion = regex.test(input.value);
    const mensaje = input.nextElementSibling.nextElementSibling;

    if (!verificacion) {
        console.log(verificacion);
        input.style.border = '2px solid #ff0000';
        input.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.27)';
        
        if (mensaje && mensaje.classList.contains('mensaje')) {
            mensaje.style.display = 'block';
        }
    } else {
        input.style.border = '';
        input.style.boxShadow = '';
        console.log(verificacion);
        if (mensaje && mensaje.classList.contains('mensaje')) {
            mensaje.style.display = 'none';
        }
        
    }
}

// Funcion para verificar minimo de carácteres.
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
};

// Funcion para verificar minimo de carácteres.
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
};

// ===== VALIDACIÓN DEL FORMULARIO DE MEDIDAS =====

// Función para resaltar campos vacíos
function resaltarVacioMedidas(input) {
    if (!input) return;
    
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

// Función para resaltar selects vacíos
function resaltarSelectVacio(select) {
    if (!select) return;
    
    if (select.value === '' || select.value === undefined) {
        select.style.border = '2px solid #ff0000';
        select.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.27)';

        const mensaje = select.nextElementSibling;
        if (mensaje && mensaje.classList.contains('mensaje')) {
            mensaje.style.display = 'block';
        }
    } else {
        select.style.border = '';
        select.style.boxShadow = '';

        const mensaje = select.nextElementSibling;
        if (mensaje && mensaje.classList.contains('mensaje')) {
            mensaje.style.display = 'none';
        }
    }
}

// Función para validar documento con mínimo de caracteres
function verificarMinDocumentoMedidas(input) {
    if (!input) return;
    
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

// Función para validar fechas
function validarFechaMedidas(input) {
    if (!input) return;
    
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

// Función para validar horas (time input)
function validarHoraMedidas(input) {
    if (!input) return;
    
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

// Función auxiliar para validar campos condicionales (que solo se validan si están visibles)
function validarSiEstaVisible(elemento, tipo = 'input') {
    if (!elemento) return false; // Retorna false si no hay error
    
    // Verificar si el elemento está visible (offsetParent !== null)
    if (elemento.offsetParent === null) {
        return false; // No validar si no está visible
    }
    
    if (tipo === 'input') {
        resaltarVacioMedidas(elemento);
        return elemento.style.border.includes('#ff0000'); // Retorna true si hay error
    } else if (tipo === 'select') {
        resaltarSelectVacio(elemento);
        return elemento.style.border.includes('#ff0000'); // Retorna true si hay error
    }
    
    return false;
}

// Validador del formulario de medidas
const guardarMedida = document.getElementById('guardarMedida');

if (guardarMedida) {
    guardarMedida.onclick = function(event) {
        event.preventDefault();
        console.log('Validando formulario de medidas...');
        
        // Función auxiliar para verificar si un campo tiene borde rojo
        function tieneError(campo) {
            if (!campo) return false;
            
            // Verificar diferentes formatos de borde rojo
            const estilos = window.getComputedStyle(campo);
            const borderColor = estilos.borderColor.toLowerCase();
            const backgroundColor = estilos.backgroundColor.toLowerCase();
            
            // Verificar si tiene borde rojo
            const tieneBordeRojo = borderColor.includes('rgb(255, 0, 0)') || 
                                  borderColor.includes('#ff0000') ||
                                  borderColor.includes('red');
            
            // O verificar si tiene fondo rojo (dependiendo de tu implementación)
            const tieneFondoRojo = backgroundColor.includes('rgb(255, 0, 0)') || 
                                  backgroundColor.includes('#ff0000');
            
            return tieneBordeRojo || tieneFondoRojo;
        }
        
        // Ejecutar todas las validaciones primero
        // ===== EJECUTAR TODAS LAS VALIDACIONES =====
        
        // Validar número de medida
        resaltarVacioMedidas(document.getElementById('numeroMedida'));
        
        // ===== VALIDAR VÍCTIMA PRINCIPAL =====
        resaltarVacioMedidas(document.getElementById('nombreV'));
        validarFechaMedidas(document.getElementById('fechaNacimientoV'));
        resaltarSelectVacio(document.getElementById('tipoDocumentoV'));
        resaltarVacioMedidas(document.getElementById('documentoV'));
        verificarMinDocumentoMedidas(document.getElementById('documentoV'));
        resaltarVacioMedidas(document.getElementById('expedicionV'));
        resaltarSelectVacio(document.getElementById('sexoV'));
        resaltarSelectVacio(document.getElementById('perteneceVictima'));
        
        // Validar campos condicionales víctima
        validarSiEstaVisible(document.getElementById('generoVictima'), 'select');
        validarSiEstaVisible(document.getElementById('otroGeneroVictima'), 'input');
        validarSiEstaVisible(document.getElementById('otroTipoV'), 'input');
        
        resaltarSelectVacio(document.getElementById('estadoCivilV'));
        resaltarVacioMedidas(document.getElementById('barrioV'));
        resaltarVacioMedidas(document.getElementById('direccionV'));
        resaltarVacioMedidas(document.getElementById('ocupacionV'));
        resaltarSelectVacio(document.getElementById('estudiosV'));
        resaltarVacioMedidas(document.getElementById('parentesco'));
        resaltarSelectVacio(document.getElementById('mostrar'));
        
        // ===== VALIDAR VICTIMARIO =====
        resaltarVacioMedidas(document.getElementById('nombreVr'));
        validarFechaMedidas(document.getElementById('fechaNacimientoVr'));
        resaltarSelectVacio(document.getElementById('tipoDocumentoVR'));
        resaltarVacioMedidas(document.getElementById('documentoVictimario'));
        verificarMinDocumentoMedidas(document.getElementById('documentoVictimario'));
        resaltarVacioMedidas(document.getElementById('expedicionVr'));
        resaltarSelectVacio(document.getElementById('sexoVr'));
        resaltarSelectVacio(document.getElementById('perteneceVictimario'));
        
        // Validar campos condicionales victimario
        validarSiEstaVisible(document.getElementById('generoVictimario'), 'select');
        validarSiEstaVisible(document.getElementById('otroGeneroVictimario'), 'input');
        validarSiEstaVisible(document.getElementById('otroTipoVr'), 'input');
        
        resaltarSelectVacio(document.getElementById('estadoCivilVr'));
        resaltarVacioMedidas(document.getElementById('barrioVr'));
        resaltarVacioMedidas(document.getElementById('direccionVr'));
        resaltarVacioMedidas(document.getElementById('ocupacionVr'));
        resaltarSelectVacio(document.getElementById('estudiosVr'));
        
        // ===== VALIDAR INFORMACIÓN DE LOS HECHOS =====
        resaltarVacioMedidas(document.getElementById('lugarHechos'));
        resaltarSelectVacio(document.getElementById('tipoViolenciaHechos'));
        validarFechaMedidas(document.getElementById('fechaUltimosHechos'));
        validarHoraMedidas(document.getElementById('horaUltimosHechos'));
        
        // ===== VALIDAR VÍCTIMAS EXTRAS (si se han habilitado) =====
        const cantidadSelect = document.getElementById('cantidad');
        if (cantidadSelect && cantidadSelect.value !== '') {
            const cantidadVictimas = parseInt(cantidadSelect.value);
            
            for (let i = 1; i <= cantidadVictimas; i++) {
                const victimaExtra = document.getElementById(`victimaExtra${i}`);
                
                // Validar solo si la sección está visible
                if (victimaExtra && victimaExtra.style.display !== 'none') {
                    resaltarVacioMedidas(document.getElementById(`nombreVE${i}`));
                    validarFechaMedidas(document.getElementById(`fechaNacimientoVE${i}`));
                    resaltarSelectVacio(document.getElementById(`tipoDocumentoVE${i}`));
                    resaltarVacioMedidas(document.getElementById(`documentoVE${i}`));
                    verificarMinDocumentoMedidas(document.getElementById(`documentoVE${i}`));
                    resaltarVacioMedidas(document.getElementById(`expedicionVE${i}`));
                    resaltarSelectVacio(document.getElementById(`sexoVE${i}`));
                    resaltarSelectVacio(document.getElementById(`perteneceVE${i}`));
                    
                    // Validar campos condicionales LGBTI extras
                    validarSiEstaVisible(document.getElementById(`cualVE${i}`), 'select');
                    validarSiEstaVisible(document.getElementById(`otroGeneroVE${i}`), 'input');
                    validarSiEstaVisible(document.getElementById(`otroTipoVE${i}`), 'input');
                    
                    resaltarSelectVacio(document.getElementById(`estadoCivilVE${i}`));
                    resaltarVacioMedidas(document.getElementById(`barrioVE${i}`));
                    resaltarVacioMedidas(document.getElementById(`direccionVE${i}`));
                    resaltarVacioMedidas(document.getElementById(`ocupacionVE${i}`));
                    resaltarSelectVacio(document.getElementById(`estudiosVE${i}`));
                }
            }
        }
        
        // Esperar un momento para que se apliquen los estilos
        setTimeout(() => {
            // Obtener todos los campos del formulario
            const formulario = document.getElementById('formularioMedidas');
            const todosLosCampos = formulario.querySelectorAll('input, select, textarea');
            
            // Contar campos con error
            let camposConError = 0;
            let camposObligatoriosVisibles = 0;
            
            todosLosCampos.forEach(campo => {
                // Verificar si el campo es visible y requerido
                const esVisible = campo.offsetParent !== null && 
                                 campo.style.display !== 'none' && 
                                 campo.type !== 'hidden';
                
                if (esVisible) {
                    camposObligatoriosVisibles++;
                    
                    // Verificar si tiene error
                    if (tieneError(campo)) {
                        camposConError++;
                        console.log(`Campo con error: ${campo.id || campo.name}`);
                    }
                }
            });
            
            console.log(`Total campos visibles: ${camposObligatoriosVisibles}`);
            console.log(`Campos con error: ${camposConError}`);
            
            if (camposConError === 0) {
                console.log('✓ Validación completada - Sin errores. Recargando página...');
                // Opcional: mostrar un mensaje de éxito
                alert('Formulario validado correctamente. Recargando página...');
                
                // Recargar la página después de 1 segundo
                setTimeout(function() {
                    location.reload();
                }, 1000);
            } else {
                console.log(`✗ Validación completada - ${camposConError} campos con error`);
                // Hacer scroll al primer error
                const primerError = document.querySelector('input[style*="red"], select[style*="red"]') ||
                                   document.querySelector('input[style*="rgb(255, 0, 0)"], select[style*="rgb(255, 0, 0)"]');
                
                if (primerError) {
                    primerError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    primerError.focus();
                }
            }
        }, 50); // Pequeño delay para asegurar que se aplicaron los estilos
    };
} else {
    console.error('No se encontró el botón guardarMedida');
}