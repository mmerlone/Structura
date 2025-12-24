# Avatar Image Optimization Strategy

## Current Implementation

Avatar images are currently stored directly in Supabase Storage and served via direct public URLs.

## Recommended Optimizations

### 1. Image Transformation Pipeline

#### Option A: Supabase Image Transformation (Recommended)
```typescript
// Use Supabase's built-in image transformation
const {
  data: { publicUrl },
} = this.client.storage
  .from(PROFILE_BUCKET)
  .getPublicUrl(filePath, {
    transform: {
      width: 200,
      height: 200,
      resize: 'cover',
      format: 'webp',
      quality: 80,
    },
  })
```

**Benefits:**
- Built into Supabase (no additional services)
- Automatic format conversion (WebP for browsers that support it)
- On-the-fly resizing
- Edge caching

#### Option B: Next.js Image Optimization API
```typescript
// Configure Next.js to optimize Supabase images
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

// Component usage
<Image
  src={profile.avatar_url}
  alt="User avatar"
  width={200}
  height={200}
  className="rounded-full"
  priority={false}
  loading="lazy"
/>
```

**Benefits:**
- Automatic WebP/AVIF conversion
- Responsive images with srcset
- Built-in lazy loading
- Automatic caching

#### Option C: CDN with Image Processing (Cloudinary, ImageKit, etc.)
```typescript
// Upload to Supabase, then sync to CDN
const cdnUrl = `https://res.cloudinary.com/${cloudName}/image/upload/w_200,h_200,c_fill,f_auto,q_auto/${imageId}`
```

**Benefits:**
- Most powerful transformation options
- Global CDN
- Advanced features (face detection, auto-cropping)
- Better performance at scale

**Drawbacks:**
- Additional service/cost
- Extra complexity

### 2. Image Processing on Upload

Add server-side image processing before storage:

```typescript
import sharp from 'sharp'

async uploadAvatar(userId: string, file: File): Promise<string> {
  // Convert File to Buffer
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Process image with sharp
  const optimizedBuffer = await sharp(buffer)
    .resize(400, 400, { fit: 'cover' })
    .webp({ quality: 80 })
    .toBuffer()

  // Upload optimized image
  const { error } = await this.client.storage
    .from(PROFILE_BUCKET)
    .upload(filePath, optimizedBuffer, {
      contentType: 'image/webp',
      cacheControl: '31536000', // 1 year
    })

  // ... rest of upload logic
}
```

**Benefits:**
- Consistent image sizes
- Reduced storage costs
- Faster page loads
- No client-side processing needed

### 3. Recommended Implementation Plan

#### Phase 1: Basic Optimization (Immediate)
1. Add Supabase image transformation parameters
2. Set appropriate cache headers
3. Generate thumbnail sizes on upload

```typescript
// Generate multiple sizes
const sizes = [
  { name: 'thumbnail', width: 50, height: 50 },
  { name: 'small', width: 100, height: 100 },
  { name: 'medium', width: 200, height: 200 },
  { name: 'large', width: 400, height: 400 },
]

for (const size of sizes) {
  const resized = await sharp(buffer)
    .resize(size.width, size.height, { fit: 'cover' })
    .webp({ quality: 80 })
    .toBuffer()

  await this.client.storage
    .from(PROFILE_BUCKET)
    .upload(`${userId}/${size.name}_${fileName}`, resized)
}
```

#### Phase 2: CDN Integration (Future)
1. Set up Cloudinary or ImageKit account
2. Configure webhook to sync Supabase uploads to CDN
3. Update URLs to use CDN
4. Add advanced transformations

#### Phase 3: Advanced Features (Optional)
1. Smart cropping with face detection
2. Automatic format selection (WebP, AVIF, JPEG fallback)
3. Progressive loading with blur-up
4. Art direction with different crops for mobile/desktop

### 4. Performance Targets

- **File Size**: < 50KB for profile avatars
- **Format**: WebP primary, JPEG fallback
- **Dimensions**: 200x200px standard, 400x400px for high-DPI
- **Loading**: Lazy load below-fold avatars
- **Caching**: 1 year cache with versioned URLs

### 5. Security Considerations

- Validate image dimensions before processing
- Scan for malware (if processing user uploads)
- Strip EXIF data to protect user privacy
- Rate limit uploads per user

### 6. Cost Analysis

**Supabase Storage + Transformation:**
- Storage: $0.021 per GB/month
- Transformation: Included in Pro plan
- Bandwidth: $0.09 per GB

**Cloudinary Free Tier:**
- 25 GB storage
- 25 GB bandwidth
- 25,000 transformations/month

**Recommendation:** Start with Supabase transformation, migrate to CDN if:
- Traffic exceeds 10,000 users/month
- Need advanced features
- Performance becomes critical

### 7. Migration Path

For existing avatars:

```typescript
// Background job to optimize existing avatars
async function migrateExistingAvatars() {
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, avatar_url')
    .not('avatar_url', 'is', null)

  for (const profile of profiles) {
    try {
      // Download existing image
      const response = await fetch(profile.avatar_url)
      const buffer = await response.arrayBuffer()

      // Optimize and re-upload
      const optimized = await sharp(Buffer.from(buffer))
        .resize(400, 400, { fit: 'cover' })
        .webp({ quality: 80 })
        .toBuffer()

      const newPath = `${profile.id}/optimized_${Date.now()}.webp`
      await supabase.storage
        .from('avatars')
        .upload(newPath, optimized)

      // Update profile with new URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(newPath)

      await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id)

      // Delete old image if different
      // ... cleanup logic
    } catch (error) {
      logger.error({ profileId: profile.id, error }, 'Failed to migrate avatar')
    }
  }
}
```

## Implementation Status

- [x] Server-side file validation added
- [ ] Image transformation on upload
- [ ] Multiple size generation
- [ ] CDN integration
- [ ] Existing avatar migration

## References

- [Supabase Storage Transform](https://supabase.com/docs/guides/storage/serving/image-transformations)
- [Next.js Image Optimization](https://nextjs.org/docs/pages/building-your-application/optimizing/images)
- [Sharp Image Processing](https://sharp.pixelplumbing.com/)
