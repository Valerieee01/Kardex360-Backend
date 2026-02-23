import { prisma } from "../../db/prisma";

export const movimientosRepository = {
 create: (data: {
  codigo_movimiento: string;
  tipo: "ENTRADA" | "VENTA" | "TRASPASO";
  fecha?: Date;
  responsable: string;
  bodega_origen?: string | null;
  bodega_destino?: string | null;
  observacion?: string | null;
  detalle: Array<{
    referencia: string;
    talla: string;
    cantidad: number;
    valor_unitario: number;
  }>;
}) =>
  prisma.$transaction(async (tx) => {
    const items = data.detalle.map((d, i) => ({
      item: i + 1,
      referencia: d.referencia,
      talla: d.talla,
      cantidad: d.cantidad,
      valor_unitario: d.valor_unitario,
    }));

    // ✅ APLICAR STOCK (esto es lo que faltaba)
    for (const d of items) {
      const qty = d.cantidad;

      if (data.tipo === "ENTRADA") {
        if (!data.bodega_destino) throw new Error("ENTRADA requiere bodega_destino");
        await incStock(tx, data.bodega_destino, d.referencia, d.talla, qty);
      }

      if (data.tipo === "VENTA") {
        if (!data.bodega_origen) throw new Error("VENTA requiere bodega_origen");
        await decStockOrThrow(tx, data.bodega_origen, d.referencia, d.talla, qty);
      }

      if (data.tipo === "TRASPASO") {
        if (!data.bodega_origen || !data.bodega_destino) throw new Error("TRASPASO requiere bodega_origen y bodega_destino");
        await decStockOrThrow(tx, data.bodega_origen, d.referencia, d.talla, qty);
        await incStock(tx, data.bodega_destino, d.referencia, d.talla, qty);
      }
    }

    // ✅ CREAR MOVIMIENTO + DETALLE
    return tx.movimientos.create({
      data: {
        codigo_movimiento: data.codigo_movimiento,
        tipo: data.tipo,
        fecha: data.fecha,
        responsable: data.responsable,
        bodega_origen: data.bodega_origen ?? null,
        bodega_destino: data.bodega_destino ?? null,
        observacion: data.observacion ?? null,
        estado: true, // si ya agregaste estado en prisma
        movimiento_detalle: { create: items },
      },
      include: {
        movimiento_detalle: { orderBy: { item: "asc" } },
        usuarios: { select: { identificacion: true, nombre_completo: true } },
        bodegas_movimientos_bodega_origenTobodegas: true,
        bodegas_movimientos_bodega_destinoTobodegas: true,
      },
    });
  }),
  findAll: (filters?: {
    tipo?: "ENTRADA" | "VENTA" | "TRASPASO";
    desde?: Date;
    hasta?: Date;
    responsable?: string;
    bodega?: string;
  }) =>
    prisma.movimientos.findMany({
      where: {
        ...(filters?.tipo ? { tipo: filters.tipo } : {}),
        ...(filters?.responsable ? { responsable: filters.responsable } : {}),
        ...(filters?.desde || filters?.hasta
          ? {
              fecha: {
                ...(filters?.desde ? { gte: filters.desde } : {}),
                ...(filters?.hasta ? { lte: filters.hasta } : {}),
              },
            }
          : {}),
        ...(filters?.bodega
          ? { OR: [{ bodega_origen: filters.bodega }, { bodega_destino: filters.bodega }] }
          : {}),
      },
      orderBy: { fecha: "desc" },
      include: {
        movimiento_detalle: { orderBy: { item: "asc" } },
        usuarios: { select: { identificacion: true, nombre_completo: true } },
      },
    }),

  findById: (codigo_movimiento: string) =>
    prisma.movimientos.findUnique({
      where: { codigo_movimiento },
      include: {
        movimiento_detalle: { orderBy: { item: "asc" } },
        usuarios: { select: { identificacion: true, nombre_completo: true } },
        bodegas_movimientos_bodega_origenTobodegas: true,
        bodegas_movimientos_bodega_destinoTobodegas: true,
      },
    }),

  update: (
  codigo_movimiento: string,
  _data: {
    tipo?: "ENTRADA" | "VENTA" | "TRASPASO";
    fecha?: Date;
    responsable?: string;
    bodega_origen?: string | null;
    bodega_destino?: string | null;
    observacion?: string | null;
    detalle?: Array<{
      referencia: string;
      talla: string;
      cantidad: number;
      valor_unitario: number;
    }>;
  }
) =>
  prisma.$transaction(async (tx) => {
    const mov = await tx.movimientos.findUnique({
      where: { codigo_movimiento },
      select: { estado: true },
    });

    if (!mov) throw new Error("Movimiento no encontrado");

    // ✅ Si está anulado, no se edita (histórico)
    if (mov.estado === false) {
      throw new Error("No se puede editar un movimiento anulado.");
    }

    // ✅ Si está vigente, bloqueamos edición (regla de negocio)
    throw new Error(
      "Edición bloqueada: no se permite actualizar movimientos. Debes anular el movimiento y crear uno nuevo."
    );
  }),

  delete: (codigo_movimiento: string) =>
    prisma.$transaction(async (tx) => {
      await tx.movimiento_detalle.deleteMany({ where: { codigo_movimiento } });
      return tx.movimientos.delete({ where: { codigo_movimiento } });
    }),

    anular: (codigo_movimiento: string, data: { anulado_por: string; motivo?: string | null }) =>
    prisma.$transaction(async (tx) => {
      const mov = await tx.movimientos.findUnique({
        where: { codigo_movimiento },
        include: { movimiento_detalle: true },
      });

      if (!mov) throw new Error("Movimiento no encontrado");
      if (mov.estado === false) throw new Error("El movimiento ya está anulado");

      // --- Ajuste de stock (reversión) ---
      for (const d of mov.movimiento_detalle) {
        const qty = d.cantidad;

        if (mov.tipo === "ENTRADA") {
          if (!mov.bodega_destino) throw new Error("ENTRADA sin bodega_destino");

          // Validar que exista y que alcance para restar
          const row = await requireStockRow(tx, mov.bodega_destino, d.referencia, d.talla);
          if (row.cantidad < qty) {
            throw new Error(`No hay stock suficiente para revertir ENTRADA en ${mov.bodega_destino} (${d.referencia}-${d.talla})`);
          }

          await tx.stock.update({
            where: { codigo_bodega_referencia_talla: { codigo_bodega: mov.bodega_destino, referencia: d.referencia, talla: d.talla } },
            data: { cantidad: { decrement: qty } },
          });
        }

        if (mov.tipo === "VENTA") {
          if (!mov.bodega_origen) throw new Error("VENTA sin bodega_origen");

          // Para sumar, si no existe fila la creamos
          await tx.stock.upsert({
            where: { codigo_bodega_referencia_talla: { codigo_bodega: mov.bodega_origen, referencia: d.referencia, talla: d.talla } },
            create: {
              codigo_bodega: mov.bodega_origen,
              referencia: d.referencia,
              talla: d.talla,
              cantidad: qty,
            },
            update: { cantidad: { increment: qty } },
          });
        }

        if (mov.tipo === "TRASPASO") {
          if (!mov.bodega_origen || !mov.bodega_destino) throw new Error("TRASPASO sin bodegas");

          // 1) devolver al origen (sumar)
          await tx.stock.upsert({
            where: { codigo_bodega_referencia_talla: { codigo_bodega: mov.bodega_origen, referencia: d.referencia, talla: d.talla } },
            create: {
              codigo_bodega: mov.bodega_origen,
              referencia: d.referencia,
              talla: d.talla,
              cantidad: qty,
            },
            update: { cantidad: { increment: qty } },
          });

          // 2) quitar del destino (restar) con validación
          const rowDest = await requireStockRow(tx, mov.bodega_destino, d.referencia, d.talla);
          if (rowDest.cantidad < qty) {
            throw new Error(`No hay stock suficiente para revertir TRASPASO en destino ${mov.bodega_destino} (${d.referencia}-${d.talla})`);
          }

          await tx.stock.update({
            where: { codigo_bodega_referencia_talla: { codigo_bodega: mov.bodega_destino, referencia: d.referencia, talla: d.talla } },
            data: { cantidad: { decrement: qty } },
          });
        }
      }

      // --- Marcar como anulado ---
      return tx.movimientos.update({
        where: { codigo_movimiento },
        data: {
          estado: false,
          anulado_at: new Date(),
          anulado_por: data.anulado_por,
          anulado_motivo: data.motivo ?? null,
        },
        include: { movimiento_detalle: true },
      });
    }),
};

