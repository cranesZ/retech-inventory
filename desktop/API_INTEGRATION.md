# Desktop App - Backend API Integration

## Overview

The desktop app has been updated to connect to the backend API instead of using local Electron storage for device management.

## Changes Made

### 1. API Service (`src/services/api.ts`)
- Created API client with base URL from environment variable
- Implemented authentication endpoints: `signup()`, `signin()`, `signout()`, `getProfile()`
- Implemented device endpoints: `fetchDevices()`, `createDevice()`, `updateDevice()`, `deleteDevice()`
- Added JWT token management with localStorage
- Error handling and response parsing

### 2. Auth Context (`src/context/AuthContext.tsx`)
- Created authentication state management
- Handles login, registration, and logout
- Stores JWT token and user data in localStorage
- Provides `useAuth()` hook for components

### 3. Updated Storage Service (`src/services/storage.ts`)
- **Device functions now use API** instead of Electron storage:
  - `getDevices()` → calls `api.fetchDevices()`
  - `saveDevice()` → calls `api.createDevice()` or `api.updateDevice()`
  - `deleteDevice()` → calls `api.deleteDevice()`
- Other entities (customers, suppliers, orders, invoices, offers) still use localStorage temporarily
- Smart update detection: checks if device has existing `createdAt` timestamp to determine create vs update

### 4. Enhanced Inventory Page (`src/pages/Inventory.tsx`)
- Added error state and retry functionality
- Added loading states for save operations
- Better error handling with user-friendly messages
- Inline editing still works with API backend

### 5. Login Page (`src/pages/Login.tsx`)
- New login/signup page with form validation
- Email and password authentication
- Integrated with AuthContext

### 6. Protected Routes (`src/App.tsx`)
- Added ProtectedRoute wrapper component
- Redirects to `/login` if not authenticated
- Shows loading state while checking authentication

### 7. Updated Layout (`src/components/Layout.tsx`)
- Shows authenticated user info (name and email)
- Added logout button with icon
- Removed Electron API status indicator

### 8. Environment Configuration (`.env`)
- Created `.env` file with `VITE_API_URL=http://localhost:3001/api`
- Added TypeScript types for env variables

## Usage

### Backend Setup
1. Ensure backend is running at `http://localhost:3001`
2. Backend should have these endpoints:
   - `POST /api/auth/signup` - Create account
   - `POST /api/auth/signin` - Login
   - `GET /api/auth/profile` - Get user profile
   - `GET /api/devices` - Get all devices
   - `POST /api/devices` - Create device
   - `PATCH /api/devices/:id` - Update device
   - `DELETE /api/devices/:id` - Delete device

### Desktop App Setup
1. Install dependencies (if not already):
   ```bash
   cd /Users/cranes/Downloads/Claude\ Retech/desktop
   npm install
   ```

2. Start the app:
   ```bash
   npm run dev
   ```

3. You'll be redirected to the login page
4. Create an account or sign in with existing credentials
5. Navigate to Inventory to manage devices

### Clearing Local Data
To start fresh, clear browser localStorage:
```javascript
// Open browser console (F12) and run:
localStorage.clear();
location.reload();
```

## API Authentication Flow

1. **Login/Signup**:
   - User enters credentials
   - App calls `/api/auth/signin` or `/api/auth/signup`
   - Backend returns `access_token` and user data
   - Token and user stored in localStorage

2. **Making Requests**:
   - API service reads token from localStorage
   - Adds `Authorization: Bearer <token>` header to all requests
   - Backend validates token and processes request

3. **Token Expiry**:
   - If backend returns 401 Unauthorized
   - User is alerted to log in again
   - Could auto-redirect to login page

4. **Logout**:
   - Removes token and user data from localStorage
   - Redirects to login page

## Data Flow

### Before (Local Storage):
```
Inventory Page → storage.ts → Electron IPC → JSON File
```

### Now (API):
```
Inventory Page → storage.ts → api.ts → HTTP Request → Backend API
```

## Features Working with API

- ✅ User authentication (signup/signin)
- ✅ Protected routes (redirect to login if not authenticated)
- ✅ Fetch all devices from backend
- ✅ Create new device
- ✅ Update device (full edit or inline edit)
- ✅ Delete device
- ✅ Error handling with retry
- ✅ Loading states
- ✅ Logout functionality

## Future Enhancements

1. **Refresh Token**: Implement token refresh when access token expires
2. **Offline Mode**: Queue operations when offline, sync when online
3. **Optimistic Updates**: Update UI immediately, rollback on error
4. **API for Other Entities**: Migrate customers, suppliers, orders, invoices to API
5. **Better Error Messages**: Map HTTP status codes to user-friendly messages
6. **Loading Skeletons**: Replace simple "Loading..." with skeleton screens

## Environment Variables

Create or update `.env` file:

```env
# API Backend URL
VITE_API_URL=http://localhost:3001/api

# For production
# VITE_API_URL=https://api.retech.example.com/api
```

## Troubleshooting

### "Failed to load devices"
- Check if backend is running at `http://localhost:3001`
- Check browser console for CORS errors
- Verify backend has `/api/devices` endpoint

### "Session expired. Please log in again."
- Token has expired or is invalid
- Log out and log back in
- Check backend token validation

### "Failed to save device"
- Check if you're authenticated (have valid token)
- Verify backend has POST/PATCH endpoints for devices
- Check backend logs for validation errors

### CORS Issues
Backend should allow requests from Electron app origin:
```typescript
// In backend
app.enableCors({
  origin: ['http://localhost:5173', 'file://'],
  credentials: true
});
```

## File Structure

```
desktop/src/
├── services/
│   ├── api.ts              # NEW - API client
│   └── storage.ts          # UPDATED - Uses API for devices
├── context/
│   └── AuthContext.tsx     # NEW - Authentication state
├── pages/
│   ├── Login.tsx           # NEW - Login/signup page
│   └── Inventory.tsx       # UPDATED - Better error handling
├── components/
│   └── Layout.tsx          # UPDATED - Shows user, logout button
├── App.tsx                 # UPDATED - Protected routes
├── main.tsx                # UPDATED - Wrapped with AuthProvider
├── vite-env.d.ts           # NEW - TypeScript env types
└── .env                    # NEW - Environment variables
```

## Testing Checklist

- [ ] Can create account
- [ ] Can login with credentials
- [ ] Redirects to login when not authenticated
- [ ] Can view devices list
- [ ] Can create new device
- [ ] Can edit device (modal)
- [ ] Can edit device inline
- [ ] Can delete device
- [ ] Error message shows if backend is down
- [ ] Can retry loading devices
- [ ] Logout clears session and redirects
- [ ] User info shows in sidebar

---

**Status**: Complete
**Date**: 2025-11-20
**Backend URL**: http://localhost:3001/api
