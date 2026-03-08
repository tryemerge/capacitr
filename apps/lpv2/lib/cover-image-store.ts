/**
 * Simple localStorage store for cover image URLs, keyed by on-chain idea ID.
 */

const STORAGE_KEY = "capacitr:cover-images"

function readStore(): Record<string, string> {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeStore(store: Record<string, string>): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

export function setCoverImage(ideaId: string, url: string): void {
  if (!url) return
  const store = readStore()
  store[ideaId] = url
  writeStore(store)
}

export function getCoverImage(ideaId: string): string | null {
  const store = readStore()
  return store[ideaId] ?? null
}
