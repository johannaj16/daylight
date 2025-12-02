# Authentication Setup Guide

This guide will help you set up Supabase authentication for your Daylight app.

## Supabase Portal Setup

### Step 1: Enable Email Authentication

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Providers** in the left sidebar
3. Under "Email" provider, ensure it's **Enabled**
4. (Optional) Configure email templates if you want custom confirmation emails

### Step 2: Configure Email Settings

1. In **Authentication** → **Settings**:
   - **Enable email confirmations**: You can toggle this based on your preference
     - If enabled: Users must click a confirmation link in their email before signing in
     - If disabled: Users can sign in immediately after signing up
   - **Site URL**: Set this to `http://localhost:3000` for local development
     - For production, update this to your actual domain (e.g., `https://yourdomain.com`)

### Step 3: (Optional) Configure Redirect URLs

1. In **Authentication** → **URL Configuration**:
   - Add your redirect URLs:
     - `http://localhost:3000/**` (for local development)
     - `http://localhost:3000/auth/**` (for auth pages)
     - Add your production URLs when deploying

### Step 4: Environment Variables

Make sure you have a `.env.local` file in the `my-app` directory with:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

You can find these values in:

- Supabase Dashboard → **Settings** → **API**

## How It Works

### Sign Up Flow

1. User enters email and password on the auth page
2. User clicks "Sign Up"
3. If email confirmation is enabled:
   - User receives an email with a confirmation link
   - After clicking the link, they can sign in
4. If email confirmation is disabled:
   - User is automatically signed in after signup

### Sign In Flow

1. User enters email and password
2. User clicks "Sign In"
3. On success, user is redirected to the home page

## Features Included

- ✅ Email/Password authentication
- ✅ Sign up and sign in forms
- ✅ Automatic session management
- ✅ Protected routes (home page redirects to `/auth` if not logged in)
- ✅ Sign out functionality
- ✅ Loading states
- ✅ Error handling

## Testing

1. Start your dev server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. You should be redirected to `/auth`
4. Click "Sign up" and create an account
5. After signing up (and confirming email if enabled), you should be redirected to the home page

## Next Steps

After authentication is working, you may want to:

1. Update RLS (Row Level Security) policies in your database to restrict data by `auth.uid()`
2. Update backend services to pass `userId` parameters
3. Add password reset functionality
4. Add social auth providers (Google, GitHub, etc.)

## Troubleshooting

### "Invalid login credentials"

- Make sure you've confirmed your email (if email confirmation is enabled)
- Check that you're using the correct email/password combination

### "Email already registered"

- The email is already in use - try signing in instead

### Not receiving confirmation emails

- Check your spam folder
- Verify email confirmation is enabled in Supabase
- Check Supabase logs for email sending errors

### Session not persisting

- Make sure your Supabase URL and anon key are correct in `.env.local`
- Restart your dev server after changing environment variables
