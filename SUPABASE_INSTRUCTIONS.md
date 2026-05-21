# Supabase Integration Guide - Quest Housing

We have successfully migrated the Quest Housing backend architecture from Google Sheets & Apps Script to **Supabase**.

## What was built:
1. **Real-time Admin Dashboard**: Accessible via `/admin`.
2. **Secure Routes**: Only `questhousingblr@gmail.com` can access the dashboard.
3. **Database Tables**: Tables for Owner Leads and Tenant Leads.
4. **Storage**: Supabase Storage bucket for storing owner images properly (instead of Google Drive base64).
5. **Real-time Updates**: Dashboard updates automatically when new leads come in.
6. **Exports**: Built-in CSV exports natively on the dashboard tables.

## Final Steps to Make it Live

Since we cannot automatically create tables in your external Supabase project, you must do this in your Supabase dashboard:

### 1. Set Up Your Environment Variables
Update the `.env` file with your Supabase credentials:
```env
VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
```

### 2. Run the SQL Schema
1. Go to your Supabase Project dashboard.
2. Navigate to the **SQL Editor** on the left menu.
3. Click "New Query".
4. Copy the entire contents of the `/supabase_schema.sql` file provided in this repository.
5. Paste it into the SQL editor and click **Run**.
*(This creates the `owner_leads` and `tenant_leads` tables, enables Row Level Security, and creates the file storage bucket).*

### 3. Create the Admin User
1. Go to **Authentication > Users** in Supabase.
2. Click **Add User** > **Create new user**.
3. Create the user with email: `questhousingblr@gmail.com` and a secure password of your choice.
4. Uncheck "Auto Confirm User" if you want to verify via email, otherwise you can manually confirm them in the UI.

### 4. You're Done!
- Go to your website's **`/admin/login`** route.
- Log in with `questhousingblr@gmail.com` and the password you set.
- You will be redirected to the luxurious, cinematic **Command Center**.
