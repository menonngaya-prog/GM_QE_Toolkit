# QA Test Documentation: Password Reset Feature

**Application:** Web Application  
**Feature:** Password Reset  
**Version:** 1.0  
**Prepared By:** QA Engineering Team  
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

This document defines the testing strategy for the Password Reset feature of the web application. The password reset flow enables users to securely regain access to their accounts when they have forgotten their password. The strategy ensures comprehensive coverage of functional, security, usability, and integration aspects of the feature.

### 1.2 Scope

**In Scope:**
- "Forgot Password" link on the login page
- Email entry and validation form
- Reset link generation and delivery via email
- Reset link expiration (60-minute validity window)
- New password entry form and validation (minimum 8 characters, must include at least one number)
- Successful password reset and redirect to login page
- Invalidation of old password immediately after reset
- Error handling for invalid or expired links
- Security controls (token uniqueness, single-use links)

**Out of Scope:**
- Email service provider infrastructure
- Account creation or registration flows
- Two-factor authentication (unless directly integrated with reset flow)
- Password recovery via SMS or other non-email channels
- Backend database schema changes
- Mobile native application (iOS/Android) if separate from web

### 1.3 Testing Types

| Testing Type | Description | Priority |
|---|---|---|
| Functional Testing | Verify each step of the reset flow works as specified | High |
| Negative Testing | Validate correct behavior for invalid inputs and edge cases | High |
| Security Testing | Assess resistance to token guessing, link reuse, and injection attacks | High |
| Boundary Value Testing | Test password length boundaries (7, 8, 9 chars) and time expiration (59 min, 60 min, 61 min) | High |
| Usability Testing | Evaluate clarity of error messages and user experience | Medium |
| Integration Testing | Verify email delivery, redirect behavior, and session management | High |
| Regression Testing | Confirm existing login and authentication flows are unaffected | High |
| Cross-Browser Testing | Validate consistent behavior across major browsers | Medium |
| Accessibility Testing | Check form labels, focus management, and screen reader compatibility | Low |

### 1.4 Risk Assessment

| Risk | Likelihood | Impact | Severity | Mitigation |
|---|---|---|---|---|
| Reset tokens are predictable or guessable | Low | Critical | High | Verify cryptographically random token generation |
| Reset link does not expire at 60 minutes | Medium | High | High | Test at 59 min, 60 min, and 61 min boundaries |
| Old password remains valid after reset | Medium | Critical | High | Explicitly test old password invalidation immediately post-reset |
| Reset link can be used multiple times | Medium | High | High | Test link reuse after successful reset |
| Email not delivered or delayed significantly | Medium | High | High | Monitor email delivery time in test environment |
| Password validation rules not enforced | Medium | High | High | Test boundary values and edge cases for password rules |
| Reset flow exposes user account existence | Medium | Medium | Medium | Verify generic response for unregistered emails |
| Redirect after reset goes to wrong page | Low | Medium | Medium | Confirm redirect target is the login page |
| CSRF vulnerabilities in reset forms | Low | High | High | Verify CSRF tokens are present on all forms |
| SQL/XSS injection via email/password fields | Low | Critical | High | Test with special characters and known payloads |

### 1.5 Entry Criteria

- Password reset feature is fully developed and deployed to the test environment
- Test environment is stable and accessible
- Email delivery service (or test stub) is configured and operational
- Test accounts (registered users, unregistered emails) are set up
- Test data including valid and invalid email addresses is prepared
- All blocking bugs from prior testing phases are resolved
- Test cases are reviewed and approved by the QA lead

### 1.6 Exit Criteria

- All High-priority test cases executed with 100% pass rate
- All Medium-priority test cases executed with at least 95% pass rate
- No open Critical or High severity defects
- All security test cases pass
- Regression test suite passes with no new failures introduced
- Test execution report is reviewed and signed off by QA lead and Product Owner

---

## 2. Test Plan

### 2.1 Objectives

- Validate that the password reset flow functions correctly end-to-end for registered users
- Confirm that reset tokens expire after 60 minutes
- Ensure password validation rules (minimum 8 characters, at least one number) are enforced
- Verify that old passwords are invalidated immediately upon successful reset
- Confirm that the user is redirected to the login page after a successful reset
- Assess the security posture of the feature against common attack vectors
- Verify appropriate error handling and messaging throughout the flow

