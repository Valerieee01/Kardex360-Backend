import express from "express";
import cors from "cors";
import routes from "./routes";
import { PrismaClient } from "@prisma/client";
import { errorMiddleware } from "./middlewares/error.middleware";

const app = express();
const prisma = new PrismaClient();


// Middlewares globales
app.use(cors());
app.use(express.json());
// Rutas principales
app.use("/api", routes);

// Middleware de errores (siempre al final)
app.use(errorMiddleware);

app.use((err: any, _req: any, res: any, _next: any) => {
  const code = typeof err?.message === "string" ? err.message : "INTERNAL";

  if (code === "BAD_REQUEST") return res.status(400).json({ ok: false, error: "BAD_REQUEST" });
  if (code === "INVALID_CREDENTIALS") return res.status(401).json({ ok: false, error: "INVALID_CREDENTIALS" });
  if (code === "UNAUTHORIZED") return res.status(401).json({ ok: false, error: "UNAUTHORIZED" });
  if (code === "FORBIDDEN") return res.status(403).json({ ok: false, error: "FORBIDDEN" });
  if (code === "USER_DISABLED") return res.status(403).json({ ok: false, error: "USER_DISABLED" });

  return res.status(500).json({ ok: false, error: "INTERNAL" });
});

export default app;
