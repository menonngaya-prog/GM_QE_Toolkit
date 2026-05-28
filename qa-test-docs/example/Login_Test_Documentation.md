# MyApp Login — QA Test Documentation
**App:** MyApp  
**Platform:** Web  
**Testing Types:** E2E/UI, API, Security  
**Version:** v1.0  
**Date:** 2026-05-26  

---

## Test Strategy — Login

### Purpose
The Login feature is the primary authentication entry point for MyApp. This strategy covers email/password authentication, social login via Google OAuth, session management, account lockout, and accessibility to ensure a secure and reliable sign-in experience.

### Scope

**In Scope**
- Email/password authentication
- Input validation (field-level and form-level)
- Show/hide password toggle
- Remember Me functionality
- Forgot Password flow
- Google OAuth (social login)
- Account lockout after repeated failures
- Session creation and expiry
- API endpoint security
- Accessibility (WCAG 2.1 AA)
- Cross-browser compatibility (Chrome, Firefox, Safari, Edge)

**Out of Scope**
- Registration/sign-up flow
- Profile management post-login
- Admin/backend authentication
- Password reset token expiry logic (beyond trigger)
- Third-party OAuth internals (Google, Apple)

### Testing Types

| Type | Coverage | Tool |
|---|---|---|
| Functional / E2E | All login flows, validation, redirects | Playwright / Cypress |
| API | Auth endpoints, token validation, lockout | Postman / REST Assured |
| Security | Brute force, SQL injection, CSRF, HTTPS | OWASP ZAP, Burp Suite |
| Performance | Login response time under load | k6 / JMeter |
| Accessibility | WCAG 2.1 AA compliance | axe-core, VoiceOver, NVDA |
| Cross-browser | Chrome, Firefox, Safari, Edge | BrowserStack |
| Regression | Re-verification after any auth-related change | Automated suite |

### Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Incorrect credentials bypass | Low | Critical | Penetration test; multi-layer auth check |
| Account lockout triggers too early / too late | Medium | High | Boundary test at N-1, N, N+1 attempts |
| Session token not invalidated on logout | Medium | High | Verify token blacklisting in API tests |
| Google OAuth failure blocks all users | Medium | High | Test OAuth error states; verify fallback |
| Remember Me persists beyond intended duration | Low | Medium | Verify cookie TTL and Secure flags |
| CSRF token absent from login form | Low | Critical | Security scan + manual API test without token |
| Accessibility failure on screen readers | Medium | Medium | Test with VoiceOver and NVDA before release |

### Entry Criteria
- Login UI deployed to staging
- API auth endpoints available with test credentials
- Test accounts created (valid, locked, unverified)
- OAuth sandbox configured

### Exit Criteria
- All Critical and High test cases pass
- Zero open Critical defects
- Security scan shows no High/Critical findings
- Accessibility audit passes WCAG 2.1 AA
- Cross-browser smoke tests pass on all four browsers

---

## Test Plan — Login

### Objectives
1. Verify that valid users can authenticate successfully and reach their intended destination.
2. Confirm all invalid inputs are rejected with clear, accurate error messages.
3. Validate that security controls (lockout, CSRF, HTTPS, token handling) function correctly.
4. Ensure the login experience is accessible and consistent across supported browsers.

### Test Environment

| Environment | Detail |
|---|---|
| Staging URL | `https://staging.myapp.com/login` |
| API Base URL | `https://api-staging.myapp.com/v1` |
| Browsers | Chrome 124+, Firefox 125+, Safari 17+, Edge 124+ |
| Devices | Desktop (1440px), Tablet (768px), Mobile (375px) |
| Test Accounts | valid_user@test.com, locked_user@test.com, unverified@test.com |
| External Services | Google OAuth sandbox with test credentials |

### Test Phases

