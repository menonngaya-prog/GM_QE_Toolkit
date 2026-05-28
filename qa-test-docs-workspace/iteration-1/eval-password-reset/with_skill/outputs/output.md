# QA Test Documentation — Password Reset

**Feature:** Password Reset
**Platform:** Web
**Testing Type:** E2E/UI, Security, Integration
**Version:** 1.0
**Date:** 2026-05-26

---

## Test Strategy — Password Reset

### Purpose
The Password Reset feature allows authenticated users who have forgotten their credentials to regain account access via a time-limited email link. The user clicks "Forgot Password" on the login page, submits their registered email address, receives a reset link valid for 60 minutes, sets a new password meeting complexity requirements (minimum 8 characters, must include at least one number), and is redirected to the login page. The old password is invalidated immediately upon successful reset. This test strategy ensures the flow is secure, reliable, and accessible — preventing both account lockout and unauthorized account takeover.

### Scope
**In Scope:**
- "Forgot Password" link visibility and behavior on the login page
- Email submission form — valid email, invalid email, unregistered email
- Reset email delivery — content, link format, expiry (60-minute window)
- Reset link behavior — valid link, expired link, already-used link, tampered link
- New password form — minimum 8 characters, must contain a number, confirmation field matching
- Post-reset behavior — redirect to login page, old password invalidation
- Session handling — any active sessions invalidated on reset
- Security controls — rate limiting on email submission, token uniqueness, HTTPS enforcement
- Cross-browser compatibility on the full reset flow
- Accessibility of all UI elements in the flow

**Out of Scope:**
- Password reset via SMS / phone verification
- Admin-initiated password resets from backend dashboards
- OAuth / SSO login flows (reset applies to email/password accounts only)
- Password reset for accounts locked by admin action
- Email provider deliverability and spam filtering internals

### Testing Types
| Type | Coverage | Tool |
|---|---|---|
| Functional / E2E | Full reset flow from "Forgot Password" click to login with new password | Playwright / Cypress |
| API | Reset token generation endpoint, token validation endpoint, password update endpoint | Postman / REST-assured |
| Security | Token entropy, HTTPS enforcement, rate limiting, token expiry, old-password invalidation | Burp Suite, manual |
| Performance | Email submission response time, reset link load time under concurrent requests | k6 / JMeter |
| Accessibility | WCAG 2.1 AA — form labels, error announcements, keyboard navigation, focus management | axe-core, VoiceOver, NVDA |
| Cross-browser | Full flow on Chrome, Firefox, Safari, Edge | BrowserStack |
| Regression | Happy path + critical negative cases included in automated regression suite | Playwright CI |

### Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Reset token not expiring at 60 minutes (allowing indefinite account takeover) | Medium | Critical | Test exact boundary at 59 min and 61 min; verify server-side expiry check |
| Old password still valid after successful reset (dual-credential window) | Medium | Critical | Immediately attempt login with old password after reset; must return 401 |
| Reset link usable more than once (token reuse attack) | Medium | Critical | Attempt second use of same link after successful reset; must be rejected |
| Reset email sent for unregistered email, leaking account existence | High | High | Verify response is identical for registered and unregistered emails (email enumeration) |
| Reset link transmitted over HTTP, exposing token in transit | Low | Critical | Confirm all reset URLs use HTTPS; test HTTP redirect behavior |
| No rate limiting on email submission (brute-force / spam vector) | Medium | High | Send 20+ rapid requests from same IP; verify throttling response |
| Tampered or forged reset tokens accepted | Low | Critical | Submit modified tokens; verify rejection with no user feedback that helps forge valid ones |
| Password validation enforced only client-side | Medium | High | Submit API request bypassing UI with non-compliant password; must be rejected server-side |
| Reset flow breaks on non-Chromium browsers | Low | Medium | Run full E2E flow on Firefox, Safari, Edge via BrowserStack |

