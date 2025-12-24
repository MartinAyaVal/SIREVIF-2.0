function setupAssociations(models) {
  const {
    Comisaria,
    Usuario,
    Rol,
    Medidas,
    Victimas,
    Victimarios,
    TipoVictima
  } = models;

  console.log('🔗 Configurando asociaciones...');

  // 1. Usuario ↔ Rol (N:1)
  Usuario.belongsTo(Rol, {
    foreignKey: 'rolId',
    as: 'rol'
  });
  Rol.hasMany(Usuario, {
    foreignKey: 'rolId',
    as: 'usuarios'
  });

  // 2. Usuario ↔ Comisaria (N:1)
  Usuario.belongsTo(Comisaria, {
    foreignKey: 'comisariaId',
    as: 'comisaria'
  });
  Comisaria.hasMany(Usuario, {
    foreignKey: 'comisariaId',
    as: 'usuarios'
  });

  // 3. Medidas ↔ Comisaria (N:1)
  Medidas.belongsTo(Comisaria, {
    foreignKey: 'comisariaId',
    as: 'comisaria'
  });
  Comisaria.hasMany(Medidas, {
    foreignKey: 'comisariaId',
    as: 'medidas'
  });

  // 4. Medidas ↔ Usuario (N:1) - Usuario que registra la medida
  Medidas.belongsTo(Usuario, {
    foreignKey: 'usuarioId',
    as: 'usuario'
  });
  Usuario.hasMany(Medidas, {
    foreignKey: 'usuarioId',
    as: 'medidasRegistradas'
  });

  // 5. Medidas ↔ Victimarios (N:1) - Un victimario puede tener múltiples medidas
  Medidas.belongsTo(Victimarios, {
    foreignKey: 'victimarioId',
    as: 'victimario'
  });
  Victimarios.hasMany(Medidas, {
    foreignKey: 'victimarioId',
    as: 'medidas'
  });

  // 6. Medidas ↔ Victimas (1:N)
  Medidas.hasMany(Victimas, {
    foreignKey: 'medidaId',
    as: 'victimas'
  });
  Victimas.belongsTo(Medidas, {
    foreignKey: 'medidaId',
    as: 'medida'
  });

  // 7. Victimas ↔ TipoVictima (N:1)
  Victimas.belongsTo(TipoVictima, {
    foreignKey: 'tipoVictimaId',
    as: 'tipoVictima'
  });
  TipoVictima.hasMany(Victimas, {
    foreignKey: 'tipoVictimaId',
    as: 'victimas'
  });

  // 8. Victimas ↔ Comisaria (N:1)
  Victimas.belongsTo(Comisaria, {
    foreignKey: 'comisariaId',
    as: 'comisaria'
  });
  Comisaria.hasMany(Victimas, {
    foreignKey: 'comisariaId',
    as: 'victimas'
  });

  // 9. Victimarios ↔ Comisaria (N:1) - Nueva relación
  Victimarios.belongsTo(Comisaria, {
    foreignKey: 'comisariaId',
    as: 'comisaria',
    allowNull: true
  });
  Comisaria.hasMany(Victimarios, {
    foreignKey: 'comisariaId',
    as: 'victimarios'
  });

  console.log('✅ Asociaciones configuradas correctamente');
}

module.exports = setupAssociations;