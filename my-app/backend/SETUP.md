# Backend Setup Guide

Follow these steps to set up the Supabase backend for your Daylight application.

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in:
   - Project name: `daylight` (or your preferred name)
   - Database Password: (save this securely)
   - Region: Choose closest to you
4. Wait for the project to be created (takes ~2 minutes)

## Step 2: Get Your API Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

## Step 3: Set Up Environment Variables

1. In your `my-app` directory, create a file named `.env.local`
2. Add the following content:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```
3. Replace the placeholder values with your actual credentials from Step 2

## Step 4: Run the Database Schema

1. In your Supabase project dashboard, go to **SQL Editor**
2. Click "New query"
3. Open the file `my-app/backend/sql/schema.sql` in your code editor
4. Copy the entire contents and paste into the SQL Editor
5. Click "Run" to execute the SQL
6. You should see "Success. No rows returned" - this is expected

## Step 5: Verify Tables Were Created

1. In your Supabase project dashboard, go to **Table Editor**
2. You should see the following tables:
   - `tasks`
   - `work_sessions`
   - `session_tasks`
   - `reflections`
   - `notes`
   - `monthly_goals`

## Step 6: Test the Connection (Optional)

You can test the connection by creating a simple test file:

```typescript
// test-supabase.ts
import { supabase } from "./backend/supabase/client";
import { getTasks } from "./backend/services/tasks";

async function test() {
  try {
    const tasks = await getTasks();
    console.log("✅ Supabase connection successful!", tasks);
  } catch (error) {
    console.error("❌ Supabase connection failed:", error);
  }
}

test();
```

## Next Steps

Now you can start using the backend services in your frontend components:

1. Import the services you need:

   ```typescript
   import { getTasks, createTask } from "@/backend/services/tasks";
   ```

2. Replace localStorage calls with Supabase service calls

3. Update your components to use async/await for database operations

## Troubleshooting

### "Invalid API key" error

- Make sure your `.env.local` file has the correct values
- Restart your Next.js dev server after creating/updating `.env.local`
- Verify the keys in Supabase dashboard → Settings → API

### "Table does not exist" error

- Make sure you ran the SQL schema (Step 4)
- Check the Table Editor to verify tables exist
- Try running the schema SQL again

### "Row Level Security policy violation"

- The schema includes RLS policies that allow all operations
- If you're getting this error, check that the policies in `schema.sql` were created correctly
- You can verify in Supabase dashboard → Authentication → Policies

### Connection issues

- Check your internet connection
- Verify your Supabase project is active (not paused)
- Check the Supabase status page for any outages

## Security Notes

- The `.env.local` file is already in `.gitignore` - never commit it
- The `anon` key is safe to use in client-side code (it has RLS protections)
- For production, consider adding authentication to restrict access by user