### Entry Criteria
- Password reset feature deployed to the staging environment
- Email delivery service configured and sending to test inboxes (e.g., Mailinator, Mailhog)
- Test accounts created: registered active user, unregistered email address available
- Reset token generation and validation APIs passing smoke tests
- Staging HTTPS certificate valid
- Test environment network access confirmed for all target browsers

### Exit Criteria
- All Critical and High priority test cases pass with no open Critical/High defects
- Token expiry, token reuse, and old-password-invalidation tests pass
- No email enumeration vulnerability confirmed
- Cross-browser smoke pass on Chrome, Firefox, Safari, Edge
- Accessibility audit passes WCAG 2.1 AA for the reset flow
- Test execution report reviewed and signed off by QA lead

---

## Test Plan — Password Reset

### Objectives
1. Verify the complete password reset flow — from "Forgot Password" initiation to successful login with the new password — functions correctly on all supported browsers.
2. Confirm all security controls are enforced: 60-minute token expiry, single-use tokens, old-password invalidation, HTTPS, and rate limiting.
3. Validate all input validation rules: email format, password minimum length (8 chars), and numeric character requirement are enforced both client-side and server-side.
4. Ensure the flow is accessible to users relying on keyboard navigation and screen readers, meeting WCAG 2.1 AA standards.

### Test Environment
| Environment | Detail |
|---|---|
| Staging URL | [staging URL] |
| API Base URL | [staging API base URL] |
| Browsers | Chrome 124+, Firefox 125+, Safari 17+, Edge 124+ |
| Devices | Desktop (1440px), Tablet (768px), Mobile (375px) |
| Email Test Inbox | Mailhog (local) or Mailinator (staging) — test inbox accessible via UI and API |
| Test Accounts | `validuser@test.com` (registered, active account); unregistered email `notauser@test.com` |
| Token Manipulation | Manual token editing via URL bar; Burp Suite for intercept tests |

### Test Phases
| Phase | Scope | Duration |
|---|---|---|
| Smoke | "Forgot Password" link renders; email submitted; reset email arrives; link opens new password form | Day 1 |
| Functional | All happy path flows, all input validation, email edge cases, post-reset redirect | Days 2–3 |
| Security | Token expiry, token reuse, old-password invalidation, rate limiting, HTTPS, email enumeration, server-side validation bypass | Day 3 |
| Accessibility | Screen reader walkthrough, keyboard-only navigation, error message announcements, color contrast | Day 4 |
| Cross-browser | Repeat smoke + critical functional cases on Firefox, Safari, Edge | Day 4 |
| Regression | Full automated E2E suite run in CI against staging | Day 5 |

### Defect Severity Levels
| Severity | Definition | Example |
|---|---|---|
| Critical | Blocks core function or constitutes a security breach | Reset token does not expire; old password still valid after reset; reset link works without HTTPS |
| High | Major flow broken with no workaround | Reset email never delivered; new password form rejects all valid input; token reuse accepted |
| Medium | Feature degraded but workaround exists | Redirect after reset goes to homepage instead of login page; error messages missing on invalid input |
| Low | Minor UX / cosmetic issue | "Forgot Password" link styling inconsistent across browsers; loading spinner not shown during email send |

### Dependencies
- Staging email delivery service operational and delivering within 2 minutes
- Test email inboxes accessible (Mailhog UI or Mailinator API)
- Staging database seeded with test user accounts
- Reset token generation and storage backend deployed
- QA team has access to staging environment and BrowserStack account

### Suspension Criteria
- Reset email delivery is non-functional, blocking all flow testing
- Token generation endpoint returning 5xx errors
- Staging environment is unavailable or returning errors on login page load
- Critical blocker defect found that makes further testing invalid (e.g., all tokens immediately expired)

---

## Test Scenarios

## TS-001 — Forgot Password Initiation
| ID | Scenario |
|----|----------|
| TS-001-01 | User navigates to the login page and sees the "Forgot Password" link |
| TS-001-02 | User clicks "Forgot Password" and is taken to the email entry page |
| TS-001-03 | "Forgot Password" link is keyboard-focusable and activatable via Enter key |
| TS-001-04 | "Forgot Password" link is visible and functional on mobile (375px) |

