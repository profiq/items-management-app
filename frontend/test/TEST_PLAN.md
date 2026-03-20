# Frontend Test Plan

## Overview

This document outlines the testing strategy and test coverage for the Profiq Reference App frontend application. The frontend uses a multi-layered testing approach with unit tests, component tests, and end-to-end (E2E) tests.

## Testing Framework & Tools

- **Unit Tests**: Vitest (Node environment)
- **Component Tests**: Vitest with Playwright browser provider
- **E2E Tests**: Playwright
- **Test Utilities**: Faker.js for test data generation
- **Authentication**: Firebase Auth Emulator for testing OAuth flows

## Test Structure

### Directory Organization

```
frontend/test/
├── assets/          # Test assets (e.g., test-image.png)
├── e2e/            # End-to-end test specifications
├── fixtures/       # Playwright fixtures for test setup
├── helpers/        # Test helper functions
└── pages/          # Page Object Model classes
```

### Test File Naming Conventions

- **Unit tests**: `*.unit-spec.ts` (located in `src/` alongside source files)
- **Component tests**: `*.component-spec.tsx` (located in `src/` alongside components)
- **E2E tests**: `*.spec.ts` (located in `test/e2e/`)

## Running Tests

### All Tests

```bash
npm run test -w frontend
```

### Unit Tests Only

```bash
npm run test:unit -w frontend
```

### Component Tests Only

```bash
npm run test:component -w frontend
```

### E2E Tests

```bash
# Standard run
npm run test:e2e -w frontend

# Headed mode (visible browser)
npm run test:e2e:headed -w frontend

# Debug mode
npm run test:e2e:debug -w frontend

# UI mode
npm run test:e2e:ui -w frontend

# View report
npm run test:e2e:report -w frontend
```

### Prerequisites for E2E Tests

```bash
npm run init:playwright -w frontend
```

## Test Coverage

### 1. Unit Tests

Unit tests verify individual functions and utilities in isolation.

**Covered Modules:**

- `math_things.unit-spec.ts` - Mathematical utility functions (prime checking, modular exponentiation)
- `generateSubTestId.unit-spec.ts` - Test ID generation utilities
- `AuthProvider.unit-spec.tsx` - Domain validation for authentication
- `employees.unit-spec.ts` - Employee service API calls
- `office_pet.unit-spec.ts` - Office pet service API calls

**Test Approach:**

- Mock external dependencies (API clients, Firebase)
- Use Faker.js for generating test data
- Test both success and error scenarios
- Validate edge cases and error handling

### 2. Component Tests

Component tests verify React components in a browser environment.

**Covered Components:**

- `user-info.component-spec.tsx` - User information display component

**Test Approach:**

- Render components in Playwright browser
- Mock authentication context
- Verify conditional rendering based on user data
- Test with various user data combinations (minimal, with avatar, complete)

### 3. End-to-End Tests

E2E tests verify complete user workflows using the Page Object Model pattern.

#### Public Pages (No Authentication Required)

**Home Page** (`home.spec.ts`)

- Page loads successfully
- Title displays correctly
- Welcome message is visible
- Main card is visible
- Status message is visible

**About Page** (`about.spec.ts`)

- Page loads successfully
- Title displays correctly
- Description content is accurate
- Tech info section is visible

#### Authentication

**Login Page** (`login.spec.ts`)

- Login page displays when not authenticated
- Login button shows correct text
- Google OAuth flow works with emulator
- Successful authentication redirects appropriately

#### Protected Pages (Authentication Required)

All protected pages test:

1. Redirect to login when not authenticated
2. Page accessibility when authenticated

**Profile Page** (`profile.spec.ts`)

- Displays user profile information
- Shows correct title and subtitle
- Displays security note
- Shows user email and name from test user
- Correct URL routing

**Employees Page** (`employees.spec.ts`)

- Displays employee list table
- Shows correct title
- Loads and displays employee data
- Shows employee details (name, email, ID, photo)
- Correct URL with page parameter
- **Tooltip functionality:**
  - Tooltip hidden by default
  - Tooltip appears on hover
  - Displays correct tooltip text
  - Shows README link
- **Pagination:**
  - Paging component visible
  - Page 1 active by default
  - Navigation to next page works
  - Navigation to specific page number works
  - Rows per page selector (default: 25)
  - Changing rows per page updates display

