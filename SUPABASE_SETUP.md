# Supabase Integration Setup Guide

## Overview
This project has been configured to use Supabase as the database backend instead of localStorage. Follow these steps to complete the setup.

## Step 1: Get Supabase Credentials

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/ihxuuualanshcprgiwpy
2. Navigate to **Settings** → **API**
3. Copy the **anon/public** key
4. Update the `.env` file:
   ```
   VITE_SUPABASE_ANON_KEY=your_copied_anon_key_here
   ```

## Step 2: Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy and paste the contents of `src/lib/schema.sql`
3. Run the SQL script to create the tables and policies

## Step 3: Verify Setup

1. Start the development server:
   ```bash
   npm run dev
   ```
2. Check the browser console for "Database initialized successfully"
3. Test the admin login with credentials: `admin` / `admin123`

## What Changed

### Database Tables
- **participants**: Stores participant data with QR codes and meal tracking
- **admins**: Stores admin credentials

### Key Features
- Real-time data synchronization across all users
- Persistent data storage in PostgreSQL
- Secure authentication and authorization
- Scalable for multiple concurrent users

### API Changes
- All store methods are now async (return Promises)
- Data persistence handled by Supabase instead of localStorage
- Automatic data loading on app initialization

## Testing the Integration

1. **Admin Flow:**
   - Login as admin
   - Upload Excel file with participant data
   - Verify participants appear in database

2. **Participant Flow:**
   - Login with name and team name
   - Verify QR code generation

3. **Scanner Flow:**
   - Scan participant QR codes
   - Verify meal status updates in real-time

## Troubleshooting

### Connection Issues
- Verify the anon key is correct
- Check network connectivity
- Ensure Supabase project is active

### Permission Issues
- Verify RLS policies are set up correctly
- Check if tables were created successfully

### Development Mode
If Supabase is not available, the app will log warnings but continue to work with limited functionality.

## Production Deployment

When deploying to production:
1. Set environment variables in your hosting platform
2. Ensure CORS is configured in Supabase for your domain
3. Consider upgrading to a paid Supabase plan for production workloads