### 2.2 Test Environment

| Component | Details |
|---|---|
| Environment | QA / Staging |
| URL | https://staging.webapp.example.com |
| Browser Support | Chrome (latest), Firefox (latest), Safari (latest), Edge (latest) |
| Email Testing Tool | Mailhog / Mailtrap (test email capture) |
| Operating System | Windows 11, macOS 14 |
| Test Accounts | qa_user_1@test.com (registered), qa_user_2@test.com (registered), notregistered@test.com (unregistered) |
| Token Manipulation | Possible via test environment or direct DB query |
| Network | Standard broadband; also test on simulated slow connection |

### 2.3 Test Phases

**Phase 1 — Smoke Testing (Day 1)**
- Verify the "Forgot Password" link is accessible
- Submit a valid email and confirm the email is received
- Click the link, set a new password, and confirm login works

**Phase 2 — Functional Testing (Days 2–3)**
- Execute all functional test cases covering happy path and alternate flows
- Validate email form behavior, link delivery, password form validation, and redirect

**Phase 3 — Negative and Boundary Testing (Days 3–4)**
- Execute negative test cases: invalid email formats, unregistered emails, expired links, reused links, invalid passwords
- Execute boundary value tests for password length and token expiration time

**Phase 4 — Security Testing (Days 4–5)**
- Test token unpredictability and single-use enforcement
- Test for user enumeration via email submission response
- Test CSRF protection on reset forms
- Test injection attacks via email and password fields

**Phase 5 — Integration and Regression Testing (Days 5–6)**
- Confirm old password invalidation
- Verify login page redirect after reset
- Run regression suite for existing authentication flows

**Phase 6 — Cross-Browser and Usability Testing (Day 6)**
- Execute key scenarios across Chrome, Firefox, Safari, and Edge
- Review error messages for clarity and consistency

### 2.4 Defect Severity Definitions

| Severity | Description | Example |
|---|---|---|
| Critical | System crash or complete feature failure; security breach possible | Reset link allows account takeover; old password still works after reset |
| High | Major functionality broken; no workaround | Reset email never delivered; token never expires |
| Medium | Functionality partially broken; workaround exists | Incorrect error message displayed; redirect goes to dashboard instead of login |
| Low | Minor UI issue or cosmetic defect | Inconsistent font size on reset page; extra whitespace |

### 2.5 Dependencies

- Email delivery service must be operational in the test environment
- Test environment database must support direct querying for token validation tests
- System clock manipulation must be available (or token insertion must be possible) to test expiration scenarios
- Development team must provide token generation mechanism details for security review
- QA team must have access to registered test accounts with known credentials

---

## 3. Test Scenarios

### Group 1: Forgot Password Link and Navigation

| # | Scenario | Priority |
|---|---|---|
| SC-01 | Verify "Forgot Password" link is visible and accessible on the login page | High |
| SC-02 | Verify clicking "Forgot Password" navigates to the email entry page | High |
| SC-03 | Verify the email entry page displays correctly with appropriate form elements | Medium |
| SC-04 | Verify a "Back to Login" or equivalent navigation option is available on the email entry page | Low |
| SC-05 | Verify the page title or heading clearly communicates the purpose of the page | Low |

### Group 2: Email Submission

| # | Scenario | Priority |
|---|---|---|
| SC-06 | Verify a registered email address can be successfully submitted | High |
| SC-07 | Verify submission of an unregistered email address shows a generic success message (no user enumeration) | High |
| SC-08 | Verify submission of an invalid email format displays an appropriate error message | High |
| SC-09 | Verify submitting an empty email field displays a validation error | High |
| SC-10 | Verify the system sends exactly one reset email per valid submission | Medium |
| SC-11 | Verify submitting the form multiple times generates a new token (and optionally invalidates the old one) | Medium |
| SC-12 | Verify email addresses with special characters or subdomains are handled correctly | Medium |

### Group 3: Reset Email Delivery and Content

| # | Scenario | Priority |
|---|---|---|
| SC-13 | Verify the reset email is delivered to the registered address within a reasonable timeframe | High |
| SC-14 | Verify the reset email contains a valid, clickable reset link | High |
| SC-15 | Verify the reset email does not contain the user's password in plain text | High |
| SC-16 | Verify the reset email includes relevant context (app name, instructions, expiration notice) | Medium |
| SC-17 | Verify the reset link in the email uses HTTPS | High |
| SC-18 | Verify the reset email sender address and subject line are appropriate | Low |

