'use client';

import { useActionState, useTransition } from 'react';
import { uploadCustomerDocument, deleteDocument, type DocumentActionState } from '@/server/actions/documents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { FileText, Trash2, ExternalLink } from 'lucide-react';

export interface DocRow {
  id: string;
  type: string;
  fileName: string;
  createdAt: string;
}

const TYPE_LABEL: Record<string, string> = {
  NID: 'NID', PHOTO: 'ছবি', SIGNATURE: 'স্বাক্ষর', AGREEMENT: 'চুক্তিপত্র',
  DEED: 'দলিল', MONEY_RECEIPT: 'রশিদ', OTHER: 'অন্যান্য',
};

export function DocumentManager({ customerId, docs }: { customerId: string; docs: DocRow[] }) {
  const action = uploadCustomerDocument.bind(null, customerId);
  const [state, formAction, pending] = useActionState<DocumentActionState, FormData>(action, {});
  const [deleting, startDelete] = useTransition();

  return (
    <div className="space-y-4">
      <ul className="divide-y divide-line">
        {docs.length === 0 && <li className="py-3 text-sm text-muted-foreground">কোনো ডকুমেন্ট নেই।</li>}
        {docs.map((d) => (
          <li key={d.id} className="flex items-center justify-between gap-3 py-2.5">
            <div className="flex min-w-0 items-center gap-2">
              <FileText className="size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-ink">{d.fileName}</div>
                <div className="text-xs text-muted-foreground">{TYPE_LABEL[d.type] ?? d.type}</div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <a href={`/api/documents/${d.id}`} target="_blank" rel="noreferrer" className="rounded-md p-1.5 text-navy hover:bg-bg-soft" aria-label="দেখুন">
                <ExternalLink className="size-4" />
              </a>
              <button
                type="button"
                onClick={() => startDelete(async () => { await deleteDocument(d.id); })}
                disabled={deleting}
                className="rounded-md p-1.5 text-red-600 hover:bg-red-50"
                aria-label="মুছুন"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <form action={formAction} className="space-y-3 rounded-md border border-line bg-bg-soft/50 p-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="doc-type">টাইপ</Label>
            <Select id="doc-type" name="type" defaultValue="NID">
              {Object.entries(TYPE_LABEL).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="doc-file">ফাইল (JPG/PNG/PDF, ≤8MB)</Label>
            <Input id="doc-file" name="file" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" required />
          </div>
        </div>
        {state.error && <p className="text-sm text-red-700">{state.error}</p>}
        {state.ok && <p className="text-sm text-green-700">✔ আপলোড হয়েছে।</p>}
        <Button type="submit" size="sm" disabled={pending}>{pending ? 'আপলোড হচ্ছে…' : 'আপলোড করুন'}</Button>
      </form>
    </div>
  );
}
