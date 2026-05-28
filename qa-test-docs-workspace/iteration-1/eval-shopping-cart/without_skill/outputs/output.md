# iOS Shopping Cart Feature — QA Documentation

**Product:** iOS Shopping App  
**Feature:** Shopping Cart  
**Document Version:** 1.0  
**Date:** 2026-05-26  
**Prepared By:** QA Engineering  

---

## Table of Contents

1. [Test Strategy](#1-test-strategy)
2. [Test Plan](#2-test-plan)
3. [Test Scenarios](#3-test-scenarios)
4. [Detailed Test Cases](#4-detailed-test-cases)
5. [Coverage Validation Report](#5-coverage-validation-report)

---

# 1. Test Strategy

## 1.1 Scope

### In Scope
- Adding items to the shopping cart
- Updating item quantities (range: 1–99)
- Removing items from the cart
- Applying and removing discount codes (percentage-off and fixed-amount)
- Running total calculation including tax at 8.5%
- Cart persistence across app sessions
- Proceeding to checkout from the cart
- Single discount code enforcement (only one active at a time)

### Out of Scope
- Checkout flow beyond the "Proceed to Checkout" action
- Payment processing
- Order confirmation and post-purchase flows
- Backend inventory management
- Push notifications related to cart (e.g., abandoned cart reminders)
- Wishlist / save-for-later functionality

---

## 1.2 Testing Types

| Testing Type | Description | Priority |
|---|---|---|
| Functional Testing | Validate all cart operations against requirements | High |
| Boundary/Edge Case Testing | Quantity limits (1, 99, 0, 100+), empty cart, zero-value discounts | High |
| UI/UX Testing | Layout, visual correctness of totals, error messages, accessibility | Medium |
| Regression Testing | Ensure new changes do not break existing cart functionality | High |
| Integration Testing | Cart interactions with product catalog, discount service, checkout service | High |
| Persistence Testing | Cart state survives app backgrounding, termination, and relaunch | High |
| Performance Testing | Cart load time with large number of items; responsiveness during quantity updates | Medium |
| Negative Testing | Invalid discount codes, quantity out of range, network failures | High |
| Exploratory Testing | Unscripted testing to discover edge cases not covered by formal tests | Medium |
| Accessibility Testing | VoiceOver compatibility, dynamic text scaling, color contrast | Low |
| Localization Testing | Currency formatting, decimal separators for supported locales | Low |

---

## 1.3 Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Incorrect tax calculation (8.5%) | Medium | High | Automated calculation tests with known values; verify rounding behavior |
| Cart data lost on session end | Medium | High | Persistence tests across cold launches, background/foreground cycles |
| Discount code applied multiple times | Low | High | State management tests; verify single-code enforcement |
| Quantity boundary not enforced (allows 0 or 100+) | Medium | Medium | Boundary value tests at 0, 1, 99, 100 |
| Race conditions during rapid quantity updates | Low | Medium | Stress/load tests; sequential and rapid update test cases |
| Incorrect discount type applied (percentage vs. fixed) | Medium | High | Separate test cases for each discount type with known codes |
| Total not recalculated after discount removal | Low | High | State transition tests; verify totals after every cart mutation |
| Checkout blocked when cart is empty | Low | Medium | Empty cart boundary test |
| Network failure during discount code validation | Medium | Medium | Offline/airplane mode tests; verify graceful error handling |
| UI does not reflect backend state after session restore | Medium | High | Full persistence cycle tests comparing pre/post session state |

---

## 1.4 Entry Criteria

- Feature implementation is code-complete and deployed to the QA test environment
- Unit tests authored by the development team are passing
- Test devices and simulators are provisioned and accessible
- Test data (product catalog, valid/invalid discount codes) is available and documented
- API endpoints for cart, discount, and checkout services are reachable from the test environment
- Build has passed smoke tests (app launches, basic navigation works)

---

## 1.5 Exit Criteria

- All High-priority test cases executed with a pass rate of 100%
- All Medium-priority test cases executed with a pass rate of ≥ 95%
- No open Critical or High severity defects
- Medium severity defects reviewed, triaged, and accepted by the product owner if deferred
- Regression suite executed and passing
- Test execution results documented and signed off by QA Lead and Product Owner

---

# 2. Test Plan

## 2.1 Objectives

1. Verify that all cart operations (add, update, remove) function correctly and update the UI in real time.
2. Confirm that tax is calculated at exactly 8.5% on the applicable subtotal, with correct rounding.
3. Validate that discount codes (percentage-off and fixed-amount) are applied correctly and that only one discount can be active at a time.
4. Ensure the cart state persists accurately across app sessions (background, foreground, and cold launch).
5. Verify that all boundary conditions for quantity (1–99) are enforced.
6. Confirm that the checkout flow is accessible from a populated cart and blocked (or shows an appropriate message) for an empty cart.
7. Identify defects and report them with sufficient detail for the development team to reproduce and fix.

---

## 2.2 Test Environment

### Devices

| Device | iOS Version | Purpose |
|---|---|---|
| iPhone 16 Pro (physical) | iOS 18.x (latest) | Primary functional and UI testing |
| iPhone SE 3rd Gen (physical) | iOS 17.x | Small screen layout; older OS validation |
| iPad Air (physical) | iOS 18.x | Tablet layout validation |
| iPhone 15 Simulator | iOS 17.x | Boundary and negative testing |
| iPhone 14 Simulator | iOS 16.x | Regression on older OS |

### Backend / Services
- Environment: QA/Staging (isolated from production)
- Discount code service: Staging endpoint with seeded test codes
- Cart persistence service: Staging server with reset capability between test runs

### Test Data Requirements
- Minimum 20 distinct product SKUs with known prices
- At least 5 valid percentage-off discount codes (e.g., 10%, 25%, 50%, 75%, 100%)
- At least 5 valid fixed-amount discount codes (e.g., $5, $10, $20, $50, $200)
- At least 5 invalid/expired discount codes
- A discount code with a value exceeding the cart total (for floor-at-zero validation)

---

## 2.3 Test Phases

### Phase 1: Smoke Testing (Day 1)
- Launch app and navigate to cart
- Add one item, verify it appears
- Update quantity, verify total updates
- Proceed to checkout entry point visible

**Exit gate:** Core cart operations functional. Proceed to Phase 2.

### Phase 2: Functional Testing (Days 2–4)
- Execute all High-priority test cases
- Cover: add/remove items, quantity updates, discount codes, tax calculation, persistence

**Exit gate:** All High-priority cases run; critical defects logged.

### Phase 3: Boundary and Negative Testing (Day 4–5)
- Quantity boundary cases (0, 1, 99, 100)
- Invalid and expired discount codes
- Empty cart checkout
- Network failure scenarios

**Exit gate:** All boundary and negative cases executed.

### Phase 4: Integration and Persistence Testing (Days 5–6)
- Session persistence (cold launch, background/foreground)
- Integration with discount service (latency, timeout)
- Integration with checkout entry

**Exit gate:** No data-loss defects open.

### Phase 5: Regression Testing (Day 7)
- Full regression suite executed against final build
- Sign-off documentation prepared

**Exit gate:** Regression pass rate ≥ 95%; no new Critical/High defects.

---

## 2.4 Defect Severity Levels

| Severity | Definition | Example |
|---|---|---|
| Critical | Feature is completely non-functional; data loss or financial error | Cart total shows wrong price, causing overcharge; cart data wiped on relaunch |
| High | Core functionality broken but workaround exists | Discount code not applied; quantity update not reflected in total |
| Medium | Feature partially works; minor financial impact | Tax rounding off by $0.01; discount removal requires two taps |
| Low | Cosmetic or minor UX issue | Misaligned text; spinner displayed longer than expected |

---

## 2.5 Dependencies

| Dependency | Owner | Risk if Unavailable |
|---|---|---|
| QA/Staging backend environment | DevOps | Cannot execute integration or persistence tests |
| Seeded discount code test data | Backend team | Discount code tests blocked |
| Physical test devices | QA Lab | Layout and on-device behavior tests deferred to simulator |
| Product catalog with known prices | Backend/Data team | Cannot verify exact total calculations |
| Checkout service stub/endpoint | Backend team | Checkout integration test blocked |

---

# 3. Test Scenarios

## 3.1 Add Items to Cart

| ID | Scenario |
|---|---|
| SC-ADD-01 | Add a single item from the product detail page and verify it appears in the cart |
| SC-ADD-02 | Add multiple different items and verify each appears with correct name and price |
| SC-ADD-03 | Add the same item multiple times and verify quantity increments (or separate lines merge) |
| SC-ADD-04 | Add an item when the cart is empty and verify the cart badge/count updates |
| SC-ADD-05 | Add an item when the cart already contains items and verify existing items are unaffected |
| SC-ADD-06 | Add an item, navigate away, return to cart and verify item still present |
| SC-ADD-07 | Attempt to add an out-of-stock item and verify appropriate error/prevention |

---

## 3.2 Update Item Quantities

| ID | Scenario |
|---|---|
| SC-QTY-01 | Increase item quantity from 1 to 5 and verify cart total updates correctly |
| SC-QTY-02 | Decrease item quantity from 5 to 1 and verify cart total updates correctly |
| SC-QTY-03 | Set item quantity to the maximum allowed value of 99 and verify acceptance |
| SC-QTY-04 | Attempt to set item quantity to 100 and verify rejection or capping at 99 |
| SC-QTY-05 | Attempt to set item quantity to 0 and verify item is removed or rejection is shown |
| SC-QTY-06 | Attempt to set item quantity to a negative number and verify rejection |
| SC-QTY-07 | Attempt to enter non-numeric characters in the quantity field and verify rejection |
| SC-QTY-08 | Update quantities of multiple items sequentially and verify totals remain accurate |
| SC-QTY-09 | Rapidly increment and decrement quantity using stepper controls and verify final state is accurate |

---

## 3.3 Remove Items from Cart

| ID | Scenario |
|---|---|
| SC-REM-01 | Remove the only item in the cart and verify the cart shows an empty state |
| SC-REM-02 | Remove one item from a multi-item cart and verify remaining items and totals are correct |
| SC-REM-03 | Remove an item that had a discount applied and verify the total recalculates correctly |
| SC-REM-04 | Remove all items one by one from a multi-item cart and verify empty state at the end |
| SC-REM-05 | Remove an item via swipe-to-delete gesture and verify removal |
| SC-REM-06 | Remove an item via a "Remove" button and verify removal |
| SC-REM-07 | Attempt to remove an item and cancel the confirmation (if applicable) and verify no change |

---

## 3.4 Discount Codes

| ID | Scenario |
|---|---|
| SC-DISC-01 | Apply a valid percentage-off discount code and verify the correct discount amount is deducted |
| SC-DISC-02 | Apply a valid fixed-amount discount code and verify the exact dollar amount is deducted |
| SC-DISC-03 | Apply an invalid discount code and verify an appropriate error message is shown |
| SC-DISC-04 | Apply an expired discount code and verify rejection with appropriate message |
| SC-DISC-05 | Apply one discount code, then attempt to apply a second and verify only one is active |
| SC-DISC-06 | Remove an applied discount code and verify the total returns to the pre-discount value |
| SC-DISC-07 | Apply a fixed-amount discount that exceeds the cart total and verify the total floors at $0 (not negative) |
| SC-DISC-08 | Apply a 100% off discount code and verify the total is $0 with tax handled correctly |
| SC-DISC-09 | Apply a discount code after updating item quantities and verify the discount recalculates |
| SC-DISC-10 | Verify discount code field is case-insensitive (if applicable) or shows clear formatting requirements |

---

## 3.5 Running Total and Tax Calculation

| ID | Scenario |
|---|---|
| SC-TAX-01 | Add a single item and verify the subtotal, tax (8.5%), and total are correctly displayed |
| SC-TAX-02 | Add multiple items and verify the subtotal equals the sum of all item prices × quantities |
| SC-TAX-03 | Verify that tax is calculated on the post-discount subtotal, not the pre-discount subtotal |
| SC-TAX-04 | Update an item quantity and verify the tax and total update immediately |
| SC-TAX-05 | Remove an item and verify the subtotal, tax, and total all update correctly |
| SC-TAX-06 | Apply and then remove a discount and verify the tax and total return to original values |
| SC-TAX-07 | Verify tax rounding behavior for prices that result in fractional cent amounts |
| SC-TAX-08 | Verify the cart total breakdown (subtotal, discount line, tax line, grand total) is clearly displayed |

---

## 3.6 Cart Persistence

| ID | Scenario |
|---|---|
| SC-PER-01 | Add items to cart, background the app, foreground it, and verify cart contents are intact |
| SC-PER-02 | Add items to cart, force-quit the app, relaunch, and verify cart contents are restored |
| SC-PER-03 | Add items with a discount code applied, force-quit the app, relaunch, and verify discount is still applied |
| SC-PER-04 | Update item quantities, force-quit, relaunch, and verify updated quantities are persisted |
| SC-PER-05 | Remove an item, force-quit, relaunch, and verify the removed item does not reappear |
| SC-PER-06 | Add items, leave the app for an extended period (e.g., 24 hours), return and verify cart state |
| SC-PER-07 | Log out and log back in as the same user and verify the cart is associated with the user account |

---

## 3.7 Proceed to Checkout

| ID | Scenario |
|---|---|
| SC-CHK-01 | Tap "Proceed to Checkout" with a populated cart and verify navigation to the checkout screen |
| SC-CHK-02 | Verify the "Proceed to Checkout" button is disabled or hidden when the cart is empty |
| SC-CHK-03 | Verify the total shown on the checkout entry matches the final cart total |
| SC-CHK-04 | Navigate to checkout and return to cart; verify cart state is unchanged |
| SC-CHK-05 | Proceed to checkout with a discount code applied and verify the discount carries over |

---

# 4. Detailed Test Cases

## TC-ADD-01: Add a Single Item to the Cart

**Related Scenario:** SC-ADD-01  
**Priority:** High  
**Preconditions:** User is logged in; product catalog is accessible; cart is empty.

| Step | Action | Expected Result |
|---|---|---|
| 1 | Launch the app and navigate to any product detail page | Product detail page is displayed with item name, image, and price |
| 2 | Tap the "Add to Cart" button | Loading indicator displays briefly |
| 3 | Observe the cart icon/badge in the navigation bar | Cart badge shows count of 1 |
| 4 | Navigate to the Cart screen | Cart screen displays the added item with correct name, price, and quantity of 1 |
| 5 | Verify the subtotal, tax, and total | Subtotal = item price; Tax = subtotal × 0.085; Total = Subtotal + Tax |

**Pass Criteria:** Item appears in cart with correct details; totals are mathematically correct.  
**Fail Criteria:** Item not added; incorrect price shown; totals do not match expected calculation.

---

## TC-QTY-03: Set Quantity to Maximum (99)

**Related Scenario:** SC-QTY-03  
**Priority:** High  
**Preconditions:** User is logged in; cart contains at least one item with quantity 1.

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to the Cart screen | Cart is displayed with the item |
| 2 | Tap the quantity field or stepper for the item | Quantity input becomes active |
| 3 | Clear the current value and type "99" (or tap increment until 99) | Field displays "99" |
| 4 | Confirm the quantity change (tap done, return, or tap elsewhere) | Item quantity updates to 99; no error message displayed |
| 5 | Verify the subtotal, tax, and total | Subtotal = item unit price × 99; Tax = Subtotal × 0.085; Total = Subtotal + Tax |

**Pass Criteria:** Quantity of 99 is accepted; totals correctly reflect 99 units.  
**Fail Criteria:** Quantity of 99 is rejected; total not updated; error shown for valid value.

---

## TC-QTY-04: Attempt to Set Quantity Above Maximum (100)

**Related Scenario:** SC-QTY-04  
**Priority:** High  
**Preconditions:** User is logged in; cart contains at least one item.

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to the Cart screen | Cart is displayed |
| 2 | Tap the quantity field for the item | Quantity input becomes active |
| 3 | Clear the current value and type "100" | Field displays "100" |
| 4 | Confirm the quantity change | System either caps the value at 99 and shows an informational message, OR rejects the entry and shows a validation error |
| 5 | Verify the final quantity displayed | Quantity is 99 or previous valid value; quantity of 100 is not persisted |
| 6 | Verify the totals | Totals reflect the valid quantity (99 or previous), not 100 |

**Pass Criteria:** Value 100 is not accepted; UI enforces the maximum of 99; appropriate user feedback shown.  
**Fail Criteria:** Quantity of 100 is accepted and used in calculations; no error or cap is applied.

---

## TC-QTY-05: Attempt to Set Quantity to Zero

**Related Scenario:** SC-QTY-05  
**Priority:** High  
**Preconditions:** User is logged in; cart contains at least one item with quantity ≥ 1.

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to the Cart screen | Cart is displayed |
| 2 | Tap the quantity field for the item | Quantity input becomes active |
| 3 | Clear the current value and type "0" | Field displays "0" |
| 4 | Confirm the change | System either removes the item with a confirmation prompt OR rejects the value with an error message |
| 5 | Verify the cart state | If removed: item no longer in cart; if rejected: item remains with previous valid quantity |

**Pass Criteria:** Quantity 0 results in item removal (with confirmation if appropriate) or is rejected; no item persists with quantity 0.  
**Fail Criteria:** Item remains in cart with quantity 0; total shows $0 for the item without removal.

---

## TC-DISC-01: Apply a Valid Percentage-Off Discount Code

**Related Scenario:** SC-DISC-01  
**Priority:** High  
**Preconditions:** User is logged in; cart contains items with a known subtotal; a valid 20% discount code "SAVE20" is available in test data.

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to the Cart screen | Cart is displayed with current subtotal |
| 2 | Note the current subtotal (e.g., $50.00) | Subtotal displayed clearly |
| 3 | Locate the discount code input field | Field is visible and active |
| 4 | Type "SAVE20" into the discount code field | Characters entered correctly |
| 5 | Tap "Apply" or equivalent button | Loading indicator shown briefly |
| 6 | Verify the discount line in the cart summary | Discount line appears showing "–$10.00" (20% of $50.00) |
| 7 | Verify the new subtotal after discount | Post-discount subtotal = $40.00 |
| 8 | Verify the tax calculation | Tax = $40.00 × 0.085 = $3.40 |
| 9 | Verify the grand total | Grand total = $40.00 + $3.40 = $43.40 |

**Pass Criteria:** Correct discount amount deducted; tax calculated on post-discount subtotal; grand total is mathematically correct.  
**Fail Criteria:** Wrong discount amount; tax calculated on pre-discount amount; grand total incorrect.

---

## TC-DISC-02: Apply a Valid Fixed-Amount Discount Code

**Related Scenario:** SC-DISC-02  
**Priority:** High  
**Preconditions:** User is logged in; cart subtotal is $60.00; valid fixed-amount code "FLAT10" deducts $10.00.

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to the Cart screen | Cart displayed with $60.00 subtotal |
| 2 | Enter "FLAT10" in the discount code field | Code entered |
| 3 | Tap "Apply" | Code validation in progress |
| 4 | Verify the discount line | "–$10.00" shown on discount line |
| 5 | Verify the post-discount subtotal | $50.00 |
| 6 | Verify the tax | $50.00 × 0.085 = $4.25 |
| 7 | Verify the grand total | $50.00 + $4.25 = $54.25 |

**Pass Criteria:** Fixed $10.00 deducted; remaining calculations correct.  
**Fail Criteria:** Incorrect deduction amount; discount treated as percentage; totals wrong.

---

## TC-DISC-05: Attempt to Apply a Second Discount Code

**Related Scenario:** SC-DISC-05  
**Priority:** High  
**Preconditions:** User is logged in; cart contains items; valid code "SAVE20" is already applied.

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to the Cart screen | Cart displayed with "SAVE20" applied and discount shown |
| 2 | Locate the discount code field | Field may show currently applied code or be partially hidden |
| 3 | Attempt to enter a second code "FLAT10" | User is either prevented from entering a second code, or a clear message explains only one code is allowed |
| 4 | Attempt to tap "Apply" for the second code | System rejects the second code; shows an error such as "Only one discount code can be applied at a time. Remove the current code to apply a new one." |
| 5 | Verify the cart totals | Original "SAVE20" discount is still active; no additional discount from "FLAT10" |

**Pass Criteria:** Second code rejected; only one discount active; user given clear guidance on how to switch codes.  
**Fail Criteria:** Two discounts applied simultaneously; total is double-discounted; no error message shown.

---

## TC-DISC-07: Fixed-Amount Discount Exceeds Cart Total

**Related Scenario:** SC-DISC-07  
**Priority:** High  
**Preconditions:** Cart subtotal is $15.00; valid fixed-amount code "FLAT50" deducts $50.00.

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to the Cart screen | Subtotal shows $15.00 |
| 2 | Enter "FLAT50" in the discount code field | Code entered |
| 3 | Tap "Apply" | Code is accepted (it is a valid code) |
| 4 | Verify the discount line | Discount shown as "–$15.00" (capped at cart total) OR "$50.00 discount applied" with total showing $0.00 |
| 5 | Verify the post-discount subtotal | $0.00 — not a negative value |
| 6 | Verify the tax | $0.00 × 0.085 = $0.00 |
| 7 | Verify the grand total | $0.00 |

**Pass Criteria:** Total floors at $0.00; no negative totals displayed; tax calculated on $0.00 base.  
**Fail Criteria:** Grand total shows a negative value; tax is calculated on a negative amount; app crashes.

---

## TC-TAX-01: Verify Tax Calculation for Single Item

**Related Scenario:** SC-TAX-01  
**Priority:** High  
**Preconditions:** Cart contains one item priced at $29.99; no discount applied.

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to the Cart screen | Item displayed with unit price $29.99 and quantity 1 |
| 2 | Read the subtotal displayed | Subtotal = $29.99 |
| 3 | Calculate expected tax: $29.99 × 0.085 | Expected tax = $2.549... → rounded to $2.55 (standard rounding) |
| 4 | Read the tax line displayed | Tax displayed = $2.55 |
| 5 | Calculate expected total: $29.99 + $2.55 | Expected total = $32.54 |
| 6 | Read the grand total displayed | Grand total = $32.54 |

**Pass Criteria:** Subtotal, tax (correctly rounded), and grand total match expected values.  
**Fail Criteria:** Tax rate is not 8.5%; rounding is inconsistent; total does not equal subtotal + tax.

---

## TC-TAX-03: Tax Applied on Post-Discount Subtotal

**Related Scenario:** SC-TAX-03  
**Priority:** High  
**Preconditions:** Cart subtotal is $100.00; valid 10% discount code "SAVE10" is available.

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to the Cart screen | Subtotal = $100.00; Tax = $8.50; Total = $108.50 |
| 2 | Apply discount code "SAVE10" | Discount of $10.00 applied |
| 3 | Verify the post-discount subtotal | $90.00 |
| 4 | Verify the tax line | Tax = $90.00 × 0.085 = $7.65 (NOT $8.50) |
| 5 | Verify the grand total | $90.00 + $7.65 = $97.65 |

**Pass Criteria:** Tax is recalculated on the discounted subtotal, not the original.  
**Fail Criteria:** Tax remains $8.50 after discount (calculated on pre-discount amount); grand total is wrong.

---

## TC-PER-02: Cart Persists After Force-Quit and Cold Launch

**Related Scenario:** SC-PER-02  
**Priority:** High  
**Preconditions:** User is logged in; cart contains 3 items with various quantities; one discount code applied.

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to the Cart screen and note the exact contents (items, quantities, discount, totals) | Screenshot or note the state |
| 2 | Press the Home button and swipe up (or use device controls) to force-quit the app | App is terminated |
| 3 | Relaunch the app by tapping its icon | App launches to the default screen (not the cart) |
| 4 | Navigate to the Cart screen | Cart is displayed |
| 5 | Verify item names and quantities | All 3 items present with their pre-quit quantities |
| 6 | Verify the discount code is still applied | Discount shown; same code displayed |
| 7 | Verify totals | Subtotal, tax, and grand total match the pre-quit values |

**Pass Criteria:** Full cart state is restored after cold launch, including items, quantities, and discount.  
**Fail Criteria:** Cart is empty; items missing; discount not restored; quantities reset to 1.

---

## TC-CHK-01: Proceed to Checkout with Populated Cart

**Related Scenario:** SC-CHK-01  
**Priority:** High  
**Preconditions:** User is logged in; cart contains at least one item.

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to the Cart screen | Cart displayed with items and totals |
| 2 | Locate the "Proceed to Checkout" button | Button is visible and enabled |
| 3 | Verify the total displayed on or near the button | Total matches the cart grand total |
| 4 | Tap "Proceed to Checkout" | App navigates to the checkout screen |
| 5 | Verify the cart total carried into checkout | Checkout screen displays the same grand total as the cart |

**Pass Criteria:** Navigation to checkout occurs; correct total is carried forward.  
**Fail Criteria:** Button is disabled with items in cart; navigation fails; total differs between cart and checkout.

---

## TC-CHK-02: Checkout Button Disabled for Empty Cart

**Related Scenario:** SC-CHK-02  
**Priority:** Medium  
**Preconditions:** User is logged in; cart is empty.

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to the Cart screen | Empty cart state is displayed with a message (e.g., "Your cart is empty") |
| 2 | Locate the "Proceed to Checkout" button | Button is either hidden, disabled (grayed out), or absent |
| 3 | If the button is visible and appears tappable, attempt to tap it | No navigation occurs; either button is non-interactive or a message is shown |

**Pass Criteria:** Empty cart prevents checkout initiation; appropriate empty state UI shown.  
**Fail Criteria:** Empty cart allows navigation to checkout; checkout attempts to process with no items.

---

# 5. Coverage Validation Report

## 5.1 Requirement-to-Test Mapping

| Requirement | Test Scenarios | Test Cases | Coverage Status |
|---|---|---|---|
| Add items to cart | SC-ADD-01 through SC-ADD-07 | TC-ADD-01 | Covered |
| Update item quantities (range 1–99) | SC-QTY-01 through SC-QTY-09 | TC-QTY-03, TC-QTY-04, TC-QTY-05 | Covered |
| Remove items from cart | SC-REM-01 through SC-REM-07 | (Covered by scenarios; detailed TCs recommended) | Partially Covered |
| Apply discount code — percentage-off | SC-DISC-01, SC-DISC-08, SC-DISC-09, SC-DISC-10 | TC-DISC-01 | Covered |
| Apply discount code — fixed-amount | SC-DISC-02, SC-DISC-07 | TC-DISC-02, TC-DISC-07 | Covered |
| Only one discount code at a time | SC-DISC-05 | TC-DISC-05 | Covered |
| Remove discount code | SC-DISC-06 | (Covered by scenario) | Partially Covered |
| Running total with tax at 8.5% | SC-TAX-01 through SC-TAX-08 | TC-TAX-01, TC-TAX-03 | Covered |
| Cart persists across sessions | SC-PER-01 through SC-PER-07 | TC-PER-02 | Covered |
| Proceed to checkout | SC-CHK-01 through SC-CHK-05 | TC-CHK-01, TC-CHK-02 | Covered |
| Invalid/expired discount codes | SC-DISC-03, SC-DISC-04 | (Covered by scenarios) | Partially Covered |
| Boundary enforcement (qty 1–99) | SC-QTY-03, SC-QTY-04, SC-QTY-05, SC-QTY-06, SC-QTY-07 | TC-QTY-03, TC-QTY-04, TC-QTY-05 | Covered |

---

## 5.2 Coverage Summary

| Category | Total Scenarios | Total Detailed Test Cases | Notes |
|---|---|---|---|
| Add Items | 7 | 1 | Additional step-by-step TCs recommended for SC-ADD-03, SC-ADD-07 |
| Quantity Updates | 9 | 3 | Covers all boundary values; TC for rapid updates (SC-QTY-09) recommended |
| Remove Items | 7 | 0 detailed | Scenarios defined; detailed TCs for swipe-delete and confirmation dialog needed |
| Discount Codes | 10 | 4 | All discount type permutations covered; expiry and invalid-code TCs to be added |
| Tax Calculation | 8 | 2 | Rounding TC (SC-TAX-07) detailed case recommended |
| Cart Persistence | 7 | 1 | Extended-period persistence (SC-PER-06) and multi-user (SC-PER-07) TCs needed |
| Checkout | 5 | 2 | Core path and empty cart covered; discount carry-over TC (SC-CHK-05) to be added |
| **Total** | **53** | **13** | |

---

## 5.3 Automation Candidates

The following test cases are strong candidates for automated regression testing (UI automation via XCUITest):

| Test Case / Scenario | Reason for Automation |
|---|---|
| TC-ADD-01: Add single item | Core happy path; must never regress |
| TC-QTY-03: Quantity = 99 | Boundary value; deterministic pass/fail |
| TC-QTY-04: Quantity = 100 (rejected) | Boundary value; deterministic pass/fail |
| TC-QTY-05: Quantity = 0 | Boundary value; deterministic pass/fail |
| TC-TAX-01: Tax calculation single item | Math verification; fully deterministic |
| TC-TAX-03: Tax on post-discount subtotal | Critical business logic; high regression risk |
| TC-DISC-01: Percentage discount | Core discount logic |
| TC-DISC-02: Fixed-amount discount | Core discount logic |
| TC-DISC-05: Single discount enforcement | Business rule; easy to verify programmatically |
| TC-DISC-07: Discount exceeds total | Edge case with known expected outcome |
| TC-PER-02: Persistence after cold launch | High-value regression; repeatable procedure |
| TC-CHK-01: Proceed to checkout | Core navigation path |
| TC-CHK-02: Empty cart blocks checkout | Gate condition; deterministic |

**Recommended Automation Framework:** XCUITest (native iOS) with a Page Object Model pattern. Consider supplementing with a contract testing layer (e.g., Pact) for the discount code service integration.

---

## 5.4 Identified Gaps and Recommendations

| Gap | Recommendation | Priority |
|---|---|---|
| No detailed test cases for item removal | Create step-by-step TCs for SC-REM-01, SC-REM-05 (swipe delete), and SC-REM-07 (cancel confirmation) | High |
| No TC for applying a discount after quantity change (SC-DISC-09) | Add TC verifying discount recalculation is based on updated quantity-adjusted subtotal | High |
| No TC for tax rounding on fractional cents (SC-TAX-07) | Add TC with item price $1.11 → tax = $0.09435 → verify rounding direction (up vs. half-even) | Medium |
| No network failure scenario TCs | Add TCs simulating timeout during discount code validation (airplane mode); verify error message and cart stability | Medium |
| No multi-user session test | Add TC where two users share a device; verify carts are user-scoped | Medium |
| No accessibility test cases | Create checklist-based TCs for VoiceOver labels on cart elements, minimum touch target sizes | Low |
| No localization TCs | Add TCs for currency display formatting in at least one non-US locale if app supports internationalization | Low |
| Performance baseline not established | Define acceptable cart load time SLA; create a performance test for cart with 50 items | Low |

---

## 5.5 Risk-Weighted Coverage Assessment

| Risk Area | Covered | Confidence |
|---|---|---|
| Financial accuracy (totals, tax, discount math) | Yes | High — multiple TCs with exact expected values |
| Cart data persistence | Yes | High — cold launch TC defined; extended-period gap noted |
| Boundary enforcement (quantity 1–99) | Yes | High — all boundaries covered |
| Single-discount enforcement | Yes | High — TC-DISC-05 directly tests this rule |
| Negative/invalid inputs | Partial | Medium — scenarios defined; detailed TCs incomplete for removal and discount edge cases |
| Network resilience | Partial | Low — no detailed offline TCs; gap documented |
| Accessibility | Not covered | Low — flagged as low priority; recommend pre-launch checklist |

---

*End of QA Documentation — iOS Shopping Cart Feature*
