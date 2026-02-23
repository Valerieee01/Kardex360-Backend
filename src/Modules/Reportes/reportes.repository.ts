import { PrismaClient, tipo_movimiento } from "@prisma/client";

export type ReporteFiltros = {
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
  bodega?: string; // codigo_bodega | "TODAS"
  tipo?: tipo_movimiento | "TODOS";
};

export class ReportesRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getMovimientosWithDetalle(filters: ReporteFiltros) {
    const whereMov: any = { estado: true };

    if (filters.tipo && filters.tipo !== "TODOS") whereMov.tipo = filters.tipo;

    if (filters.from || filters.to) {
      whereMov.fecha = {};
      if (filters.from) whereMov.fecha.gte = new Date(filters.from + "T00:00:00");
      if (filters.to) whereMov.fecha.lte = new Date(filters.to + "T23:59:59");
    }

    // filtro bodega: para TRASPASO se usan origen/destino, para otros puedes decidir
    if (filters.bodega && filters.bodega !== "TODAS") {
      whereMov.OR = [
        { bodega_origen: filters.bodega },
        { bodega_destino: filters.bodega },
      ];
    }

    return this.prisma.movimiento_detalle.findMany({
      where: {
        movimientos: whereMov,
      },
      select: {
        cantidad: true,
        valor_unitario: true,
        referencia: true,
        talla: true,
        created_at: true,
        productos: { select: { referencia: true, descripcion: true } },
        movimientos: {
          select: {
            codigo_movimiento: true,
            tipo: true,
            fecha: true,
            responsable: true,
            bodega_origen: true,
            bodega_destino: true,
            usuarios: { select: { identificacion: true, nombre_completo: true } },
          },
        },
      },
      orderBy: { created_at: "desc" },
    });
  }

  async getMovimientosByUsuario(identificacion: string, filters: ReporteFiltros, limit = 50) {
    const whereMov: any = { estado: true, responsable: identificacion };

    if (filters.tipo && filters.tipo !== "TODOS") whereMov.tipo = filters.tipo;

    if (filters.from || filters.to) {
      whereMov.fecha = {};
      if (filters.from) whereMov.fecha.gte = new Date(filters.from + "T00:00:00");
      if (filters.to) whereMov.fecha.lte = new Date(filters.to + "T23:59:59");
    }

    if (filters.bodega && filters.bodega !== "TODAS") {
      whereMov.OR = [
        { bodega_origen: filters.bodega },
        { bodega_destino: filters.bodega },
      ];
    }

    return this.prisma.movimiento_detalle.findMany({
      take: limit,
      where: { movimientos: whereMov },
      select: {
        cantidad: true,
        valor_unitario: true,
        productos: { select: { referencia: true, descripcion: true } },
        movimientos: {
          select: {
            codigo_movimiento: true,
            tipo: true,
            fecha: true,
            bodega_origen: true,
            bodega_destino: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });
  }
}