### Group 4: Reset Link Behavior and Expiration

| # | Scenario | Priority |
|---|---|---|
| SC-19 | Verify the reset link is functional when accessed within 60 minutes of generation | High |
| SC-20 | Verify the reset link is rejected when accessed after 60 minutes of generation | High |
| SC-21 | Verify the reset link cannot be reused after a successful password reset | High |
| SC-22 | Verify the reset link cannot be reused after it has expired | High |
| SC-23 | Verify a tampered or malformed reset link displays an appropriate error page | High |
| SC-24 | Verify a reset link from a previous request is invalidated when a new one is generated | Medium |

### Group 5: New Password Entry and Validation

| # | Scenario | Priority |
|---|---|---|
| SC-25 | Verify a valid new password (8+ characters, includes a number) is accepted | High |
| SC-26 | Verify a password with fewer than 8 characters is rejected | High |
| SC-27 | Verify a password with 8 or more characters but no number is rejected | High |
| SC-28 | Verify a password with exactly 8 characters including a number is accepted | High |
| SC-29 | Verify a very long password (e.g., 128 characters) is accepted | Medium |
| SC-30 | Verify submitting mismatched password and confirm password fields shows an error | High |
| SC-31 | Verify submitting an empty password field displays a validation error | High |
| SC-32 | Verify password fields mask input by default | Medium |
| SC-33 | Verify password visibility toggle (if present) works correctly | Low |

### Group 6: Post-Reset Behavior

| # | Scenario | Priority |
|---|---|---|
| SC-34 | Verify the user is redirected to the login page after a successful password reset | High |
| SC-35 | Verify the old password no longer works after a successful reset | High |
| SC-36 | Verify the new password allows successful login immediately after reset | High |
| SC-37 | Verify any active sessions using the old password are invalidated after reset | Medium |
| SC-38 | Verify a confirmation message or notification is shown after successful reset | Medium |

### Group 7: Security

| # | Scenario | Priority |
|---|---|---|
| SC-39 | Verify reset tokens are sufficiently long and random (not guessable) | High |
| SC-40 | Verify CSRF protection is present on the email submission and password reset forms | High |
| SC-41 | Verify email field does not reflect XSS payloads | High |
| SC-42 | Verify password field does not allow SQL injection | High |
| SC-43 | Verify the reset link uses a secure, non-predictable token in the URL (not user ID or timestamp alone) | High |
| SC-44 | Verify rate limiting is applied to the email submission form | Medium |
| SC-45 | Verify that the response to an unregistered email is identical in timing to a registered email (prevent timing-based enumeration) | Medium |

---

## 4. Detailed Test Cases

---

### TC-001: Forgot Password Link Visible and Accessible on Login Page

**Test Case ID:** TC-001  
**Scenario Reference:** SC-01  
**Priority:** High  
**Test Type:** Functional  

**Preconditions:**
- User is on the login page
- User is not logged in

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to the application login page | Login page loads successfully |
| 2 | Inspect the login form area | A "Forgot Password" link or button is visible |
| 3 | Verify the link is keyboard accessible | The link is reachable via Tab key and activatable via Enter |
| 4 | Verify the link text clearly communicates its purpose | Text reads "Forgot Password" or equivalent clear label |

**Pass Criteria:** "Forgot Password" link is visible, readable, and accessible on the login page.  
**Fail Criteria:** Link is absent, hidden, or inaccessible via keyboard.

---

### TC-002: Navigate to Email Entry Page via Forgot Password Link

**Test Case ID:** TC-002  
**Scenario Reference:** SC-02  
**Priority:** High  
**Test Type:** Functional  

**Preconditions:**
- User is on the login page

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to the login page | Login page loads |
| 2 | Click the "Forgot Password" link | Browser navigates to the email entry page |
| 3 | Observe the page content | Page displays a form for entering the user's email address |
| 4 | Observe the page URL | URL reflects the forgot-password endpoint (e.g., /forgot-password) |

**Pass Criteria:** Clicking the link correctly navigates to the email entry page without errors.  
**Fail Criteria:** Navigation fails, page errors, or wrong page is displayed.

---

### TC-003: Submit Valid Registered Email Address

