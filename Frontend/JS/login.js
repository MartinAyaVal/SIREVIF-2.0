
        // Elementos del DOM
        const loginForm = document.getElementById('loginForm');
        const loginBtn = document.getElementById('loginBtn');
        const btnText = document.getElementById('btnText');
        const loaderOverlay = document.getElementById('loaderOverlay');
        const loaderText = document.querySelector('.loader-text');
        const errorMsg = document.getElementById('errorMessage');
        const successMsg = document.getElementById('successMessage');
        
        // Estados del loader
        const loaderStates = [
            "Autenticando usuario",
            "Verificando credenciales",
            "Conectando con el servidor",
            "Generando token de acceso"
        ];
        
        let loaderStateIndex = 0;
        let loaderInterval;
        
        // Función para mostrar el loader
        function showLoader() {
            loaderOverlay.style.display = 'flex';
            document.body.classList.add('loading-active');
            loginBtn.classList.add('loading');
            loginBtn.disabled = true;
            
            // Cambiar texto del loader cada 2 segundos
            loaderInterval = setInterval(() => {
                loaderStateIndex = (loaderStateIndex + 1) % loaderStates.length;
                loaderText.textContent = loaderStates[loaderStateIndex];
            }, 2000);
        }
        
        // Función para ocultar el loader
        function hideLoader() {
            loaderOverlay.style.display = 'none';
            document.body.classList.remove('loading-active');
            loginBtn.classList.remove('loading');
            loginBtn.disabled = false;
            clearInterval(loaderInterval);
            loaderStateIndex = 0;
            loaderText.textContent = loaderStates[0];
        }
        
        // Función para mostrar errores
        function showError(message) {
            errorMsg.textContent = message;
            errorMsg.style.display = 'block';
            successMsg.style.display = 'none';
        }
        
        // Evento de submit del formulario
// ... código anterior igual ...

loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Obtener valores del formulario
    const documento = document.getElementById('documento').value.trim();
    const contrasena = document.getElementById('contrasena').value;
    
    // Validar campos
    if (!documento || !contrasena) {
        showError('Por favor ingresa documento y contraseña');
        return;
    }
    
    // Validar que documento sea numérico
    if (isNaN(documento) || documento.length < 5) {
        showError('Documento inválido. Debe ser un número de cédula válido');
        return;
    }
    
    // Mostrar loader
    showLoader();
    
    try {
        // CORRECCIÓN: Asegurar que enviamos "contrasena" (sin ñ)
        const payload = {
            documento: parseInt(documento),
            contrasena: contrasena  // ← SIN Ñ, igual que el campo HTML
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
            // ✅ LOGIN EXITOSO
            
            // 1. Guardar token y datos de usuario
            localStorage.setItem('sirevif_token', data.token);
            console.log('🔍 Datos del usuario que se guardarán:', data.usuario);
            localStorage.setItem('sirevif_usuario', JSON.stringify(data.usuario));
            
            // 2. Cambiar mensaje del loader a éxito
            loaderText.textContent = "✅ ¡Autenticación exitosa!";
            loaderText.style.color = "#4CAF50";
            
            // 3. Mostrar nombre del usuario brevemente
            successMsg.textContent = `Bienvenido/a, ${data.usuario.nombre}`;
            successMsg.style.display = 'block';
            successMsg.style.backgroundColor = '#e8f5e9';
            
            // 4. Redirigir después de 1.5 segundos
            setTimeout(() => {
                hideLoader();
                window.location.href = '/Frontend/HTML/index.html';
            }, 1500);
            
        } else {
            // ❌ ERROR EN LOGIN
            hideLoader();
            showError(data.message || `Error ${response.status}: ${data.error || 'Error desconocido'}`);
        }
        
    } catch (error) {
        console.error('❌ Error de conexión:', error);
        hideLoader();
        
        if (error.message.includes('Failed to fetch')) {
            showError('Error de conexión con el servidor. Verifica que el Gateway esté corriendo en puerto 8080.');
        } else {
            showError(`Error: ${error.message}`);
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
                    // Opcional: Redirigir automáticamente si ya está logueado
                    // window.location.href = '/Frontend/dashboard.html';
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
            errorMsg.style.display = 'none';
            successMsg.style.display = 'none';
        });
        
        document.getElementById('contrasena').addEventListener('input', () => {
            errorMsg.style.display = 'none';
            successMsg.style.display = 'none';
        });
        
        // Permitir login con Enter en la contraseña
        document.getElementById('contrasena').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                loginForm.dispatchEvent(new Event('submit'));
            }
        });