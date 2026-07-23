import { renderNewsDetail } from '@/components/public/renderers';
export const dynamic = 'force-dynamic'; // data is cached in server/public-data.ts (5 min)
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return renderNewsDetail('bn', slug);
}
