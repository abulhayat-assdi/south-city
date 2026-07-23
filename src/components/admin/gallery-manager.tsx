'use client';

import { useActionState, useTransition } from 'react';
import Image from 'next/image';
import { addProjectImage, deleteProjectImage } from '@/server/actions/projects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2 } from 'lucide-react';

export interface GalleryRow {
  id: string;
  url: string;
  captionBn: string | null;
  captionEn: string | null;
}

export function GalleryManager({ projectId, images }: { projectId: string; images: GalleryRow[] }) {
  const action = addProjectImage.bind(null, projectId);
  const [state, formAction, pending] = useActionState<{ error?: string; ok?: boolean }, FormData>(action, {});
  const [deleting, startDelete] = useTransition();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.length === 0 && <p className="text-sm text-muted-foreground">কোনো ছবি নেই।</p>}
        {images.map((img) => (
          <div key={img.id} className="group relative overflow-hidden rounded-md border border-line">
            <div className="relative aspect-video bg-bg-soft">
              <Image src={img.url} alt={img.captionEn ?? ''} fill className="object-cover" sizes="200px" />
            </div>
            <div className="truncate px-2 py-1 text-xs text-muted-foreground">{img.captionBn ?? img.url}</div>
            <button
              type="button"
              onClick={() => startDelete(async () => { await deleteProjectImage(img.id); })}
              disabled={deleting}
              className="absolute right-1 top-1 rounded-md bg-white/90 p-1 text-red-600 opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="মুছুন"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </div>

      <form action={formAction} className="space-y-3 rounded-md border border-line bg-bg-soft/50 p-3">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5 sm:col-span-3">
            <Label htmlFor="url">ছবির URL (যেমন /projects/…/gallery-1.webp)</Label>
            <Input id="url" name="url" required placeholder="/projects/south-city/gallery-1.webp" />
          </div>
          <div className="space-y-1.5"><Label htmlFor="captionBn">ক্যাপশন (বাংলা)</Label><Input id="captionBn" name="captionBn" /></div>
          <div className="space-y-1.5"><Label htmlFor="captionEn">ক্যাপশন (English)</Label><Input id="captionEn" name="captionEn" /></div>
        </div>
        {state.error && <p className="text-sm text-red-700">{state.error}</p>}
        {state.ok && <p className="text-sm text-green-700">✔ যোগ হয়েছে।</p>}
        <Button type="submit" size="sm" disabled={pending}>{pending ? 'যোগ হচ্ছে…' : 'ছবি যোগ করুন'}</Button>
      </form>
    </div>
  );
}
