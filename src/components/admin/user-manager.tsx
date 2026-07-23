'use client';

import { useActionState, useState, useTransition } from 'react';
import { createStaffUser, toggleUserActive, resetUserPassword, type UserActionState } from '@/server/actions/users';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  customerCode: string | null;
}

const ROLE_BN: Record<string, string> = { ADMIN: 'অ্যাডমিন', STAFF: 'স্টাফ', CUSTOMER: 'কাস্টমার' };

export function UserManager({ users }: { users: UserRow[] }) {
  const [state, formAction, pending] = useActionState<UserActionState, FormData>(createStaffUser, {});

  return (
    <div className="space-y-6">
      <form action={formAction} className="grid gap-3 rounded-lg border border-line bg-white p-4 sm:grid-cols-4">
        <div className="space-y-1.5"><Label>নাম</Label><Input name="name" required /></div>
        <div className="space-y-1.5"><Label>ইমেইল</Label><Input name="email" type="email" required /></div>
        <div className="space-y-1.5"><Label>ফোন</Label><Input name="phone" /></div>
        <div className="space-y-1.5">
          <Label>রোল</Label>
          <Select name="role" defaultValue="STAFF"><option value="STAFF">স্টাফ</option><option value="ADMIN">অ্যাডমিন</option></Select>
        </div>
        {state.error && <p className="text-sm text-red-700 sm:col-span-4">{state.error}</p>}
        {state.ok && (
          <p className="rounded bg-green-50 px-3 py-2 text-sm text-green-800 sm:col-span-4">
            ✔ অ্যাকাউন্ট তৈরি — <b>{state.email}</b> · অস্থায়ী পাসওয়ার্ড: <b className="font-mono">{state.tempPassword}</b> (কপি করে দিন)।
          </p>
        )}
        <div className="sm:col-span-4"><Button type="submit" disabled={pending}>{pending ? 'তৈরি হচ্ছে…' : 'স্টাফ/অ্যাডমিন যোগ করুন'}</Button></div>
      </form>

      <div className="rounded-lg border border-line bg-white">
        <Table>
          <TableHeader><TableRow><TableHead>নাম</TableHead><TableHead>ইমেইল</TableHead><TableHead>রোল</TableHead><TableHead>স্ট্যাটাস</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>
            {users.map((u) => <UserRowView key={u.id} u={u} />)}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function UserRowView({ u }: { u: UserRow }) {
  const [pending, start] = useTransition();
  const [temp, setTemp] = useState<string | null>(null);

  return (
    <TableRow>
      <TableCell>{u.name}{u.customerCode && <span className="ml-1 text-xs text-muted-foreground">({u.customerCode})</span>}</TableCell>
      <TableCell className="font-mono text-xs">{u.email}</TableCell>
      <TableCell><Badge variant={u.role === 'ADMIN' ? 'gold' : 'secondary'}>{ROLE_BN[u.role]}</Badge></TableCell>
      <TableCell>{u.isActive ? <Badge variant="success">সক্রিয়</Badge> : <Badge variant="danger">নিষ্ক্রিয়</Badge>}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <button
            type="button" disabled={pending}
            onClick={() => start(async () => { await toggleUserActive(u.id); })}
            className="text-xs text-navy hover:underline"
          >
            {u.isActive ? 'নিষ্ক্রিয়' : 'সক্রিয়'}
          </button>
          <button
            type="button" disabled={pending}
            onClick={() => start(async () => { const r = await resetUserPassword(u.id); if (r.tempPassword) setTemp(r.tempPassword); })}
            className="text-xs text-navy hover:underline"
          >
            পাসওয়ার্ড রিসেট
          </button>
          {temp && <span className="font-mono text-xs text-green-700">{temp}</span>}
        </div>
      </TableCell>
    </TableRow>
  );
}