## TS-002 — Email Submission Form
| ID | Scenario |
|----|----------|
| TS-002-01 | User submits a valid registered email address and receives a success message |
| TS-002-02 | User submits an unregistered email address and receives the same success message (no enumeration) |
| TS-002-03 | User submits an invalid email format (e.g., "notanemail") and sees a validation error |
| TS-002-04 | User submits an empty email field and sees a required-field error |
| TS-002-05 | User submits email with leading/trailing whitespace — form trims and processes it |
| TS-002-06 | User submits the form multiple times rapidly — rate limiting is applied after threshold |
| TS-002-07 | Success message does not reveal whether the email is registered or not |

## TS-003 — Reset Email Delivery and Content
| ID | Scenario |
|----|----------|
| TS-003-01 | Registered user receives a reset email within 2 minutes of submission |
| TS-003-02 | Reset email contains a clearly labeled reset link/button |
| TS-003-03 | Reset link in the email uses HTTPS |
| TS-003-04 | Reset link contains a unique token (not sequential or guessable) |
| TS-003-05 | Only one reset email is received per submission (no duplicates) |
| TS-003-06 | A second reset request generates a new token and invalidates the first token |

## TS-004 — Reset Link Behavior
| ID | Scenario |
|----|----------|
| TS-004-01 | User clicks a valid (within 60 minutes) reset link and is taken to the new password form |
| TS-004-02 | User clicks an expired reset link (>60 minutes old) and sees an expiry error message |
| TS-004-03 | User attempts to reuse a reset link after already completing a reset — link is rejected |
| TS-004-04 | User submits a tampered/invalid token in the reset URL and sees an error |
| TS-004-05 | Reset link works correctly in all supported browsers |
| TS-004-06 | Reset link opened in a different browser or device from where it was requested still works |
| TS-004-07 | Accessing the reset link via HTTP is redirected to HTTPS |

## TS-005 — New Password Form Validation
| ID | Scenario |
|----|----------|
| TS-005-01 | User sets a valid new password (8+ chars, contains a number) and reset succeeds |
| TS-005-02 | User submits a password shorter than 8 characters and sees a validation error |
| TS-005-03 | User submits a password with exactly 8 characters including a number — reset succeeds |
| TS-005-04 | User submits a password with 8+ characters but no number — sees a validation error |
| TS-005-05 | User submits a password where confirmation does not match — sees a mismatch error |
| TS-005-06 | User submits an empty password field — sees a required-field error |
| TS-005-07 | Password validation is enforced server-side (bypass via direct API call) |
| TS-005-08 | Password field has show/hide toggle that functions correctly |

## TS-006 — Post-Reset Behavior
| ID | Scenario |
|----|----------|
| TS-006-01 | After successful reset, user is redirected to the login page |
| TS-006-02 | After successful reset, user can log in with the new password |
| TS-006-03 | After successful reset, the old password no longer works (returns auth error) |
| TS-006-04 | After successful reset, any existing active sessions are invalidated |
| TS-006-05 | A success confirmation message is shown to the user after reset completes |

## TS-007 — Accessibility
| ID | Scenario |
|----|----------|
| TS-007-01 | All form fields on email entry and new password pages have associated labels |
| TS-007-02 | Error messages are announced by screen readers when validation fails |
| TS-007-03 | Focus is managed correctly after form submission (moved to error or confirmation) |
| TS-007-04 | The full flow is completable using keyboard only (Tab, Enter, Shift+Tab) |
| TS-007-05 | Color contrast on all text elements meets WCAG 2.1 AA ratio (4.5:1) |

---

## Detailed Test Cases