**Test Case ID:** TC-003  
**Scenario Reference:** SC-06  
**Priority:** High  
**Test Type:** Functional  

**Preconditions:**
- User is on the email entry page
- Test account `qa_user_1@test.com` is registered in the system

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Enter `qa_user_1@test.com` in the email field | Email is accepted into the field |
| 2 | Click the "Submit" or "Send Reset Link" button | Form is submitted |
| 3 | Observe the page response | A success message is displayed (e.g., "If this email is registered, you will receive a reset link.") |
| 4 | Check the test email inbox for `qa_user_1@test.com` | A password reset email is received within 2 minutes |

**Pass Criteria:** Submission succeeds, generic success message shown, and reset email is delivered to the registered address.  
**Fail Criteria:** Error is displayed for a valid registered email, or no email is delivered.

---

### TC-004: Submit Unregistered Email Address (User Enumeration Prevention)

**Test Case ID:** TC-004  
**Scenario Reference:** SC-07  
**Priority:** High  
**Test Type:** Security / Functional  

**Preconditions:**
- User is on the email entry page
- `notregistered@test.com` is confirmed to not be registered in the system

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Enter `notregistered@test.com` in the email field | Email is accepted into the field |
| 2 | Click the Submit button | Form is submitted |
| 3 | Observe the response message | The same generic success message is displayed as for a registered email |
| 4 | Check if any email is sent to the unregistered address | No email is delivered |

**Pass Criteria:** Identical generic response shown for unregistered email; no email delivered; no indication of whether the account exists.  
**Fail Criteria:** Response reveals whether the email is registered (e.g., "Email not found" vs "Reset link sent").

---

### TC-005: Submit Invalid Email Format

**Test Case ID:** TC-005  
**Scenario Reference:** SC-08  
**Priority:** High  
**Test Type:** Negative / Functional  

**Preconditions:**
- User is on the email entry page

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Enter `notavalidemail` in the email field | Text is entered |
| 2 | Click the Submit button | Form validation is triggered |
| 3 | Observe the error message | An appropriate validation error is shown (e.g., "Please enter a valid email address") |
| 4 | Repeat with `@nodomain.com`, `user@`, and `user @test.com` | Validation errors are shown for each |

**Pass Criteria:** All invalid formats are rejected with clear error messages; no submission is made to the backend.  
**Fail Criteria:** Invalid emails are accepted and submitted, or no error message is shown.

---

### TC-006: Submit Empty Email Field

**Test Case ID:** TC-006  
**Scenario Reference:** SC-09  
**Priority:** High  
**Test Type:** Negative / Boundary  

**Preconditions:**
- User is on the email entry page

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Leave the email field blank | Field remains empty |
| 2 | Click the Submit button | Form validation triggers |
| 3 | Observe the response | Error message displayed: "Email is required" or equivalent |

**Pass Criteria:** Empty submission is blocked with a clear required-field error.  
**Fail Criteria:** Empty form is submitted without error, or no error message is shown.

---

### TC-007: Reset Email Contains Valid Link

**Test Case ID:** TC-007  
**Scenario Reference:** SC-14, SC-17  
**Priority:** High  
**Test Type:** Functional / Security  

**Preconditions:**
- A valid reset email has been delivered to `qa_user_1@test.com`

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open the reset email in the test inbox | Email displays correctly |
| 2 | Locate the reset link in the email body | A clearly labeled reset link or button is present |
| 3 | Inspect the reset link URL | URL begins with `https://` (not `http://`) |
| 4 | Verify the URL contains a token parameter | URL contains a token (e.g., `?token=<random_string>`) |
| 5 | Click the link within 60 minutes of receipt | Password reset page loads correctly |

**Pass Criteria:** Email contains a clickable HTTPS link with a token parameter that opens the reset page.  
**Fail Criteria:** Link is absent, uses HTTP, contains no token, or leads to an error page.

---

### TC-008: Reset Link Valid Within 60 Minutes

**Test Case ID:** TC-008  
**Scenario Reference:** SC-19  
**Priority:** High  
**Test Type:** Functional / Boundary  

**Preconditions:**
- Reset email has been generated for `qa_user_1@test.com`
- Test environment supports token timestamp verification

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Generate a reset link for `qa_user_1@test.com` | Link is received |
| 2 | Wait 59 minutes (or manipulate system clock to T+59min) | Time elapses |
| 3 | Click/navigate to the reset link | Password reset form loads |
| 4 | Observe the page | Form is accessible and functional (not expired) |

