// Backend/sync-database.js - VERSIÓN FINAL
require('dotenv').config();
const { Sequelize } = require('sequelize');

// 1. Crear conexión central
const sequelize = new Sequelize(
  process.env.DB_NAME || 'sirevif',
  process.env.DB_USER || 'alcaldia',
  process.env.DB_PASS || 'sirevif2.02026',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false
  }
);

// 2. Cargar modelos
const Comisaria = require('./comisaria-service/models/comisarias.js')(sequelize);
const Usuario = require('./usuarios-service/models/usuarios.js')(sequelize);
const Medidas = require('./medidas-service/models/medidas.js')(sequelize);
const Victimas = require('./victimas-service/models/victimas.js')(sequelize);
const Victimarios = require('./victimarios-service/models/victimarios.js')(sequelize);
const TipoVictima = require('./tipoVictima-service/models/tipoVictima.js')(sequelize);
const Rol = require('./roles-service/models/roles.js')(sequelize);

async function syncDatabase() {
  console.log('🔄 Verificando base de datos sirevif...\n');
  
  try {
    // 1. Autenticar
    await sequelize.authenticate();
    console.log('✅ Conectado a MySQL');
    
    // 2. SINCRONIZAR SIN MODIFICAR ESTRUCTURA EXISTENTE
    console.log('📋 Verificando tablas (solo crear si no existen):');
    
    // Solo crear tablas si no existen
    await Rol.sync();
    console.log('   ✅ roles');
    
    await TipoVictima.sync();
    console.log('   ✅ tipo_victimas');
    
    await Comisaria.sync();
    console.log('   ✅ comisarias');
    
    await Usuario.sync();
    console.log('   ✅ usuarios');
    
    await Victimarios.sync();
    console.log('   ✅ victimarios');
    
    await Medidas.sync();
    console.log('   ✅ medidas_de_proteccion');
    
    await Victimas.sync();
    console.log('   ✅ victimas');
    
    console.log('\n🎉 ¡Tablas verificadas!');
    
    // 3. Configurar relaciones esenciales
    console.log('\n🔗 Configurando relaciones...');
    
    // Solo relaciones esenciales
    Usuario.belongsTo(Rol, { foreignKey: 'rolId', as: 'rol' });
    Rol.hasMany(Usuario, { foreignKey: 'rolId', as: 'usuarios' });
    
    Usuario.belongsTo(Comisaria, { foreignKey: 'comisariaId', as: 'comisaria' });
    Comisaria.hasMany(Usuario, { foreignKey: 'comisariaId', as: 'usuarios' });
    
    Medidas.belongsTo(Comisaria, { foreignKey: 'comisariaId', as: 'comisaria' });
    Comisaria.hasMany(Medidas, { foreignKey: 'comisariaId', as: 'medidas' });
    
    Medidas.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });
    Usuario.hasMany(Medidas, { foreignKey: 'usuarioId', as: 'medidas' });
    
    Medidas.belongsTo(Victimarios, { foreignKey: 'victimarioId', as: 'victimario' });
    Victimarios.hasMany(Medidas, { foreignKey: 'victimarioId', as: 'medidas' });
    
    Medidas.hasMany(Victimas, { foreignKey: 'medidaId', as: 'victimas' });
    Victimas.belongsTo(Medidas, { foreignKey: 'medidaId', as: 'medida' });
    
    Victimas.belongsTo(TipoVictima, { foreignKey: 'tipoVictimaId', as: 'tipoVictima' });
    TipoVictima.hasMany(Victimas, { foreignKey: 'tipoVictimaId', as: 'victimas' });
    
    Victimas.belongsTo(Comisaria, { foreignKey: 'comisariaId', as: 'comisaria' });
    Comisaria.hasMany(Victimas, { foreignKey: 'comisariaId', as: 'victimas' });
    
    Victimarios.belongsTo(Comisaria, { 
      foreignKey: 'comisariaId', 
      as: 'comisaria',
      allowNull: true 
    });
    Comisaria.hasMany(Victimarios, { 
      foreignKey: 'comisariaId', 
      as: 'victimarios' 
    });
    
    console.log('✅ Relaciones configuradas');
    
    // 4. Verificar estructura
    console.log('\n🔍 Verificando estructura...');
    await verificarEstructura();
    
    console.log('\n' + '='.repeat(60));
    console.log('🚀 ¡SISTEMA DE MEDIDAS COMPLETO LISTO!');
    console.log('='.repeat(60));
    console.log('\n📋 Campos de medidas (según formulario):');
    console.log('   • numero_medida');
    console.log('   • lugar_hechos');
    console.log('   • tipo_violencia');
    console.log('   • fecha_ultimos_hechos');
    console.log('   • hora_ultimos_hechos');
    console.log('   • comisaria_id');
    console.log('   • usuario_id');
    console.log('   • victimario_id (opcional)');
    console.log('\n🎯 Endpoint principal:');
    console.log('   POST /api/medidas/completa/nueva');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.original) {
      console.error('   Detalle MySQL:', error.original.message);
      console.error('   Código SQL:', error.original.code);
    }
  }
}

async function verificarEstructura() {
  try {
    // Verificar columnas de medidas
    const [columnasMedidas] = await sequelize.query(`
      SHOW COLUMNS FROM medidas_de_proteccion
    `);
    
    console.log('   📋 Columnas en medidas_de_proteccion:');
    const columnasNecesarias = [
      'numero_medida', 'lugar_hechos', 'tipo_violencia',
      'fecha_ultimos_hechos', 'hora_ultimos_hechos',
      'comisaria_id', 'usuario_id', 'victimario_id',
      'fecha_creacion', 'fecha_actualizacion'
    ];
    
    columnasNecesarias.forEach(col => {
      const existe = columnasMedidas.some(c => c.Field === col);
      console.log(`      ${existe ? '✅' : '❌'} ${col}`);
    });
    
    // Verificar datos mínimos
    const rolesCount = await Rol.count();
    const tiposCount = await TipoVictima.count();
    const comisariasCount = await Comisaria.count();
    
    console.log('\n   📊 Datos mínimos:');
    console.log(`      ${rolesCount > 0 ? '✅' : '⚠️ '} Roles: ${rolesCount}`);
    console.log(`      ${tiposCount > 0 ? '✅' : '⚠️ '} Tipos de víctima: ${tiposCount}`);
    console.log(`      ${comisariasCount > 0 ? '✅' : '⚠️ '} Comisarías: ${comisariasCount}`);
    
    if (rolesCount === 0 || tiposCount === 0 || comisariasCount === 0) {
      console.log('\n   💡 Recomendación: Ejecuta datos_iniciales.sql para crear datos básicos');
    }
    
  } catch (error) {
    console.log('   ⚠️  Error verificando estructura:', error.message);
  }
}

// Ejecutar
syncDatabase();