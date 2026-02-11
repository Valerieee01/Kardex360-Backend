import bcrypt from "bcrypt";
import type { RoleCode, JwtPayloadShape, JwtUser } from "../../types/auth.types";
import { AuthRepository } from "./auth.repository";
import { tupleProcessor } from "zod/v4/core/json-schema-processors.cjs";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { env } from "../../config/env";


export class AuthService {
    constructor(private readonly repo: AuthRepository) {}
    
    private signAccessToken(payload: JwtPayloadShape) {
        const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET no configurado");

        return jwt.sign(payload, secret,  { expiresIn: "15m" }); 
    
  }

  async login(input: { identification: string; password: string }) {
    const user = await this.repo.findUserForLoginByIdentification(input.identification);

    // evita user enumeration: mismo mensaje para todo
    if (!user) throw new Error("INVALID_CREDENTIALS");

    // Si manejas estado (soft-disable), corta aquí
    if (typeof user.estado !== "undefined" && user.estado !== true) {
      throw new Error("USER_DISABLED");
    }

    const hash = (user as any).password_hash as string | null; // ajusta si tu select usa otro nombre
    if (!hash) throw new Error("INVALID_CREDENTIALS");

    const ok = await bcrypt.compare(input.password, hash);
    if (!ok) throw new Error("INVALID_CREDENTIALS");

    const roles = (user.usuario_roles ?? [])
      .map((ur: any) => ur.roles?.codigo)
      .filter(Boolean) as RoleCode[];

    const payload: JwtPayloadShape = {
      sub: String(user.identificacion),
      nombre: String(user.nombre_completo),
      roles,
    };

    const accessToken = this.signAccessToken(payload);

    return {
      accessToken,
      user: {
        id: String(user.identificacion),
        nombre: String(user.nombre_completo),
        roles,
      } satisfies JwtUser,
    };
  }

  async me(userId: string ) {
    const user = await this.repo.findUserByIdWithRoles(userId);
    if (!user) throw new Error("UNAUTHORIZED");

    if (typeof user.estado !== "undefined" && user.estado !== true) {
      throw new Error("USER_DISABLED");
    }

    const roles = (user.usuario_roles ?? [])
      .map((ur: any) => ur.roles?.codigo)
      .filter(Boolean) as RoleCode[];

    return {
      id: String(user.identificacion),
      nombre: String(user.nombre_completo),
      roles,
    } satisfies JwtUser;
  }
}
