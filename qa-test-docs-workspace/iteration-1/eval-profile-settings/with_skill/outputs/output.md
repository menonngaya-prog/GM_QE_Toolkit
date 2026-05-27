# QA Test Documentation — User Profile Settings Page

**Feature:** User Profile Settings  
**Platform:** Web (React Frontend)  
**Testing Type:** E2E/UI, Integration, Security  
**Version:** 1.0  
**Date:** 2026-05-26  

---

## Test Strategy — User Profile Settings

### Purpose

The User Profile Settings page allows authenticated users to manage their personal account information and preferences. Users can update their display name, change their registered email address, upload a profile photo, toggle email notification preferences, and permanently delete their account. This strategy exists to ensure that all settings behave correctly according to their specified rules (character limits, file constraints, confirmation flows), that auto-save and explicit-save mechanisms work as designed, and that sensitive operations (email change, account deletion) are protected by appropriate confirmation steps.

### Scope

**In Scope:**
- Display name update (3–50 character validation, auto-save behaviour)
- Email address change (password confirmation requirement, validation)
- Profile photo upload (JPEG/PNG only, max 5MB, preview and persistence)
- Email notification toggle (on/off, auto-save behaviour)
- Account deletion (requires typing 'DELETE' to confirm, irreversibility)
- Auto-save for display name and notification toggle
- Explicit confirmation dialogs for email change and account deletion
- Client-side and server-side validation for all fields
- Security: unauthenticated access prevention, password confirmation bypass attempts
- Accessibility: keyboard navigation, screen reader labels, contrast
- Cross-browser compatibility

**Out of Scope:**
- Backend email delivery and deliverability testing
- Database-level data persistence verification beyond API response
- Password reset flow (separate feature)
- OAuth/SSO account management
- Billing or subscription settings
- Admin-side user management

### Testing Types

| Type | Coverage | Tool |
|---|---|---|
| Functional / E2E | All five settings areas; happy paths, negative cases, edge cases, auto-save and explicit-save flows | Playwright / Cypress |
| Integration | API calls for save operations, photo upload endpoint, account deletion endpoint | Playwright API assertions / Postman |
| Security | Password confirmation bypass attempts on email change; unauthenticated access; malicious file upload; account deletion CSRF | OWASP ZAP, manual penetration testing |
| Performance | Profile photo upload with 5MB file; page load time for settings page | Lighthouse, k6 |
| Accessibility | WCAG 2.1 AA — keyboard navigation, screen reader labels on all form controls, focus management in confirmation dialogs | axe-core, VoiceOver, NVDA |
| Cross-browser | Chrome, Firefox, Safari, Edge — all critical paths including file upload and modal dialogs | BrowserStack |
| Regression | Full automated suite run on every deployment | Automated suite (Playwright) |

### Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Auto-save triggers unintended display name change (e.g. user pauses mid-edit) | Medium | Medium | Verify debounce/blur-based save; test partial input retention on page refresh |
| Account deletion is irreversible — accidental deletion if confirmation is weak or bypassable | Low | Critical | Test all paths to bypass 'DELETE' confirmation; verify UI disables confirm button until exact string is typed |
| Email change locks user out if confirmation is sent to wrong address or old address is invalidated prematurely | Low | Critical | Test email change flow end-to-end; verify old email remains active until new email is confirmed |
| Password confirmation for email change can be brute-forced or replayed | Low | High | Test rate limiting on confirmation endpoint; verify CSRF token on form submission |
| Malicious file upload (executable disguised as JPEG/PNG, oversized file) | Medium | High | Test with non-image MIME types, mismatched extensions, files >5MB, and files exactly at 5MB boundary |
| Profile photo URL persists after account deletion (data retention risk) | Low | High | Verify photo assets are purged on account deletion |
| Notification toggle auto-save fails silently — user believes preference was saved but it was not | Medium | Medium | Assert API call is made and response is confirmed on toggle; verify persistence after page reload |
| React state desync — settings page shows stale values after successful save | Medium | Medium | Verify UI reflects server-confirmed state after each save operation |

### Entry Criteria

- User Profile Settings page is deployed to staging environment
- All five settings sections are functional (display name, email, photo, notifications, account deletion)
- API endpoints for all settings operations are available and documented
- Test accounts created: standard user, user with existing profile photo, user with notifications enabled
- Test environment is seeded with known data
- Browser test matrix is configured in BrowserStack