| Phase | Scope | Duration |
|---|---|---|
| Smoke | Core login happy path, API health check | Day 1 |
| Functional | All input validation, flows, session, social login | Days 2–3 |
| Security | Brute force, injection, CSRF, token validation | Day 3 |
| Accessibility | Screen reader, keyboard nav, contrast | Day 4 |
| Cross-browser | Repeat smoke + critical paths on all browsers | Day 4 |
| Regression | Full automated suite run | Day 5 |

### Defect Severity Levels

| Severity | Definition | Example |
|---|---|---|
| Critical | Blocks core functionality or security breach | Login bypassed; session not invalidated |
| High | Major flow broken, no workaround | Lockout not triggering; OAuth failing |
| Medium | Feature degraded but workaround exists | Error message misleading; toggle broken |
| Low | Minor UX or cosmetic issue | Label alignment off; tooltip misspelling |

### Dependencies
- Staging environment with seeded test users
- Google OAuth sandbox credentials
- Email service available for Forgot Password flow
- API documentation for all `/auth` endpoints

### Suspension Criteria
Testing suspended if: login API is down, test environment is unreachable, or a Critical defect blocks more than 50% of test execution.

---

## Test Scenarios

### TS-001 — Email/Password Authentication

| ID | Scenario |
|----|----------|
| TS-001-01 | Successful login with valid email and password |
| TS-001-02 | Login fails with correct email, wrong password |
| TS-001-03 | Login fails with unregistered email |
| TS-001-04 | Login fails with empty email field |
| TS-001-05 | Login fails with empty password field |
| TS-001-06 | Login fails with both fields empty |
| TS-001-07 | Login fails with invalid email format (missing @, missing domain) |
| TS-001-08 | User is redirected to originally requested URL after successful login |
| TS-001-09 | Email treated as case-insensitive |
| TS-001-10 | Password treated as case-sensitive |

### TS-002 — Input Validation

| ID | Scenario |
|----|----------|
| TS-002-01 | Email field enforces valid format before submission |
| TS-002-02 | Password field enforces minimum length (≥8 characters) |
| TS-002-03 | Whitespace-only input is rejected for both fields |
| TS-002-04 | SQL injection string in email field is sanitised and rejected |
| TS-002-05 | XSS payload in email field is not executed |
| TS-002-06 | Email with leading/trailing whitespace is trimmed before submission |
| TS-002-07 | Error messages are specific per field (not generic "login failed") |
| TS-002-08 | Inline error clears when user corrects the invalid input |

### TS-003 — Password Visibility Toggle

| ID | Scenario |
|----|----------|
| TS-003-01 | Password is masked by default on page load |
| TS-003-02 | Clicking the eye icon reveals the password in plain text |
| TS-003-03 | Clicking the eye icon again re-masks the password |
| TS-003-04 | Toggle state does not reset when user switches between fields |
| TS-003-05 | Toggle is keyboard-accessible (Tab + Enter/Space) |

### TS-004 — Remember Me

| ID | Scenario |
|----|----------|
| TS-004-01 | With Remember Me checked, session persists after browser is closed and reopened |
| TS-004-02 | Without Remember Me, session ends when browser is closed |
| TS-004-03 | Remember Me cookie has correct TTL (e.g., 30 days) and Secure flag set |
| TS-004-04 | Remember Me cookie is invalidated on explicit logout |
| TS-004-05 | Remember Me checkbox is unchecked by default |

### TS-005 — Forgot Password

| ID | Scenario |
|----|----------|
| TS-005-01 | Clicking "Forgot Password" navigates to the reset request page |
| TS-005-02 | Submitting a registered email triggers a password reset email |
| TS-005-03 | Submitting an unregistered email shows no-error response (anti-enumeration) |
| TS-005-04 | Password reset link in email is valid and navigates to reset form |
| TS-005-05 | Submitting empty email on Forgot Password page shows validation error |

### TS-006 — Account Lockout

| ID | Scenario |
|----|----------|
| TS-006-01 | Account is not locked after N-1 failed attempts |
| TS-006-02 | Account is locked after exactly N failed attempts (e.g., 5) |
| TS-006-03 | Locked account shows clear lockout message with guidance |
| TS-006-04 | Valid credentials are rejected while account is locked |
| TS-006-05 | Lockout resets after the cooldown period (e.g., 15 minutes) |
| TS-006-06 | Lockout counter resets after a successful login |

