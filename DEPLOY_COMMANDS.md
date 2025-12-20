# 🚀 Complete Deployment Commands

## One-Command Deployment

```bash
./deploy-now.sh
```

---

## Manual Step-by-Step Commands

Copy and paste these commands in order:

### 1. Stage All Changes
```bash
git add .
```

### 2. Commit Changes
```bash
git commit -m "Deploy to Vercel - $(date +'%Y-%m-%d %H:%M:%S')"
```

Or with custom message:
```bash
git commit -m "Your custom commit message"
```

### 3. Push to GitHub
```bash
git push origin main
```

Or if your branch is `master`:
```bash
git push origin master
```

### 4. Install Dependencies (if needed)
```bash
npm install
```

### 5. Build Locally (to catch errors)
```bash
npm run build
```

### 6. Install Vercel CLI (if not installed)
```bash
npm i -g vercel
```

### 7. Login to Vercel (if not logged in)
```bash
vercel login
```

### 8. Deploy to Production
```bash
vercel --prod
```

Or for preview deployment:
```bash
vercel
```

---

## Quick Copy-Paste (All at Once)

```bash
git add . && \
git commit -m "Deploy to Vercel - $(date +'%Y-%m-%d %H:%M:%S')" && \
git push origin main && \
npm install && \
npm run build && \
vercel --prod
```

---

## With Error Handling

```bash
# Stage changes
git add .

# Commit (skip if no changes)
git commit -m "Deploy to Vercel" || echo "No changes to commit"

# Push (skip if fails)
git push origin main || echo "Push failed, continuing..."

# Install dependencies
npm install

# Build
npm run build

# Deploy
vercel --prod
```

---

## Environment Setup (First Time Only)

Before first deployment, set up Vercel:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project (first time)
vercel link
```

---

## Post-Deployment

After deployment, don't forget:

1. **Set Environment Variables** in Vercel Dashboard
2. **Run Database Migrations** in Supabase
3. **Update WorkOS Redirect URI** in WorkOS Dashboard
4. **Update Supabase Redirect URLs** in Supabase Dashboard
5. **Test the Application**

---

## Troubleshooting

### Build Fails
```bash
# Check for TypeScript errors
npm run build

# Check for linting errors
npm run lint
```

### Vercel Deploy Fails
```bash
# Check Vercel status
vercel inspect

# View logs
vercel logs
```

### Git Push Fails
```bash
# Check remote
git remote -v

# Set upstream if needed
git push -u origin main
```

---

**For automated deployment, use**: `./deploy-now.sh`

