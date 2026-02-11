import { Router } from "express";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AuthRepository } from "./auth.repository";
import type { PrismaClient } from "@prisma/client";
import { authenticate } from "../../middlewares/auth.middleware";

export function authRoutes(prisma: PrismaClient) {
  const router = Router();

  const repo = new AuthRepository(prisma);
  const service = new AuthService(repo);
  const controller = new AuthController(service);

  router.post("/login", controller.login);
  router.get("/me", authenticate, controller.me);

  return router;
}
