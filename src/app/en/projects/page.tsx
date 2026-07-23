import { renderProjectsList } from '@/components/public/renderers';
export const dynamic = 'force-dynamic'; // data is cached in server/public-data.ts (5 min)
export default function Page() { return renderProjectsList('en'); }
