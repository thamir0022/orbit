/**
 * Configuration for optional welcome tutorial content.
 *
 * - Video and thumbnail URLs must use HTTPS.
 * - The thumbnail is rendered as a Markdown image linked to the video.
 */
export interface WelcomeNotificationContentOptions {
  readonly videoUrl?: string
  readonly thumbnailUrl?: string
}

/** Generated Markdown content for the account welcome notification. */
export interface WelcomeNotificationContent {
  readonly title: string
  readonly message: string
}

/** Injection token for preconfigured welcome notification content. */
export const WELCOME_NOTIFICATION_CONTENT = Symbol('WelcomeNotificationContent')

/**
 * Generates the default Orbit onboarding notification.
 *
 * - Uses Markdown compatible with the Streamdown renderer.
 * - Includes tutorial media only when configured.
 * - Keeps onboarding content independent of MongoDB and NestJS.
 */
export function createWelcomeNotificationContent(
  options: WelcomeNotificationContentOptions = {}
): WelcomeNotificationContent {
  const videoUrl = options.videoUrl ? normalizeHttpsUrl(options.videoUrl) : null

  const thumbnailUrl = options.thumbnailUrl
    ? normalizeHttpsUrl(options.thumbnailUrl)
    : null

  if (thumbnailUrl && !videoUrl) {
    throw new Error('Welcome tutorial thumbnail requires a video URL')
  }

  const tutorial = videoUrl
    ? thumbnailUrl
      ? `[![Watch the Orbit introduction](${thumbnailUrl})](${videoUrl})`
      : `[Watch the Orbit introduction](${videoUrl})`
    : null

  const sections = [
    '# Welcome to Orbit! 👋',
    'Your workspace for planning, organizing, and delivering great work.',
    '## Get started',
    [
      '1. **Set up your workspace** — Configure your workspace and preferences.',
      '2. **Invite your team** — Bring everyone together.',
      '3. **Create a project** — Define what your team is working on.',
      '4. **Organize work items** — Assign responsibilities and track progress.',
      '5. **Plan your sprints** — Turn priorities into achievable goals.',
    ].join('\n'),
  ]

  if (tutorial) {
    sections.push('## Watch the introduction', tutorial)
  }

  sections.push(
    'You’re all set to get started. Make great things happen with Orbit! 🚀'
  )

  return {
    title: 'Welcome to Orbit!',
    message: sections.join('\n\n'),
  }
}

/**
 * Validates and normalizes a trusted tutorial URL for Markdown.
 *
 * - Rejects non-HTTPS URLs and embedded credentials.
 * - Escapes Markdown destination delimiters.
 */
function normalizeHttpsUrl(value: string): string {
  let url: URL

  try {
    url = new URL(value)
  } catch {
    throw new Error('Welcome tutorial URL must be valid')
  }

  if (url.protocol !== 'https:' || url.username || url.password) {
    throw new Error('Welcome tutorial URLs must use HTTPS')
  }

  return url.toString().replaceAll('(', '%28').replaceAll(')', '%29')
}