#### TC-001-01: Verify "Forgot Password" link is present and navigates to email entry page
**Scenario:** TS-001-02
**Priority:** High
**Automation Candidate:** Yes
**Preconditions:** User is on the login page; user is not logged in

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open the application login page in Chrome at 1440px viewport | Login page loads with email field, password field, login button, and "Forgot Password" link visible |
| 2 | Locate the "Forgot Password" link on the page | Link is visible below the password field or login button |
| 3 | Click the "Forgot Password" link | Browser navigates to the email entry page for password reset |
| 4 | Observe the URL in the address bar | URL changes to the reset-request page (e.g., `/forgot-password` or `/reset-request`) |
| 5 | Observe the page content | Page displays a heading indicating password reset, an email input field, and a submit button |

**Pass Criteria:** Clicking "Forgot Password" navigates the user to the email entry page; the email input field and submit button are present and interactive.
**Fail Criteria:** Link is absent, clicking produces no navigation, or the destination page is blank or shows an error.

---

#### TC-002-01: Submit valid registered email — success message displayed, no enumeration
**Scenario:** TS-002-01, TS-002-07
**Priority:** Critical
**Automation Candidate:** Yes
**Preconditions:** User is on the email entry page; `validuser@test.com` is a registered account in the staging database; `notauser@test.com` is confirmed unregistered

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | In the email field, type `validuser@test.com` | Email is entered into the field |
| 2 | Click the **Submit** / **Send Reset Link** button | Form is submitted; a loading indicator appears briefly |
| 3 | Observe the page after submission | A success message is displayed (e.g., "If this email is registered, you'll receive a reset link shortly") |
| 4 | Note the exact wording of the success message | Message does not confirm whether the email is registered |
| 5 | Navigate back to the email entry page and enter `notauser@test.com` | Email is entered |
| 6 | Click Submit | A success message is displayed |
| 7 | Compare the success message from step 3 and step 6 | Both messages are identical in wording and presentation |

**Pass Criteria:** Both registered and unregistered emails receive identical success messages; the message text does not disclose registration status.
**Fail Criteria:** Different messages shown for registered vs. unregistered emails (e.g., "Email sent" vs. "Email not found"), or message explicitly confirms the account exists.

---

#### TC-002-03: Submit invalid email format — validation error shown
**Scenario:** TS-002-03
**Priority:** Medium
**Automation Candidate:** Yes
**Preconditions:** User is on the email entry page

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click into the email input field | Field receives focus |
| 2 | Type `notanemail` (no @ symbol) | Text appears in the field |
| 3 | Click the **Submit** button | Form submission is blocked; an inline validation error appears |
| 4 | Read the error message | Error message states the email format is invalid (e.g., "Please enter a valid email address") |
| 5 | Clear the field and type `user@` (incomplete domain) | Text appears in the field |
| 6 | Click the **Submit** button | Form submission is blocked; validation error appears |

**Pass Criteria:** Submitting an invalid email format prevents submission and displays a clear inline error message; no network request is made for invalid formats.
**Fail Criteria:** Form submits with an invalid email, or no error message is shown, or the page navigates away.

---

#### TC-002-06: Rate limiting applied after rapid repeated submissions
**Scenario:** TS-002-06
**Priority:** High
**Automation Candidate:** Yes (with API-level testing)
**Preconditions:** User is on the email entry page; access to staging environment with rate limiting enabled

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Submit `validuser@test.com` via the reset form | Success message appears (request 1) |
| 2 | Navigate back and submit the same email 9 more times in rapid succession (within 60 seconds) | Each submission returns a success message for early requests |
| 3 | On the 11th (or threshold+1) submission within the window, click Submit | A rate-limit or "too many requests" error message is shown, or the form is temporarily disabled |
| 4 | Wait 5 minutes and submit once more | Submission succeeds again (rate limit window has reset) |

**Pass Criteria:** After exceeding the rate limit threshold, further submissions are blocked with an appropriate message; the block is temporary and lifts after the cooldown period.
**Fail Criteria:** No rate limiting is applied regardless of submission frequency; unlimited reset emails are sent from a single IP.