### Exit Criteria

- All Critical and High priority test cases have passed
- Zero open Critical defects; zero open High defects without an accepted workaround
- All security test cases passed (no bypass possible for email change or account deletion)
- Accessibility audit shows no WCAG 2.1 AA violations
- Cross-browser testing completed on Chrome, Firefox, Safari, and Edge
- Coverage Validation Report confirms 100% of stated requirements are covered
- Regression suite passes with no new failures

---

## Test Plan — User Profile Settings

### Objectives

1. Verify that display name and email notification toggle changes auto-save correctly with proper validation, and that saved values persist after page reload.
2. Verify that email address change requires valid current password confirmation before processing, and that the flow protects the user from unintended or unauthorised email changes.
3. Verify that profile photo upload enforces JPEG/PNG-only and 5MB maximum size constraints, and that uploaded photos display correctly and persist.
4. Verify that account deletion requires the user to type 'DELETE' exactly and cannot be completed without this confirmation, and that deletion is irreversible.

### Test Environment

| Environment | Detail |
|---|---|
| Staging URL | [staging URL] |
| API Base URL | [API base URL] |
| Browsers | Chrome 124+, Firefox 125+, Safari 17+, Edge 124+ |
| Devices | Desktop (1440px), Tablet (768px), Mobile (375px) |
| Test Accounts | `standard_user@test.com` — active user, no photo; `photo_user@test.com` — user with existing profile photo; `notif_on@test.com` — user with notifications enabled; `notif_off@test.com` — user with notifications disabled |

### Test Phases

| Phase | Scope | Duration |
|---|---|---|
| Smoke | Load settings page, verify all five sections render, basic API health check | Day 1 |
| Functional | All flows: display name, email change, photo upload, notifications toggle, account deletion — happy paths, validation, edge cases | Days 2–3 |
| Security | Password confirmation bypass on email change; 'DELETE' confirmation bypass; malicious file upload; unauthenticated access; CSRF | Day 3 |
| Accessibility | Screen reader traversal of all form controls; keyboard navigation through all dialogs; colour contrast | Day 4 |
| Cross-browser | Repeat critical paths (happy path per section + file upload + deletion dialog) on Firefox, Safari, Edge | Day 4 |
| Regression | Full automated suite against staging before release sign-off | Day 5 |

### Defect Severity Levels

| Severity | Definition | Example |
|---|---|---|
| Critical | Blocks core function or represents a security breach | Account deletion proceeds without 'DELETE' confirmation; email change succeeds without password |
| High | Major flow is broken with no acceptable workaround | Profile photo upload always fails; display name save silently does not persist |
| Medium | Feature degraded but workaround exists | Validation error message is missing but save is correctly blocked; notification toggle flickers |
| Low | Minor UX or cosmetic issue | Character counter for display name is misaligned; modal close button has low contrast |

### Dependencies

- Staging environment with User Profile Settings page deployed and accessible
- API endpoints operational: `PATCH /users/me/display-name`, `POST /users/me/email-change`, `POST /users/me/photo`, `PATCH /users/me/notifications`, `DELETE /users/me`
- File storage service available and accepting uploads in staging
- Email service available to receive confirmation emails in staging (Mailtrap or equivalent)
- Test data seeded: multiple test accounts in known states
- BrowserStack account with required browser/OS combinations configured

### Suspension Criteria

- Staging environment is down or Settings page is inaccessible
- API base is returning 5xx on all endpoints
- A Critical defect is found that blocks testing of downstream test cases (e.g. authentication broken, settings page crashes on load)
- Data seeding is corrupt, making test accounts unusable

---

## Test Scenarios

### TS-001 — Display Name Update

| ID | Scenario |
|----|----------|
| TS-001-01 | User updates display name with a valid value (3–50 chars) and name auto-saves on blur |
| TS-001-02 | User attempts to save a display name shorter than 3 characters — save is blocked with validation error |
| TS-001-03 | User attempts to save a display name longer than 50 characters — save is blocked with validation error |
| TS-001-04 | User enters a display name of exactly 3 characters — save succeeds |
| TS-001-05 | User enters a display name of exactly 50 characters — save succeeds |
| TS-001-06 | User enters a display name of 51 characters — save is blocked |
| TS-001-07 | User clears the display name field entirely — save is blocked (empty string fails minimum length) |
| TS-001-08 | Saved display name persists after full page reload |
| TS-001-09 | Display name auto-save does not trigger mid-keystroke (only on blur or debounce completion) |
| TS-001-10 | Display name field correctly reflects special characters (accents, hyphens, apostrophes) after save |

