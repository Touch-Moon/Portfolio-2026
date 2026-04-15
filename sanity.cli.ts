import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: '9z8k2qza',
    dataset: 'production'
  },
  deployment: {
    appId: 'leqs5ydqm5prs4ts4u1bpcjw',
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/studio/latest-version-of-sanity#k47faf43faf56
     */
    autoUpdates: true,
  }
})
