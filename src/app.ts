import express from "express";
import cors from "cors";
import routes from "./routes";
import { PrismaClient } from "@prisma/client";
import { errorHandler } from "./middlewares/error.middleware";

const app = express();
const prisma = new PrismaClient();


// Middlewares globales
app.use(cors());
app.use(express.json());



// Rutas principales
app.use("/System/Inventory/Information", routes);

// Middleware de errores (siempre al final)
app.use(errorHandler);

export default app;
