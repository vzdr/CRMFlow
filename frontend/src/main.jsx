import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#2a2a2a',
              color: '#fff',
              border: '1px solid #444'
            },
            success: {
              iconTheme: {
                primary: '#00ff00',
                secondary: '#1a1a1a'
              }
            },
            error: {
              iconTheme: {
                primary: '#ff3b30',
                secondary: '#1a1a1a'
              }
            }
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
