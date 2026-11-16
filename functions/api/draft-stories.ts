// Cloudflare Pages Function for /api/draft-stories. The logic and its tests live in server/.
import { handleDraftStories, type DraftEnv } from '../../server/draftStories.ts'

export const onRequest = (context: { request: Request; env: DraftEnv }) =>
  handleDraftStories(context.request, context.env)
