import type { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";

export class AuthController {
  constructor(private readonly service: AuthService) {}

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { identification, password } = req.body ?? {};
      if (typeof identification !== "string" || typeof password !== "string") {
        throw new Error("BAD_REQUEST");
      }

      const result = await this.service.login({ identification, password });
      res.json({ ok: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new Error("UNAUTHORIZED");
      const data = await this.service.me(req.user.id);
      res.json({ ok: true, data });
    } catch (err) {
      next(err);
    }
  };
}
