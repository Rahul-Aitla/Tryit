# Demo Media Files - Setup Guide

## 📂 Directory Structure

Your project now includes a `public/demo/` directory for demo videos and before/after images:

```
frontend/
├── public/
│   └── demo/
│       ├── videos/
│       │   └── demo.mp4          ← Add your demo video here
│       └── before-after/
│           ├── winter-jacket/
│           │   ├── before.jpg
│           │   └── after.jpg
│           ├── summer-dress/
│           │   ├── before.jpg
│           │   └── after.jpg
│           └── formal-wear/
│               ├── before.jpg
│               └── after.jpg
└── README.md                      ← Images are referenced here
```

## 📹 Adding Demo Video

### File: `public/demo/videos/demo.mp4`

**Specifications:**
- **Format**: MP4 with H.264 video codec
- **Resolution**: 1280x720 (720p) or 1920x1080 (1080p)
- **Duration**: 30-60 seconds recommended
- **File Size**: Keep under 10MB for fast loading
- **Aspect Ratio**: 16:9 widescreen

**What to Show:**
1. **Upload Phase** (10-15 seconds)
   - Drag-and-drop interface
   - File selection and upload process
   - Multiple files being uploaded

2. **Processing Phase** (10-15 seconds)
   - Dashboard with real-time job progress
   - Processing status indicators
   - Multiple jobs running simultaneously

3. **Results Phase** (10-15 seconds)
   - Gallery view with generated images
   - Before/after comparison
   - Download functionality

**How to Create:**
- Use screen recording software (OBS, Camtasia, ScreenFlow)
- Keep framerate at 30fps or 60fps
- Compress video: `ffmpeg -i input.mov -c:v libx264 -preset medium -crf 23 output.mp4`

## 🖼️ Adding Before/After Images

### Category Structure

For each fashion category, create a subfolder with `before.jpg` and `after.jpg`:

```
public/demo/before-after/
├── winter-jacket/
│   ├── before.jpg      # Original design uploaded
│   └── after.jpg       # AI-generated variation
├── summer-dress/
│   ├── before.jpg
│   └── after.jpg
└── formal-wear/
    ├── before.jpg
    └── after.jpg
```

### Image Specifications

- **Format**: JPG (recommended for photos) or PNG
- **Resolution**: 
  - Minimum: 400x500px
  - Recommended: 600x750px
  - Aspect Ratio: Portrait/Square (for fashion)
- **File Size**: 50-100KB per image (optimize with TinyPNG)
- **Naming**: Always use lowercase `before.jpg` and `after.jpg`

### Image Content Guidelines

**Before Image (Original):**
- Clear view of the uploaded garment
- Good lighting
- Plain or neutral background
- Focus on the design details

**After Image (AI Generated):**
- Same garment with AI enhancements
- Improved styling, colors, or details
- Maintained garment structure and proportions
- Professional presentation

### How to Add Images

1. **Create category folder:**
   ```bash
   mkdir -p public/demo/before-after/category-name
   ```

2. **Add images:**
   ```bash
   # Copy your images
   cp original.jpg public/demo/before-after/category-name/before.jpg
   cp generated.jpg public/demo/before-after/category-name/after.jpg
   ```

3. **Update README.md if adding new categories:**
   - Add a new row in the gallery table
   - Use the folder name for image paths
   - Follow the existing format

### Image Optimization

**Using ImageMagick:**
```bash
convert input.jpg -resize 600x750 -quality 85 output.jpg
```

**Using FFmpeg:**
```bash
ffmpeg -i input.jpg -vf "scale=600:750" output.jpg
```

**Online Tools:**
- [TinyPNG](https://tinypng.com) - Compress PNG/JPG
- [ImageOptim](https://imageoptim.com) - Mac image optimizer
- [Squoosh](https://squoosh.app) - Google's image compressor

## 📝 Updating README

The README automatically displays:
- Demo video from: `/demo/videos/demo.mp4`
- Images from: `/demo/before-after/{category}/{before|after}.jpg`

**To add a new category to the gallery:**

1. Create the folder and add images:
   ```bash
   mkdir -p public/demo/before-after/your-category
   # Add before.jpg and after.jpg
   ```

2. Add to README.md under "Before & After Gallery":
   ```markdown
   #### Example N: Your Category
   | Original Design | AI Generated Variations |
   |---|---|
   | ![Before: Your Category](/demo/before-after/your-category/before.jpg) | ![After: Your Category Variations](/demo/before-after/your-category/after.jpg) |
   | Description | Description |
   ```

## 🚀 Deploying with Media

When you push to GitHub and deploy to Vercel:
1. All files in `public/` are automatically served
2. Demo videos and images load at `/demo/videos/demo.mp4` etc.
3. No additional configuration needed

### Vercel Deployment
```bash
# Push to main branch
git add public/demo/
git commit -m "📹 Add demo video and before/after images"
git push origin main

# Vercel automatically deploys - images appear in ~2 minutes
# Access at: https://tryit-yourself.vercel.app
```

## 💡 Tips

- **Video Hosting**: Keep video under 5MB for Vercel's edge network
- **Image Compression**: Compress to reduce load time
- **Git LFS** (Optional): For very large video files, consider:
  ```bash
  git lfs install
  git lfs track "*.mp4"
  git add .gitattributes
  ```
- **CDN Optimization**: Vercel automatically optimizes Next.js Image components
- **Backup**: Keep original files locally before compressing

## ✅ Checklist

- [ ] Demo video created and saved to `public/demo/videos/demo.mp4`
- [ ] Video is under 10MB and in MP4 format
- [ ] Before/after image categories created
- [ ] All images optimized to 50-100KB each
- [ ] Images follow naming convention (before.jpg, after.jpg)
- [ ] README.md references all images correctly
- [ ] Changes committed and pushed to GitHub
- [ ] Vercel deployment verified and images display correctly
- [ ] README displays in GitHub without broken links

---

**Questions?** Check the main [README.md](../README.md) for more details!
