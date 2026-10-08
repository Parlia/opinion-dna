/**
 * A page-level `openGraph` / `twitter` metadata object replaces the root one
 * wholesale, including the file-based images from src/app/opengraph-image.tsx
 * and twitter-image.tsx. Pages that set their own openGraph/twitter must spread
 * these back in or they ship with no share image.
 */
const SHARE_IMAGE = {
  width: 1200,
  height: 630,
  alt: "Opinion DNA: 48 dimensions of personality, values, and meta-thinking",
};

export const ROOT_OG_IMAGES = [{ url: "/opengraph-image", ...SHARE_IMAGE }];
export const ROOT_TWITTER_IMAGES = [{ url: "/twitter-image", ...SHARE_IMAGE }];
