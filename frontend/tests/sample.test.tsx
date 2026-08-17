/// <reference types="@vitest/browser/matchers" />
import { describe, expect, test, beforeAll, afterEach, afterAll } from 'vitest'
import { render } from 'vitest-browser-react'
import { MemoryRouter } from 'react-router-dom'
import { setupWorker } from 'msw/browser' 
import { http, HttpResponse } from 'msw'
import React from 'react'
import { page } from 'vitest/browser' 

import App from '../src/App.tsx'
import AuthProvider from '../src/AuthContext.tsx'

// Helper function that mirrors your index.tsx provider hierarchy
// Specify the exact route where FormsPage renders (e.g., '/account')
const renderWithProviders = (ui: React.ReactElement, { route = '/account' } = {}) => {
    return render(
      <MemoryRouter initialEntries={[route]}>
        <AuthProvider>
          {ui}
        </AuthProvider>
      </MemoryRouter>
    )
  }

// 1. MSW Network Handlers
const mockHandlers = [
    http.get('/api/me', async ({ request }) => {
        return new HttpResponse(null, { status: 401 });
    }),

    http.post('/api/validate_user', async ({ request }) => {
        const body = (await request.json()) as { username: string }
        if (body.username.toLowerCase() === 'taken_username') {
        return HttpResponse.json({ detail: 'Username not available.' }, { status: 400 })
        }
        return HttpResponse.json({ status: 'valid', username: 'Username is available' })
    }),

    http.post('/api/login', async ({ request }) => {
        const body = (await request.json()) as { username: string; password: string }
        if (body.username === 'valid_user' && body.password === 'password123') {
        return HttpResponse.json({ status: 'authenticated', username: body.username })
        }
        return HttpResponse.json({ detail: 'Invalid credentials.' }, { status: 400 })
    }),
]

const worker = setupWorker(...mockHandlers)

beforeAll(async () => {
  await worker.start({ onUnhandledRequest: 'bypass', quiet: true })
})

afterEach(() => {
  worker.resetHandlers()
})

afterAll(() => {
  worker.stop()
})

// 2. Test Cases

describe('Frontend Authentication View Flows', () => {

  test('displays an error message when submitting invalid login credentials', async () => {
    await renderWithProviders(<App />)

    const usernameInput = page.getByLabelText(/username/i)
    const passwordInput = page.getByLabelText(/password/i)
    const submitButton = page.getByRole('button', { name: /log in/i })

    await usernameInput.fill('wrong_user')
    await passwordInput.fill('wrong_password')
    await submitButton.click()

    const errorMessage = page.getByText(/invalid credentials/i)
    await expect.element(errorMessage).toBeInTheDocument()
  })

  test('successfully authenticates and redirects user on correct credentials', async () => {
    await renderWithProviders(<App />)

    const usernameInput = page.getByLabelText(/username/i)
    const passwordInput = page.getByLabelText(/password/i)
    const submitButton = page.getByRole('button', { name: /log in/i })

    await usernameInput.fill('valid_user')
    await passwordInput.fill('password123')
    await submitButton.click()

    const homeHeading = page.getByText(/welcome to our clinic!/i)
    await expect.element(homeHeading).toBeInTheDocument()

    const logoutButton = page.getByRole('button', { name: /log out/i })
    await expect.element(logoutButton).toBeInTheDocument()
  })
})