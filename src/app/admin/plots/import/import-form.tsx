'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { importPlotsCsv } from '@/server/actions/plots';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const SAMPLE = `sector,plotNumber,sizeKatha,category,roadWidthFt,dimensions,basePrice
A,A-09,5,RESIDENTIAL,40,40ft x 90ft,6000000
A,A-10,10,COMMERCIAL,60,50ft x 144ft,13000000`;

export function ImportForm({
  projects,
  defaultProjectId,
}: {
  projects: { id: string; name: string }[];
  defaultProjectId?: string;
}) {
  const [state, formAction, pending] = useActionState(importPlotsCsv, {} as { error?: string; imported?: number; skipped?: number });

  return (
    <form action={formAction} className="max-w-2xl space-y-4">
      <div className="space-y-2">
        <Label htmlFor="projectId">প্রজেক্ট</Label>
        <Select id="projectId" name="projectId" defaultValue={defaultProjectId ?? projects[0]?.id ?? ''} required>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="csv">CSV ডেটা</Label>
        <p className="text-xs text-muted-foreground">
          প্রথম লাইন হেডার। আবশ্যক কলাম: <code>sector, plotNumber, sizeKatha</code>। ঐচ্ছিক:
          category, roadWidthFt, dimensions, faceDirection, basePrice।
        </p>
        <Textarea id="csv" name="csv" rows={10} defaultValue={SAMPLE} className="font-mono text-xs" />
      </div>

      {state.error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      {state.imported !== undefined && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          ✔ {state.imported} টি প্লট ইমপোর্ট হয়েছে{state.skipped ? `, ${state.skipped} টি বাদ পড়েছে (ডুপ্লিকেট/ভুল)` : ''}।
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>{pending ? 'ইমপোর্ট হচ্ছে…' : 'ইমপোর্ট করুন'}</Button>
        <Button asChild variant="outline" type="button"><Link href="/admin/plots">ফিরে যান</Link></Button>
      </div>
    </form>
  );
}
