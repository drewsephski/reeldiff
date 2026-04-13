import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { ClerkProvider } from '@clerk/clerk-react'
import { ThemeProvider } from './components/ThemeProvider.tsx'
import './index.css'
import App from './App.tsx'
import Success from './pages/Success.tsx'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/success" element={<Success />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </ClerkProvider>
    <Analytics />
  </StrictMode>,
)
