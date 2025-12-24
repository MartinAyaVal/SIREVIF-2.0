// test-crear-medida.js
const axios = require('axios');

async function testCrearMedida() {
  console.log('🧪 PRUEBA: Crear medida completa\n');
  
  const GATEWAY_URL = 'http://localhost:8080';
  
  try {
    // 1. Login para obtener token
    console.log('1. 🔐 Obteniendo token...');
    const loginRes = await axios.post(`${GATEWAY_URL}/usuarios/auth/login`, {
      documento: "123456789",
      contrasena: "admin123"
    });
    
    if (!loginRes.data.token) {
      throw new Error('No se recibió token del login');
    }
    
    const token = loginRes.data.token;
    console.log(`   ✅ Token obtenido (${token.length} caracteres)`);
    
    // 2. Intentar crear medida
    console.log('\n2. 📝 Creando medida completa...');
    
    const medidaData = {
      medida: {
        numeroMedida: Math.floor(Math.random() * 9000) + 1000,
        lugarHechos: "Calle de Prueba #123",
        tipoViolencia: "psicologica",
        fechaUltimosHechos: "2024-12-24",
        horaUltimosHechos: "10:00:00",
        comisariaId: 1,
        usuarioId: 1
      },
      victimario: {
        nombreCompleto: "Test Victimario",
        fechaNacimiento: "1980-01-01",
        edad: 44,
        tipoDocumento: "cedula",
        numeroDocumento: `TEST${Date.now()}`,
        documentoExpedido: "Ciudad Test",
        sexo: "masculino",
        estadoCivil: "soltero",
        direccion: "Dirección Test",
        barrio: "Barrio Test",
        ocupacion: "Ocupación Test",
        estudios: "universitario"
      },
      victimas: [
        {
          nombreCompleto: "Test Víctima 1",
          fechaNacimiento: "1990-01-01",
          edad: 34,
          tipoDocumento: "cedula",
          numeroDocumento: `VICT${Date.now()}`,
          sexo: "femenino",
          tipoVictimaId: 1
        }
      ]
    };
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Probar AMBAS rutas
    const rutas = [
      '/usuarios/completa/nueva',
      '/medidas/completa/nueva'
    ];
    
    for (const ruta of rutas) {
      console.log(`\n   🔗 Probando ruta: ${ruta}`);
      try {
        const response = await axios.post(
          `${GATEWAY_URL}${ruta}`,
          medidaData,
          { headers, timeout: 10000 }
        );
        
        console.log(`   ✅ ÉXITO: ${response.status} ${response.statusText}`);
        console.log(`   📦 Respuesta:`, JSON.stringify(response.data, null, 2).substring(0, 200) + '...');
        
        // Incrementar número de medida para la siguiente prueba
        medidaData.medida.numeroMedida++;
        
      } catch (error) {
        console.log(`   ❌ ERROR en ${ruta}:`);
        console.log(`      Mensaje: ${error.message}`);
        if (error.response) {
          console.log(`      Status: ${error.response.status}`);
          console.log(`      Data:`, JSON.stringify(error.response.data, null, 2));
        }
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎯 PRUEBA COMPLETADA');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ ERROR GENERAL:');
    console.error('   Mensaje:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    process.exit(1);
  }
}

// Ejecutar prueba
testCrearMedida();