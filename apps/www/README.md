# @capacitr/www

Static splash page for [capacitr.xyz](https://www.capacitr.xyz/).

## Local Development

```bash
# From repo root
cd apps/www

# Serve locally (no build step)
npx serve .
```

Opens at `http://localhost:3000`.

## Deployment

Deployed as a static site on Vercel. The `vercel.json` in this directory configures it with no build command and outputs from the current directory.

### Vercel Setup

1. Add a new project in [Vercel](https://vercel.com)
2. Import the `tryemerge/capacitr` repo
3. Set **Root Directory** to `apps/www`
4. Framework Preset: **Other**
5. Build Command: leave empty
6. Output Directory: `.`
7. Add domain: `capacitr.xyz` and `www.capacitr.xyz`

No environment variables are needed — this is a purely static HTML page.