**Pass Criteria:** Link is valid and the reset page loads at 59 minutes after generation.  
**Fail Criteria:** Link is incorrectly rejected before the 60-minute mark.

---

### TC-009: Reset Link Expires After 60 Minutes

**Test Case ID:** TC-009  
**Scenario Reference:** SC-20  
**Priority:** High  
**Test Type:** Functional / Boundary  

**Preconditions:**
- Reset email has been generated for `qa_user_1@test.com`
- Test environment supports clock manipulation or expired token insertion

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Generate a reset link for `qa_user_1@test.com` | Link is received |
| 2 | Advance system clock to T+61 minutes or insert an expired token into the DB | Time is beyond expiry |
| 3 | Navigate to the reset link | An error page or message is displayed |
| 4 | Observe the error message | Message indicates link has expired (e.g., "This reset link has expired. Please request a new one.") |

**Pass Criteria:** Expired link is rejected with an appropriate expiration error message; reset form is not shown.  
**Fail Criteria:** Expired link allows access to the password reset form.

---

### TC-010: Reset Link Cannot Be Reused After Successful Reset

**Test Case ID:** TC-010  
**Scenario Reference:** SC-21  
**Priority:** High  
**Test Type:** Security  

**Preconditions:**
- A valid reset link has been generated and used successfully to reset the password for `qa_user_1@test.com`

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Complete a full successful password reset using the reset link | Password is reset; user is redirected to login |
| 2 | Copy the reset link URL that was used | Link URL is retained |
| 3 | Navigate to the same reset link URL again | An error or rejection page is shown |
| 4 | Observe the error message | Message indicates link has already been used or is invalid |

**Pass Criteria:** Used reset link is rejected on second use; password form is not presented again.  
**Fail Criteria:** Used reset link is accepted again, allowing a second (potentially malicious) password reset.

---

### TC-011: Tampered Reset Link Is Rejected

**Test Case ID:** TC-011  
**Scenario Reference:** SC-23  
**Priority:** High  
**Test Type:** Security / Negative  

**Preconditions:**
- A valid reset link has been generated

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Obtain the reset link from the email | Link URL captured |
| 2 | Modify the token parameter (e.g., change last 3 characters) | Tampered URL created |
| 3 | Navigate to the tampered URL | Error page or invalid-link message is shown |
| 4 | Attempt to set a new password | Form is not accessible |

**Pass Criteria:** Tampered link is rejected; no reset form displayed; clear error message shown.  
**Fail Criteria:** Tampered link is accepted, or a generic application error is thrown without a user-friendly message.

---

### TC-012: Valid Password Accepted (8 Characters, Includes Number)

**Test Case ID:** TC-012  
**Scenario Reference:** SC-25, SC-28  
**Priority:** High  
**Test Type:** Functional / Boundary  

**Preconditions:**
- User has clicked a valid, unexpired reset link and is on the password reset form

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Enter `Secure1a` in the new password field (8 chars, includes number) | Password is entered |
| 2 | Enter `Secure1a` in the confirm password field | Confirm field matches |
| 3 | Click the "Reset Password" button | Form is submitted successfully |
| 4 | Observe the result | Redirect to login page; success message shown |

**Pass Criteria:** Password meeting minimum requirements is accepted and reset completes.  
**Fail Criteria:** Valid password is rejected; error is displayed.

---

### TC-013: Password with Fewer Than 8 Characters Is Rejected

**Test Case ID:** TC-013  
**Scenario Reference:** SC-26  
**Priority:** High  
**Test Type:** Negative / Boundary  

**Preconditions:**
- User is on the password reset form with a valid token

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Enter `Pass1` in the new password field (5 chars, includes number) | Password entered |
| 2 | Enter `Pass1` in the confirm password field | Fields match |
| 3 | Click "Reset Password" | Validation error displayed |
| 4 | Observe error message | Message indicates password must be at least 8 characters |
| 5 | Enter `Pass123` (7 chars, includes numbers) | Password entered |
| 6 | Click "Reset Password" | Validation error displayed for 7-char password |

**Pass Criteria:** Passwords with fewer than 8 characters are rejected with a clear validation message.  
**Fail Criteria:** Short password is accepted, or no error is shown.

---

### TC-014: Password Without a Number Is Rejected

