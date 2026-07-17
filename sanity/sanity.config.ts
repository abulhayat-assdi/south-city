import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './schemaTypes';

// 🔴 placeholder — run `npx sanity init` (or create a project at sanity.io/manage)
// and put the real project ID here AND in the site's SANITY_PROJECT_ID env var.
const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? 'YOUR_SANITY_PROJECT_ID';
const dataset = process.env.SANITY_STUDIO_DATASET ?? 'production';

// singleton document types: one instance each, no "create new" button
const singletons = ['siteSettings', 'hero', 'overview', 'masterPlan', 'brochure'];

export default defineConfig({
  name: 'south-city',
  title: 'South City Website',
  projectId,
  dataset,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            ...singletons.map((type) =>
              S.listItem()
                .title(
                  { siteSettings: 'Site Settings (phone, email, address)',
                    hero: 'Hero (headline + image)',
                    overview: 'Overview (paragraph + counters)',
                    masterPlan: 'Master Plan image',
                    brochure: 'Brochure (PDF)' }[type] ?? type
                )
                .child(S.document().schemaType(type).documentId(type))
            ),
            S.divider(),
            ...['trustBadge', 'projectFact', 'plot', 'amenity', 'landmarkTab', 'galleryImage'].map(
              (type) => S.documentTypeListItem(type)
            ),
          ]),
    }),
  ],
  schema: {
    types: schemaTypes,
    templates: (templates) => templates.filter((t) => !singletons.includes(t.schemaType)),
  },
});
