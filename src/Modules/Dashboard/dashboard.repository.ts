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
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const ventas = await this.prisma.movimiento_detalle.findMany({
      where: {
        movimientos: {
          tipo: tipo_movimiento.VENTA,
          fecha: { gte: today },
        },
      },
      select: {
        cantidad: true,
        valor_unitario: true,
      },
    });

    return ventas.reduce((acc, v) => {
      return acc + Number(v.valor_unitario) * v.cantidad;
    }, 0);
  }

  // Traspasos hoy
  traspasosHoy() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.prisma.movimientos.count({
      where: {
        tipo: tipo_movimiento.TRASPASO,
        fecha: { gte: today },
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