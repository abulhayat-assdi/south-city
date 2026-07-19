'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { assertPermission } from '@/server/session';
import { writeAudit } from '@/lib/audit';
import { plotSchema } from '@/lib/validators/plot';

export interface PlotActionState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

function nn(v: string | number | undefined | null): string | null {
  if (v === undefined || v === null || v === '') return null;
  return String(v);
}

function parseForm(formData: FormData) {
  return plotSchema.safeParse({
    sector: formData.get('sector'),
    plotNumber: formData.get('plotNumber'),
    sizeKatha: formData.get('sizeKatha'),
    category: formData.get('category') || 'RESIDENTIAL',
    roadWidthFt: formData.get('roadWidthFt') || '',
    dimensions: formData.get('dimensions') || '',
    faceDirection: formData.get('faceDirection') || '',
    status: formData.get('status') || 'AVAILABLE',
    basePrice: formData.get('basePrice') || '',
    remarks: formData.get('remarks') || '',
  });
}

export async function createPlot(_prev: PlotActionState, formData: FormData): Promise<PlotActionState> {
  const user = await assertPermission('plot:write');
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }
  const d = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      const plot = await tx.plot.create({
        data: {
          sector: d.sector.toUpperCase(),
          plotNumber: d.plotNumber,
          sizeKatha: new Prisma.Decimal(d.sizeKatha),
          category: d.category,
          roadWidthFt: d.roadWidthFt ?? null,
          dimensions: nn(d.dimensions),
          faceDirection: nn(d.faceDirection),
          status: d.status,
          basePrice: d.basePrice ? new Prisma.Decimal(d.basePrice) : null,
          remarks: nn(d.remarks),
        },
      });
      await writeAudit(tx, { userId: user.id, action: 'CREATE_PLOT', entity: 'Plot', entityId: plot.id, after: plot });
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return { error: 'এই সেক্টরে এই প্লট নম্বর ইতিমধ্যে আছে' };
    }
    throw e;
  }

  revalidatePath('/admin/plots');
  redirect('/admin/plots');
}

export async function updatePlot(id: string, _prev: PlotActionState, formData: FormData): Promise<PlotActionState> {
  const user = await assertPermission('plot:write');
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const d = parsed.data;

  const before = await prisma.plot.findUnique({ where: { id } });
  if (!before) return { error: 'প্লট পাওয়া যায়নি' };

  try {
    await prisma.$transaction(async (tx) => {
      const plot = await tx.plot.update({
        where: { id },
        data: {
          sector: d.sector.toUpperCase(),
          plotNumber: d.plotNumber,
          sizeKatha: new Prisma.Decimal(d.sizeKatha),
          category: d.category,
          roadWidthFt: d.roadWidthFt ?? null,
          dimensions: nn(d.dimensions),
          faceDirection: nn(d.faceDirection),
          status: d.status,
          basePrice: d.basePrice ? new Prisma.Decimal(d.basePrice) : null,
          remarks: nn(d.remarks),
        },
      });
      await writeAudit(tx, { userId: user.id, action: 'UPDATE_PLOT', entity: 'Plot', entityId: id, before, after: plot });
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return { error: 'এই সেক্টরে এই প্লট নম্বর ইতিমধ্যে আছে' };
    }
    throw e;
  }

  revalidatePath('/admin/plots');
  redirect(`/admin/plots/${id}`);
}

export async function deletePlot(id: string): Promise<{ error?: string }> {
  const user = await assertPermission('plot:write');
  const plot = await prisma.plot.findUnique({ where: { id }, include: { _count: { select: { sales: true } } } });
  if (!plot) return { error: 'প্লট পাওয়া যায়নি' };
  if (plot._count.sales > 0) return { error: 'বিক্রয় যুক্ত থাকায় প্লট মুছে ফেলা যাবে না' };

  await prisma.$transaction(async (tx) => {
    await tx.plot.delete({ where: { id } });
    await writeAudit(tx, { userId: user.id, action: 'DELETE_PLOT', entity: 'Plot', entityId: id, before: plot });
  });
  revalidatePath('/admin/plots');
  return {};
}

/** CSV import (spec §6.2). Header: sector,plotNumber,sizeKatha,category,roadWidthFt,dimensions,faceDirection,basePrice */
export async function importPlotsCsv(
  _prev: { error?: string; imported?: number; skipped?: number },
  formData: FormData,
): Promise<{ error?: string; imported?: number; skipped?: number }> {
  const user = await assertPermission('plot:write');
  const text = String(formData.get('csv') ?? '').trim();
  if (!text) return { error: 'CSV খালি' };

  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  const header = lines.shift()?.split(',').map((h) => h.trim().toLowerCase()) ?? [];
  const col = (name: string) => header.indexOf(name);
  const iSector = col('sector');
  const iNo = col('plotnumber');
  const iSize = col('sizekatha');
  if (iSector < 0 || iNo < 0 || iSize < 0) {
    return { error: 'হেডারে অন্তত sector, plotNumber, sizeKatha থাকতে হবে' };
  }

  let imported = 0;
  let skipped = 0;
  for (const line of lines) {
    const cells = line.split(',').map((c) => c.trim());
    const parsed = plotSchema.safeParse({
      sector: cells[iSector],
      plotNumber: cells[iNo],
      sizeKatha: cells[iSize],
      category: (cells[col('category')] || 'RESIDENTIAL').toUpperCase(),
      roadWidthFt: cells[col('roadwidthft')] || '',
      dimensions: cells[col('dimensions')] || '',
      faceDirection: cells[col('facedirection')] || '',
      status: 'AVAILABLE',
      basePrice: cells[col('baseprice')] || '',
    });
    if (!parsed.success) {
      skipped++;
      continue;
    }
    const d = parsed.data;
    try {
      await prisma.plot.create({
        data: {
          sector: d.sector.toUpperCase(),
          plotNumber: d.plotNumber,
          sizeKatha: new Prisma.Decimal(d.sizeKatha),
          category: d.category,
          roadWidthFt: d.roadWidthFt ?? null,
          dimensions: nn(d.dimensions),
          faceDirection: nn(d.faceDirection),
          basePrice: d.basePrice ? new Prisma.Decimal(d.basePrice) : null,
        },
      });
      imported++;
    } catch {
      skipped++; // duplicate (sector, plotNumber) etc.
    }
  }

  await prisma.auditLog.create({
    data: { userId: user.id, action: 'IMPORT_PLOTS', entity: 'Plot', entityId: '-', after: { imported, skipped } },
  });
  revalidatePath('/admin/plots');
  return { imported, skipped };
}