### TS-007 — Google OAuth (Social Login)

| ID | Scenario |
|----|----------|
| TS-007-01 | Clicking "Continue with Google" opens the Google consent screen |
| TS-007-02 | Successful Google auth creates/signs in the user and redirects to dashboard |
| TS-007-03 | Cancelling the Google consent screen returns user to the login page |
| TS-007-04 | Google OAuth failure (revoked token) shows a user-friendly error |
| TS-007-05 | Google account not linked to any MyApp account prompts account creation or error |

### TS-008 — Session Management

| ID | Scenario |
|----|----------|
| TS-008-01 | Auth token is returned in the API response on successful login |
| TS-008-02 | Token is stored securely (HttpOnly cookie, not localStorage) |
| TS-008-03 | Expired token results in 401 response and redirect to login |
| TS-008-04 | Logging out invalidates the token server-side |
| TS-008-05 | Using an invalidated token after logout returns 401 |
| TS-008-06 | Concurrent sessions: behaviour is consistent with policy (allow/block) |

### TS-009 — Accessibility

| ID | Scenario |
|----|----------|
| TS-009-01 | All form fields have associated, visible labels |
| TS-009-02 | Full login flow is completable using keyboard only (Tab, Enter) |
| TS-009-03 | Error messages are announced by screen reader (VoiceOver / NVDA) |
| TS-009-04 | Focus indicator is visible on all interactive elements |
| TS-009-05 | Colour contrast for all text meets WCAG 2.1 AA (4.5:1 ratio) |

---

## Detailed Test Cases

#### TC-001-01: Successful login with valid credentials
**Scenario:** TS-001-01  
**Priority:** Critical  
**Automation Candidate:** Yes  
**Preconditions:** User account `valid_user@test.com` / `P@ssword123` exists and is active. Browser is on `https://staging.myapp.com/login`.

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enter `valid_user@test.com` in the Email field | Email field displays the entered value |
| 2 | Enter `P@ssword123` in the Password field | Password field displays masked characters |
| 3 | Click the **Sign In** button | Loading indicator appears on the button |
| 4 | Wait for navigation | Browser redirects to `https://staging.myapp.com/dashboard` |
| 5 | Inspect cookies via DevTools > Application > Cookies | An `auth_token` HttpOnly cookie is present with `Secure` and `SameSite=Strict` flags |

**Pass Criteria:** User lands on the dashboard within 3 seconds; auth cookie is set with correct security flags.  
**Fail Criteria:** Any error message appears, redirect does not occur, or auth cookie is missing/misconfigured.

---

#### TC-001-02: Login fails with wrong password
**Scenario:** TS-001-02  
**Priority:** Critical  
**Automation Candidate:** Yes  
**Preconditions:** User `valid_user@test.com` exists. Browser is on the login page. Failed attempt count is 0.

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enter `valid_user@test.com` in the Email field | Field accepts input |
| 2 | Enter `WrongPassword!` in the Password field | Field accepts input (masked) |
| 3 | Click the **Sign In** button | Button enters loading state |
| 4 | Wait for response | Page remains on `/login`; error message "Invalid email or password" appears beneath the form |
| 5 | Open DevTools > Application > Cookies | No `auth_token` cookie is present |

**Pass Criteria:** Error message is shown; user stays on login page; no auth token is issued.  
**Fail Criteria:** User is authenticated, no error is shown, or a different/misleading error message appears.

---

#### TC-002-01: Empty fields trigger validation errors
**Scenario:** TS-002-01  
**Priority:** High  
**Automation Candidate:** Yes  
**Preconditions:** Browser is on the login page with both fields empty.

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Leave Email and Password fields empty | Both fields are blank |
| 2 | Click the **Sign In** button | No network request is made (verify in DevTools > Network) |
| 3 | Inspect the Email field area | Inline error "Email is required" appears below the Email field |
| 4 | Inspect the Password field area | Inline error "Password is required" appears below the Password field |
| 5 | Focus the Email field and type `test@example.com` | Email error clears immediately |