**Pet List Page** (`pet-list.spec.ts`)

- Displays pet list table
- Shows correct title
- Create pet button is visible
- Correct URL routing
- Loads and displays pet data
- Pet rows contain expected information

**Pet Detail Page** (`pet-detail.spec.ts`)

- Displays individual pet details
- Shows pet information (name, type, etc.)
- Displays pet avatar/image
- Correct URL with pet ID
- Navigation from list to detail works

**Pet Create Page** (`pet-create.spec.ts`)

- Displays create pet form
- Shows correct title
- Form fields are visible and functional
- Submit and reset buttons present
- **Image upload functionality:**
  - Dropzone visible
  - File upload works
  - Selected file name displays
  - Reset image button appears after upload
  - Reset image clears selection
  - Form submission with image works
- Successful creation redirects to pet list

**Pet Update Page** (`pet-update.spec.ts`)

- Displays update pet form
- Shows correct title
- Form pre-filled with existing pet data
- Submit and reset buttons present
- **Image upload functionality:**
  - Dropzone visible
  - File upload works
  - Selected file name displays
  - Reset image button appears after upload
  - Reset image clears selection
  - Form submission with new image works
- Successful update redirects to pet detail page
- Updated image displays on detail page

**Pet Delete Page** (`pet-delete.spec.ts`)

- Displays delete confirmation
- Shows pet information to be deleted
- Confirm and cancel buttons present
- Successful deletion redirects appropriately

## Test Patterns & Best Practices

### Page Object Model (POM)

All E2E tests use the Page Object Model pattern for maintainability and reusability.

**Base Page** (`BasePage.ts`)

- Abstract class extended by all page objects
- Common navigation methods
- Element location helpers
- Wait and assertion utilities

**Page Objects:**

- `HomePage.ts`
- `AboutPage.ts`
- `LoginPage.ts`
- `ProfilePage.ts`
- `EmployeesPage.ts`
- `PetListPage.ts`
- `PetCreatePage.ts`
- `PetDetailPage.ts`
- `PetUpdatePage.ts`
- `PetDeletePage.ts`

### Fixtures

**Public Fixtures** (`fixtures/public.ts`)

- Provides page objects for public pages (Home, About)
- No authentication required

**Auth Fixtures** (`fixtures/auth.ts`)

- Provides authenticated page context
- Test user creation
- Login helper function
- Pre-authenticated page objects for protected routes

### Helpers

**Auth Helper** (`helpers/auth-helper.ts`)

- `createTestUserData()` - Generates test user data
- `signInWithGoogleEmulatorPopup()` - Handles OAuth flow with Firebase emulator

**Pet ID Helper** (`helpers/pet-id-helper.ts`)

- `getFirstPetId()` - Retrieves a valid pet ID from the list for testing

## Test Environment Configuration

### E2E Test Environment

**Services Started:**

1. Frontend dev server (Vite) - `http://localhost:5173`
2. Firebase Auth Emulator - `http://localhost:9099`
3. Backend API server - `http://localhost:3000`

**Environment Variables:**

- `VITE_FIREBASE_EMULATE=true`
- `VITE_FIREBASE_EMULATOR_URL=http://localhost:9099`
- `VITE_API_URL=http://127.0.0.1:3000`
- `GOOGLE_STORAGE_BUCKET=pq-reference-app-dev.firebasestorage.app`
- `FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099`
- `FIREBASE_STORAGE_EMULATOR_HOST=127.0.0.1:9199`

**Browser Configuration:**

- Primary: Chromium (Desktop Chrome)
- Headless mode in CI
- Parallel execution enabled (except in CI)
- Retries: 2 on CI, 0 locally

## CI/CD Considerations

- Tests run in fully parallel mode locally
- CI runs tests sequentially (workers: 1)
- CI enforces no `test.only` in code
- Retries enabled on CI for flaky test resilience
- HTML reporter for test results
- Trace collection on first retry for debugging

## Known Test Dependencies

### Test Data

- Test image: `test/assets/test-image.png` (used for pet image upload tests)
- Test users: Generated dynamically with Faker.js
- Employee data: Fetched from Google Workspace API (mocked in unit tests)

### External Services

- Firebase Auth Emulator (required for authentication tests)
- Backend API (required for E2E tests)
- Google Storage Emulator (for image upload tests)
