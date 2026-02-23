import type { PrismaClient } from "@prisma/client";

export class AuthRepository {
  constructor(private readonly prisma: PrismaClient) {}


  async findUserForLoginByIdentification(identificacion: string) {
    return this.prisma.usuarios.findUnique({
      where: { identificacion }, 
      select: {
        identificacion: true,       
        nombre_completo: true,     
        password_hash: true, 
        estado: true,    
        usuario_roles: {
          select: {
            roles: {
              select: {
                codigo_rol: true, 
                nombre : true
              },
            },
          },
        },
      },
    });
  }

  async findUserByIdWithRoles(identificacion: string) {
    return this.prisma.usuarios.findUnique({
      where: { identificacion: identificacion },
      select: {
        identificacion: true,
        nombre_completo: true,
        estado: true, 
        usuario_roles: {
          select: {
            roles: { select: { codigo_rol: true } }, 
          },
        },
      },
    });
  }

    async saveAccessToken(params: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }) {
    // Prisma (ejemplo)
    return this.prisma.usuarios.update({
      where: { identificacion: params.userId },
      data: {
        jwt_token: params.tokenHash,
        jwt_expires_at: params.expiresAt
      },
    });

  }
}
