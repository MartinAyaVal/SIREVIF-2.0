import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import { autenticarToken } from "../middleware/authMiddleware.js";

dotenv.config();
const router = express.Router();

const services = {
  comisarias: process.env.COMISARIAS_SERVICE,
  medidas: process.env.MEDIDAS_SERVICE,
  roles: process.env.ROLES_SERVICE,
  tipo_victima: process.env.TIPO_VICTIMA_SERVICE,
  usuarios: process.env.USUARIOS_SERVICE, // Debe ser: http://localhost:3005
  victimarios: process.env.VICTIMARIOS_SERVICE,
  victimas: process.env.VICTIMAS_SERVICE,
};

// Rutas públicas
const rutasPublicas = [
  /^\/usuarios\/auth\/login$/,      // Login público
  /^\/usuarios\/auth\/register$/,   // Registro público
  /^\/health$/,                     // Health checks
  /^\/$/,                           // Ruta raíz
];

// Middleware condicional de autenticación
router.use((req, res, next) => {
  const path = req.path;
  const esPublica = rutasPublicas.some(regex => regex.test(path));
  
  if (esPublica) {
    console.log(`🔓 Ruta pública: ${req.method} ${path}`);
    return next();
  }
  
  console.log(`🔐 Ruta protegida: ${req.method} ${path}`);
  autenticarToken(req, res, next);
});

// Ruta dinámica usando regex
router.all(/^\/([^\/]+)\/?(.*)/, async (req, res) => {
  const service = req.params[0];
  const path = req.params[1] || '';

  const targetURL = services[service];
  
  // DEBUG: Ver información de la solicitud
  console.log("=".repeat(50));
  console.log(`📡 GATEWAY REQUEST: ${req.method} ${req.originalUrl}`);
  console.log(`📡 Service: ${service}`);
  console.log(`📡 Path: ${path}`);
  console.log(`📡 Target URL: ${targetURL}`);
  
  if (!targetURL) {
    console.error(`❌ Servicio ${service} no encontrado`);
    console.log(`❌ Servicios disponibles: ${Object.keys(services).join(', ')}`);
    return res.status(404).json({ 
      error: `Servicio ${service} no encontrado`,
      availableServices: Object.keys(services)
    });
  }

  // Construir URL CORRECTAMENTE
  let url;
  
  // CASO ESPECIAL: Servicio de usuarios
if (service === "usuarios") {
  // SIEMPRE mantener /usuarios en el path para este servicio
  url = `${targetURL}/usuarios/${path}`;
  console.log(`✅ URL construida (usuarios): ${url}`);
} else {
    // Para otros servicios
    // Ejemplo: Gateway recibe /comisarias/listar
    // Redirige a: http://localhost:3001/comisarias/listar
    url = `${targetURL}/${service}${path ? '/' + path : ''}`;
    console.log(`🔗 URL construida (otros): ${url}`);
  }

  // Limpiar encabezados
  const cleanHeaders = { ...req.headers };
  delete cleanHeaders.host;
  
  // DEBUG: Mostrar datos enviados
  console.log(`📦 Body enviado:`, req.body);
  console.log(`📤 Headers enviados:`, cleanHeaders);

  try {
    console.log(`🔄 Enviando a: ${req.method} ${url}`);
    
    const response = await axios({
      method: req.method.toLowerCase(),
      url: url,
      headers: {
        ...cleanHeaders,
        'Content-Type': 'application/json'
      },
      data: req.body,
      timeout: 10000, // 10 segundos timeout
    });

    console.log(`✅ Respuesta de ${service}: ${response.status}`);
    console.log(`📥 Datos respuesta:`, response.data);
    console.log("=".repeat(50));

    res.status(response.status).json(response.data);
    
  } catch (error) {
    console.error(`❌ ERROR redirigiendo a ${service}:`, error.message);
    console.error(`❌ Error details:`, {
      url: url,
      method: req.method,
      errorCode: error.code,
      responseStatus: error.response?.status,
      responseData: error.response?.data
    });
    console.log("=".repeat(50));

    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: "Servicio no disponible",
        message: `El servicio ${service} no está respondiendo en ${targetURL}`,
        service: service,
        targetURL: targetURL
      });
    }

    res
      .status(error.response?.status || 500)
      .json(error.response?.data || { 
        error: "Error interno del Gateway",
        message: error.message,
        service: service
      });
  }
});

// Ruta para verificar estado del gateway
router.get('/gateway/health', (req, res) => {
  const serviciosStatus = {};
  
  Object.keys(services).forEach(service => {
    serviciosStatus[service] = {
      url: services[service],
      status: 'configured'
    };
  });

  res.json({
    status: 'healthy',
    gateway: 'running',
    timestamp: new Date().toISOString(),
    services: serviciosStatus
  });
});

export default router;