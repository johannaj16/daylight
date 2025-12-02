# Backend Services

This folder contains the backend services for the Daylight application using Supabase.

## Structure

```
backend/
├── supabase/
│   └── client.ts          # Supabase client configuration
├── db/
│   └── types.ts           # TypeScript types for database tables
├── services/
│   ├── tasks.ts           # Task CRUD operations (Sprint 1)
│   ├── sessions.ts        # Work session CRUD operations (Sprint 1)
│   ├── reflections.ts     # Reflection operations (Sprint 2)
│   ├── notes.ts           # Journal/notes operations (Sprint 2)
│   └── timeline.ts        # Timeline data operations (Sprint 2)
└── sql/
    └── schema.sql         # Database schema and migrations
```

## Setup

1. **Install dependencies** (already done):

   ```bash
   npm install @supabase/supabase-js
   ```

2. **Set up Supabase**:

   - Create a project at [supabase.com](https://supabase.com)
   - Get your project URL and anon key
   - Create a `.env.local` file in the `my-app` directory:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your-project-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     ```

3. **Run the database schema**:
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of `backend/sql/schema.sql`
   - Run the SQL to create all tables, indexes, and policies

## Usage

### Tasks Service

```typescript
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTask,
} from "@/backend/services/tasks";

// Get all tasks
const tasks = await getTasks();

// Create a task
const newTask = await createTask({
  text: "Complete project",
  completed: false,
});

// Update a task
await updateTask(taskId, { text: "Updated task", completed: true });

// Toggle completion
await toggleTask(taskId);

// Delete a task
await deleteTask(taskId);
```

### Work Sessions Service

```typescript
import {
  getWorkSessions,
  createWorkSession,
  getWorkSession,
} from "@/backend/services/sessions";

// Get all sessions
const sessions = await getWorkSessions();

// Create a session
const session = await createWorkSession({
  startedAtISO: new Date().toISOString(),
  durationSec: 3600,
  completedTaskIds: ["task-id-1", "task-id-2"],
  tasks: [
    /* task objects */
  ],
});

// Get a single session
const session = await getWorkSession(sessionId);
```

### Reflections Service

```typescript
import {
  upsertReflections,
  getReflectionsBySession,
} from "@/backend/services/reflections";

// Save reflections for a session
await upsertReflections(sessionId, {
  "task-id-1": "Completed successfully",
  "task-id-2": "Struggled with this task",
});

// Get reflections for a session
const reflections = await getReflectionsBySession(sessionId);
```

### Notes Service

```typescript
import { upsertNote, getNoteByDateKey } from "@/backend/services/notes";

// Save a journal entry
await upsertNote("journal:2025-10-06", "<p>Today was a great day...</p>");

// Get a journal entry
const note = await getNoteByDateKey("journal:2025-10-06");
```

### Timeline Service

```typescript
import { getTimelineData, getTimelineStats } from "@/backend/services/timeline";

// Get timeline data for last 30 days
const timeline = await getTimelineDataForDateRange(30);

// Get timeline statistics
const stats = await getTimelineStats();
```

## Database Schema

The database schema includes:

- **tasks**: Daily tasks/checklist items
- **work_sessions**: Timed work sessions
- **session_tasks**: Junction table linking tasks to sessions
- **reflections**: Task reflections after work sessions
- **notes**: Journal entries with rich text content
- **monthly_goals**: Monthly goals (Sprint 3 - future)

See `sql/schema.sql` for the complete schema with indexes, triggers, and RLS policies.

## Migration from LocalStorage

To migrate existing localStorage data to Supabase:

1. Export data from localStorage
2. Use the service functions to bulk insert into Supabase
3. Update frontend components to use the backend services instead of localStorage

## Row Level Security (RLS)

Currently, RLS policies allow all operations. When you add authentication:

1. Update the policies in `schema.sql` to check `auth.uid() = user_id`
2. Pass the user ID to all service functions
3. The service functions already support optional `userId` parameters

## Future Enhancements

- [ ] Add authentication and user management
- [ ] Implement monthly goals (Sprint 3)
- [ ] Add data export/import functionality
- [ ] Add database backups
- [ ] Implement real-time subscriptions for live updates

