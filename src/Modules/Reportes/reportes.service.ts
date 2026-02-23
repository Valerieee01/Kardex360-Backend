import { tipo_movimiento } from "@prisma/client";
import { ReportesRepository, ReporteFiltros } from "./reportes.repository";

const DIAS = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"]; // JS getDay(): 0=Dom

function toCOP(n: number) {
  return Math.round(n * 100) / 100;
}

export class ReportesService {
  constructor(private readonly repo: ReportesRepository) {}

  async resumenMovimientos(filters: ReporteFiltros) {
    const rows = await this.repo.getMovimientosWithDetalle(filters);

    // acumuladores por día
    const byDay: Record<string, { VENTA: number; TRASPASO: number; ENTRADA: number }> = {};
    for (const d of DIAS) byDay[d] = { VENTA: 0, TRASPASO: 0, ENTRADA: 0 };

    let totalCantidad = 0;
    let totalValor = 0;

    for (const r of rows) {
      const day = DIAS[new Date(r.movimientos.fecha).getDay()];
      const tipo = r.movimientos.tipo as tipo_movimiento;

      totalCantidad += r.cantidad;

      // “valor” solo tiene sentido en venta/entrada si lo manejas así
      const valor = Number(r.valor_unitario) * r.cantidad;
      totalValor += valor;

      // para la gráfica: puedes usar cantidad o valor; aquí uso cantidad
      if (tipo === "VENTA") byDay[day].VENTA += r.cantidad;
      if (tipo === "TRASPASO") byDay[day].TRASPASO += r.cantidad;
      if (tipo === "ENTRADA") byDay[day].ENTRADA += r.cantidad;
    }

    // salida lista para gráfica de barras:
    // [{ dia:'Lun', ventas: 10, traspasos: 4 }, ...]
    const dataChart = ["Lun","Mar","Mie","Jue","Vie","Sab","Dom"].map((dia) => ({
      dia,
      ventas: byDay[dia].VENTA,
      traspasos: byDay[dia].TRASPASO,
      entradas: byDay[dia].ENTRADA,
    }));

    return {
      filtros: filters,
      chart: dataChart,
      totales: {
        registros: rows.length,
        cantidad: totalCantidad,
        valor_estimado: toCOP(totalValor),
      },
      // opcional para tabla/export:
      items: rows.slice(0, 100), // no devuelvas infinito al front
    };
  }

  async movimientosPorUsuario(identificacion: string, filters: ReporteFiltros, limit = 50) {
    const rows = await this.repo.getMovimientosByUsuario(identificacion, filters, limit);

    const data = rows.map((r) => ({
      codigo_movimiento: r.movimientos.codigo_movimiento,
      tipo: r.movimientos.tipo,
      fecha: r.movimientos.fecha,
      bodega_origen: r.movimientos.bodega_origen,
      bodega_destino: r.movimientos.bodega_destino,
      producto: r.productos.descripcion,
      referencia: r.productos.referencia,
      cantidad: r.cantidad,
      valor_unitario: Number(r.valor_unitario),
      total_linea: toCOP(Number(r.valor_unitario) * r.cantidad),
    }));

    return { identificacion, filtros: filters, data };
  }
}