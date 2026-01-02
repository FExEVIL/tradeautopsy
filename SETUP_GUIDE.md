# 🚀 TradeAutopsy Setup Guide

Complete setup instructions for all features.

---

## 📧 **Email Configuration**

### Option 1: Resend (Recommended)

1. Sign up at [resend.com](https://resend.com)
2. Create an API key from the dashboard
3. Add to `.env.local`:

```env
EMAIL_SERVICE_PROVIDER=resend
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=TradeAutopsy <noreply@yourdomain.com>
```

**Note:** You need to verify your domain in Resend before sending emails.

### Option 2: SendGrid

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Create an API key
3. Add to `.env.local`:

```env
EMAIL_SERVICE_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
```

### Option 3: Disable (Development)

```env
EMAIL_SERVICE_PROVIDER=none
```

Emails will be logged to console but not sent.

### Test Email Templates

1. Go to `/dashboard/settings/notifications/test-email`
2. Select a template
3. Enter test email (or leave empty to use your account email)
4. Click "Send Test Email"
5. Check your inbox

---

## ⏰ **Cron Job Setup**

### Vercel Cron (Recommended)

The `vercel.json` file is already configured. Just add the cron secret:

1. Add to `.env.local`:
```env
CRON_SECRET=your_random_secret_string_here
```

2. Add to Vercel environment variables:
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add `CRON_SECRET` with a random string

3. The cron job will run every Sunday at 6 PM IST (18:00 UTC)

### Manual Testing

Test the cron endpoint manually:

```bash
curl -X GET "https://yourdomain.com/api/cron/weekly-report" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Alternative: External Cron Service

If not using Vercel, set up an external cron service:

1. Use [cron-job.org](https://cron-job.org) or [EasyCron](https://www.easycron.com)
2. Schedule: Every Sunday at 18:00 UTC
3. URL: `https://yourdomain.com/api/cron/weekly-report`
4. Headers: `Authorization: Bearer YOUR_CRON_SECRET`

---

## 🎨 **Extension Icons**

### Quick Setup

1. Create three PNG files:
   - `extension/assets/icon-16.png` (16x16 pixels)
   - `extension/assets/icon-48.png` (48x48 pixels)
   - `extension/assets/icon-128.png` (128x128 pixels)

### Using Online Tools

1. **Favicon.io**:
   - Go to [favicon.io](https://favicon.io)
   - Upload your logo or create one
   - Download favicon package
   - Extract and rename to `icon-16.png`, `icon-48.png`, `icon-128.png`

2. **RealFaviconGenerator**:
   - Go to [realfavicongenerator.net](https://realfavicongenerator.net)
   - Upload your logo
   - Generate favicons
   - Download and extract

### Using Design Tools

1. Create a 128x128px design in Figma/Illustrator
2. Export as PNG with transparency
3. Save as `icon-128.png`
4. Resize to 48x48px → `icon-48.png`
5. Resize to 16x16px → `icon-16.png`

### Temporary Placeholders

For testing, you can use simple colored squares:

```bash
# Using ImageMagick (if installed)
convert -size 16x16 xc:#10b981 extension/assets/icon-16.png
convert -size 48x48 xc:#10b981 extension/assets/icon-48.png
convert -size 128x128 xc:#10b981 extension/assets/icon-128.png
```

Or create simple PNG files with any image editor.

---

## 📧 **Test Email Delivery**

### Method 1: Test Page (Recommended)

1. Navigate to `/dashboard/settings/notifications/test-email`
2. Select a template (Welcome, Weekly Report, etc.)
3. Enter your email address (or leave empty)
4. Click "Send Test Email"
5. Check your inbox

### Method 2: API Direct

```bash
curl -X POST "http://localhost:3000/api/email/test" \
  -H "Content-Type: application/json" \
  -H "Cookie: your_session_cookie" \
  -d '{
    "template": "welcome",
    "email": "your@email.com"
  }'
```

### Troubleshooting

- **Email not sending**: Check `EMAIL_SERVICE_PROVIDER` is set correctly
- **API key error**: Verify `RESEND_API_KEY` or `SENDGRID_API_KEY` is correct
- **Domain not verified**: Verify your domain in Resend/SendGrid
- **Check logs**: Look at server logs for email service errors

---

## 🌐 **Browser Extension Testing**

### Step 1: Prepare Extension

1. Update API URL in extension files:
   - `extension/popup/app.js` - Line 2
   - `extension/background/service-worker.js` - Line 2
   
   Change to your domain:
   ```javascript
   const API_BASE_URL = 'https://tradeautopsy.com'
   ```

   Or for local testing:
   ```javascript
   const API_BASE_URL = 'http://localhost:3000'
   ```

2. Create extension icons (see Extension Icons section above)

### Step 2: Load Extension

1. Open Chrome → `chrome://extensions/`
2. Enable **Developer mode** (top-right toggle)
3. Click **"Load unpacked"**
4. Select the `extension` folder
5. Extension should appear in list

### Step 3: Authenticate

1. Click extension icon in toolbar
2. Click "Login" button
3. Login to TradeAutopsy
4. Extension will store auth token

**Note:** Authentication flow needs to be implemented to pass token back to extension.

### Step 4: Test Features

- ✅ Popup opens
- ✅ Stats display (P&L, trades, win rate)
- ✅ Rules status shows
- ✅ Goals progress displays
- ✅ Badge updates (green/yellow/red)
- ✅ Refresh button works
- ✅ "Open Dashboard" works
- ✅ Notifications appear for violations

### Troubleshooting

- **Popup blank**: Check browser console (right-click popup → Inspect)
- **API errors**: Verify API endpoints are accessible
- **Auth errors**: Check token is stored in extension storage
- **Icons missing**: Create placeholder PNG files

---

## 🔧 **Environment Variables Checklist**

Copy `.env.example` to `.env.local` and fill in:

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email (choose one)
EMAIL_SERVICE_PROVIDER=resend
RESEND_API_KEY=your_resend_key
EMAIL_FROM=TradeAutopsy <noreply@yourdomain.com>

# Cron
CRON_SECRET=random_secret_string

# App URL
NEXT_PUBLIC_APP_URL=https://tradeautopsy.com

# Optional
OPENAI_API_KEY=your_openai_key
WORKOS_API_KEY=your_workos_key
ZERODHA_API_KEY=your_zerodha_key
```

---

## ✅ **Verification Checklist**

### Email System
- [ ] Email provider configured (Resend/SendGrid)
- [ ] Test email sent successfully
- [ ] Email templates render correctly
- [ ] Email preferences page works
- [ ] Weekly report cron configured

### Browser Extension
- [ ] Extension loads in Chrome
- [ ] Icons display correctly
- [ ] Popup opens and displays data
- [ ] API endpoints respond correctly
- [ ] Authentication works
- [ ] Badge updates correctly
- [ ] Notifications work

### General
- [ ] All environment variables set
- [ ] Database migrations run
- [ ] API endpoints accessible
- [ ] No console errors

---

## 🆘 **Need Help?**

- Check server logs for errors
- Verify environment variables are set
- Test API endpoints directly
- Check browser console for extension errors
- Review database migrations

---

**All setup complete! 🎉**

