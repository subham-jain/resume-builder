# 🔥 Hot Reload Configuration Guide

This project is optimized for fast hot reload using Next.js 15 with Turbopack.

## ✅ Current Configuration

### 1. Turbopack Enabled
- Development server uses `--turbopack` flag
- Faster compilation and hot reload compared to Webpack
- Better incremental builds

### 2. Optimized Package Imports
The following packages are optimized for faster hot reload:
- `@google/generative-ai`
- `react-hook-form`
- `@supabase/supabase-js`
- `@supabase/ssr`
- `jspdf`
- `mammoth`
- `pdf-parse`

### 3. File Watching Optimizations
- TypeScript watch mode configured
- File system events enabled
- Excluded unnecessary directories (node_modules, .next)

### 4. Page Buffer Configuration
- `maxInactiveAge`: 60 seconds (pages stay in memory longer)
- `pagesBufferLength`: 5 pages (more pages cached)

## 🚀 Usage

### Start Development Server
```bash
npm run dev
```

This will:
- Start Next.js dev server with Turbopack
- Enable hot module replacement (HMR)
- Watch for file changes
- Automatically refresh browser on changes

### Expected Hot Reload Behavior

1. **Component Changes**: Instant update without page refresh
2. **Style Changes**: CSS updates immediately
3. **API Route Changes**: Server restarts automatically
4. **Config Changes**: Requires manual restart

## 🔧 Troubleshooting

### Hot Reload Not Working?

1. **Clear Next.js Cache**:
   ```bash
   rm -rf .next
   npm run dev
   ```

2. **Check File Watchers**:
   - macOS: Check if too many files are being watched
   - Linux: May need to increase `fs.inotify.max_user_watches`
   ```bash
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

3. **Restart Dev Server**:
   - Stop the server (Ctrl+C)
   - Restart: `npm run dev`

4. **Check for Syntax Errors**:
   - Syntax errors can break hot reload
   - Check terminal for error messages

### Slow Hot Reload?

1. **Reduce File Watching**:
   - Exclude large directories in `.watchmanconfig`
   - Check `tsconfig.json` watch options

2. **Optimize Imports**:
   - Use dynamic imports for large libraries
   - Split code into smaller modules

3. **Check System Resources**:
   - Ensure sufficient RAM
   - Close unnecessary applications

## 📊 Performance Tips

1. **Use Client Components Wisely**:
   - Mark components with `'use client'` only when needed
   - Server components reload faster

2. **Optimize Imports**:
   - Use named imports instead of default imports
   - Import only what you need

3. **Split Large Files**:
   - Break down large components
   - Separate concerns into different files

## 🎯 Best Practices

1. **Save Files Properly**:
   - Ensure files are saved completely
   - Avoid rapid save/unsave cycles

2. **Watch Terminal Output**:
   - Monitor compilation messages
   - Check for warnings/errors

3. **Use Fast Refresh**:
   - Preserve component state when possible
   - Use React hooks properly

## 🔍 Monitoring Hot Reload

Watch the terminal for:
- `✓ Compiled in Xms` - Fast compilation
- `○ Compiling /path` - File being compiled
- `✓ Compiled /path` - File compiled successfully

If you see errors, hot reload may pause until fixed.

---

**Note**: Hot reload works best with:
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Stable internet connection (for HMR WebSocket)
- Sufficient system resources

