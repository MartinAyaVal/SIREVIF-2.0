// Backend/sincronizar-tablas.js
require('dotenv').config();
const { Sequelize } = require('sequelize');

console.log('🔄 Iniciando sincronización...\n');

// 1. Crear conexión directa
const sequelize = new Sequelize(
  'sirevif',       // nombre BD
  'alcaldia',      // usuario
  'sirevif2.02026',// password (vacío según tu .env)
  {
    host: 'localhost',
    port: 3306,
    dialect: 'mysql',
    logging: false
  }
);

async function sincronizarTodo() {
  try {
    // Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conectado a MySQL');
    
    // 2. Ejecutar SQL DIRECTAMENTE para crear tablas
    console.log('\n📋 Creando/Estructurando tablas...');
    
    // Tabla: comisarias
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS comisarias (
        id INT PRIMARY KEY AUTO_INCREMENT,
        numero INT NOT NULL,
        lugar VARCHAR(100) NOT NULL
      )
    `);
    console.log('   ✅ comisarias');
    
    // Tabla: roles
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        rol VARCHAR(50) NOT NULL UNIQUE
      )
    `);
    console.log('   ✅ roles');
    
    // Tabla: tipo_victimas
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS tipo_victimas (
        id INT PRIMARY KEY AUTO_INCREMENT,
        tipo VARCHAR(50) NOT NULL UNIQUE
      )
    `);
    console.log('   ✅ tipo_victimas');
    
    // Tabla: victimarios
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS victimarios (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nombreCompleto VARCHAR(100) NOT NULL,
        fechaNacimiento DATE NOT NULL,
        edad INT NOT NULL,
        tipoDocumento VARCHAR(20) NOT NULL,
        otroTipoDocumento VARCHAR(45),
        numeroDocumento INT NOT NULL UNIQUE,
        documentoExpedido VARCHAR(100) NOT NULL,
        sexo VARCHAR(20) NOT NULL,
        lgtbi VARCHAR(2) NOT NULL DEFAULT 'NO',
        cualLgtbi VARCHAR(45),
        estadoCivil VARCHAR(20) NOT NULL,
        direccion VARCHAR(200) NOT NULL,
        barrio VARCHAR(100) NOT NULL,
        ocupacion VARCHAR(100) NOT NULL,
        estudios VARCHAR(100) NOT NULL
      )
    `);
    console.log('   ✅ victimarios');
    
    // Tabla: usuarios (CON FOREIGN KEYS)
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nombre VARCHAR(45) NOT NULL,
        documento INT NOT NULL UNIQUE,
        cargo VARCHAR(45) NOT NULL,
        correo VARCHAR(100) NOT NULL UNIQUE,
        telefono VARCHAR(20) NOT NULL,
        contraseña VARCHAR(100) NOT NULL,
        comisaria_rol VARCHAR(45) NOT NULL,
        rol_id INT NOT NULL,
        comisaria_id INT NOT NULL,
        estado ENUM('activo', 'inactivo') DEFAULT 'activo',
        FOREIGN KEY (rol_id) REFERENCES roles(id),
        FOREIGN KEY (comisaria_id) REFERENCES comisarias(id)
      )
    `);
    console.log('   ✅ usuarios');
    
    // Tabla: medidas_de_proteccion (CON FOREIGN KEYS)
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS medidas_de_proteccion (
        id INT PRIMARY KEY AUTO_INCREMENT,
        numeroMedida INT NOT NULL,
        lugarHechos VARCHAR(45) NOT NULL,
        tipoViolencia VARCHAR(45) NOT NULL,
        fechaUltimosHechos DATE NOT NULL,
        horaUltimosHechos TIME NOT NULL,
        comisaria_id INT NOT NULL,
        usuario_id INT NOT NULL,
        victimario_id INT,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (comisaria_id) REFERENCES comisarias(id),
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
        FOREIGN KEY (victimario_id) REFERENCES victimarios(id)
      )
    `);
    console.log('   ✅ medidas_de_proteccion');
    
    // Tabla: victimas (CON FOREIGN KEYS)
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS victimas (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nombreCompleto VARCHAR(100) NOT NULL,
        fechaNacimiento DATE NOT NULL,
        edad INT NOT NULL,
        tipoDocumento VARCHAR(20),
        otroTipoDocumento VARCHAR(45),
        numeroDocumento INT NOT NULL UNIQUE,
        documentoExpedido VARCHAR(100),
        sexo VARCHAR(20) NOT NULL,
        lgtbi VARCHAR(2) NOT NULL DEFAULT 'NO',
        cualLgtbi VARCHAR(45),
        estadoCivil VARCHAR(20),
        direccion VARCHAR(200),
        barrio VARCHAR(100),
        ocupacion VARCHAR(100),
        estudios VARCHAR(100),
        aparentescoConVictimario VARCHAR(100),
        tipo_victima_id INT NOT NULL,
        comisaria_id INT NOT NULL,
        medida_id INT NOT NULL,
        FOREIGN KEY (tipo_victima_id) REFERENCES tipo_victimas(id),
        FOREIGN KEY (comisaria_id) REFERENCES comisarias(id),
        FOREIGN KEY (medida_id) REFERENCES medidas_de_proteccion(id)
      )
    `);
    console.log('   ✅ victimas');
    
    console.log('\n🎉 ¡Todas las tablas creadas/verificadas!');
    
    // 3. Insertar datos básicos si no existen
    console.log('\n📝 Insertando datos básicos...');
    
    // Roles
    const [roles] = await sequelize.query('SELECT COUNT(*) as count FROM roles');
    if (roles[0].count === 0) {
      await sequelize.query(`
        INSERT INTO roles (rol) VALUES 
        ('Administrador'),
        ('Operador'),
        ('Consulta')
      `);
      console.log('   ✅ Roles insertados');
    }
    
    // Tipos de víctima
    const [tipos] = await sequelize.query('SELECT COUNT(*) as count FROM tipo_victimas');
    if (tipos[0].count === 0) {
      await sequelize.query(`
        INSERT INTO tipo_victimas (tipo) VALUES 
        ('Directa'),
        ('Indirecta'),
        ('Testigo')
      `);
      console.log('   ✅ Tipos de víctima insertados');
    }
    
    // Comisaría por defecto
    const [comisarias] = await sequelize.query('SELECT COUNT(*) as count FROM comisarias');
    if (comisarias[0].count === 0) {
      await sequelize.query(`
        INSERT INTO comisarias (numero, lugar) VALUES 
        (1, 'Comisaría Central')
      `);
      console.log('   ✅ Comisaría por defecto insertada');
    }
    
    console.log('\n🚀 ¡Base de datos lista! Puedes iniciar los servicios.');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.original && error.original.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Problema de acceso a MySQL. Verifica:');
      console.error('   1. MySQL está corriendo');
      console.error('   2. Usuario: alcaldia');
      console.error('   3. Password: (vacío)');
      console.error('   4. Base de datos: sirevif');
    } else if (error.original && error.original.code === 'ER_BAD_DB_ERROR') {
      console.error('\n💡 La base de datos no existe. Creala con:');
      console.error('   mysql -u root -p');
      console.error('   CREATE DATABASE sirevif;');
      console.error('   GRANT ALL ON sirevif.* TO "alcaldia"@"localhost";');
      console.error('   FLUSH PRIVILEGES;');
    }
  } finally {
    await sequelize.close();
  }
}

// Ejecutar
sincronizarTodo();