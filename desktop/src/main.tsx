import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext'

// Debug: Check if Electron API is available
console.log('=== React App Starting ===');
console.log('[React] API URL:', import.meta.env.VITE_API_URL || 'http://localhost:3001/api');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
