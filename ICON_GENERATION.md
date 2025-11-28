# PWA Icon Generation Guide

The app requires icons in the following sizes for the PWA to work properly:

## Required Icon Sizes:
- 72x72
- 96x96
- 128x128
- 144x144
- 152x152
- 192x192
- 384x384
- 512x512

## How to Generate Icons:

### Option 1: Using an Online Tool
1. Visit https://realfavicongenerator.net/ or https://www.pwabuilder.com/imageGenerator
2. Upload your logo (preferably 512x512 PNG with transparent background)
3. Generate all sizes
4. Download and place in `/public` folder

### Option 2: Using ImageMagick (Command Line)
```bash
# Install ImageMagick first
# For a source logo.png at 512x512:

convert logo.png -resize 72x72 public/icon-72x72.png
convert logo.png -resize 96x96 public/icon-96x96.png
convert logo.png -resize 128x128 public/icon-128x128.png
convert logo.png -resize 144x144 public/icon-144x144.png
convert logo.png -resize 152x152 public/icon-152x152.png
convert logo.png -resize 192x192 public/icon-192x192.png
convert logo.png -resize 384x384 public/icon-384x384.png
convert logo.png -resize 512x512 public/icon-512x512.png
```

### Option 3: Manual Placeholder (Temporary)
For development, you can use a simple colored square:
- Background: Emerald Green (#10b981)
- Symbol: Rupee symbol (₹) in white
- Font: Bold, centered

## Recommended Icon Design:
- Simple, recognizable logo
- Works well at small sizes
- Good contrast
- No text (except maybe currency symbol)
- Rounded corners (handled by OS)
- Transparent or solid background

## File Naming Convention:
All icons should be named: `icon-{size}.png`
Example: `icon-192x192.png`

## After Generating:
1. Place all icons in `/public` folder
2. Icons are already referenced in:
   - `/public/manifest.json`
   - `/index.html` (apple-touch-icon)
3. No code changes needed after adding icons
