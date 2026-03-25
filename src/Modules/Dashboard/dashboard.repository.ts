import { PrismaClient, tipo_movimiento } from "@prisma/client";

export class DashboardRepository {
  constructor(private readonly prisma: PrismaClient) {}

  // Total productos activos
  totalProductos() {
    return this.prisma.productos.count({
      where: { estado: true },
    });
  }

  // Stock total disponible
  stockDisponible() {
    return this.prisma.stock.aggregate({
      _sum: { cantidad: true },
    });
  }

  // Ventas del día (suma valor_unitario * cantidad)
  async ventasDelDia() {
  const inicio = new Date();
  inicio.setHours(0, 0, 0, 0);

  const fin = new Date();
  fin.setHours(23, 59, 59, 999);

  const ventas = await this.prisma.movimiento_detalle.findMany({
    where: {
      movimientos: {
        is: {
          tipo: tipo_movimiento.VENTA,
          created_at: {
            gte: inicio,
            lte: fin,
          },
        },
      },
    },
    select: {
      cantidad: true,
      valor_unitario: true,
    },
  });

  console.log("ventas:", ventas);

  return ventas.reduce((acc, item) => {
    return acc + Number(item.valor_unitario ?? 0) * Number(item.cantidad ?? 0);
  }, 0);
}
  // Traspasos hoy
  traspasosHoy() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.prisma.movimientos.count({
      where: {
        tipo: tipo_movimiento.TRASPASO,
        created_at: { gte: today },
      },
    });
  }

  // Últimos movimientos
  ultimosMovimientos(limit = 5) {
    return this.prisma.movimiento_detalle.findMany({
      take: limit,
      orderBy: { created_at: "desc" },
      include: {
        productos: true,
        movimientos: {
          include: {
            usuarios: true,
          },
        },
      },
    });
  }

  // Movimientos por semana agrupados
  async movimientosSemana() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    return this.prisma.movimientos.findMany({
      where: {
        fecha: { gte: sevenDaysAgo },
      },
      select: {
        fecha: true,
        tipo: true,
      },
    });
  }
}