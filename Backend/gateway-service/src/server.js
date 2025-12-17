import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import router from "./routes/gatewayRoutes.js";

dotenv.config();
const app = express();

// Configuración de CORS más permisiva para debug
// Reemplaza la configuración CORS actual con esta:

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

app.use(cors({
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
    credentials: true,  // Permite cookies
    maxAge: 86400, // 24 horas de cache para preflight
}));

// Manejar preflight requests
app.options('*', cors()); // Habilitar preflight para todas las rutas

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

app.use("/", router);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚪 API Gateway corriendo en puerto ${PORT}`);
  console.log(`🔗 Endpoint de prueba: http://localhost:${PORT}/`);
  console.log(`📡 Servicios configurados:`);
  console.log(`   - Comisarias: ${process.env.COMISARIAS_SERVICE}`);
  console.log(`   - Usuarios: ${process.env.USUARIOS_SERVICE}`);
  console.log(`   - ... etc`);
});