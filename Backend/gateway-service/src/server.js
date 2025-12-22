import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import router from "./routes/gatewayRoutes.js";

dotenv.config();
const app = express();

// Configuración de CORS más permisiva para debug
// Configuración CORS más específica y segura
const allowedOrigins = [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3005',
    'http://127.0.0.1:3005',
    // Agrega otros puertos que uses
];

// CORRECCIÓN 1: Configuración simplificada de CORS
const corsOptions = {
    origin: function (origin, callback) {
        // Permitir requests sin origen (como mobile apps o curl)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        } else {
            console.log(`🚫 Origen bloqueado por CORS: ${origin}`);
            return callback(new Error('Not allowed by CORS'), false);
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    exposedHeaders: ['Authorization', 'Content-Disposition'],
    credentials: true,  
    maxAge: 86400, 
    optionsSuccessStatus: 200 
};

// Usa la configuración CORS directamente
app.use(cors(corsOptions));

app.use(express.json());
app.use(morgan("dev"));

// Ruta para verificar que el gateway está funcionando
app.get("/", (req, res) => {
  res.json({
    message: "🚪 API Gateway funcionando",
    timestamp: new Date().toISOString(),
    endpoints: [
      "/comisarias",
      "/medidas", 
      "/roles",
      "/tipo_victima",
      "/usuarios",
      "/victimarios",
      "/victimas"
    ].map(endpoint => ({
      endpoint,
      url: `http://localhost:${process.env.PORT || 8080}${endpoint}`,
      example: `curl -X GET http://localhost:${process.env.PORT || 8080}${endpoint}`
    }))
  });
});

// Manejo de errores para CORS
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: "CORS Error",
      message: "Origen no permitido",
      allowedOrigins: allowedOrigins
    });
  }
  next(err);
});

app.use("/", router);

// Middleware para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    error: "Ruta no encontrada",
    message: `La ruta ${req.method} ${req.originalUrl} no existe en el gateway`,
    availableEndpoints: [
      "/comisarias",
      "/medidas", 
      "/roles",
      "/tipo_victima",
      "/usuarios",
      "/victimarios",
      "/victimas"
    ]
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚪 API Gateway corriendo en puerto ${PORT}`);
  console.log(`🔗 Endpoint de prueba: http://localhost:${PORT}/`);
  console.log(`📡 Orígenes permitidos:`);
  allowedOrigins.forEach(origin => console.log(`   ✅ ${origin}`));
  console.log(`\n📋 Servicios configurados:`);
  console.log(`  |-------------------------------------------|`);
  console.log(`  |- Comisarias:      | ${process.env.COMISARIAS_SERVICE || 'No configurado'} |`);
  console.log(`  |-------------------------------------------|`);
  console.log(`  |- Medidas:         | ${process.env.MEDIDAS_SERVICE || 'No configurado'} |`);
  console.log(`  |-------------------------------------------|`);
  console.log(`  |- Roles:           | ${process.env.ROLES_SERVICE || 'No configurado'} |`);
  console.log(`  |-------------------------------------------|`);
  console.log(`  |- Tipo de Victima: | ${process.env.TIPO_VICTIMA_SERVICE || 'No configurado'} |`);
  console.log(`  |-------------------------------------------|`);
  console.log(`  |- Usuarios:        | ${process.env.USUARIOS_SERVICE || 'No configurado'} |`);
  console.log(`  |-------------------------------------------|`);
  console.log(`  |- Victimarios:     | ${process.env.VICTIMARIOS_SERVICE || 'No configurado'} |`);
  console.log(`  |-------------------------------------------|`);
  console.log(`  |- Victimas:        | ${process.env.VICTIMAS_SERVICE || 'No configurado'} |`);
  console.log(`  |-------------------------------------------|`);
});