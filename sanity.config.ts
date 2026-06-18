import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {orderableDocumentListDeskItem} from '@sanity/orderable-document-list'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'MyPortfolio2026',

  projectId: '9z8k2qza',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S, context) =>
        S.list()
          .title('Content')
          .items([
            // Stories — drag to reorder; the order is reflected on the site
            orderableDocumentListDeskItem({
              type: 'story',
              title: 'Stories (drag to order)',
              S,
              context,
            }),
            // Everything else as the normal document lists
            ...S.documentTypeListItems().filter(
              (listItem) => !['story'].includes(listItem.getId() || '')
            ),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})
