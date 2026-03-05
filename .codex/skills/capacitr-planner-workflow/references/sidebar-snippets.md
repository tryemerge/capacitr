# Sidebar Snippets

Update `apps/docs/content/.vitepress/config.ts` planning sections.

## ADR entry

```ts
{ text: 'v{V} {date} {Title}', link: '/planning/adr/{filename-without-ext}' }
```

## Impl entry

```ts
{ text: 'v{V} {date} {Title}', link: '/planning/impl/{filename-without-ext}' }
```

## Archive entry

```ts
{ text: 'v{V} {date} {Title} ({suffix})', link: '/planning/archive/{filename-without-ext}' }
```
