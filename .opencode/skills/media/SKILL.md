---
name: media
description: Centralized Media Library — upload, process, variant generation, storage providers, usage tracking. Activate for file uploads, image processing, media relations, storage configuration.
argument-hint: "[upload|process|variant|storage|relation] [args]"
metadata:
  author: nox
  version: "1.0.0"
---

# Media Library

Centralized file storage with automatic variant generation and polymorphic usage tracking.

## Architecture

```
MediaFolder (hierarchical)
  └── Media (centralized file store)
        ├── url, thumbnail_url, small_url, medium_url, large_url
        ├── mime_type, extension, file_size, file_type
        ├── width, height, duration, is_animated
        ├── storage_provider: local | supabase | s3 | cloudinary
        ├── blur_hash (image placeholders)
        ├── status: uploading → processing → ready | failed
        └── uploaded_by: Admin relation

MediaUsage (polymorphic tracking)
  └── resource_type + resource_id + usage_type
```

## Variant Sizes

| Variant | Size | Use Case |
|---------|------|----------|
| url (original) | Full | Full resolution |
| thumbnail_url | 100px | Gallery grids |
| small_url | 300px | Product cards |
| medium_url | 600px | Product detail |
| large_url | 1200px | Hero banners |

## Key Patterns

### Upload Flow
```ts
const media = await prisma.media.create({
  data: {
    filename, original_name, mime_type, extension, file_size, file_type,
    url, thumbnail_url, small_url, medium_url, large_url,
    storage_provider: "local",
    status: "ready",
    uploaded_by_id: adminId,
  },
});
```

### Attach Media to Entity
```ts
await prisma.productMedia.create({
  data: { product_id, media_id: media.id, is_primary: true, sort_order: 0 },
});

// Also track in MediaUsage
await prisma.mediaUsage.create({
  data: { media_id: media.id, resource_type: "product", resource_id: productId, usage_type: "image" },
});
```

### Query with Media
```ts
const product = await prisma.product.findUnique({
  where: { id },
  include: {
    media: { include: { media: true }, orderBy: { sort_order: "asc" } },
  },
});
// Access: product.media[0].media.url
```

## Storage Providers

Set `storage_provider` on Media to switch:
- `local` — `public/uploads/` (default)
- `supabase` — Supabase Storage bucket
- `s3` — AWS S3 compatible
- `cloudinary` — Cloudinary CDN

## References

| Topic | Description |
|-------|-------------|
| `src/lib/upload.ts` | Upload processing utilities |
| Media schema | `prisma/schema.prisma` (model Media, MediaFolder, MediaUsage) |
| All media relations | `NOX_REFERENCE.md` section 4 |
