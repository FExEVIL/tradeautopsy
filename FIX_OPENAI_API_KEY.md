# Fix: OpenAI API Key Invalid Header Error

## Problem
Error: `Headers.append: "Bearer sk-proj-... w8B jnGOnuR..." is an invalid header value`

The API key contains a **space or newline** character, which makes it invalid for HTTP headers.

## Solution

### Option 1: Fix in Vercel Dashboard (Recommended)

1. Go to **Vercel Dashboard** → **Project Settings** → **Environment Variables**
2. Find `OPENAI_API_KEY`
3. **Edit** the value
4. **Remove any spaces or newlines** from the key
5. The key should be one continuous string like:
   ```
   sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
6. **Save** and **Redeploy**

### Option 2: Fix in Local `.env.local`

1. Open `.env.local`
2. Find `OPENAI_API_KEY`
3. Remove any spaces/newlines
4. Should be on a single line:
   ```bash
   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
5. Restart dev server

### Option 3: Get New API Key

If the key is corrupted, get a new one:

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create new API key
3. Copy it **carefully** (no spaces)
4. Update in Vercel/local env

## Verification

After fixing, test audio transcription:
1. Go to `/dashboard/journal`
2. Click "Record Audio"
3. Record a short note
4. Should transcribe successfully

## Code Fix Applied

The code now:
- ✅ Trims whitespace from API key
- ✅ Validates key format (no spaces/newlines)
- ✅ Shows clear error if key is invalid

This prevents the error from happening again!
