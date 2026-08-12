/// <reference types="@vitest/browser/matchers" />
import { describe, expect, test, beforeAll, afterEach, afterAll } from 'vitest'
import { render } from 'vitest-browser-react'
import { setupServer } from 'msw/node' // If running purely node, use 'msw/browser' for browser-only setups
import { setupWorker } from 'msw/browser' 
import { http, HttpResponse } from 'msw'
import React from 'react'
import { page } from 'vitest/browser' 

// 1. Import your actual app components and context providers
import App from '../src/App.tsx'
import AuthProvider from '../src/AuthContext.tsx'

// 2. Define your Mock Network Interceptions to mimic your FastAPI backend
const mockHandlers = [
  // Intercept the Username Validation API Route
  http.post('/api/validate_user', async ({ request }) => {
    const body = await request.json() as { username: string }
    if (body.username.toLowerCase() === 'taken_username') {
      return HttpResponse.json({ detail: "Username not available." }, { status: 400 })
    }
    return HttpResponse.json({ status: "valid", username: "Username is available" })
  }),

  // Intercept the Login API Route
  http.post('/api/login', async ({ request }) => {
    const body = await request.json() as { username: string; password: string }
    if (body.username === 'valid_user' && body.password === 'password123') {
      return HttpResponse.json({ status: "authenticated", username: body.username })
    }
    return HttpResponse.json({ detail: "Invalid credentials." }, { status: 400 })
  })
]

const worker = setupWorker(...mockHandlers)

// 🚀 4. Update the lifecycles to use browser worker commands
beforeAll(async () => {
  await worker.start({ onUnhandledRequest: 'error' })
})

// Initialize the mock worker framework layer
// Note: If using pure Vitest Browser Mode, configure 'setupWorker' from 'msw/browser' instead
const server = setupServer(...mockHandlers)
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// --- Test Cases ---

describe('Frontend Authentication View Flows', () => {
  
    test('displays an error message when submitting invalid login credentials', async () => {
      // Render mounts into the browser frame asynchronously
      await render(
        <AuthProvider>
          <App />
        </AuthProvider>
      )
  
      // 2. Use `page` to select inputs and button elements
      const usernameInput = page.getByLabelText(/username/i)
      const passwordInput = page.getByLabelText(/password/i)
      const submitButton = page.getByRole('button', { name: /login/i })
  
      // Simulate typing and clicking natively in the headless engine
      await usernameInput.fill('wrong_user')
      await passwordInput.fill('wrong_password')
      await submitButton.click()
  
      // Assert: Verify visibility using Vitest's auto-retrying locator engine
      const errorMessage = page.getByText(/invalid credentials/i)
      await expect.element(errorMessage).toBeInTheDocument()
    })
  
    test('successfully authenticates and redirects user on correct credentials', async () => {
      await render(
        <AuthProvider>
          <App />
        </AuthProvider>
      )
  
      // Query globally via page locator tokens
      const usernameInput = page.getByLabelText(/username/i)
      const passwordInput = page.getByLabelText(/password/i)
      const submitButton = page.getByRole('button', { name: /login/i })
  
      await usernameInput.fill('valid_user')
      await passwordInput.fill('password123')
      await submitButton.click()
  
      const welcomeDashboardMessage = page.getByText(/welcome back, valid_user/i)
      await expect.element(welcomeDashboardMessage).toBeInTheDocument()
    })
  })