---

### TS-002 — Email Address Change

| ID | Scenario |
|----|----------|
| TS-002-01 | User enters a new valid email and correct current password — change request is accepted |
| TS-002-02 | User enters a new valid email but incorrect current password — change is rejected with error message |
| TS-002-03 | User enters an invalid email format — validation error shown, form not submitted |
| TS-002-04 | User enters the same email as the current email — appropriate error or warning shown |
| TS-002-05 | User submits the email change form with the password field empty — form not submitted |
| TS-002-06 | User submits the email change form with the new email field empty — form not submitted |
| TS-002-07 | Confirmation dialog or explicit submit button is required — email change does not occur on simple field blur |
| TS-002-08 | After successful email change request, user receives a confirmation prompt or notification |
| TS-002-09 | Multiple rapid form submissions do not result in duplicate email change requests |
| TS-002-10 | Unauthenticated request to email change endpoint returns 401 |

---

### TS-003 — Profile Photo Upload

| ID | Scenario |
|----|----------|
| TS-003-01 | User uploads a valid JPEG file under 5MB — photo uploads successfully and preview updates |
| TS-003-02 | User uploads a valid PNG file under 5MB — photo uploads successfully and preview updates |
| TS-003-03 | User attempts to upload a GIF file — upload is rejected with format error |
| TS-003-04 | User attempts to upload a PDF file — upload is rejected with format error |
| TS-003-05 | User attempts to upload a file larger than 5MB — upload is rejected with size error |
| TS-003-06 | User uploads a file exactly at 5MB — upload succeeds |
| TS-003-07 | User uploads a file of 1 byte over 5MB — upload is rejected |
| TS-003-08 | User uploads a file with a .jpg extension but with a PDF MIME type — upload is rejected |
| TS-003-09 | Uploaded profile photo persists after page reload |
| TS-003-10 | User with an existing photo can upload a new photo — old photo is replaced |

---

### TS-004 — Email Notifications Toggle

| ID | Scenario |
|----|----------|
| TS-004-01 | User with notifications OFF toggles to ON — preference auto-saves and UI confirms |
| TS-004-02 | User with notifications ON toggles to OFF — preference auto-saves and UI confirms |
| TS-004-03 | Toggle state persists after full page reload |
| TS-004-04 | Toggle state reflects server-side value, not just local React state |
| TS-004-05 | If the save API call fails (simulated network error), toggle reverts to previous state and error is surfaced |
| TS-004-06 | Toggle is accessible via keyboard (Space / Enter to activate) |
| TS-004-07 | Toggle has correct ARIA role and label for screen readers |

---

### TS-005 — Account Deletion

| ID | Scenario |
|----|----------|
| TS-005-01 | User types 'DELETE' (exact case) and confirms — account deletion proceeds |
| TS-005-02 | Confirm button is disabled until 'DELETE' is typed exactly |
| TS-005-03 | User types 'delete' (lowercase) — confirm button remains disabled |
| TS-005-04 | User types 'DELETE ' (trailing space) — confirm button remains disabled |
| TS-005-05 | User types 'DELET' (incomplete) — confirm button remains disabled |
| TS-005-06 | User opens deletion dialog and clicks Cancel — account is not deleted, user remains on settings page |
| TS-005-07 | User presses Escape key while deletion dialog is open — dialog closes, account is not deleted |
| TS-005-08 | After successful account deletion, user is redirected to a logged-out or confirmation page |
| TS-005-09 | After account deletion, attempting to log in with the deleted account credentials fails |
| TS-005-10 | Unauthenticated request to the account deletion endpoint returns 401 |

---

## Detailed Test Cases

### TC-001-01: Valid display name auto-saves on blur