**Pass Criteria:** Both errors appear without a network call; Email error clears on valid input.  
**Fail Criteria:** Form submits, no errors shown, or errors remain after valid input is entered.

---

#### TC-002-02: SQL injection in email field is rejected
**Scenario:** TS-002-04  
**Priority:** Critical  
**Automation Candidate:** Yes  
**Preconditions:** Browser is on the login page.

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enter `' OR '1'='1` in the Email field | Field accepts the string |
| 2 | Enter any value in the Password field | Field accepts input |
| 3 | Click **Sign In** | Request is sent to the API |
| 4 | Check the API response in DevTools > Network tab | API returns `400` or `422`; response body contains an error message; no `200` returned |
| 5 | Check the page | Error message is displayed; user is not authenticated |

**Pass Criteria:** Injection string does not authenticate the user; API returns a non-200 status.  
**Fail Criteria:** User is authenticated, or the API returns a `200` status.

---

#### TC-006-01: Account locks after 5 consecutive failed attempts
**Scenario:** TS-006-02  
**Priority:** Critical  
**Automation Candidate:** Yes  
**Preconditions:** User `lockout_test@test.com` exists; failed attempt count is 0.

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enter `lockout_test@test.com` + `WrongPass1`, click **Sign In** | Error: "Invalid email or password" (attempt 1) |
| 2 | Repeat with `WrongPass2` | Error: "Invalid email or password" (attempt 2) |
| 3 | Repeat with `WrongPass3` | Error: "Invalid email or password" (attempt 3) |
| 4 | Repeat with `WrongPass4` | Error: "Invalid email or password" (attempt 4) |
| 5 | Repeat with `WrongPass5` | Error changes to: "Account locked. Too many failed attempts. Try again in 15 minutes." |
| 6 | Attempt login with the correct password `CorrectPass!` | Error: "Account locked..." — user is still rejected |

**Pass Criteria:** Account locks on the 5th failed attempt; correct credentials are rejected during lockout.  
**Fail Criteria:** Account locks before 5 attempts, does not lock at 5, or correct credentials succeed while locked.

---

#### TC-007-01: Successful Google OAuth login
**Scenario:** TS-007-02  
**Priority:** High  
**Automation Candidate:** No  
**Preconditions:** Google test account `qa_test@gmail.com` is pre-linked to a MyApp account. Browser is on the login page.

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click **Continue with Google** | Browser opens a Google OAuth consent popup or redirects to `accounts.google.com` |
| 2 | Select or log in as `qa_test@gmail.com` | Google consent screen appears showing MyApp permission request |
| 3 | Click **Allow** | Browser redirects back to `https://staging.myapp.com` |
| 4 | Wait for navigation | User lands on `https://staging.myapp.com/dashboard` |
| 5 | Open DevTools > Application > Cookies | An `auth_token` HttpOnly cookie is present; user's name/avatar is shown in the nav bar |

**Pass Criteria:** User is authenticated and on the dashboard within 5 seconds; auth cookie is present.  
**Fail Criteria:** Redirect loop occurs, user lands on an error page, or no auth cookie is set.

---

#### TC-008-02: Auth token is invalidated after logout
**Scenario:** TS-008-04  
**Priority:** Critical  
**Automation Candidate:** Yes  
**Preconditions:** User is logged in as `valid_user@test.com`. Auth token has been captured from the `auth_token` cookie.

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open DevTools > Application > Cookies and copy the `auth_token` value | Token string is captured |
| 2 | Click the **Logout** button in the navigation | API call to `POST /v1/auth/logout` is made; browser redirects to `/login` |
| 3 | Open DevTools > Application > Cookies | `auth_token` cookie is no longer present |
| 4 | Send `GET /v1/user/profile` with header `Authorization: Bearer <captured-token>` via Postman | API returns `401 Unauthorized` |
| 5 | Navigate directly to `https://staging.myapp.com/dashboard` in the browser | Browser redirects to `/login` |

