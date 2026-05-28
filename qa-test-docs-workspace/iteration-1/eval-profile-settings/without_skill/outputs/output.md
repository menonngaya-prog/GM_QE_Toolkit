# QA Test Documentation: User Profile Settings Page

**Application:** Web App (React Frontend)
**Feature:** User Profile Settings
**Document Version:** 1.0
**Date:** 2026-05-26

---

## Table of Contents

1. [Test Strategy](#1-test-strategy)
2. [Test Plan](#2-test-plan)
3. [Test Scenarios](#3-test-scenarios)
4. [Detailed Test Cases](#4-detailed-test-cases)
5. [Coverage Validation Report](#5-coverage-validation-report)

---

## 1. Test Strategy

### 1.1 Overview

This Test Strategy defines the approach for validating the User Profile Settings page of a React-based web application. The page supports display name updates, email changes, profile photo uploads, email notification toggles, and account deletion. Several features auto-save while others require explicit user confirmation.

### 1.2 Scope

**In Scope:**
- Display name update (3–50 character validation)
- Email change workflow (requires current password confirmation)
- Profile photo upload (JPEG/PNG only, max 5 MB, with preview)
- Email notification toggle (on/off)
- Account deletion (requires typing 'DELETE' to confirm)
- Auto-save behavior for display name and notification toggle
- Explicit confirmation flows for email change and account deletion
- Client-side and server-side field validation
- Error handling and user feedback (success/error messages)
- Accessibility of interactive elements
- Responsive layout across common breakpoints

**Out of Scope:**
- Backend authentication service internals
- Email delivery infrastructure
- Third-party OAuth integrations
- Payment or billing settings
- Admin-side user management

### 1.3 Testing Types

| Testing Type | Purpose | Coverage Target |
|---|---|---|
| Functional Testing | Verify each feature behaves as specified | 100% of requirements |
| Boundary Value Analysis | Validate character limits (3, 50 chars) and file size (5 MB) | All numeric constraints |
| Negative / Error Path Testing | Confirm appropriate errors for invalid inputs | All validation rules |
| UI / Visual Testing | Verify layout, labels, and feedback messages render correctly | All UI states |
| Accessibility Testing | Verify keyboard navigation, ARIA labels, focus management | Key interactive elements |
| Cross-Browser Testing | Ensure consistent behavior across major browsers | Chrome, Firefox, Safari, Edge |
| Responsive Testing | Validate layout at mobile, tablet, and desktop breakpoints | 3 key breakpoints |
| Regression Testing | Confirm existing functionality is not broken by changes | Full feature set |
| Security Testing | Validate password confirmation, input sanitization, file-type enforcement | Authentication-gated actions |
| Performance Testing | File upload within acceptable time; page load within budget | Photo upload, page render |

### 1.4 Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Auto-save fires prematurely (e.g., on every keystroke) causing excessive API calls | Medium | High | Test debounce behavior; verify save triggers on blur/tab |
| Account deletion confirmation bypass (skipping 'DELETE' check) | Low | Critical | Dedicated negative tests; verify server-side guard |
| Non-image files accepted as profile photo (security/MIME spoofing) | Medium | High | Test MIME type and extension validation independently |
| Email change without password re-authentication | Low | Critical | End-to-end test of password confirmation gate |
| Large file upload causing browser hang or memory issues | Medium | Medium | Test at and just above 5 MB boundary |
| Email notification toggle state not persisted after page reload | Medium | High | Verify persistence with page refresh after toggle |
| Display name XSS via unsanitized input rendered in UI | Low | High | Test with script-tag payloads; verify escaping |
| Race condition between auto-save and manual confirmation actions | Low | Medium | Test concurrent interactions |
| Password field exposed in browser autocomplete/cache | Low | Medium | Verify autocomplete=off or new-password attribute |

### 1.5 Entry Criteria

- The User Profile Settings page is deployed to the test environment
- All APIs consumed by this page are available and returning valid responses
- Test environment has stable test user accounts pre-created
- Acceptance criteria and design mockups have been reviewed and signed off
- Test data (valid/invalid images, edge-case strings) is prepared

### 1.6 Exit Criteria

- All P1 (Critical) and P2 (High) test cases have passed
- Zero open Critical or High severity defects
- No more than 5% of Medium severity defects remain open (with documented acceptance)
- Test coverage meets or exceeds 95% of documented requirements
- Regression suite executed with no new failures
- Test summary report reviewed and approved by QA lead

---

## 2. Test Plan

### 2.1 Objectives

- Validate all five profile settings features against defined acceptance criteria
- Confirm validation rules are enforced on both client and server sides
- Verify auto-save operates correctly and does not degrade performance
- Ensure security-sensitive flows (email change, account deletion) require proper confirmation
- Identify defects and track them to resolution before release

### 2.2 Test Environment

| Environment Attribute | Details |
|---|---|
| Application | React web app (production build in staging) |
| Browsers | Chrome 120+, Firefox 120+, Safari 17+, Edge 120+ |
| OS | Windows 11, macOS 14, iOS 17 (mobile), Android 14 (mobile) |
| Screen Resolutions | 375px (mobile), 768px (tablet), 1440px (desktop) |
| Test User Accounts | Minimum 3: standard user, user with existing photo, user with notifications disabled |
| Network Conditions | Standard broadband; simulated 3G for upload performance tests |
| API Environment | Staging API with stubbed email delivery |
| Tools | Jest + React Testing Library (unit), Playwright (E2E), axe-core (accessibility), Chrome DevTools (performance) |

### 2.3 Test Phases

| Phase | Activities | Duration (Estimate) |
|---|---|---|
| Phase 1: Unit & Component Testing | Validate individual React components (inputs, modals, toggle) in isolation | 2 days |
| Phase 2: Integration Testing | Validate API calls, state management, and component interactions | 2 days |
| Phase 3: End-to-End Functional Testing | Full user-flow testing across all five features | 3 days |
| Phase 4: Boundary & Negative Testing | Edge cases, invalid inputs, file type/size limits | 1 day |
| Phase 5: Security Testing | Password bypass attempts, MIME spoofing, XSS probes | 1 day |
| Phase 6: Accessibility & Cross-Browser | WCAG 2.1 AA compliance, multi-browser execution | 1 day |
| Phase 7: Regression Testing | Full regression suite on release candidate | 1 day |

### 2.4 Defect Severity Levels

| Severity | Definition | Example |
|---|---|---|
| P1 - Critical | Feature completely broken; blocks user workflow; security vulnerability | Account deletion without 'DELETE' confirmation; email change without password |
| P2 - High | Major functionality broken; workaround not available | Profile photo upload silently fails; display name changes not persisted |
| P3 - Medium | Feature partially broken; workaround exists | Error message not displayed for oversized photo; toggle flickers on slow network |
| P4 - Low | Cosmetic or minor UX issue | Button alignment slightly off; tooltip text typo |

### 2.5 Dependencies

- Backend API endpoints for profile update, email change, photo upload, notifications, and account deletion must be stable
- Authentication service must support password re-confirmation endpoint
- File storage service must be accessible from staging environment
- Design team must finalize and lock UI specifications before Phase 3
- Test data including sample JPEG/PNG files at various sizes must be prepared by QA

### 2.6 Roles and Responsibilities

| Role | Responsibility |
|---|---|
| QA Engineer | Author and execute test cases; log defects; produce test summary |
| QA Lead | Review strategy and plan; approve exit criteria sign-off |
| Frontend Developer | Support unit test setup; resolve defects |
| Backend Developer | Confirm API contract; resolve server-side defects |
| Product Owner | Review acceptance criteria; approve release |

---

## 3. Test Scenarios

### 3.1 Display Name Update

| # | Scenario | Expected Outcome |
|---|---|---|
| DS-01 | Update display name with a valid name (within 3–50 characters) | Name saves automatically; success indicator shown |
| DS-02 | Enter a display name exactly 3 characters long | Accepted and saved |
| DS-03 | Enter a display name exactly 50 characters long | Accepted and saved |
| DS-04 | Enter a display name 2 characters long (below minimum) | Validation error shown; changes not saved |
| DS-05 | Enter a display name 51 characters long (above maximum) | Input rejected or truncated; error shown |
| DS-06 | Clear the display name field entirely (0 characters) | Validation error; field must not be blank |
| DS-07 | Enter a display name with leading/trailing spaces | Spaces trimmed or counted; behavior matches spec |
| DS-08 | Enter special characters and Unicode in display name | Accepted if within length; rendered correctly |
| DS-09 | Enter a script tag as display name (XSS attempt) | Input sanitized; script not executed in UI |
| DS-10 | Verify auto-save triggers on blur (focus leaves field) | API call made; name updated without manual submission |

### 3.2 Email Change

| # | Scenario | Expected Outcome |
|---|---|---|
| EC-01 | Change email with valid new address and correct current password | Confirmation modal shown; email updated on confirm |
| EC-02 | Submit email change with incorrect current password | Error message shown; email not changed |
| EC-03 | Enter an invalid email format (missing @) | Client-side validation error; form not submitted |
| EC-04 | Enter new email identical to current email | Error or informational message shown |
| EC-05 | Submit email change with empty password field | Validation error; submission blocked |
| EC-06 | Submit email change with empty new email field | Validation error; submission blocked |
| EC-07 | Cancel email change after entering new email and password | Form dismissed; email unchanged |
| EC-08 | Attempt to access email change without being authenticated | Redirected to login or 401 returned |
| EC-09 | Enter new email that is already registered to another account | Appropriate error shown (e.g., "Email already in use") |
| EC-10 | Verify password field is masked and does not autocomplete insecurely | Input type=password; autocomplete attribute set appropriately |

### 3.3 Profile Photo Upload

| # | Scenario | Expected Outcome |
|---|---|---|
| PH-01 | Upload a valid JPEG under 5 MB | Photo uploaded; preview updated; success message shown |
| PH-02 | Upload a valid PNG under 5 MB | Photo uploaded; preview updated; success message shown |
| PH-03 | Upload a file that is exactly 5 MB | Upload accepted (boundary inclusive check) |
| PH-04 | Upload a file slightly above 5 MB (e.g., 5.1 MB) | Upload rejected; error message shown |
| PH-05 | Attempt to upload a GIF file | Upload rejected; error: only JPEG/PNG accepted |
| PH-06 | Attempt to upload a PDF file | Upload rejected; error: only JPEG/PNG accepted |
| PH-07 | Attempt to upload a file renamed with .jpg extension but wrong MIME type | Upload rejected based on MIME type check |
| PH-08 | Upload a very small valid image (e.g., 1x1 pixel JPEG) | Upload accepted; preview shown (possibly small) |
| PH-09 | Cancel file selection before upload completes | No photo change occurs; previous photo retained |
| PH-10 | Upload a new photo when a profile photo already exists | Previous photo replaced; new photo displayed |

### 3.4 Email Notification Toggle

| # | Scenario | Expected Outcome |
|---|---|---|
| NT-01 | Toggle email notifications from ON to OFF | Toggle changes state; change auto-saved; success feedback shown |
| NT-02 | Toggle email notifications from OFF to ON | Toggle changes state; change auto-saved; success feedback shown |
| NT-03 | Reload page after toggling notifications OFF | Toggle remains in OFF state (persisted) |
| NT-04 | Reload page after toggling notifications ON | Toggle remains in ON state (persisted) |
| NT-05 | Toggle notifications rapidly multiple times | Final state is persisted correctly; no race conditions |
| NT-06 | Toggle notifications while on a slow network connection | Loading indicator shown; state confirmed on completion |
| NT-07 | Verify toggle is accessible via keyboard (Tab + Space/Enter) | Toggle activatable without mouse |

### 3.5 Account Deletion

| # | Scenario | Expected Outcome |
|---|---|---|
| AD-01 | Initiate account deletion and type 'DELETE' exactly | Deletion proceeds; user logged out and account removed |
| AD-02 | Initiate account deletion and type 'delete' (lowercase) | Deletion blocked; error or field invalidated |
| AD-03 | Initiate account deletion and type 'DELETE ' (trailing space) | Deletion blocked (exact match required) |
| AD-04 | Initiate account deletion and leave confirmation field empty | Delete/Confirm button remains disabled |
| AD-05 | Initiate account deletion and type a partial string (e.g., 'DEL') | Delete/Confirm button remains disabled |
| AD-06 | Click Cancel on the account deletion confirmation modal | Modal dismissed; account not deleted; user remains logged in |
| AD-07 | Attempt to delete account via direct API call without 'DELETE' confirmation | Server rejects request; account not deleted |
| AD-08 | Verify deletion confirmation button is disabled until 'DELETE' is typed | Button disabled state verified before and after correct input |
| AD-09 | Confirm account deletion completes: all user data removed, session terminated | User redirected to home/login; re-login fails |
| AD-10 | Attempt to access account deletion without active authentication | Redirected to login or 401 returned |

---

## 4. Detailed Test Cases

### TC-DS-001: Update Display Name with Valid Input

**Feature:** Display Name Update
**Priority:** P1 - Critical
**Type:** Functional

**Preconditions:**
- User is logged in and on the Profile Settings page
- Current display name is set to "OldName"

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Locate the Display Name input field | Field is visible, labeled "Display Name", contains current name "OldName" |
| 2 | Click on the Display Name field to focus it | Field receives focus; cursor is placed in field |
| 3 | Clear the existing content | Field is empty |
| 4 | Type "ValidName" (9 characters) | Characters appear in field |
| 5 | Click outside the field (blur) or press Tab | Focus leaves the field; auto-save is triggered |
| 6 | Observe the UI feedback | Success indicator (checkmark, toast, or "Saved" message) appears |
| 7 | Reload the page | Display name shows "ValidName" — persisted correctly |

**Pass Criteria:** Display name updates to "ValidName" without manual save button; persists after reload.
**Fail Criteria:** Name not saved; error shown for valid input; page requires manual save button.

---

### TC-DS-002: Display Name Below Minimum Length

**Feature:** Display Name Update
**Priority:** P2 - High
**Type:** Negative / Boundary

**Preconditions:**
- User is logged in and on the Profile Settings page

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Click on the Display Name input field | Field receives focus |
| 2 | Clear the field and type "AB" (2 characters) | Two characters appear in field |
| 3 | Click outside the field (blur) or press Tab | Validation is triggered |
| 4 | Observe the UI feedback | Error message shown (e.g., "Display name must be at least 3 characters") |
| 5 | Check whether an API call was made | No API call to save; name not updated |
| 6 | Reload the page | Previous valid display name is unchanged |

**Pass Criteria:** Error message displayed; changes not persisted; API not called.
**Fail Criteria:** 2-character name accepted and saved; no error shown.

---

### TC-DS-003: Display Name at Exact Minimum (3 Characters)

**Feature:** Display Name Update
**Priority:** P2 - High
**Type:** Boundary Value

**Preconditions:**
- User is logged in and on the Profile Settings page

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Click on the Display Name input field | Field receives focus |
| 2 | Clear the field and type "ABC" (3 characters) | Three characters appear |
| 3 | Click outside the field (blur) | Auto-save triggered |
| 4 | Observe feedback | Success indicator shown; no validation error |
| 5 | Reload the page | Display name shows "ABC" |

**Pass Criteria:** 3-character name accepted and persisted.
**Fail Criteria:** 3-character name rejected; error message shown.

---

### TC-DS-004: Display Name at Exact Maximum (50 Characters)

**Feature:** Display Name Update
**Priority:** P2 - High
**Type:** Boundary Value

**Preconditions:**
- User is logged in and on the Profile Settings page

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Click on the Display Name input field | Field receives focus |
| 2 | Clear the field and type a 50-character string (e.g., "AAAAAAAAAABBBBBBBBBBCCCCCCCCCCDDDDDDDDDDEEEEEEEEEE") | 50 characters appear; field accepts all of them |
| 3 | Click outside the field (blur) | Auto-save triggered |
| 4 | Observe feedback | Success indicator shown |
| 5 | Reload the page | 50-character name persisted correctly |

**Pass Criteria:** 50-character name accepted and persisted.
**Fail Criteria:** 50-character name rejected; name truncated without notice.

---

### TC-DS-005: Display Name XSS Sanitization

**Feature:** Display Name Update
**Priority:** P1 - Critical
**Type:** Security

**Preconditions:**
- User is logged in and on the Profile Settings page

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Click on the Display Name input field | Field receives focus |
| 2 | Clear the field and type: `<script>alert('XSS')</script>` | Characters appear in field (length check: 35 chars, within limit) |
| 3 | Click outside the field (blur) | Auto-save or validation triggered |
| 4 | Observe the browser | No alert dialog appears; script not executed |
| 5 | Check how the value is rendered in the UI | Displayed as literal text, not interpreted as HTML |
| 6 | Inspect the DOM for injected script elements | No script elements injected into DOM |

**Pass Criteria:** Script tag rendered as literal text; no JavaScript executed; value sanitized.
**Fail Criteria:** Alert dialog appears; script executes; unsanitized HTML rendered in DOM.

---

### TC-EC-001: Email Change with Valid Credentials

**Feature:** Email Change
**Priority:** P1 - Critical
**Type:** Functional

**Preconditions:**
- User is logged in and on the Profile Settings page
- User's current email is "user@example.com"
- User knows their current password "CurrentPass123!"

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Locate the Email section on the settings page | Current email displayed; "Change Email" button or input visible |
| 2 | Click "Change Email" or focus the new email field | Email change form/modal opens |
| 3 | Enter new email: "newemail@example.com" | Email entered in new email field |
| 4 | Enter current password: "CurrentPass123!" | Password entered in confirmation field (masked) |
| 5 | Click the "Confirm" or "Save Email" button | Request submitted |
| 6 | Observe UI feedback | Success message shown (e.g., "Email updated successfully" or "Verification email sent") |
| 7 | Reload the page | Email field shows "newemail@example.com" |

**Pass Criteria:** Email updated; success feedback shown; persisted after reload.
**Fail Criteria:** Email not updated; error shown for valid inputs; no feedback shown.

---

### TC-EC-002: Email Change with Incorrect Password

**Feature:** Email Change
**Priority:** P1 - Critical
**Type:** Negative / Security

**Preconditions:**
- User is logged in and on the Profile Settings page

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open the email change form | Form is displayed |
| 2 | Enter a valid new email: "another@example.com" | Email entered |
| 3 | Enter incorrect password: "WrongPass999!" | Password entered in masked field |
| 4 | Click "Confirm" | Request submitted |
| 5 | Observe UI feedback | Error message shown (e.g., "Incorrect password"); email not changed |
| 6 | Reload the page | Email unchanged from original |

**Pass Criteria:** Email not changed; clear error message displayed; API returns appropriate error.
**Fail Criteria:** Email changed despite wrong password; no error message shown.

---

### TC-EC-003: Email Change with Invalid Email Format

**Feature:** Email Change
**Priority:** P2 - High
**Type:** Negative / Validation

**Preconditions:**
- User is logged in and on the Profile Settings page

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open the email change form | Form is displayed |
| 2 | Enter invalid email: "notanemail" | Value entered in email field |
| 3 | Click "Confirm" or tab out of field | Client-side validation triggers |
| 4 | Observe UI feedback | Error message shown (e.g., "Please enter a valid email address") |
| 5 | Verify no API call was made | Network request not sent (confirm via DevTools) |

**Pass Criteria:** Validation error shown; no API request made.
**Fail Criteria:** Invalid email accepted; API call made; no error message displayed.

---

### TC-PH-001: Upload Valid JPEG Under 5 MB

**Feature:** Profile Photo Upload
**Priority:** P1 - Critical
**Type:** Functional

**Preconditions:**
- User is logged in and on the Profile Settings page
- A valid JPEG file (e.g., 2 MB, 800x800px) is available on the test machine

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Locate the profile photo section | Current photo (or placeholder) displayed; upload control visible |
| 2 | Click the upload button or the photo area | File picker dialog opens |
| 3 | Select the valid 2 MB JPEG file | File selected; dialog closes |
| 4 | Observe the UI | Preview of new photo displayed |
| 5 | Wait for upload to complete | Progress indicator (if present) completes; success message shown |
| 6 | Reload the page | New profile photo displayed |

**Pass Criteria:** Photo uploads successfully; preview shown; persisted after reload.
**Fail Criteria:** Upload fails; error shown for valid file; photo not updated after reload.

---

### TC-PH-002: Upload File Exceeding 5 MB

**Feature:** Profile Photo Upload
**Priority:** P2 - High
**Type:** Negative / Boundary

**Preconditions:**
- User is logged in and on the Profile Settings page
- A JPEG or PNG file slightly above 5 MB (e.g., 5.2 MB) is available

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Click the upload control | File picker dialog opens |
| 2 | Select the 5.2 MB JPEG file | File selected |
| 3 | Observe the UI | Error message shown (e.g., "File size must not exceed 5 MB") |
| 4 | Check that photo was not updated | Previous photo or placeholder still displayed |
| 5 | Verify no API call was made (or that server rejected it) | Upload blocked client-side or server returns error |

**Pass Criteria:** File rejected; clear error message shown; photo not changed.
**Fail Criteria:** 5.2 MB file accepted and uploaded; no error displayed.

---

### TC-PH-003: Upload Non-Image File (PDF)

**Feature:** Profile Photo Upload
**Priority:** P2 - High
**Type:** Negative / Security

**Preconditions:**
- User is logged in and on the Profile Settings page
- A PDF file is available

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Click the upload control | File picker dialog opens |
| 2 | Select the PDF file | File selected (file picker may or may not filter) |
| 3 | Observe the UI | Error message shown (e.g., "Only JPEG and PNG files are accepted") |
| 4 | Verify photo was not changed | Previous photo or placeholder still displayed |

**Pass Criteria:** PDF rejected; error message shown.
**Fail Criteria:** PDF accepted; photo updated or garbled image shown.

---

### TC-PH-004: Upload JPEG with Mismatched MIME Type

**Feature:** Profile Photo Upload
**Priority:** P1 - Critical
**Type:** Security

**Preconditions:**
- User is logged in and on the Profile Settings page
- A file with a non-image MIME type (e.g., a script or HTML file) renamed to "image.jpg" is available

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Click the upload control | File picker dialog opens |
| 2 | Select the renamed "image.jpg" file that has a non-image MIME type | File selected |
| 3 | Observe the UI | Upload rejected; error message displayed |
| 4 | Verify server-side rejection | API returns 400 or appropriate error if client-side check is bypassed |

**Pass Criteria:** File rejected based on MIME type, not just extension.
**Fail Criteria:** File accepted because it has a .jpg extension; malicious content uploaded.

---

### TC-NT-001: Toggle Email Notifications OFF and Verify Persistence

**Feature:** Email Notification Toggle
**Priority:** P2 - High
**Type:** Functional

**Preconditions:**
- User is logged in and on the Profile Settings page
- Email notifications are currently enabled (ON)

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Locate the Email Notifications toggle | Toggle is visible and shows ON state |
| 2 | Click the toggle to switch it OFF | Toggle animates to OFF state |
| 3 | Observe the UI | Success feedback shown (e.g., "Preferences saved"); auto-save triggered |
| 4 | Note: no separate Save button should be required | Change saved without extra click |
| 5 | Reload the page | Toggle shows OFF state — persisted correctly |

**Pass Criteria:** Toggle state changes to OFF; auto-saved; persisted after page reload.
**Fail Criteria:** Toggle reverts to ON after reload; no feedback shown; separate save required.

---

### TC-NT-002: Rapid Toggle Does Not Cause Race Condition

**Feature:** Email Notification Toggle
**Priority:** P3 - Medium
**Type:** Edge Case / Reliability

**Preconditions:**
- User is logged in and on the Profile Settings page
- Email notifications are currently enabled (ON)

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Click the toggle rapidly 5 times | Toggle cycles between ON and OFF states |
| 2 | Wait 3 seconds for all API calls to settle | No error messages; no spinning indefinitely |
| 3 | Note the final displayed state of the toggle | Toggle shows a definite ON or OFF state |
| 4 | Reload the page | Persisted state matches what was displayed before reload |

**Pass Criteria:** Final state is consistent and persisted; no error messages or UI hang.
**Fail Criteria:** Toggle stuck in indeterminate state; error shown; persisted state differs from displayed state.

---

### TC-AD-001: Account Deletion with Correct 'DELETE' Confirmation

**Feature:** Account Deletion
**Priority:** P1 - Critical
**Type:** Functional

**Preconditions:**
- User is logged in and on the Profile Settings page
- A dedicated test account (to be deleted) is used — not a shared account

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Locate the "Delete Account" button or section | Button/link is visible, clearly labeled with a destructive action warning |
| 2 | Click "Delete Account" | Confirmation modal or section appears |
| 3 | Read the confirmation message | Modal explains consequences and instructs user to type 'DELETE' |
| 4 | Leave the confirmation text field empty | Confirm/Delete button is disabled |
| 5 | Type "DELETE" (exactly, in uppercase) in the confirmation field | Text entered; Confirm button becomes enabled |
| 6 | Click the enabled "Confirm Delete" button | Deletion request submitted |
| 7 | Observe the outcome | User session terminated; redirected to login or home page |
| 8 | Attempt to log in with the deleted account's credentials | Login fails with "Account not found" or similar error |

**Pass Criteria:** Account deleted; user redirected; cannot log back in.
**Fail Criteria:** Account not deleted; user remains logged in; deleted account can still authenticate.

---

### TC-AD-002: Account Deletion Blocked by Incorrect Confirmation Text

**Feature:** Account Deletion
**Priority:** P1 - Critical
**Type:** Negative / Security

**Preconditions:**
- User is logged in and on the Profile Settings page

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Click "Delete Account" | Confirmation modal appears |
| 2 | Type "delete" (lowercase) in the confirmation field | Button remains disabled, OR error shown on submit |
| 3 | Attempt to submit (if button enabled despite wrong text) | Request blocked; error message shown |
| 4 | Clear and type "DELETE " (with trailing space) | Button remains disabled, OR error shown on submit |
| 5 | Clear and type "DELETED" | Button remains disabled, OR error shown on submit |
| 6 | Verify account is not deleted | Reload page; account still accessible |

**Pass Criteria:** All variants other than exact "DELETE" are rejected; account not deleted.
**Fail Criteria:** Any non-exact variant triggers deletion; case-insensitive match accepted.

---

### TC-AD-003: Account Deletion Cancelled

**Feature:** Account Deletion
**Priority:** P2 - High
**Type:** Functional

**Preconditions:**
- User is logged in and on the Profile Settings page

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Click "Delete Account" | Confirmation modal appears |
| 2 | Type "DELETE" in the confirmation field | Confirm button enabled |
| 3 | Click "Cancel" button | Modal closes without submitting |
| 4 | Observe the page state | User remains on Profile Settings page; logged in |
| 5 | Reload the page | Account still exists and is accessible |

**Pass Criteria:** Cancel dismisses modal; no deletion occurs; account intact.
**Fail Criteria:** Deletion proceeds after Cancel; account deleted.

---

### TC-AD-004: Account Deletion Confirmation Button State

**Feature:** Account Deletion
**Priority:** P2 - High
**Type:** UI / Validation

**Preconditions:**
- User is logged in and on the Profile Settings page

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Click "Delete Account" | Confirmation modal appears |
| 2 | Verify the Confirm button initial state | Button is disabled (grayed out, not clickable) |
| 3 | Type "D" | Button remains disabled |
| 4 | Type "DE" | Button remains disabled |
| 5 | Type "DEL" | Button remains disabled |
| 6 | Type "DELE" | Button remains disabled |
| 7 | Type "DELET" | Button remains disabled |
| 8 | Type "DELETE" | Button becomes enabled |
| 9 | Remove one character (back to "DELET") | Button becomes disabled again |

**Pass Criteria:** Button enables only when the exact string "DELETE" is present.
**Fail Criteria:** Button enables for partial input; button remains disabled for correct input.

---

## 5. Coverage Validation Report

### 5.1 Requirement-to-Test Mapping

| Requirement ID | Requirement Description | Test Scenarios | Test Cases | Coverage Status |
|---|---|---|---|---|
| REQ-01 | User can update display name (3–50 chars) | DS-01 through DS-10 | TC-DS-001 through TC-DS-005 | COVERED |
| REQ-01a | Min length = 3 characters | DS-02, DS-04 | TC-DS-002, TC-DS-003 | COVERED |
| REQ-01b | Max length = 50 characters | DS-03, DS-05 | TC-DS-004 | COVERED |
| REQ-01c | Auto-save on change | DS-01, DS-10 | TC-DS-001 | COVERED |
| REQ-02 | User can change email address | EC-01 through EC-10 | TC-EC-001 through TC-EC-003 | COVERED |
| REQ-02a | Email change requires current password | EC-01, EC-02 | TC-EC-001, TC-EC-002 | COVERED |
| REQ-02b | Email change requires explicit confirmation | EC-01, EC-07 | TC-EC-001 | COVERED |
| REQ-02c | Invalid email format rejected | EC-03 | TC-EC-003 | COVERED |
| REQ-03 | User can upload profile photo | PH-01 through PH-10 | TC-PH-001 through TC-PH-004 | COVERED |
| REQ-03a | Accepted formats: JPEG, PNG only | PH-01, PH-02, PH-05, PH-06 | TC-PH-001, TC-PH-003 | COVERED |
| REQ-03b | Max file size = 5 MB | PH-03, PH-04 | TC-PH-002 | COVERED |
| REQ-03c | MIME type validation (not just extension) | PH-07 | TC-PH-004 | COVERED |
| REQ-04 | User can toggle email notifications on/off | NT-01 through NT-07 | TC-NT-001, TC-NT-002 | COVERED |
| REQ-04a | Notification preference auto-saves | NT-01, NT-02 | TC-NT-001 | COVERED |
| REQ-04b | Preference persists after page reload | NT-03, NT-04 | TC-NT-001 | COVERED |
| REQ-05 | User can delete their account | AD-01 through AD-10 | TC-AD-001 through TC-AD-004 | COVERED |
| REQ-05a | Deletion requires typing 'DELETE' exactly | AD-01 through AD-05 | TC-AD-001, TC-AD-002, TC-AD-004 | COVERED |
| REQ-05b | Deletion requires explicit confirmation action | AD-01 | TC-AD-001 | COVERED |
| REQ-05c | Deletion can be cancelled | AD-06 | TC-AD-003 | COVERED |
| REQ-05d | Post-deletion: session terminated, account inaccessible | AD-01, AD-09 | TC-AD-001 | COVERED |

### 5.2 Test Coverage Summary

| Feature Area | Total Requirements | Scenarios Written | Test Cases Written | Coverage % |
|---|---|---|---|---|
| Display Name | 3 | 10 | 5 | 100% |
| Email Change | 3 | 10 | 3 | 100% |
| Profile Photo | 3 | 10 | 4 | 100% |
| Notifications | 2 | 7 | 2 | 100% |
| Account Deletion | 4 | 10 | 4 | 100% |
| **Total** | **15** | **47** | **18** | **100%** |

### 5.3 Automation Candidates

The following test cases are strong candidates for automation due to their deterministic nature and high frequency of execution:

| Test Case | Automation Type | Priority | Rationale |
|---|---|---|---|
| TC-DS-001 | E2E (Playwright) | High | Core happy path; run on every build |
| TC-DS-002, TC-DS-003, TC-DS-004 | E2E (Playwright) | High | Boundary values; fast and deterministic |
| TC-DS-005 | E2E (Playwright) | High | Security-critical; must not regress |
| TC-EC-002 | E2E (Playwright) | High | Security-critical; wrong password must always block |
| TC-EC-003 | Unit (React Testing Library) | Medium | Client-side validation; pure component logic |
| TC-PH-002 | E2E (Playwright) | High | File size boundary; deterministic with fixture files |
| TC-PH-003, TC-PH-004 | E2E (Playwright) | High | Security; file type validation |
| TC-NT-001 | E2E (Playwright) | High | Core happy path + persistence check |
| TC-AD-002 | E2E (Playwright) | High | Security-critical; exact string match |
| TC-AD-004 | E2E (Playwright) | Medium | Button state transitions; UI contract |

**Recommended for Manual Testing Only:**
- TC-PH-001 (validating visual photo preview quality is a human judgment call)
- TC-AD-001 (destructive action; use a dedicated disposable test account)
- TC-NT-002 (race condition timing is difficult to reliably reproduce in automation)
- Cross-browser visual verification
- Accessibility audit review

### 5.4 Coverage Gaps and Risks

| Gap / Risk | Description | Recommendation |
|---|---|---|
| Multi-tab behavior | No tests for changes made in one browser tab affecting another | Add scenario: open settings in two tabs; change name in one; check other tab |
| Session expiry during form fill | If session expires while user is filling email change form | Add scenario: simulate session timeout mid-flow |
| Slow network upload | No explicit test for upload progress UX on throttled connection | Add manual test with DevTools network throttling |
| Internationalized display names | Limited coverage of RTL characters, CJK characters, emoji | Add test cases for Unicode edge cases including emoji (which may be multi-byte) |
| Concurrent save operations | Display name and notification toggle changed simultaneously | Add scenario to verify both saves complete without conflict |
| Password complexity for email change | No test verifying password field accepts/rejects based on complexity (if applicable) | Clarify with dev team whether current password field has its own validation |
| Accessibility: screen reader announcement on auto-save | Auto-save success not verified for screen reader users | Add axe-core and manual screen reader test for live region announcements |
| Mobile-specific file picker behavior | File picker on iOS/Android may behave differently (e.g., camera option) | Add mobile-specific upload scenarios for iOS Safari and Chrome Android |

### 5.5 Defect Prevention Recommendations

1. **Define debounce timing for auto-save** — Document the exact delay (e.g., 500ms after last keystroke or on blur) so QA can verify correct behavior rather than guessing.
2. **Server-side validation as safety net** — Ensure all client-side validations are mirrored server-side to prevent API-level bypass.
3. **Idempotent deletion** — Verify the account deletion API is idempotent; a second DELETE request after deletion should return a clear error, not a 500.
4. **CSRF protection on all mutation endpoints** — Verify profile update, email change, photo upload, and account deletion all include CSRF token validation.
5. **Logging and alerting** — Verify that failed deletion confirmation attempts (wrong 'DELETE' text) are logged for security auditing purposes.

---

*End of QA Test Documentation — User Profile Settings Page*
*Generated: 2026-05-26 | Version 1.0*
