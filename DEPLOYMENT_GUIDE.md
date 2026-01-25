# Deployment Guide for Penny Count

Your app is currently only accessible on your local machine. To make it accessible at **pennycount.in** from anywhere, you need to deploy it to a hosting service.

## Quick Deployment Options

### Option 1: Netlify (Recommended - Easiest)

1. **Sign up/Login to Netlify**
   - Go to https://www.netlify.com/
   - Sign up or login with GitHub/GitLab/Bitbucket

2. **Deploy Your Site**

   **Method A: Drag & Drop (Fastest)**
   - Build your app: `npm run build`
   - Go to https://app.netlify.com/drop
   - Drag the `dist` folder onto the page
   - Your site is live instantly!

   **Method B: Connect GitHub (Best for Updates)**
   - Push your code to GitHub
   - In Netlify: "New site from Git"
   - Connect your repository
   - Build settings are auto-detected from `netlify.toml`
   - Deploy!

3. **Configure Custom Domain**
   - In Netlify Dashboard: Domain Settings
   - Add custom domain: `pennycount.in`
   - Update your domain's DNS:
     - Add CNAME record: `www` → `[your-site].netlify.app`
     - Add A record: `@` → `75.2.60.5`
   - Enable HTTPS (automatic)

4. **Add Environment Variables**
   - In Netlify: Site Settings → Environment Variables
   - Add:
     - `VITE_SUPABASE_URL` = `https://tazrnqlxxwdbtfyeosqm.supabase.co`
     - `VITE_SUPABASE_ANON_KEY` = `[your-anon-key]`

---

### Option 2: Vercel (Also Great)

1. **Sign up/Login to Vercel**
   - Go to https://vercel.com/
   - Sign up or login with GitHub

2. **Deploy Your Site**
   - Push code to GitHub
   - In Vercel: "Import Project"
   - Connect your repository
   - Click "Deploy" (settings auto-detected from `vercel.json`)

3. **Configure Custom Domain**
   - In Vercel Dashboard: Settings → Domains
   - Add `pennycount.in`
   - Update DNS as instructed by Vercel
   - HTTPS enabled automatically

4. **Add Environment Variables**
   - In Vercel: Settings → Environment Variables
   - Add the same Supabase variables

---

### Option 3: Cloudflare Pages

1. **Sign up/Login to Cloudflare**
   - Go to https://pages.cloudflare.com/

2. **Deploy**
   - Connect Git repository
   - Build command: `npm run build`
   - Output directory: `dist`
   - Deploy

3. **Configure Domain**
   - Cloudflare handles DNS automatically if domain is with Cloudflare
   - Or follow their custom domain instructions

---

## Supabase Configuration

Your Supabase is already configured for public access. However, you should:

1. **Set Redirect URLs in Supabase Dashboard**
   - Go to: https://supabase.com/dashboard/project/tazrnqlxxwdbtfyeosqm
   - Navigate to: Authentication → URL Configuration
   - Add your production URLs:
     - Site URL: `https://pennycount.in`
     - Redirect URLs:
       - `https://pennycount.in/**`
       - `https://pennycount.in/reset-password`
       - `https://www.pennycount.in/**`

2. **Email Templates** (for password reset)
   - In Supabase: Authentication → Email Templates
   - Update "Reset Password" template to use your domain
   - Change `{{ .ConfirmationURL }}` links to point to your domain

---

## DNS Configuration (For Your Domain Registrar)

Once you choose a hosting provider, update your DNS at your domain registrar (where you bought pennycount.in):

### For Netlify:
```
Type    Name    Value
A       @       75.2.60.5
CNAME   www     [your-site].netlify.app
```

### For Vercel:
```
Type    Name    Value
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
```

### For Cloudflare Pages:
Follow Cloudflare's nameserver instructions

---

## Testing After Deployment

1. Visit `https://pennycount.in` from any device
2. Test signup with a new account
3. Test login
4. Test forgot password (email should arrive)
5. Test password reset link
6. Test from mobile device

---

## Automatic Deployments

Once connected to Git:
- Every push to `main` branch = automatic deployment
- Preview deployments for pull requests
- Rollback to previous versions anytime

---

## Troubleshooting

### "Cannot connect to database"
- Check environment variables are set in hosting platform
- Verify Supabase URL is correct

### "Password reset link doesn't work"
- Update Supabase redirect URLs to your production domain

### "Site not loading"
- Clear browser cache
- Wait 5-10 minutes for DNS propagation
- Check deployment logs in hosting platform

### "403 Forbidden" or CORS errors
- Verify Supabase allows your domain
- Check browser console for specific errors

---

## Recommended: Netlify (Quickest Setup)

For the fastest deployment:
1. Run `npm run build`
2. Go to https://app.netlify.com/drop
3. Drag `dist` folder
4. Copy the URL Netlify gives you
5. Test it works
6. Add custom domain `pennycount.in`
7. Update DNS records
8. Done!

Your site will be live at pennycount.in in ~5 minutes!

---

## Current Status

✅ Application built and ready to deploy
✅ Supabase database configured
✅ Authentication working
✅ Deployment configs created (netlify.toml, vercel.json)
⏳ Needs deployment to hosting service
⏳ Needs DNS configuration
