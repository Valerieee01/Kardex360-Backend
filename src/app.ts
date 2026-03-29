import express from "express";
import cors from "cors";
import routes from "./routes";
import { PrismaClient } from "@prisma/client";
import { errorHandler } from "./middlewares/error.middleware";

const app = express();
const prisma = new PrismaClient();

// Middlewares globales
app.use(cors());

// ✅ Solo uno, con el límite
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Rutas principales
app.use("/System/Inventory/Information", routes);

// Middleware de errores (siempre al final)
app.use(errorHandler);

export default app;