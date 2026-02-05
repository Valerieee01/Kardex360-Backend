import express from "express";
import cors from "cors";
import routes from "./routes";
import { errorMiddleware } from "./middlewares/error.middleware";

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "kardex-api" });
});

// Rutas principales
app.use("/api", routes);

// Middleware de errores (siempre al final)
app.use(errorMiddleware);

export default app;