**Scenario:** TS-001-01  
**Priority:** High  
**Automation Candidate:** Yes  
**Preconditions:** User is logged in and on the Profile Settings page. Current display name is "TestUser".

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Locate the **Display Name** input field on the Profile Settings page | Input field is visible and contains the current display name "TestUser" |
| 2 | Click into the **Display Name** field and clear the existing value | Field is empty and has focus |
| 3 | Type "Jane Doe" (8 characters) | Field displays "Jane Doe" |
| 4 | Click outside the input field (blur the field) | A save indicator (spinner, checkmark, or "Saved" text) appears briefly |
| 5 | Reload the page (F5 / Cmd+R) | Page reloads and the **Display Name** field displays "Jane Doe" |

**Pass Criteria:** Display name field shows "Jane Doe" after page reload, confirming the auto-save persisted the change to the server.  
**Fail Criteria:** Field reverts to "TestUser" after reload, or no save indicator is shown after blur, or an error is displayed.

---

### TC-001-02: Display name below 3 characters is rejected

**Scenario:** TS-001-02  
**Priority:** High  
**Automation Candidate:** Yes  
**Preconditions:** User is logged in and on the Profile Settings page.

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click into the **Display Name** input field | Field receives focus |
| 2 | Clear the field and type "Jo" (2 characters) | Field shows "Jo" |
| 3 | Click outside the input field (blur) | An inline validation error appears, e.g. "Display name must be at least 3 characters" |
| 4 | Verify that no network request is made to the save endpoint | Browser DevTools Network tab shows no PATCH request to the display name endpoint |
| 5 | Reload the page | Field reverts to the previously saved display name |

**Pass Criteria:** Validation error message is shown after blur; no API call is made; display name in the database is unchanged.  
**Fail Criteria:** No error message shown; API call is made with invalid value; display name is updated to "Jo" on the server.

---

### TC-001-04: Display name of exactly 3 characters saves successfully

**Scenario:** TS-001-04  
**Priority:** Medium  
**Automation Candidate:** Yes  
**Preconditions:** User is logged in and on the Profile Settings page.

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click into the **Display Name** field and clear it | Field is empty |
| 2 | Type "Ace" (3 characters) | Field shows "Ace" |
| 3 | Click outside the field to blur | Save indicator appears; no validation error is shown |
| 4 | Reload the page | Display name field shows "Ace" |

**Pass Criteria:** "Ace" is saved and displayed after reload with no errors.  
**Fail Criteria:** A validation error appears for a 3-character name, or the value is not persisted.

---

### TC-002-01: Email change succeeds with correct password

**Scenario:** TS-002-01  
**Priority:** Critical  
**Automation Candidate:** Yes  
**Preconditions:** User is logged in as `standard_user@test.com` with known password "TestPass123!". A distinct new email address `new_address@test.com` is available.

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Locate the **Change Email** section on the Profile Settings page | Section is visible with a **New Email** field and a **Current Password** field |
| 2 | Enter `new_address@test.com` in the **New Email** field | Field displays the new email |
| 3 | Enter "TestPass123!" in the **Current Password** field | Field shows masked characters |
| 4 | Click the **Confirm Email Change** (or equivalent) button | Button activates; a loading state is shown briefly |
| 5 | Observe the result on the page | A success message is shown, e.g. "A confirmation email has been sent to new_address@test.com" — or the email is updated immediately |
| 6 | Check that no error message is displayed | Page shows success state, not an error |

**Pass Criteria:** The email change request is accepted (HTTP 200/202 from API); a success confirmation is shown to the user; the old email address is not silently discarded without notification.  
**Fail Criteria:** An error is returned despite correct password; no feedback is given to the user; the API returns 4xx or 5xx.

---

### TC-002-02: Email change is rejected with incorrect password

**Scenario:** TS-002-02  
**Priority:** Critical  
**Automation Candidate:** Yes  
**Preconditions:** User is logged in as `standard_user@test.com`.

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Locate the **Change Email** section | Section is visible |
| 2 | Enter `another_email@test.com` in the **New Email** field | Field displays the value |
| 3 | Enter "WrongPassword999!" in the **Current Password** field | Field shows masked characters |
| 4 | Click the **Confirm Email Change** button | Button activates; loading state shown |
| 5 | Observe the result | An error message appears, e.g. "Incorrect password. Please try again." |
| 6 | Verify that the email has not changed by checking the current email display | Current email still shows `standard_user@test.com` |

