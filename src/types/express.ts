import "express";
import type { JwtUser } from "../auth/auth.types";

declare global {
  namespace Express {
    interface Request {
      user?: JwtUser;
    }
  }
}

export {};