---

#### TC-004-01: Valid reset link opens new password form
**Scenario:** TS-004-01
**Priority:** Critical
**Automation Candidate:** Yes
**Preconditions:** `validuser@test.com` has submitted the reset form within the last 5 minutes; reset email has been received in the test inbox (Mailhog/Mailinator)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open the test email inbox for `validuser@test.com` | Inbox is accessible; reset email is present |
| 2 | Open the reset email | Email contains a reset link/button |
| 3 | Click the reset link in the email | Browser opens the reset link URL |
| 4 | Observe the page | New password form is displayed with a "New Password" field and a "Confirm Password" field |
| 5 | Verify the URL uses HTTPS | URL begins with `https://` |
| 6 | Verify the page does not show an expired or invalid token error | Page renders the password form without error messages |

**Pass Criteria:** A valid reset link opens the new password form without errors; URL is HTTPS; both password and confirm-password fields are present.
**Fail Criteria:** Link shows an error page, expired token message, or 404 for a link opened within 60 minutes of generation.

---

#### TC-004-02: Expired reset link is rejected with clear error
**Scenario:** TS-004-02
**Priority:** Critical
**Automation Candidate:** Yes (with token timestamp manipulation on staging)
**Preconditions:** A reset token has been generated and its expiry timestamp set to 61 minutes ago in the staging database (or a token generated 61+ minutes prior is available)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Obtain the reset URL with the expired token | URL is available |
| 2 | Open the reset URL in the browser | Page loads |
| 3 | Observe the page content | An error message is displayed indicating the link has expired (e.g., "This reset link has expired. Please request a new one.") |
| 4 | Verify no password entry fields are presented | Password form fields are NOT displayed; only the error and a link to request a new reset |
| 5 | Click the "request a new reset" link or button | User is redirected to the email entry page |

**Pass Criteria:** Expired token renders an expiry error message with no password form visible; user is offered a path to request a new link.
**Fail Criteria:** Expired token is accepted and password form is displayed; or generic 500 error shown instead of a user-friendly expiry message.

---

#### TC-004-03: Reset link is rejected after one-time use
**Scenario:** TS-004-03
**Priority:** Critical
**Automation Candidate:** Yes
**Preconditions:** `validuser@test.com` has a valid unused reset token; the reset email is in the test inbox

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open the test inbox and copy the reset link URL | URL is saved |
| 2 | Click the reset link and complete the password reset with `NewPass1` | Reset completes successfully; user is redirected to login page |
| 3 | Paste the previously copied reset link URL into the browser address bar and navigate to it | Page loads |
| 4 | Observe the page content | An error message is displayed stating the link is invalid or already used (e.g., "This reset link has already been used.") |
| 5 | Verify no password form is shown | Password fields are NOT visible |

**Pass Criteria:** Second use of the same reset link is rejected with an appropriate error; the password form is not accessible via the used token.
**Fail Criteria:** Used token is accepted again and password form is displayed; user could potentially set a different password using the same token.

---

#### TC-004-04: Tampered reset token is rejected
**Scenario:** TS-004-04
**Priority:** Critical
**Automation Candidate:** Yes (API level)
**Preconditions:** A valid reset email has been generated for `validuser@test.com`; tester can modify URL parameters

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open the test inbox and copy the reset link URL | URL with token is available (e.g., `https://app.example.com/reset?token=abc123xyz`) |
| 2 | Modify the token value in the URL by changing one character (e.g., `abc123xyz` → `abc124xyz`) | Modified URL is ready |
| 3 | Navigate to the modified URL in the browser | Page loads |
| 4 | Observe the page content | An error is displayed stating the link is invalid (e.g., "Invalid or expired reset link.") |
| 5 | Verify the error message does not reveal which part of the token is wrong | Generic "invalid" message is shown without token structure hints |

**Pass Criteria:** Any modification to the token results in rejection with a generic invalid-link message; no password form is displayed.
**Fail Criteria:** Tampered token is accepted; or error message reveals token structure (e.g., "checksum mismatch") that aids forgery.

