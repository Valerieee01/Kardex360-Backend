import type { Request, Response, NextFunction } from "express";
import { ok } from "./../../utils/response";
import { AppError } from "./../../utils/app-error";
import { AuthService } from "./auth.service";

export class AuthController {
  constructor(private readonly service: AuthService) {}

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { identification, password } = req.body ?? {};

      if (typeof identification !== "string" || typeof password !== "string") {
        throw new AppError("BAD_REQUEST", 400, "identification y password son requeridos");
      }

      const result = await this.service.login({ identification, password });
      return ok(res, "Login exitoso", result);
    } catch (err) {
      next(err);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new AppError("UNAUTHORIZED", 401);

      const data = await this.service.me(req.user.id);
      return ok(res, "Usuario autenticado", data);
    } catch (err) {
      next(err);
    }
  };
}
