# Supabase Setup Guide

## Creating a Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign in or create an account
2. Click "New Project" and follow the setup wizard
3. Choose a name for your project and set a secure database password
4. Select the region closest to your users
5. Wait for your project to be created (this may take a few minutes)

## Getting Your Supabase Credentials

1. Once your project is created, go to the project dashboard
2. Click on the "Settings" icon (gear icon) in the sidebar
3. Select "API" from the settings menu
4. You'll find your credentials in the "Project API Keys" section:
   - **Project URL**: Copy the URL under "Project URL"
   - **anon/public key**: Copy the key under "anon public"
   - **service_role key**: Copy the key under "service_role" (keep this secure!)

## Setting Up Environment Variables in Tempo

1. In Tempo, click on the "Settings" icon in the top navigation
2. Select "Environment Variables"
3. Add the following environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key
SUPABASE_PROJECT_ID=your_project_id
```

4. Click "Save" to apply the changes
5. Restart your development server

## Running Database Migrations

After setting up your environment variables, you can run the database migrations to create the necessary tables:

```bash
npx supabase db push
```

Or manually execute the SQL files in the `supabase/migrations` directory against your Supabase database using the SQL editor in the Supabase dashboard.

## Verifying Your Setup

To verify that your Supabase connection is working correctly:

1. Navigate to your application
2. Try to sign up or log in
3. Check that you can access the translation dashboard after authentication

If you encounter any issues, check the browser console for error messages related to Supabase connections.
