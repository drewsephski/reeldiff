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
<<<<<<< HEAD
import Videos from './pages/Videos.tsx'
import GitHubCallback from './pages/GitHubCallback.tsx'
=======
>>>>>>> origin/feat/webhook-automation

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
<<<<<<< HEAD
            <Route path="/videos" element={<Videos />} />
            <Route path="/github-callback" element={<GitHubCallback />} />
=======
>>>>>>> origin/feat/webhook-automation
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </ClerkProvider>
    <Analytics />
  </StrictMode>,
)
