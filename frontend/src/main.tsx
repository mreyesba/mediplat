import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './components/site/App.tsx'
import { BrowserRouter } from 'react-router-dom'
import AuthProvider from './components/authentication/AuthContext.tsx'
import posthog from 'posthog-js';
import { PostHogProvider } from '@posthog/react'
import { POSTHOG_HOST, POSTHOG_PROJECT_TOKEN } from './apiConfig.ts'

posthog.init(POSTHOG_PROJECT_TOKEN, {
  api_host: POSTHOG_HOST,
  defaults: '2026-08-30',
  mask_all_text: true,
  mask_all_element_attributes: true,
  session_recording: { maskAllInputs: true, maskTextSelector: '*' },
});

posthog.register({ environment: import.meta.env.MODE });

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <PostHogProvider client={posthog}>
            <BrowserRouter>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </BrowserRouter>
        </PostHogProvider>
    </StrictMode>,
)
