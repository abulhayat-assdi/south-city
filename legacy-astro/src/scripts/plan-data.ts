/**
 * Hotspot data shared with the client-side master-plan script.
 * (Kept as a tiny module so the DOM script stays dependency-free —
 * importing site.ts client-side would pull server-only env access.)
 */
import { hotspots } from '../content/site';

export const hotspotData = hotspots.map(({ id, name, desc }) => ({ id, name, desc }));