**Pass Criteria:** Token is invalidated server-side; direct navigation and API calls with the old token return 401.  
**Fail Criteria:** Old token still returns 200 from the API, or the user can access protected pages without re-authenticating.

---

#### TC-009-01: Login form is fully keyboard-navigable
**Scenario:** TS-009-02  
**Priority:** High  
**Automation Candidate:** No  
**Preconditions:** Browser is on the login page. Mouse is not used after Step 1.

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Place focus on the browser address bar, press Tab | Focus moves to the first interactive element on the page (Email field) |
| 2 | Type `valid_user@test.com` | Email field receives input |
| 3 | Press Tab | Focus moves to the Password field with a visible focus ring |
| 4 | Type `P@ssword123` | Password field receives masked input |
| 5 | Press Tab | Focus moves to the "Remember Me" checkbox |
| 6 | Press Space | Checkbox is checked |
| 7 | Press Tab | Focus moves to the "Forgot Password" link |
| 8 | Press Tab | Focus moves to the "Sign In" button |
| 9 | Press Enter | Form is submitted; user is redirected to the dashboard |

**Pass Criteria:** Every interactive element is reachable via Tab in logical order; login completes without mouse interaction.  
**Fail Criteria:** Any element is skipped, focus order is illogical, or the form cannot be submitted via keyboard.

---

## Coverage Validation Report

### Requirement → Test Coverage Mapping

| Requirement | Covered By |
|---|---|
| Valid email/password login | TC-001-01, TS-001-01 |
| Invalid credentials rejected | TC-001-02, TS-001-02, TS-001-03 |
| Empty field validation | TC-002-01, TS-001-04, TS-001-05, TS-001-06 |
| Email format validation | TS-001-07, TS-002-01 |
| SQL injection / XSS protection | TC-002-02, TS-002-04, TS-002-05 |
| Password show/hide toggle | TS-003-01 through TS-003-05 |
| Remember Me behaviour | TS-004-01 through TS-004-05 |
| Forgot Password trigger | TS-005-01 through TS-005-05 |
| Account lockout at N attempts | TC-006-01, TS-006-01 through TS-006-06 |
| Google OAuth | TC-007-01, TS-007-01 through TS-007-05 |
| Session token security | TC-008-02, TS-008-01 through TS-008-06 |
| WCAG 2.1 AA accessibility | TC-009-01, TS-009-01 through TS-009-05 |
| Post-login redirect | TS-001-08 |
| Anti-enumeration on Forgot Password | TS-005-03 |

### Automation Candidates

| Test Case | Reason |
|---|---|
| TC-001-01, TC-001-02 | Core smoke tests; run on every deploy |
| TC-002-01, TC-002-02 | Validation logic is stable; regressions are high-risk |
| TC-006-01 | Boundary test; tedious manually and error-prone |
| TC-008-02 | Requires API-level verification; best done programmatically |
| All TS-008 scenarios | API contract tests; ideal for CI pipeline |

### Clarification Questions / Gaps

| # | Gap or Question |
|---|---|
| 1 | **Lockout threshold** — What is the exact N (number of failed attempts before lockout)? Assumed 5. |
| 2 | **Lockout reset** — Is 15 minutes the cooldown, or is unlock admin-only? |
| 3 | **Session timeout** — What is the idle session timeout duration? Not specified. |
| 4 | **Concurrent sessions** — Are multiple simultaneous sessions allowed? Policy unclear. |
| 5 | **Password reset link expiry** — How long is the Forgot Password link valid? Assumed 1 hour. |
| 6 | **Additional SSO** — Is Apple Sign-In or other SSO in scope for this release? |
| 7 | **Unverified account** — What happens when an unverified user attempts to log in? |
| 8 | **Rate limiting** — Is there API-level rate limiting on `/auth/login` independent of account lockout? |