**Pass Criteria:** API returns 401 or 403; error message is displayed to the user; no email change is made.  
**Fail Criteria:** Email is changed despite incorrect password; no error message shown; API returns 200.

---

### TC-003-01: Valid JPEG photo uploads and displays

**Scenario:** TS-003-01  
**Priority:** High  
**Automation Candidate:** Yes  
**Preconditions:** User is logged in on the Profile Settings page. A valid JPEG file `test_photo.jpg` (800×800px, 2MB) is available on the test machine.

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Locate the **Profile Photo** section | Current photo or placeholder avatar is visible; an **Upload Photo** or **Change Photo** button is present |
| 2 | Click the **Upload Photo** button | OS file picker dialog opens |
| 3 | Select `test_photo.jpg` from the file picker | File picker closes; upload begins |
| 4 | Observe the profile photo area | A progress indicator or loading state is shown during upload |
| 5 | Wait for upload to complete | The profile photo area displays the newly uploaded photo |
| 6 | Reload the page | The uploaded photo is still displayed as the profile photo |

**Pass Criteria:** The JPEG is accepted; the photo preview updates to show the new image; after reload the new photo persists; API returns 200 with a photo URL.  
**Fail Criteria:** An error is shown for a valid JPEG; the photo does not update; the upload silently fails.

---

### TC-003-03: GIF file upload is rejected

**Scenario:** TS-003-03  
**Priority:** High  
**Automation Candidate:** Yes  
**Preconditions:** User is logged in. A valid GIF file `animation.gif` (1MB) is available on the test machine.

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Locate the **Profile Photo** section and click **Upload Photo** | File picker opens |
| 2 | In the file picker, select `animation.gif` | (If the picker uses an `accept` attribute, GIF may be filtered out — attempt to override filter if possible) |
| 3 | Observe the result on the page | An error message is shown, e.g. "Only JPEG and PNG files are supported" |
| 4 | Verify the profile photo has not changed | Original photo or placeholder remains displayed |

**Pass Criteria:** GIF is rejected with a descriptive error message; no upload request is sent to the server (or the server rejects it with 400/415); photo is unchanged.  
**Fail Criteria:** GIF is accepted and displayed as the profile photo.

---

### TC-003-05: File larger than 5MB is rejected

**Scenario:** TS-003-05  
**Priority:** High  
**Automation Candidate:** Yes  
**Preconditions:** User is logged in. A JPEG file `large_photo.jpg` of 6MB is available on the test machine.

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Locate the **Profile Photo** section and click **Upload Photo** | File picker opens |
| 2 | Select `large_photo.jpg` (6MB JPEG) | File picker closes |
| 3 | Observe the result on the page | An error message appears, e.g. "File size must not exceed 5MB" |
| 4 | Verify no upload request is sent (check Network tab in DevTools) | No POST request to the photo upload endpoint, or server responds with 413 |

**Pass Criteria:** File is rejected before or at upload; error message is shown; profile photo is unchanged.  
**Fail Criteria:** 6MB file is accepted and stored.

---

### TC-003-06: File exactly at 5MB boundary is accepted

**Scenario:** TS-003-06  
**Priority:** Medium  
**Automation Candidate:** Yes  
**Preconditions:** User is logged in. A JPEG file `exact_5mb.jpg` of exactly 5,242,880 bytes (5MB) is available.

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click **Upload Photo** and select `exact_5mb.jpg` | Upload begins |
| 2 | Wait for upload to complete | Upload succeeds; new photo is displayed |
| 3 | Reload the page | Photo persists |

**Pass Criteria:** File at exactly 5MB is accepted with no error.  
**Fail Criteria:** A "file too large" error is shown for a file at exactly the stated limit.

---

### TC-004-01: Notifications toggle auto-saves and persists

**Scenario:** TS-004-01  
**Priority:** High  
**Automation Candidate:** Yes  
**Preconditions:** User is logged in as `notif_off@test.com` — notifications are currently OFF.

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Locate the **Email Notifications** toggle on the Profile Settings page | Toggle is visible and in the OFF/unchecked state |
| 2 | Click the **Email Notifications** toggle | Toggle animates to the ON/checked state; a brief loading or "Saved" indicator appears |
| 3 | Open the browser DevTools Network tab and verify the API call | A PATCH request was made to the notifications endpoint with `{"notifications": true}` and received a 200 response |
| 4 | Reload the page | Toggle is in the ON state |