**Test Case ID:** TC-014  
**Scenario Reference:** SC-27  
**Priority:** High  
**Test Type:** Negative / Functional  

**Preconditions:**
- User is on the password reset form with a valid token

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Enter `SecurePassword` in the new password field (13 chars, no number) | Password entered |
| 2 | Enter `SecurePassword` in the confirm password field | Fields match |
| 3 | Click "Reset Password" | Validation error displayed |
| 4 | Observe error message | Message indicates password must contain at least one number |

**Pass Criteria:** Password lacking a number is rejected with a descriptive error message.  
**Fail Criteria:** Password without a number is accepted.

---

### TC-015: Mismatched Password and Confirm Password Fields

**Test Case ID:** TC-015  
**Scenario Reference:** SC-30  
**Priority:** High  
**Test Type:** Negative / Functional  

**Preconditions:**
- User is on the password reset form with a valid token

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Enter `NewPass1a` in the new password field | Password entered |
| 2 | Enter `NewPass2b` in the confirm password field | Different value entered |
| 3 | Click "Reset Password" | Validation error displayed |
| 4 | Observe error message | Message indicates passwords do not match |

**Pass Criteria:** Mismatched passwords are rejected with a clear mismatch error.  
**Fail Criteria:** Mismatched passwords are accepted, or no error is shown.

---

### TC-016: Old Password Is Invalidated After Reset

**Test Case ID:** TC-016  
**Scenario Reference:** SC-35  
**Priority:** High  
**Test Type:** Functional / Security  

**Preconditions:**
- `qa_user_1@test.com` has a known password: `OldPass1a`
- A successful password reset has been completed, setting the new password to `NewPass2b`

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to the login page | Login page loads |
| 2 | Enter `qa_user_1@test.com` and `OldPass1a` (old password) | Credentials entered |
| 3 | Click "Login" | Login fails |
| 4 | Observe error message | Message indicates invalid credentials |
| 5 | Enter `qa_user_1@test.com` and `NewPass2b` (new password) | Credentials entered |
| 6 | Click "Login" | Login succeeds |

**Pass Criteria:** Old password is rejected immediately after reset; new password grants access.  
**Fail Criteria:** Old password is still accepted after the reset.

---

### TC-017: Redirect to Login Page After Successful Reset

**Test Case ID:** TC-017  
**Scenario Reference:** SC-34  
**Priority:** High  
**Test Type:** Functional  

**Preconditions:**
- User has completed the password reset form with a valid new password

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Submit a valid new password on the reset form | Form submitted |
| 2 | Observe the browser URL after submission | URL changes to the login page (e.g., `/login`) |
| 3 | Observe the page displayed | Login form is visible |
| 4 | Check for a success notification | A success message or toast is displayed (e.g., "Password reset successfully. Please log in.") |

**Pass Criteria:** User is redirected to the login page and sees a success notification.  
**Fail Criteria:** User is redirected to a wrong page, or no redirect occurs, or success message is absent.

---

### TC-018: New Password Allows Successful Login

**Test Case ID:** TC-018  
**Scenario Reference:** SC-36  
**Priority:** High  
**Test Type:** Functional  

**Preconditions:**
- Password reset was completed for `qa_user_1@test.com` with new password `FreshPass9z`

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to the login page | Login page loads |
| 2 | Enter `qa_user_1@test.com` and `FreshPass9z` | Credentials entered |
| 3 | Click "Login" | Login is successful |
| 4 | Observe the landing page | User is logged in and taken to the application home/dashboard |

**Pass Criteria:** New password allows immediate successful login after reset.  
**Fail Criteria:** New password is rejected on the login page.

---

### TC-019: Password Field Masks Input

**Test Case ID:** TC-019  
**Scenario Reference:** SC-32  
**Priority:** Medium  
**Test Type:** Usability / Security  

**Preconditions:**
- User is on the password reset form

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Click on the new password field | Field is focused |
| 2 | Type any characters | Characters appear as dots or asterisks (masked) |
| 3 | Repeat for the confirm password field | Same masking behavior |

**Pass Criteria:** Both password fields mask input by default.  
**Fail Criteria:** Password characters are visible in plain text.

---

### TC-020: CSRF Token Present on Reset Forms

**Test Case ID:** TC-020  
**Scenario Reference:** SC-40  
**Priority:** High  
**Test Type:** Security  

