# QR Scanner Debugging Guide

## 🔧 Setup Complete
- ✅ Database operations confirmed working (via debug-scanner.cjs)
- ✅ Console logging added to AdminScanner component
- ✅ Browser debugging helpers created
- ✅ Store exposed to window for debugging

## 🧪 Testing Steps

### 1. Basic Functionality Test
1. Open your ngrok URL: `https://911b9cac2b50.ngrok-free.app`
2. Navigate to Admin Login: `/admin/login`
3. Log in with admin credentials
4. Go to Scanner: `/admin/scanner`

### 2. Browser Console Debugging
Open browser console (F12) and run:

```javascript
// Check admin state
debugAdminState()

// Test manual QR scanning
testQRScan("HACK-1761989827237-2-x0u2ue7l8")
```

### 3. Live QR Scanning Test
1. Generate a QR code containing: `HACK-1761989827237-2-x0u2ue7l8`
2. Scan it with the camera scanner
3. Watch browser console for detailed logs:
   - `🔍 QR Scanned: [code]`
   - `👤 Participant found: [data]` 
   - `📊 Current meal status: [status]`
   - `💾 Update result: [true/false]`

### 4. Database Verification
After scanning, check Supabase dashboard:
1. Go to Supabase project → Table Editor → participants
2. Find "Sakshi S Kulal" 
3. Check if breakfast/lunch/dinner column updated to `true`

## 🔍 Common Issues & Solutions

### Issue: "Participant not found"
- **Check:** QR code format matches database
- **Log:** Look for `❌ Participant not found for QR: [code]`
- **Solution:** Verify QR code exists in database

### Issue: "Already completed" message
- **Check:** Meal status already true in database
- **Log:** Look for `⚠️ Meal status not updated - likely already marked`
- **Solution:** Reset meal status in database or test different meal type

### Issue: No console logs appear
- **Check:** Admin authentication failed
- **Log:** Run `debugAdminState()` to verify admin login
- **Solution:** Re-login as admin

### Issue: Database not updating
- **Check:** Network requests in browser dev tools
- **Log:** Look for Supabase errors in console
- **Solution:** Check .env variables and Supabase connection

## 📱 Mobile Testing
1. Open ngrok URL on mobile device
2. Test admin login → scanner flow
3. Use built-in QR scanner or generate QR codes online
4. Monitor console via remote debugging tools

## 🎯 Sample Test Data
```
Participant: Sakshi S Kulal
Team: Tech Explorers  
QR Code: HACK-1761989827237-2-x0u2ue7l8
```

## ✅ Success Indicators
- Console shows: `✅ Meal status updated successfully`
- Toast message: "Breakfast marked for [Name]"
- Database shows meal column = `true`
- Green success card appears in scanner UI

## 🚨 Failure Indicators  
- Console shows: `❌ Participant not found`
- Toast message: "Participant not found"
- Red error card appears in scanner UI
- Database remains unchanged

Run through these steps and share the console output to identify the exact issue!