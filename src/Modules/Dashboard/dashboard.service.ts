import { DashboardRepository } from "./dashboard.repository";

export class DashboardService {
  constructor(private readonly repo: DashboardRepository) {}

  async getResumen() {
    const [
      totalProductos,
      stock,
      ventasHoy,
      traspasosHoy,
      ultimos,
      movimientosSemana,
    ] = await Promise.all([
      this.repo.totalProductos(),
      this.repo.stockDisponible(),
      this.repo.ventasDelDia(),
      this.repo.traspasosHoy(),
      this.repo.ultimosMovimientos(),
      this.repo.movimientosSemana(),
    ]);

    return {
      cards: {
        totalProductos,
        stockDisponible: stock._sum.cantidad ?? 0,
        ventasHoy,
        traspasosHoy,
      },
      ultimosMovimientos: ultimos.map((m) => ({
        producto: m.productos.descripcion,
        fecha: m.movimientos.fecha,
        usuario: m.movimientos.usuarios.nombre_completo,
        cantidad: m.cantidad,
        tipo: m.movimientos.tipo,
      })),
      movimientosSemana,
    };
  }
}