**Pass Criteria:** Toggle switches to ON; API call confirms the save; state persists after reload.  
**Fail Criteria:** Toggle appears to switch but reverts after reload; no API call is made; API call returns an error.

---

### TC-004-05: Toggle reverts on API failure

**Scenario:** TS-004-05  
**Priority:** High  
**Automation Candidate:** Yes (with network mocking)  
**Preconditions:** User is logged in. Notifications are ON. Network interception tool (Playwright network mock or browser DevTools) configured to return 500 for the notifications PATCH endpoint.

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Intercept the notifications PATCH endpoint to return HTTP 500 | Interception rule is active |
| 2 | Click the **Email Notifications** toggle (currently ON → attempting OFF) | Toggle briefly shows OFF state |
| 3 | Wait for the API call to resolve (with simulated 500 error) | Toggle reverts to ON state; an error message appears, e.g. "Failed to save preference. Please try again." |
| 4 | Reload the page | Toggle remains in the ON state (server state was not changed) |

**Pass Criteria:** Toggle reverts to previous state on API failure; error is surfaced to the user; server state is unchanged.  
**Fail Criteria:** Toggle stays in the OFF state despite API failure; no error message shown; UI and server are out of sync.

---

### TC-005-01: Account deletion with exact 'DELETE' confirmation

**Scenario:** TS-005-01  
**Priority:** Critical  
**Automation Candidate:** Yes  
**Preconditions:** User is logged in as `delete_test@test.com` (a disposable test account created specifically for this test). Account exists in the database.

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Locate the **Delete Account** section on the Profile Settings page | A **Delete Account** button or link is visible |
| 2 | Click the **Delete Account** button | A confirmation dialog opens containing a text input field and a confirmation button that is currently disabled |
| 3 | Observe the confirmation button state before typing | The **Confirm Delete** button is disabled (greyed out, not clickable) |
| 4 | Type "DELETE" (all caps, no spaces) in the confirmation text field | The **Confirm Delete** button becomes enabled |
| 5 | Click the **Confirm Delete** button | A loading state is shown; the API DELETE request is sent |
| 6 | Wait for the result | User is redirected to a logged-out state, login page, or "account deleted" confirmation page |
| 7 | Attempt to log in with `delete_test@test.com` credentials | Login fails with "account not found" or equivalent error |

**Pass Criteria:** Account is deleted after typing 'DELETE' exactly and clicking confirm; user session is terminated; re-login with the same credentials fails.  
**Fail Criteria:** Account deletion proceeds without typing 'DELETE'; account is not deleted despite the full flow; user remains logged in after deletion.

---

### TC-005-02: Confirm button disabled until 'DELETE' is typed exactly

**Scenario:** TS-005-02  
**Priority:** Critical  
**Automation Candidate:** Yes  
**Preconditions:** User is logged in. The Delete Account confirmation dialog is open.

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open the **Delete Account** dialog | Confirmation input is empty; **Confirm Delete** button is disabled |
| 2 | Type "delete" (all lowercase) in the confirmation field | **Confirm Delete** button remains disabled |
| 3 | Clear the field and type "DELETE " (with trailing space) | **Confirm Delete** button remains disabled |
| 4 | Clear the field and type "DELET" (missing last character) | **Confirm Delete** button remains disabled |
| 5 | Clear the field and type "DELETE" (exact, no spaces) | **Confirm Delete** button becomes enabled |

**Pass Criteria:** The button is enabled only when the field contains the string "DELETE" — no variations, no trailing/leading whitespace accepted.  
**Fail Criteria:** Button becomes enabled for "delete", "DELETE " or "DELET"; or button is enabled at any point before the correct string is typed.

---

### TC-005-06: Clicking Cancel in deletion dialog does not delete account

**Scenario:** TS-005-06  
**Priority:** High  
**Automation Candidate:** Yes  
**Preconditions:** User is logged in.

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click the **Delete Account** button to open the confirmation dialog | Dialog opens |
| 2 | Type "DELETE" in the confirmation field | **Confirm Delete** button becomes enabled |
| 3 | Click the **Cancel** button (or the X close button on the dialog) | Dialog closes; user is returned to the Profile Settings page |
| 4 | Verify the page state | Profile Settings page is displayed; user is still logged in |
| 5 | Verify no delete API call was made (DevTools Network tab) | No DELETE request to the account deletion endpoint |

