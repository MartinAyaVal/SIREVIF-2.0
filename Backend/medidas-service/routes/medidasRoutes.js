const express = require('express');
const router = express.Router();
const medidaController = require('../controllers/medidasController.js');

// ===== RUTA PRINCIPAL: Crear medida completa (con victimario y víctimas)
router.post('/completa/nueva', medidaController.createMedidaCompleta);

// ===== RUTAS BÁSICAS DE MEDIDAS =====
router.get('/', medidaController.getMedidas);
router.get('/:id', medidaController.getMedidasById);
router.put('/:id', medidaController.updateMedidas);
router.delete('/:id', medidaController.deleteMedidas);

// ===== RUTAS CON RELACIONES =====
router.get('/con-relaciones/todas', medidaController.getMedidasConRelaciones);
router.get('/completa/:id', medidaController.getMedidaCompleta);

// ===== RUTAS ESPECÍFICAS =====
router.get('/comisaria/:comisariaId', medidaController.getMedidasPorComisaria);
router.get('/estadisticas/totales', medidaController.getEstadisticas);
router.get('/buscar/search', medidaController.searchMedidas);

module.exports = router;