---

#### TC-005-01: Valid new password accepted — reset completes successfully
**Scenario:** TS-005-01
**Priority:** Critical
**Automation Candidate:** Yes
**Preconditions:** User is on the new password form (arrived via a valid, unexpired reset link for `validuser@test.com`)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click into the **New Password** field | Field receives focus |
| 2 | Type `Newpass1` (8 chars, includes number) | Password is entered (masked by default) |
| 3 | Click into the **Confirm Password** field | Field receives focus |
| 4 | Type `Newpass1` | Confirmation matches |
| 5 | Click the **Reset Password** / **Save** button | Form is submitted |
| 6 | Observe the page | A success message is displayed and user is redirected to the login page |
| 7 | Verify the URL is the login page URL | Address bar shows login page path (e.g., `/login`) |

**Pass Criteria:** Valid password meeting all requirements is accepted; user is redirected to login page; a success confirmation is shown.
**Fail Criteria:** Valid password is rejected with an error; user is not redirected to login page after success.

---

#### TC-005-02: Password shorter than 8 characters is rejected
**Scenario:** TS-005-02
**Priority:** High
**Automation Candidate:** Yes
**Preconditions:** User is on the new password form via a valid reset link

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Type `Pass1` (5 chars, has a number) into the **New Password** field | Password entered |
| 2 | Type `Pass1` into the **Confirm Password** field | Confirmation entered |
| 3 | Click **Reset Password** | Form submission is blocked or returns an error |
| 4 | Observe the error message | Error states password must be at least 8 characters |
| 5 | Type `Passwor` (7 chars, no number) into the **New Password** field and submit | Error displayed: too short |
| 6 | Type `Password` (8 chars, no number) into the **New Password** field and submit | Error displayed: missing number |

**Pass Criteria:** Passwords under 8 characters are rejected with a clear "minimum 8 characters" error; the reset is not completed.
**Fail Criteria:** Short password is accepted and reset proceeds; or error message is absent.

---

#### TC-005-04: Password without a number is rejected
**Scenario:** TS-005-04
**Priority:** High
**Automation Candidate:** Yes
**Preconditions:** User is on the new password form via a valid reset link

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Type `PasswordNoNum` (13 chars, no number) into the **New Password** field | Password entered |
| 2 | Type `PasswordNoNum` into the **Confirm Password** field | Confirmation entered |
| 3 | Click **Reset Password** | Form submission is blocked or returns an error |
| 4 | Observe the error message | Error states password must include at least one number |

**Pass Criteria:** A password meeting length but lacking a number is rejected with a clear error referencing the number requirement.
**Fail Criteria:** Password without a number is accepted and reset completes.

---

#### TC-005-07: Password validation enforced server-side (bypass attempt)
**Scenario:** TS-005-07
**Priority:** Critical
**Automation Candidate:** Yes (API level)
**Preconditions:** A valid reset token has been obtained for `validuser@test.com`; tester has Postman or equivalent API client configured for the staging environment

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | In Postman, construct a POST request to the password reset API endpoint (e.g., `POST /api/reset-password`) | Request is ready |
| 2 | Set the request body with the valid token and a non-compliant password: `{"token": "<valid_token>", "password": "short"}` | Body is set |
| 3 | Send the request | Response is received |
| 4 | Verify the HTTP status code | Status is 400 Bad Request (or 422 Unprocessable Entity) |
| 5 | Verify the response body | Error message references password validation failure (min length or number requirement) |
| 6 | Repeat with `{"token": "<valid_token>", "password": "NoNumbers"}` | Status is 400; error references number requirement |

**Pass Criteria:** API rejects non-compliant passwords with 4xx status codes and descriptive error messages regardless of client-side bypass.
**Fail Criteria:** API accepts non-compliant passwords and returns 200, allowing password to be set without meeting requirements.

---

