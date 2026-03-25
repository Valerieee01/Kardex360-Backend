import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { RoleCode, JwtPayloadShape, JwtUser } from "../../types/auth.types";
import { AuthRepository } from "./auth.repository";
import { AppError} from "./../../utils/app-error";

export class AuthService {
  constructor(private readonly repo: AuthRepository) {}

  private signAccessToken(payload: JwtPayloadShape) {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new AppError("JWT_SECRET_NOT_CONFIGURED", 401);;

    return jwt.sign(payload, secret, { expiresIn: "7h" });
  }

  async login(input: { identification: string; password: string }) {
    const user = await this.repo.findUserForLoginByIdentification(input.identification);

    if (!user) throw new AppError("INVALID_CREDENTIALS", 401);

    if (typeof user.estado !== "undefined" && user.estado !== true) {
      throw new AppError("USER_DISABLED", 403);
    }

    const hash = (user as any).password_hash as string | null;
    if (!hash) throw new AppError("INVALID_CREDENTIALS", 401);

    const passOk = await bcrypt.compare(input.password, hash);
    if (!passOk) throw new AppError("INVALID_CREDENTIALS", 401);

    const roles = (user.usuario_roles ?? [])
      .map((ur: any) => ur.roles?.codigo_rol)
      .filter(Boolean) as RoleCode[];

    const payload: JwtPayloadShape = {
      sub: String(user.identificacion), // o id_usuario si lo tienes (mejor)
      nombre: String(user.nombre_completo),
      roles,
    };

    const accessToken = this.signAccessToken(payload);

     // 1) hashea el token antes de guardarlo
    const tokenHash = await bcrypt.hash(accessToken, 10);

    // ✅ 2) calcula expiración real leyendo el JWT
    const decoded = jwt.decode(accessToken) as { exp?: number } | null;
    if (!decoded?.exp) throw new AppError("TOKEN_EXP_MISSING", 500);
    const expiresAt = new Date(decoded.exp * 1000);

    // ✅ 3) guarda en BD
    await this.repo.saveAccessToken({
      userId: String(user.identificacion),
      tokenHash,
      expiresAt,
    });


    return {
      accessToken,
      user: {
        id: String(user.identificacion),
        nombre: String(user.nombre_completo),
        roles,
      } satisfies JwtUser,
    };
  }

  async me(userId: string) {
    const user = await this.repo.findUserByIdWithRoles(userId);
    if (!user) throw new Error("UNAUTHORIZED");

    if (typeof user.estado !== "undefined" && user.estado !== true) {
      throw new AppError("USER_DISABLED", 403);
    }

    const roles = (user.usuario_roles ?? [])
      .map((ur: any) => ur.roles?.codigo_rol) 
      .filter(Boolean) as RoleCode[];

    return {
      id: String(user.identificacion),
      nombre: String(user.nombre_completo),
      roles,
    } satisfies JwtUser;
  }
}
