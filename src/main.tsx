import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { ClerkProvider } from '@clerk/clerk-react'
import { ThemeProvider } from './components/ThemeProvider.tsx'
import './index.css'
import App from './App.tsx'
import Success from './pages/Success.tsx'
import Projects from './pages/Projects.tsx'
import ProjectSettings from './pages/ProjectSettings.tsx'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/success" element={<Success />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<Projects />} />
            <Route path="/projects/:id/settings" element={<ProjectSettings />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </ClerkProvider>
    <Analytics />
  </StrictMode>,
)