async function requireStockRow(tx: any, codigo_bodega: string, referencia: string, talla: string) {
  const row = await tx.stock.findUnique({
    where: { codigo_bodega_referencia_talla: { codigo_bodega, referencia, talla } },
  });
  if (!row) throw new Error(`No existe stock para ${codigo_bodega} - ${referencia} - ${talla}`);
  return row;
}

async function incStock(tx: any, codigo_bodega: string, referencia: string, talla: string, qty: number) {
  await tx.stock.upsert({
    where: { codigo_bodega_referencia_talla: { codigo_bodega, referencia, talla } },
    create: { codigo_bodega, referencia, talla, cantidad: qty },
    update: { cantidad: { increment: qty } },
  });
}

async function decStockOrThrow(tx: any, codigo_bodega: string, referencia: string, talla: string, qty: number) {
  const row = await requireStockRow(tx, codigo_bodega, referencia, talla);
  if (row.cantidad < qty) {
    throw new Error(
      `Stock insuficiente en ${codigo_bodega} (${referencia}-${talla}). Actual: ${row.cantidad}, requiere: ${qty}`
    );
  }
  await tx.stock.update({
    where: { codigo_bodega_referencia_talla: { codigo_bodega, referencia, talla } },
    data: { cantidad: { decrement: qty } },
  });
}