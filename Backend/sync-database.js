// Backend/sync-database.js
require('dotenv').config();
const { sequelize, Comisaria, Usuario, Medidas, Victimas, Victimarios, TipoVictima, Rol } = require('./shared-models');

async function syncDatabase() {
  console.log('🔄 Iniciando sincronización de base de datos sirevif...');
  
  try {
    // 1. Autenticar
    await sequelize.authenticate();
    console.log('✅ Conexión a sirevif establecida');
    
    // 2. Sincronizar en orden
    console.log('\n📋 Sincronizando tablas:');
    
    await Rol.sync({ alter: true });
    console.log('   ✅ roles');
    
    await TipoVictima.sync({ alter: true });
    console.log('   ✅ tipo_victimas');
    
    await Comisaria.sync({ alter: true });
    console.log('   ✅ comisarias');
    
    await Usuario.sync({ alter: true });
    console.log('   ✅ usuarios');
    
    await Victimarios.sync({ alter: true });
    console.log('   ✅ victimarios');
    
    await Medidas.sync({ alter: true });
    console.log('   ✅ medidas_de_proteccion');
    
    await Victimas.sync({ alter: true });
    console.log('   ✅ victimas');
    
    console.log('\n🎉 ¡Todas las tablas sincronizadas en sirevif!');
    
    // 3. Datos iniciales
    await crearDatosIniciales();
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

async function crearDatosIniciales() {
  try {
    console.log('\n📝 Verificando datos iniciales...');
    
    const [rolesCount, tiposCount, comisariasCount] = await Promise.all([
      Rol.count(),
      TipoVictima.count(),
      Comisaria.count()
    ]);
    
    if (rolesCount === 0) {
      await Rol.bulkCreate([
        { rol: 'Administrador' },
        { rol: 'Operador' },
        { rol: 'Consulta' }
      ]);
      console.log('   ✅ Roles creados');
    }
    
    if (tiposCount === 0) {
      await TipoVictima.bulkCreate([
        { tipo: 'Directa' },
        { tipo: 'Indirecta' },
        { tipo: 'Testigo' }
      ]);
      console.log('   ✅ Tipos de víctima creados');
    }
    
    if (comisariasCount === 0) {
      await Comisaria.bulkCreate([
        { numero: 1, lugar: 'Comisaría Central' },
        { numero: 2, lugar: 'Comisaría Norte' },
        { numero: 3, lugar: 'Comisaría Sur' }
      ]);
      console.log('   ✅ Comisarías de ejemplo creadas');
    }
    
    console.log('\n🚀 ¡Base de datos lista para usar!');
    
  } catch (error) {
    console.error('⚠️ Error en datos iniciales:', error.message);
  }
}

// Ejecutar
if (require.main === module) {
  syncDatabase();
}

module.exports = syncDatabase;