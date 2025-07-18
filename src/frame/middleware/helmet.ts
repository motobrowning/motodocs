import type { NextFunction, Request, Response } from 'express'
import helmet from 'helmet'
import { isArchivedVersion } from '@/archives/lib/is-archived-version'
import versionSatisfiesRange from '@/versions/lib/version-satisfies-range'
import { languagePrefixPathRegex } from '@/languages/lib/languages'

const isDev = process.env.NODE_ENV === 'development'
const GITHUB_DOMAINS = [
  "'self'",
  'github.com',
  '*.github.com',
  '*.githubusercontent.com',
  '*.githubassets.com',
]

const DEFAULT_OPTIONS = {
  crossOriginResourcePolicy: true,
  crossOriginEmbedderPolicy: false, // doesn't work with youtube
  referrerPolicy: {
    // See docs-engineering #2426
    // The `... as 'no-referrer-when-downgrade'` is a workaround for TypeScript
    policy: 'no-referrer-when-downgrade' as 'no-referrer-when-downgrade',
  },
  // This module defines a Content Security Policy (CSP) to disallow
  // inline scripts and content from untrusted sources.
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'none'"],
      prefetchSrc: ["'self'"],
      // When doing local dev, especially in Safari, you need to add `ws:`
      // which NextJS uses for the hot module reloading.
      connectSrc: ["'self'", isDev && 'ws:'].filter(Boolean) as string[],
      fontSrc: ["'self'", 'data:'],
      imgSrc: [...GITHUB_DOMAINS, 'data:', 'placehold.it'],
      objectSrc: ["'self'"],
      // For use during development only!
      // `unsafe-eval` allows us to use a performant webpack devtool setting (eval)
      // https://webpack.js.org/configuration/devtool/#devtool
      scriptSrc: [...GITHUB_DOMAINS, "'self'", 'data:', isDev && "'unsafe-eval'"].filter(
        Boolean,
      ) as string[],
      scriptSrcAttr: ["'self'"],
      frameSrc: [
        ...GITHUB_DOMAINS,
        isDev && 'http://localhost:3000',
        // This URL is also set in ArticleContext.tsx. We don't rely on importing a constant as we may run into an import conflict where the env variable is not yet set.
        process.env.NODE_ENV === 'production'
          ? 'https://support.github.com'
          : // Assume that a developer is not testing the VA iframe locally if this env var is not set
            process.env.SUPPORT_PORTAL_URL || '',
        'https://www.youtube-nocookie.com',
      ].filter(Boolean) as string[],
      frameAncestors: isDev ? ['*'] : [...GITHUB_DOMAINS],
      styleSrc: [...GITHUB_DOMAINS, "'self'", "'unsafe-inline'", 'data:'],
      childSrc: ["'self'"], // exception for search in deprecated GHE versions
      manifestSrc: ["'self'"],
      upgradeInsecureRequests: isDev ? null : [],
    },
  },
}

const NODE_DEPRECATED_OPTIONS = structuredClone(DEFAULT_OPTIONS)
const ndDirs = NODE_DEPRECATED_OPTIONS.contentSecurityPolicy.directives
ndDirs.scriptSrc.push(
  "'unsafe-eval'",
  "'unsafe-inline'",
  'http://www.google-analytics.com',
  'https://ssl.google-analytics.com',
)
ndDirs.connectSrc.push('https://www.google-analytics.com')
ndDirs.imgSrc.push('http://www.google-analytics.com', 'https://ssl.google-analytics.com')

const DEVELOPER_DEPRECATED_OPTIONS = structuredClone(DEFAULT_OPTIONS)
const devDirs = DEVELOPER_DEPRECATED_OPTIONS.contentSecurityPolicy.directives
devDirs.styleSrc.push('*.googleapis.com')
devDirs.scriptSrc.push("'unsafe-inline'", '*.googleapis.com', 'http://www.google-analytics.com')
devDirs.fontSrc.push('*.gstatic.com')
devDirs.scriptSrcAttr.push("'unsafe-inline'")

const STATIC_DEPRECATED_OPTIONS = structuredClone(DEFAULT_OPTIONS)
STATIC_DEPRECATED_OPTIONS.contentSecurityPolicy.directives.scriptSrc.push("'unsafe-inline'")

const defaultHelmet = helmet(DEFAULT_OPTIONS)
const nodeDeprecatedHelmet = helmet(NODE_DEPRECATED_OPTIONS)
const staticDeprecatedHelmet = helmet(STATIC_DEPRECATED_OPTIONS)
const developerDeprecatedHelmet = helmet(DEVELOPER_DEPRECATED_OPTIONS)

export default function helmetMiddleware(req: Request, res: Response, next: NextFunction) {
  // Enable CORS
  if (['GET', 'OPTIONS'].includes(req.method)) {
    res.set('access-control-allow-origin', '*')
  }

  // Determine version for exceptions
  const { requestedVersion } = isArchivedVersion(req)

  // Check if this is a legacy developer.github.com path
  const isDeveloper = req.path
    .replace(languagePrefixPathRegex, '/')
    .startsWith(`/enterprise/${requestedVersion}/developer`)
  if (versionSatisfiesRange(requestedVersion, '<=2.18') && isDeveloper) {
    return developerDeprecatedHelmet(req, res, next)
  }

  // Exception for deprecated Enterprise docs (Node.js era)
  if (
    versionSatisfiesRange(requestedVersion, '<=2.19') &&
    versionSatisfiesRange(requestedVersion, '>2.12')
  ) {
    return nodeDeprecatedHelmet(req, res, next)
  }

  // Exception for search in deprecated Enterprise docs <=2.12 (static site era)
  if (versionSatisfiesRange(requestedVersion, '<=2.12')) {
    return staticDeprecatedHelmet(req, res, next)
  }

  return defaultHelmet(req, res, next)
}