**Preconditions:**
- User is on the email submission form
- Browser developer tools are available

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open developer tools and inspect the email submission form | Form HTML is visible |
| 2 | Look for a hidden CSRF token field or X-CSRF header | A CSRF token is present |
| 3 | Navigate to the password reset form (via valid link) | Reset form loads |
| 4 | Inspect the reset form for a CSRF token | CSRF token is present on this form too |
| 5 | Attempt to submit the email form without the CSRF token (via direct API call) | Request is rejected with 403 Forbidden or equivalent |

**Pass Criteria:** CSRF tokens are present on both forms and are enforced server-side.  
**Fail Criteria:** CSRF token is absent or not enforced.

---

### TC-021: Rate Limiting on Email Submission

**Test Case ID:** TC-021  
**Scenario Reference:** SC-44  
**Priority:** Medium  
**Test Type:** Security  

**Preconditions:**
- User is on the email entry page

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Submit a valid email address 10 times in rapid succession | Requests are submitted |
| 2 | Observe the response after repeated submissions | After a threshold (e.g., 5 attempts), a rate limit message is displayed or requests are blocked |
| 3 | Note the HTTP response code on blocked requests | Response is 429 Too Many Requests or equivalent |

**Pass Criteria:** Rate limiting is enforced after excessive submissions; error message guides the user.  
**Fail Criteria:** Unlimited submissions are accepted without throttling.

---

### TC-022: XSS Injection via Email Field

**Test Case ID:** TC-022  
**Scenario Reference:** SC-41  
**Priority:** High  
**Test Type:** Security  

**Preconditions:**
- User is on the email entry page

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Enter `<script>alert('XSS')</script>@test.com` in the email field | Value entered |
| 2 | Click Submit | Form is submitted or rejected |
| 3 | Observe the page response | No JavaScript alert fires; value is escaped or rejected |
| 4 | Inspect the response body for the injected value | Value is HTML-encoded or not reflected |

**Pass Criteria:** XSS payload is not executed; value is properly escaped or rejected.  
**Fail Criteria:** JavaScript alert fires or XSS payload is reflected unescaped.

---

### TC-023: Password Reset with Very Long Password

**Test Case ID:** TC-023  
**Scenario Reference:** SC-29  
**Priority:** Medium  
**Test Type:** Boundary  

**Preconditions:**
- User is on the password reset form with a valid token

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Enter a 128-character password containing at least one number in the new password field | Password entered |
| 2 | Enter the same 128-character password in the confirm field | Fields match |
| 3 | Click "Reset Password" | Form is submitted |
| 4 | Observe the result | Reset completes successfully; redirect to login page |

**Pass Criteria:** Long but valid password is accepted.  
**Fail Criteria:** Valid long password is rejected with an error.

---

### TC-024: Multiple Reset Requests — Previous Link Invalidated

**Test Case ID:** TC-024  
**Scenario Reference:** SC-24  
**Priority:** Medium  
**Test Type:** Security / Functional  

**Preconditions:**
- `qa_user_2@test.com` is a registered user

**Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Submit a reset request for `qa_user_2@test.com` | First reset email received; capture Link A |
| 2 | Submit another reset request for `qa_user_2@test.com` | Second reset email received; capture Link B |
| 3 | Attempt to use Link A (the first link) | Link A is rejected or shows an error |
| 4 | Use Link B (the second link) to reset the password | Reset form loads and password can be changed |

**Pass Criteria:** Earlier reset link is invalidated when a newer one is generated; only the most recent link is valid.  
**Fail Criteria:** Both links remain valid simultaneously.

---

## 5. Coverage Validation Report

### 5.1 Requirement-to-Test Mapping

| Requirement | Description | Test Cases | Status |
|---|---|---|---|
| REQ-01 | "Forgot Password" link on login page | TC-001, TC-002 | Covered |
| REQ-02 | Email entry page and submission | TC-003, TC-004, TC-005, TC-006 | Covered |
| REQ-03 | Reset link sent via email | TC-007 | Covered |
| REQ-04 | Reset link valid for 60 minutes | TC-008, TC-009 | Covered |
| REQ-05 | New password: minimum 8 characters | TC-012, TC-013 | Covered |
| REQ-06 | New password: must include a number | TC-012, TC-014 | Covered |
| REQ-07 | Redirect to login page after reset | TC-017 | Covered |
| REQ-08 | Old password invalidated immediately after reset | TC-016 | Covered |
| REQ-09 | New password allows login | TC-018 | Covered |
| REQ-10 | Reset link is single-use | TC-010 | Covered |
| REQ-11 | Reset link expires at 60 minutes | TC-009 | Covered |