#### TC-006-03: Old password is invalidated immediately after reset
**Scenario:** TS-006-03
**Priority:** Critical
**Automation Candidate:** Yes
**Preconditions:** `validuser@test.com` has a known current password `OldPass1`; the password reset flow has just been completed setting the new password to `NewPass2`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | After reset completion, navigate to the login page | Login page loads |
| 2 | Enter `validuser@test.com` in the email field | Email entered |
| 3 | Enter `OldPass1` (the old password) in the password field | Password entered |
| 4 | Click **Log In** | Login attempt is made |
| 5 | Observe the page | Login fails; an error message is shown (e.g., "Incorrect email or password") |
| 6 | Verify the user is NOT logged in | User remains on the login page; no authenticated session is created |
| 7 | Enter `NewPass2` in the password field (keeping same email) | New password entered |
| 8 | Click **Log In** | Login succeeds; user is redirected to the authenticated home/dashboard |

**Pass Criteria:** Old password is rejected immediately after reset; new password allows login.
**Fail Criteria:** Old password is accepted after reset, granting unauthorized access; or new password is rejected.

---

#### TC-006-02: User can log in with new password after reset
**Scenario:** TS-006-02
**Priority:** Critical
**Automation Candidate:** Yes
**Preconditions:** Password reset for `validuser@test.com` completed with new password `NewPass1` within the current test session

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to the login page | Login page is displayed |
| 2 | Enter `validuser@test.com` in the email field | Email entered |
| 3 | Enter `NewPass1` in the password field | Password entered |
| 4 | Click the **Log In** button | Login request is submitted |
| 5 | Observe the result | User is authenticated and redirected to the post-login page (dashboard or home) |
| 6 | Verify the authenticated state | User's account name or avatar is visible; session cookie is set |

**Pass Criteria:** New password authenticates successfully; user reaches the post-login destination.
**Fail Criteria:** New password is rejected; user remains on login page with an error.

---

#### TC-007-04: Full password reset flow is completable by keyboard only
**Scenario:** TS-007-04
**Priority:** High
**Automation Candidate:** No (manual accessibility test)
**Preconditions:** User is on the login page; keyboard-only navigation mode (no mouse); screen reader disabled for this test (keyboard-only, not screen reader)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Press **Tab** repeatedly from the top of the login page until the "Forgot Password" link receives focus | Focus indicator (visible outline) moves to the "Forgot Password" link |
| 2 | Press **Enter** | Browser navigates to the email entry page |
| 3 | Press **Tab** to move focus to the email input field | Email field is focused |
| 4 | Type a valid email address (`validuser@test.com`) | Email is entered |
| 5 | Press **Tab** to move to the Submit button | Submit button is focused |
| 6 | Press **Enter** | Form submits; success message is shown |
| 7 | Check that the success confirmation message receives focus or is announced | Focus moves to the confirmation message or an appropriate container |
| 8 | Open the reset link from the test inbox and navigate via keyboard to the New Password field | New password field can be reached via Tab |
| 9 | Type a valid password, Tab to Confirm field, type the same password, Tab to Submit, press Enter | Reset completes; redirect to login page |

**Pass Criteria:** Every interactive element in the password reset flow is reachable and operable using Tab and Enter keys only, with a visible focus indicator at all times.
**Fail Criteria:** Any step requires a mouse click to proceed; focus is lost or trapped at any point; any form element is not keyboard-reachable.

---

## Coverage Validation Report

