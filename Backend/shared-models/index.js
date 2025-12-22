const sequelize = require('./sequelize-config.js');
const setupAssociations = require('./associations.js');

// Modelos como funciones
const initComisaria = require('../../comisaria-service/models/comisarias.js');
const initUsuario = require('../../usuarios-service/models/usuarios.js');
const initMedidas = require('../../medidas-service/models/medidas.js');
const initVictimas = require('../../victimas-service/models/victimas.js');
const initVictimarios = require('../../victimarios-service/models/victimarios.js');
const initTipoVictima = require('../../tipoVictima-service/models/tipoVictima.js');
const initRol = require('../../roles-service/models/roles.js');

// Inicializar modelos
const Comisaria = initComisaria(sequelize);
const Usuario = initUsuario(sequelize);
const Medidas = initMedidas(sequelize);
const Victimas = initVictimas(sequelize);
const Victimarios = initVictimarios(sequelize);
const TipoVictima = initTipoVictima(sequelize);
const Rol = initRol(sequelize);

const models = {
  Comisaria,
  Usuario,
  Medidas,
  Victimas,
  Victimarios,
  TipoVictima,
  Rol
};

// Configurar asociaciones
setupAssociations(models);

module.exports = {
  sequelize,
  ...models
};