import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import { ClerkProvider } from '@clerk/clerk-react'
import { ThemeProvider } from './components/ThemeProvider.tsx'
import './index.css'
import App from './App.tsx'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </ClerkProvider>
    <Analytics />
  </StrictMode>,
)