### Requirement → Test Coverage Mapping
| Requirement | Covered By |
|---|---|
| "Forgot Password" link present on login page | TS-001-01, TS-001-02, TC-001-01 |
| Clicking "Forgot Password" navigates to email entry page | TS-001-02, TC-001-01 |
| User enters their email on the reset request page | TS-002-01, TS-002-03, TS-002-04, TC-002-01, TC-002-03 |
| Valid registered email triggers reset email delivery | TS-003-01, TC-002-01 |
| Reset link sent by email (valid for 60 minutes) | TS-003-01, TS-004-01, TS-004-02, TC-004-01, TC-004-02 |
| Reset link expires after 60 minutes | TS-004-02, TC-004-02 |
| User clicks the link and lands on the new password form | TS-004-01, TC-004-01 |
| New password minimum 8 characters | TS-005-02, TS-005-03, TC-005-02 |
| New password must include at least one number | TS-005-04, TC-005-04 |
| Password validation enforced server-side | TS-005-07, TC-005-07 |
| After reset, user is redirected to login page | TS-006-01, TC-005-01 |
| Old password stops working immediately after reset | TS-006-03, TC-006-03 |
| User can log in with new password after reset | TS-006-02, TC-006-02 |
| Reset link is single-use only | TS-004-03, TC-004-03 |
| Tampered tokens are rejected | TS-004-04, TC-004-04 |
| No email enumeration (same response for registered/unregistered email) | TS-002-02, TS-002-07, TC-002-01 |
| Rate limiting on email submission | TS-002-06, TC-002-06 |
| Reset link uses HTTPS | TS-004-07, TC-004-01 (step 5) |
| Active sessions invalidated on reset | TS-006-04 |
| Accessibility: keyboard navigation | TS-007-04, TC-007-04 |
| Accessibility: screen reader support | TS-007-01, TS-007-02, TS-007-03 |
| Cross-browser compatibility | TS-004-05, Test Plan cross-browser phase |

### Automation Candidates
| Test Case | Reason |
|---|---|
| TC-001-01 | Simple navigation check — deterministic, fast, high ROI in regression |
| TC-002-01 | Core happy path — should be in every regression run |
| TC-002-03 | Input validation — easily parameterized across many invalid formats |
| TC-002-06 | Rate limiting — best validated via API-level automation, repeatable |
| TC-004-01 | Critical path — link opens form; must run on every deploy |
| TC-004-02 | Token expiry — critical security control; token timestamp can be seeded in test DB |
| TC-004-03 | Token reuse — critical security control; fully scriptable |
| TC-004-04 | Token tampering — API-level test; fast and repeatable |
| TC-005-01 | Full happy path E2E — highest value automation candidate |
| TC-005-02 | Boundary value (7 chars, 8 chars) — parameterizable |
| TC-005-04 | Negative validation — parameterizable alongside TC-005-02 |
| TC-005-07 | Server-side validation bypass — API test; essential security regression |
| TC-006-02 | Post-reset login — must be in every regression run |
| TC-006-03 | Old password invalidation — critical security control; fully scriptable E2E |

### Clarification Questions / Gaps
| # | Gap or Question |
|---|---|
| 1 | **Session invalidation scope:** When a password is reset, are ALL active sessions across all devices invalidated, or only the current session? The requirement "old password should stop working" implies full invalidation but the scope of session tokens is not specified. |
| 2 | **Second reset request behavior:** If a user requests a second reset before using the first link, is the first link immediately invalidated? This should be confirmed to prevent a window where two valid tokens exist simultaneously. |
| 3 | **Password reuse policy:** Can the user reset their password to the same password they currently have? No requirement addresses this. If not restricted, a user who is compromised could "reset" to the same weak password. |
| 4 | **Maximum token lifetime enforcement:** The 60-minute expiry must be enforced server-side. It is assumed this is not purely a client-side check — please confirm which layer performs the expiry validation. |
| 5 | **Locked or suspended accounts:** What happens if a user whose account is locked or suspended attempts to reset their password? The requirements do not address this flow. |
| 6 | **Reset link delivery failure:** If the email fails to deliver (e.g., invalid mail server), is there any user-facing retry mechanism or support fallback? |
| 7 | **Assumption made:** It is assumed the reset token is a cryptographically random, unguessable string (e.g., UUID v4 or equivalent entropy). If tokens are sequentially generated or based on predictable data (user ID + timestamp), token enumeration attacks become viable and additional security tests would be needed. |
