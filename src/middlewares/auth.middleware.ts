import jwt from "jsonwebtoken";
import type { JwtPayloadShape, JwtUser, RoleCode } from "../types/auth.types";
import type { Request, Response, NextFunction } from "express";

function getBearerToken(req: Request) {
  const h = req.headers.authorization;
  if (!h) return null;
  const [type, token] = h.split(" ");
  if (type !== "Bearer" || !token) return null;
  return token;
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = getBearerToken(req);
    if (!token) throw new Error("UNAUTHORIZED");

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET no configurado");

    const decoded = jwt.verify(token, secret) as jwt.JwtPayload;

    // Validación mínima (sin librería extra)
    const sub = decoded.sub;
    const nombre = (decoded as any).nombre;
    const roles = (decoded as any).roles;

    if (!sub || typeof nombre !== "string" || !Array.isArray(roles)) {
      throw new Error("UNAUTHORIZED");
    }

    req.user = {
      id: String(sub),
      nombre: nombre,
      roles: roles,
    } satisfies JwtUser;

    next();
  } catch {
    next(new Error("UNAUTHORIZED"));
  }
}

export function requireRoles(...allowed: RoleCode[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new Error("UNAUTHORIZED"));
    const ok = req.user.roles.some( (r : RoleCode) => allowed.includes(r));
    if (!ok) return next(new Error("FORBIDDEN"));
    next();
  };
}
