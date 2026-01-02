# ⚡ Quick Setup Checklist

Follow these steps to complete the setup for all new features.

---

## 1️⃣ **Email Configuration** (5 minutes)

### Get Resend API Key:
1. Go to [resend.com](https://resend.com) and sign up
2. Navigate to API Keys section
3. Create a new API key
4. Copy the key

### Add to Environment:
Add to `.env.local`:
```env
EMAIL_SERVICE_PROVIDER=resend
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=TradeAutopsy <noreply@yourdomain.com>
CRON_SECRET=your_random_secret_here
NEXT_PUBLIC_APP_URL=https://tradeautopsy.com
```

### Verify Domain (Required):
1. In Resend dashboard, go to Domains
2. Add your domain (e.g., `tradeautopsy.com`)
3. Add DNS records as instructed
4. Wait for verification (usually instant)

### Test:
1. Go to `/dashboard/settings/notifications/test-email`
2. Select "Welcome Email" template
3. Click "Send Test Email"
4. Check your inbox!

---

## 2️⃣ **Cron Job Setup** (2 minutes)

### Vercel (Automatic):
The cron is already configured in `vercel.json`. Just add:

**To `.env.local`:**
```env
CRON_SECRET=generate_random_string_here
```

**To Vercel Dashboard:**
1. Go to Project → Settings → Environment Variables
2. Add `CRON_SECRET` = `your_random_string`
3. Deploy

The cron will run every Sunday at 6 PM IST automatically.

### Manual Test:
```bash
curl -X GET "http://localhost:3000/api/cron/weekly-report" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## 3️⃣ **Extension Icons** (5 minutes)

### Quick Method (Online):
1. Go to [favicon.io](https://favicon.io/favicon-generator/)
2. Upload TradeAutopsy logo or create simple icon
3. Download favicon package
4. Extract files to `extension/assets/`
5. Rename:
   - `favicon-16x16.png` → `icon-16.png`
   - `favicon-32x32.png` → `icon-48.png` (resize to 48x48)
   - `android-chrome-192x192.png` → `icon-128.png` (resize to 128x128)

### Temporary Placeholder:
Create simple colored squares (16x16, 48x48, 128x128) with emerald green (#10b981) background.

---

## 4️⃣ **Test Email Delivery** (2 minutes)

### Via UI:
1. Navigate to `/dashboard/settings/notifications/test-email`
2. Select any template
3. Enter your email (or leave empty)
4. Click "Send Test Email"
5. Check inbox

### Via API:
```bash
curl -X POST "http://localhost:3000/api/email/test" \
  -H "Content-Type: application/json" \
  -d '{"template": "welcome"}'
```

**Expected:** Email arrives in inbox with proper formatting.

---

## 5️⃣ **Test Browser Extension** (10 minutes)

### Load Extension:
1. Open Chrome → `chrome://extensions/`
2. Enable **Developer mode** (top-right)
3. Click **"Load unpacked"**
4. Select the `extension` folder
5. Extension appears in list

### Update API URL:
Edit `extension/popup/app.js` and `extension/background/service-worker.js`:
- Change `API_BASE_URL` to your domain or `http://localhost:3000`

### Test:
1. Click extension icon
2. Should show login screen
3. Click "Login" → redirects to TradeAutopsy
4. After login, extension should load stats

**Note:** Authentication flow needs to pass token back to extension (to be implemented).

### Verify:
- ✅ Popup opens
- ✅ Stats display
- ✅ Rules show status
- ✅ Goals show progress
- ✅ Badge updates

---

## ✅ **Verification**

### Email:
- [ ] Test email sent successfully
- [ ] Email templates render correctly
- [ ] Email preferences save correctly

### Cron:
- [ ] Cron endpoint accessible
- [ ] Authorization header works
- [ ] Weekly reports would send (test with manual trigger)

### Extension:
- [ ] Extension loads in Chrome
- [ ] Popup displays correctly
- [ ] API endpoints respond
- [ ] Badge updates

---

## 🆘 **Troubleshooting**

### Email Not Sending:
- Check `EMAIL_SERVICE_PROVIDER` is set
- Verify API key is correct
- Check domain is verified in Resend
- Look at server logs for errors

### Cron Not Working:
- Verify `CRON_SECRET` is set in Vercel
- Check cron schedule in `vercel.json`
- Test endpoint manually with curl

### Extension Not Loading:
- Check `manifest.json` is valid JSON
- Verify all files exist
- Check browser console for errors
- Ensure icons exist (even placeholders)

---

**All set! 🎉**

For detailed instructions, see `SETUP_GUIDE.md`.