### 5.2 Scenario Coverage Summary

| Group | Total Scenarios | Covered by Test Cases |
|---|---|---|
| Group 1: Navigation | 5 | TC-001, TC-002 |
| Group 2: Email Submission | 7 | TC-003, TC-004, TC-005, TC-006 |
| Group 3: Email Content | 6 | TC-007 |
| Group 4: Link Behavior | 6 | TC-008, TC-009, TC-010, TC-011, TC-024 |
| Group 5: Password Validation | 9 | TC-012, TC-013, TC-014, TC-015, TC-019, TC-023 |
| Group 6: Post-Reset | 5 | TC-016, TC-017, TC-018 |
| Group 7: Security | 7 | TC-020, TC-021, TC-022, TC-011, TC-004 |

### 5.3 Automation Candidates

The following test cases are strong candidates for test automation due to their deterministic nature and high execution frequency:

| Test Case | Reason for Automation |
|---|---|
| TC-003 | Core happy path; must run on every build |
| TC-005 | Email format validation is purely front-end rule-based |
| TC-006 | Required-field validation is consistent and fast |
| TC-009 | Token expiration logic is critical; automation avoids manual clock manipulation |
| TC-012 | Password validation happy path; run on every build |
| TC-013 | Password length boundary; deterministic |
| TC-014 | Number requirement; deterministic |
| TC-015 | Mismatch validation; deterministic |
| TC-016 | Old password invalidation; critical regression check |
| TC-017 | Redirect behavior; easily verifiable with automation |
| TC-018 | New password login; critical end-to-end path |
| TC-010 | Single-use link enforcement; critical security check |

### 5.4 Manual Testing Focus

The following test cases require manual attention or environment-specific setup:

| Test Case | Reason for Manual Testing |
|---|---|
| TC-008 | Requires careful timing or clock control |
| TC-020 | Requires network-level inspection of form submissions |
| TC-021 | Rate limiting behavior varies; requires tuning of threshold values |
| TC-022 | Security payload testing benefits from human review of output |
| TC-024 | Multi-step scenario requiring coordination of two email inboxes |

### 5.5 Coverage Gaps and Recommendations

| Gap | Description | Recommendation |
|---|---|---|
| G-01 | Active session invalidation after reset not fully tested | Add test case to verify all existing sessions are terminated upon password reset |
| G-02 | Email delivery time SLA not formally asserted | Define an SLA (e.g., 2 minutes) and add an automated email delivery timing check |
| G-03 | Accessibility testing not covered in detail | Add tests for screen reader compatibility, ARIA labels on password fields, and focus management |
| G-04 | Cross-browser execution of reset flow | Add a test matrix covering Chrome, Firefox, Safari, Edge with at least the happy path |
| G-05 | Token entropy / randomness not formally tested | Engage security team to review token generation algorithm and entropy |
| G-06 | International/unicode characters in password not tested | Add boundary test for passwords containing unicode characters |
| G-07 | Behavior when user is already logged in and accesses forgot-password flow | Define expected behavior and add test case |
| G-08 | Email delivery failure handling (SMTP errors) | Test application behavior when the email service is unavailable |

### 5.6 Overall Coverage Assessment

| Category | Coverage Level |
|---|---|
| Core Functional Requirements | High (all 11 requirements mapped) |
| Boundary Value Testing | High (7-char, 8-char, 128-char, 59-min, 60-min, 61-min) |
| Security Testing | Medium-High (CSRF, XSS, enumeration, token reuse, rate limiting) |
| Usability | Medium (error messages, masking; accessibility gap noted) |
| Cross-Browser | Low (identified as gap; recommended for next iteration) |
| Integration | Medium (email delivery, redirect, session management partially covered) |

**Overall Risk Confidence:** The test suite provides strong coverage of the highest-risk areas (security, core functional flow, and validation rules). The identified gaps are lower-risk but should be addressed in follow-up test iterations, particularly session invalidation and cross-browser testing.

---

*End of QA Test Documentation — Password Reset Feature*
