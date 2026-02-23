import { prisma } from "../../db/prisma";

export class ConfiguracionRepository {
  findAll() {
    return prisma.configuracion.findMany({
      orderBy: { created_at: "desc" },
    });
  }

  findById(identificacion: string) {
    return prisma.configuracion.findUnique({
      where: { identificacion },
    });
  }

  create(data: { identificacion: string; nombre_sistema: string; ubicacion?: string | null }) {
    return prisma.configuracion.create({
      data: {
        identificacion: data.identificacion,
        nombre_sistema: data.nombre_sistema,
        ubicacion: data.ubicacion ?? null,
      },
    });
  }

  update(
    identificacion: string,
    data: { nombre_sistema?: string; ubicacion?: string | null }
  ) {
    return prisma.configuracion.update({
      where: { identificacion },
      data: {
        ...data,
        updated_at: new Date(), // si no usas @updatedAt
      },
    });
  }

  delete(identificacion: string) {
    return prisma.configuracion.delete({
      where: { identificacion },
    });
  }
}