**Pass Criteria:** Dialog closes; user remains logged in with account intact; no deletion API call was made.  
**Fail Criteria:** Account is deleted after clicking Cancel; dialog does not close; user is logged out unexpectedly.

---

## Coverage Validation Report

### Requirement → Test Coverage Mapping

| Requirement | Covered By |
|---|---|
| Update display name (3–50 characters) | TS-001, TC-001-01, TC-001-02, TC-001-04 |
| Display name minimum 3 characters | TC-001-02 (below minimum), TC-001-04 (exactly 3) |
| Display name maximum 50 characters | TS-001-05 (exactly 50), TS-001-06 (51 chars rejected) |
| Display name auto-saves (no explicit submit) | TC-001-01, TS-001-09 |
| Change email requires current password confirmation | TC-002-01, TC-002-02 |
| Email change requires explicit confirmation (not auto-save) | TS-002-07 |
| Upload profile photo — JPEG only | TC-003-01 |
| Upload profile photo — PNG only | TS-003-02 |
| Upload profile photo — max 5MB | TC-003-05, TC-003-06, TS-003-07 |
| Reject non-JPEG/PNG file types | TC-003-03 (GIF), TS-003-04 (PDF) |
| Toggle email notifications on/off | TC-004-01, TC-004-02 |
| Email notification toggle auto-saves | TC-004-01, TC-004-02 |
| Delete account requires typing 'DELETE' to confirm | TC-005-01, TC-005-02 |
| Account deletion requires explicit confirmation (not auto-save) | TC-005-01, TC-005-06 |
| Cancel out of account deletion does not delete account | TC-005-06, TS-005-07 |

### Automation Candidates

| Test Case | Reason |
|---|---|
| TC-001-01 | Repeatable blur-triggered save flow; deterministic; high value as regression guard |
| TC-001-02 | Simple validation rule; runs fast; prevents regression of length enforcement |
| TC-001-04 | Boundary value test; important for regression; executes in seconds |
| TC-002-01 | Critical happy path; run on every deployment to catch auth integration regressions |
| TC-002-02 | Security-critical negative case; must never regress; fast to automate |
| TC-003-01 | File upload happy path; automatable with Playwright's `setInputFiles` API |
| TC-003-03 | File type rejection; fast to run; protects against MIME type validation removal |
| TC-003-05 | File size rejection; boundary condition; quick to automate |
| TC-003-06 | Boundary value (exactly 5MB); important edge case for regression |
| TC-004-01 | Toggle + auto-save pattern; verifiable via API call assertion; high regression value |
| TC-004-05 | Network failure handling; automatable with Playwright route interception |
| TC-005-01 | Critical path for irreversible action; run in isolated test environment |
| TC-005-02 | Exact string matching logic; fast to automate; critical security guardrail |
| TC-005-06 | Cancel path; verifiable with network assertion; important regression guard |

### Clarification Questions / Gaps

| # | Gap or Question |
|---|---|
| 1 | Auto-save trigger for display name: does save occur on blur (focus leaves the field), on a debounce timer while typing, or both? This affects TC-001-01 and TS-001-09 test steps and the debounce timing assertion. |
| 2 | Email change flow: does the new email take effect immediately upon form submission, or only after the user clicks a confirmation link sent to the new address? This determines whether the old email should remain functional during the confirmation window. |
| 3 | Is there a rate limit on failed password attempts for the email change form? If so, the limit and lockout behaviour should be tested. |
| 4 | Profile photo: is there a minimum file size or minimum image dimension requirement? No minimum is stated in the requirements. |
| 5 | Account deletion: are there soft-delete / grace period semantics (e.g., 30-day recovery window) or is deletion immediate and permanent? This affects TC-005-01 step 7 and the definition of "account deleted". |
| 6 | What happens if the user uploads a new profile photo while one is already uploading? The requirements do not specify concurrent upload behaviour. |
| 7 | Display name: are there any character restrictions beyond length (e.g. no special characters, no HTML/script injection allowed)? XSS via display name should be tested if markup rendering is possible. |
