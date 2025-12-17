import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const SECRET = process.env.JWT_SECRET;
console.log("JWT_SECRET en authMiddleware:", SECRET);

if (!SECRET) {
  console.error("❌ ERROR: JWT_SECRET no está definido en el .env del gateway");
  process.exit(1);
}

export const autenticarToken = (req, res, next) => {

  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Token no proporcionado" });

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Token inválido o expirado" });
    req.user = user;
    next();
  });
};