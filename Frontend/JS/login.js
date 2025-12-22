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
        
function error(message) {
    mensajeError.textContent = message;
    mensajeError.style.display = 'block';
    mensajeExito.style.display = 'none';
}
        

formulario.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Obtener valores del formulario
    const documento = document.getElementById('documento').value.trim();
    const contrasena = document.getElementById('contrasena').value;
    
    // Validar campos
    if (!documento || !contrasena) {
        error('Por favor ingresa documento y contraseña');
        return;
    }
    
    // Validar que documento sea numérico
    if (isNaN(documento) || documento.length < 5) {
        error('Documento inválido. Debe ser un número de cédula válido');
        return;
    }
    
    // Mostrar loader
    mostrarLoader();
    
    try {
        const payload = {
            documento: parseInt(documento),
            contrasena: contrasena
        };
        
        console.log('📤 Enviando al servidor:', payload);
        
        // Enviar petición al Gateway
        const response = await fetch('http://localhost:8080/usuarios/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });
        
        console.log('📥 Respuesta HTTP status:', response.status);
        
        // Intentar parsear la respuesta
        let data;
        try {
            data = await response.json();
            console.log('📥 Respuesta JSON:', data);
        } catch (parseError) {
            console.error('❌ Error parseando respuesta:', parseError);
            const text = await response.text();
            console.log('📥 Respuesta como texto:', text);
            throw new Error('Respuesta inválida del servidor');
        }
        
        // Pequeña pausa para que se vea el loader
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (response.ok && data.success) {
            // Guardar token y datos de usuario
            localStorage.setItem('sirevif_token', data.token);
            console.log('🔍 Datos del usuario que se guardarán:', data.usuario);
            localStorage.setItem('sirevif_usuario', JSON.stringify(data.usuario));

            // Ingreso exitoso
            textoLoader.textContent = "¡Autenticación exitosa!";
            textoLoader.style.color = "#4CAF50";
            
            // 4. Redirigir a index
            setTimeout(() => {
                ocultarLoader();
                window.location.href = '/Frontend/HTML/index.html';
            }, 1500);
            
        } else {
            ocultarLoader();
            error(data.message || `Error ${response.status}: ${data.error || 'Error desconocido'}`);
        }
        
    } catch (error) {
        console.error('❌ Error de conexión:', error);
        ocultarLoader();
        
        if (error.message.includes('Failed to fetch')) {
            error('Error de conexión con el servidor. Verifica que el Gateway esté corriendo en puerto 8080.');
        } else {
            error(`Error: ${error.message}`);
        }
    }
});
        // Verificar si ya hay una sesión activa
        window.addEventListener('DOMContentLoaded', () => {
            const token = localStorage.getItem('sirevif_token');
            const usuario = localStorage.getItem('sirevif_usuario');
            
            if (token && usuario) {
                try {
                    const userData = JSON.parse(usuario);
                    console.log('Sesión activa encontrada para:', userData.nombre);
                } catch (e) {
                    localStorage.removeItem('sirevif_token');
                    localStorage.removeItem('sirevif_usuario');
                }
            }
            
            // Enfocar automáticamente en el campo documento
            document.getElementById('documento').focus();
        });
        
        // Limpiar mensajes cuando el usuario empiece a escribir
        document.getElementById('documento').addEventListener('input', () => {
            mensajeError.style.display = 'none';
            mensajeExito.style.display = 'none';
        });
        
        document.getElementById('contrasena').addEventListener('input', () => {
            mensajeError.style.display = 'none';
            mensajeExito.style.display = 'none';
        });
        
        // Permitir login con Enter en la contraseña
        document.getElementById('contrasena').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                formulario.dispatchEvent(new Event('submit'));
            }
        });