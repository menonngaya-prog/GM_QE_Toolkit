# QA Test Documentation — iOS Shopping Cart

---

## Test Strategy — iOS Shopping Cart

### Purpose
The iOS Shopping Cart feature enables users to manage their intended purchases before completing a transaction. Users can add items, adjust quantities within the 1–99 range, remove items, apply a single discount code (percentage-off or fixed-amount), view a running total with 8.5% tax applied, and proceed to checkout. The cart persists across app sessions, ensuring users do not lose their selections. This strategy ensures that every functional area is systematically tested — from basic cart operations to tax calculations, discount logic, persistence, and the checkout hand-off — with appropriate coverage of happy paths, negative cases, and edge cases on the iOS platform.

### Scope
**In Scope:**
- Adding items to the cart from product listings
- Updating item quantities within the 1–99 boundary
- Removing individual items from the cart
- Applying a discount code (percentage-off type)
- Applying a discount code (fixed-amount type)
- Enforcing single-code-only constraint (no stacking)
- Running total calculation reflecting quantity changes and discounts
- Tax calculation at exactly 8.5% of the applicable subtotal
- Cart persistence across app sessions (background, force-quit, and re-launch)
- Proceeding to checkout with cart contents intact
- Edge cases: boundary quantities (1, 99, 0, 100), empty cart, invalid/expired discount codes

**Out of Scope:**
- Checkout flow beyond the "Proceed to Checkout" action (payment processing, order confirmation)
- Product search and browsing
- Inventory/stock management
- Wishlist functionality
- Multi-currency or multi-region tax rates
- Android platform
- Web or Desktop platform

### Testing Types
| Type | Coverage | Tool |
|---|---|---|
| Functional / E2E | Add/update/remove items, discount codes, tax calculation, cart persistence, checkout initiation | XCUITest, Appium |
| Integration | Cart service API, discount validation API, session/persistence layer | XCTestCase, Postman |
| Security | Discount code brute-force, price manipulation via tampered requests, session token handling | OWASP Mobile Top 10, Burp Suite |
| Performance | Cart load time with 50+ items, quantity update responsiveness, persistence restore time | Xcode Instruments |
| Accessibility | VoiceOver navigation through cart, dynamic type scaling, minimum tap target sizes | Xcode Accessibility Inspector, VoiceOver |
| Regression | Full automated suite covering all critical and high priority test cases | XCUITest CI pipeline |

### Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Tax rounding errors producing incorrect totals (8.5% produces fractional cents) | High | High | Verify rounding rule (round half-up) against business spec; test with amounts that produce fractional results |
| Discount code stacking bypass (applying second code via API while first is applied via UI) | Medium | High | Test code replacement and stacking via both UI and direct API calls; ensure server-side enforcement |
| Cart persistence failure after force-quit or iOS memory pressure | Medium | High | Test persistence under low-memory conditions and after various termination scenarios |
| Quantity boundary enforcement gaps (allowing 0 or 100+ via rapid UI taps or API) | Medium | High | Test rapid increment/decrement, direct input of out-of-range values, and API manipulation |
| Fixed-amount discount exceeding item subtotal (negative total) | Low | High | Test discount amount greater than cart subtotal; verify floor at $0.00 |
| Checkout hand-off carrying incorrect cart state (stale total, missing discount) | Low | Critical | Verify cart state passed to checkout matches displayed cart immediately before transition |
| iOS version compatibility (cart UI or persistence breaking on older supported iOS versions) | Low | Medium | Test on minimum supported iOS version and latest release |

### Entry Criteria
- iOS app build deployed to test devices/simulators with cart feature enabled
- Backend cart service, discount service, and session service are running in the staging environment
- Test accounts configured: standard user, user with expired discount codes, user with no prior cart
- Test discount codes created: valid percentage-off, valid fixed-amount, expired, already-used, non-existent
- Smoke test of app launch and basic navigation passes
- API documentation for cart and discount endpoints is available

### Exit Criteria
- All Critical and High priority test cases have passed
- No open Critical defects; all High defects have an accepted workaround or fix scheduled
- Tax calculation verified correct for a minimum of 10 representative cart totals
- Cart persistence verified across all three termination scenarios (background, force-quit, re-launch after OS restart)
- All discount code types (percentage, fixed-amount, invalid) tested and passing
- Regression suite passes at ≥ 95% pass rate
- Coverage Validation Report confirms every stated requirement has at least one passing test case

---

## Test Plan — iOS Shopping Cart

### Objectives
1. Verify that users can add, update quantities (within the 1–99 constraint), and remove items from the cart without data loss or UI errors.
2. Confirm that discount code logic is correctly enforced: only one code at a time, percentage-off and fixed-amount types calculate correctly, and invalid codes are rejected.
3. Validate that the running total — including tax at exactly 8.5% — updates accurately in real time as the cart changes.
4. Ensure the cart persists correctly across all session termination scenarios and that the correct cart state is handed off when the user proceeds to checkout.

### Test Environment
| Environment | Detail |
|---|---|
| Staging App Build | iOS `.ipa` installed on test devices/simulators (staging scheme) |
| API Base URL | `https://staging-api.example.com/v1` |
| iOS Devices | iPhone 15 Pro (iOS 17), iPhone 12 (iOS 16), iPhone SE 3rd gen (iOS 16), iPad Air 5th gen (iOS 17) |
| iOS Simulator | iPhone 15 Pro Simulator, iOS 17 (Xcode 15) |
| Minimum iOS Version | iOS 16.0 (as per current app support policy) |
| Test Accounts | `cart_standard@test.com` (no prior cart), `cart_existing@test.com` (pre-populated cart from prior session), `cart_discounttest@test.com` (for discount code testing) |
| Discount Codes | `SAVE10PCT` (10% off), `SAVE5OFF` ($5.00 fixed off), `EXPIRED2023` (expired), `USEDCODE` (already redeemed), `INVALID999` (non-existent) |

### Test Phases
| Phase | Scope | Duration |
|---|---|---|
| Smoke | App launches, cart screen loads, add one item, view running total | Day 1 |
| Functional | All cart operations, quantity boundaries, discount codes, tax calculation, persistence | Days 2–3 |
| Security | Discount stacking via API, price tamper via proxy, session token validation | Day 3 |
| Accessibility | VoiceOver full cart traversal, dynamic type (largest size), tap target verification | Day 4 |
| Regression | Full automated XCUITest suite on primary device and minimum iOS version | Day 5 |

### Defect Severity Levels
| Severity | Definition | Example |
|---|---|---|
| Critical | Blocks core cart function or causes incorrect financial data | Cart total shows $0.00 for all items; proceeding to checkout with wrong price |
| High | Major cart flow broken with no workaround | Quantity update does not persist; discount code cannot be applied at all |
| Medium | Feature degraded but workaround exists | Running total flickers before updating; remove item requires two taps |
| Low | Minor UX or cosmetic issue | Discount applied confirmation message has a typo; quantity stepper animation stutters |

### Dependencies
- Staging backend services (cart API, discount API, session/persistence service) must be deployed and accessible
- Valid test discount codes provisioned in the staging discount service
- Test user accounts created with the required states (empty cart, existing cart)
- XCUITest automation suite configured for the staging build scheme
- Xcode 15 and physical test devices enrolled in the development team

### Suspension Criteria
- Cart API returns 5xx errors consistently — suspend functional and integration testing until resolved
- App crashes on launch on primary test device — suspend all testing
- Discount validation service is unavailable — suspend all discount code test cases
- A Critical defect is found that corrupts cart data — suspend testing and notify lead; do not proceed to checkout hand-off tests until resolved

---

## Test Scenarios

### TS-001 — Add Items to Cart
| ID | Scenario |
|----|----------|
| TS-001-01 | User adds a single item to an empty cart and sees it appear with correct name, price, and quantity of 1 |
| TS-001-02 | User adds the same item twice and sees quantity increment to 2 (or two separate line items, per business rule) |
| TS-001-03 | User adds multiple different items and all appear correctly in the cart |
| TS-001-04 | User attempts to add an item when cart already contains 99 of that item (boundary enforcement) |
| TS-001-05 | User adds an item, navigates away, and returns to cart — item is still present |
| TS-001-06 | User adds item with a long product name — name displays correctly without truncation errors |
| TS-001-07 | Network connection is lost mid-add — appropriate error shown, cart not corrupted |

### TS-002 — Update Item Quantities
| ID | Scenario |
|----|----------|
| TS-002-01 | User increases item quantity from 1 to 5 using the stepper — running total updates correctly |
| TS-002-02 | User decreases item quantity from 5 to 2 — running total updates correctly |
| TS-002-03 | User attempts to decrease quantity below 1 — decrement button is disabled or quantity stays at 1 |
| TS-002-04 | User attempts to increase quantity above 99 — increment button is disabled or quantity stays at 99 |
| TS-002-05 | User sets quantity to exactly 1 (minimum boundary) — cart retains item |
| TS-002-06 | User sets quantity to exactly 99 (maximum boundary) — cart accepts and total is correct |
| TS-002-07 | User enters quantity 0 via direct text input — validation error shown, quantity reverts to previous value |
| TS-002-08 | User enters quantity 100 via direct text input — validation error shown, quantity reverts to 99 or previous value |
| TS-002-09 | User rapidly taps increment button multiple times — quantity does not exceed 99 |
| TS-002-10 | Quantity update is reflected immediately in the running total without page reload |

### TS-003 — Remove Items from Cart
| ID | Scenario |
|----|----------|
| TS-003-01 | User removes the only item from the cart — empty cart state is displayed |
| TS-003-02 | User removes one item from a multi-item cart — remaining items and total are unaffected |
| TS-003-03 | User removes all items one by one — cart ends in empty state |
| TS-003-04 | User swipes to delete item (iOS swipe-to-delete pattern) — item is removed |
| TS-003-05 | Running total updates immediately after item removal |
| TS-003-06 | Removed item is not re-added on cart refresh or app re-launch |
| TS-003-07 | Network connection is lost during removal — user is shown error, item is not lost from cart |

### TS-004 — Discount Code Application
| ID | Scenario |
|----|----------|
| TS-004-01 | User applies a valid percentage-off code — discount is reflected in subtotal and running total |
| TS-004-02 | User applies a valid fixed-amount code — correct dollar amount is deducted from subtotal |
| TS-004-03 | User applies an invalid (non-existent) code — error message shown, total unchanged |
| TS-004-04 | User applies an expired discount code — error message shown, total unchanged |
| TS-004-05 | User applies a valid code, then attempts to apply a second code — second code replaces or is rejected, no stacking |
| TS-004-06 | User removes the applied discount code — total reverts to pre-discount amount |
| TS-004-07 | Fixed-amount discount exceeds cart subtotal — total is floored at $0.00, not negative |
| TS-004-08 | Percentage-off discount applied — tax is recalculated on the discounted subtotal |
| TS-004-09 | User applies already-used (single-use) code — error message shown, code rejected |
| TS-004-10 | Discount code field accepts only valid format (length, character set) — malformed input is rejected |

### TS-005 — Running Total and Tax Calculation
| ID | Scenario |
|----|----------|
| TS-005-01 | Running total equals sum of (item price × quantity) for all items, with no discount |
| TS-005-02 | Tax is calculated as exactly 8.5% of the taxable subtotal |
| TS-005-03 | Tax amount rounds to the nearest cent (no fractional cents displayed) |
| TS-005-04 | After applying a percentage-off discount, tax is recalculated on the discounted subtotal |
| TS-005-05 | After applying a fixed-amount discount, tax is recalculated on the discounted subtotal |
| TS-005-06 | After removing a discounted item, running total and tax update correctly |
| TS-005-07 | Running total updates in real time as quantities are changed |
| TS-005-08 | Total breakdown (subtotal, discount, tax, total) is displayed and each component is accurate |
| TS-005-09 | Cart with a single $0.01 item — tax rounds correctly and total is displayed |

### TS-006 — Cart Persistence Across Sessions
| ID | Scenario |
|----|----------|
| TS-006-01 | User adds items, sends app to background, returns to app — cart is unchanged |
| TS-006-02 | User adds items, force-quits the app, re-launches — cart is restored with all items and quantities |
| TS-006-03 | User adds items, device is restarted, app is launched — cart is restored |
| TS-006-04 | Applied discount code persists after app background/foreground cycle |
| TS-006-05 | Applied discount code persists after force-quit and re-launch |
| TS-006-06 | User logs out and logs back in with the same account — cart is restored |
| TS-006-07 | Cart for user A is not visible when user B logs in on the same device |

### TS-007 — Proceed to Checkout
| ID | Scenario |
|----|----------|
| TS-007-01 | User taps "Proceed to Checkout" with items in cart — checkout screen loads with correct cart summary |
| TS-007-02 | Checkout screen reflects the same subtotal, discount, tax, and total as the cart screen |
| TS-007-03 | "Proceed to Checkout" button is disabled or shows appropriate state on empty cart |
| TS-007-04 | User navigates back from checkout to cart — cart state is unchanged |
| TS-007-05 | Discount code applied in cart is carried through to the checkout screen |

---

## Detailed Test Cases

### Feature Area: Add Items to Cart

#### TC-001-01: Add single item to empty cart
**Scenario:** TS-001-01
**Priority:** Critical
**Automation Candidate:** Yes
**Preconditions:** User is logged in as `cart_standard@test.com`; cart is empty; user is on the product listing page for "Blue Wireless Earbuds" priced at $29.99

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Tap the "Add to Cart" button on the "Blue Wireless Earbuds" product card | Activity indicator appears briefly; button changes state (e.g., shows "Added" or cart count badge increments by 1) |
| 2 | Tap the Cart icon in the navigation bar | Cart screen opens |
| 3 | Observe the cart item list | "Blue Wireless Earbuds" appears as a line item with quantity "1" and unit price "$29.99" |
| 4 | Observe the running total section | Subtotal shows "$29.99"; Tax shows "$2.55" (8.5% of $29.99, rounded); Total shows "$32.54" |

**Pass Criteria:** Cart contains exactly one line item for "Blue Wireless Earbuds" at quantity 1; subtotal is $29.99; tax is $2.55; total is $32.54.
**Fail Criteria:** Item does not appear in cart; quantity is not 1; price is incorrect; any total component displays an unexpected value.

---

#### TC-001-07: Network loss during add-to-cart
**Scenario:** TS-001-07
**Priority:** High
**Automation Candidate:** No
**Preconditions:** User is logged in; cart is empty; device network connection can be toggled via Airplane Mode; user is on any product detail page

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enable Airplane Mode on the device | Device shows no network connectivity |
| 2 | Tap "Add to Cart" | Error message or toast is shown (e.g., "Unable to add item. Please check your connection."); cart badge does not increment |
| 3 | Disable Airplane Mode and wait for connectivity to restore | Normal network indicator returns |
| 4 | Tap "Add to Cart" again | Item is added successfully; cart badge increments; no duplicate item added |

**Pass Criteria:** Appropriate network error message is shown when offline; cart is not corrupted; item is successfully added once connection is restored.
**Fail Criteria:** App crashes on add attempt; item appears to be added while offline (UI lies) but is not saved; duplicate items appear after retry.

---

### Feature Area: Update Item Quantities

#### TC-002-01: Increase item quantity and verify total update
**Scenario:** TS-002-01
**Priority:** Critical
**Automation Candidate:** Yes
**Preconditions:** User is logged in; cart contains one "Red Running Shoes" at $75.00, quantity 1; no discount code applied

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open the Cart screen | "Red Running Shoes" shows quantity "1"; subtotal "$75.00"; tax "$6.38"; total "$81.38" |
| 2 | Tap the "+" (increment) button next to "Red Running Shoes" four times | Quantity changes to "5" after each tap; running total updates with each tap |
| 3 | Observe the cart after the 4th tap | Quantity shows "5"; subtotal shows "$375.00" |
| 4 | Observe the tax and total fields | Tax shows "$31.88" (8.5% of $375.00, rounded); total shows "$406.88" |

**Pass Criteria:** Quantity is 5; subtotal is $375.00; tax is $31.88; total is $406.88.
**Fail Criteria:** Quantity does not update; running total is stale or incorrect; tax is not recalculated.

---

#### TC-002-03: Attempt to decrease quantity below 1
**Scenario:** TS-002-03
**Priority:** High
**Automation Candidate:** Yes
**Preconditions:** User is logged in; cart contains "Red Running Shoes" at quantity 1

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open the Cart screen | "Red Running Shoes" shows quantity "1"; decrement ("-") button is visible |
| 2 | Tap the "-" (decrement) button | One of: (a) button is disabled/greyed out and quantity remains "1", OR (b) a remove-item confirmation dialog appears |
| 3 | If a confirmation dialog appeared in Step 2, tap "Cancel" | Dialog dismisses; item remains in cart at quantity "1" |
| 4 | Observe quantity field | Quantity remains "1"; running total is unchanged |

**Pass Criteria:** Quantity cannot be reduced below 1 via the decrement button; item is not removed unless user explicitly confirms removal.
**Fail Criteria:** Quantity shows "0" or a negative number; item is silently removed without confirmation; total becomes $0.00 or negative.

---

#### TC-002-08: Enter quantity 100 via direct text input
**Scenario:** TS-002-08
**Priority:** High
**Automation Candidate:** Yes
**Preconditions:** User is logged in; cart contains "Blue Wireless Earbuds" at quantity 1; quantity field is editable via direct text input

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open the Cart screen and tap the quantity field for "Blue Wireless Earbuds" | Keyboard appears; field is selected and editable |
| 2 | Clear the field and type "100" | Characters "100" appear in the field |
| 3 | Tap "Done" or press Return on the keyboard | Inline validation error appears (e.g., "Maximum quantity is 99") OR quantity field reverts to "99" (clamped) or the previous value "1" |
| 4 | Observe the quantity field and running total | Quantity is 99 or the previous valid value; total reflects the valid quantity |

**Pass Criteria:** Quantity of 100 is rejected; field shows either 99 (clamped) or the previous value; an error message is shown if the value is rejected outright.
**Fail Criteria:** Quantity of 100 is accepted and persisted; total is calculated for 100 units; no validation feedback is given.

---

### Feature Area: Remove Items from Cart

#### TC-003-01: Remove only item — empty cart state
**Scenario:** TS-003-01
**Priority:** Critical
**Automation Candidate:** Yes
**Preconditions:** User is logged in; cart contains exactly one item: "Green Water Bottle" at quantity 1, $15.00

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open the Cart screen | "Green Water Bottle" is shown; total is $16.28 ($15.00 + $1.28 tax) |
| 2 | Swipe left on the "Green Water Bottle" row | A red "Delete" (or "Remove") button appears to the right of the row |
| 3 | Tap the "Delete" button | "Green Water Bottle" is removed from the cart list |
| 4 | Observe the cart screen | Empty cart state is shown (e.g., "Your cart is empty" message with a call-to-action to browse products) |
| 5 | Observe the total area | Running total shows $0.00 or the total area is hidden/replaced by empty state UI |

**Pass Criteria:** Cart displays the empty state UI after the last item is removed; no items remain; total is $0.00 or not shown.
**Fail Criteria:** Item reappears after removal; cart shows a negative total; empty state is not shown; app crashes.

---

#### TC-003-02: Remove one item from multi-item cart
**Scenario:** TS-003-02
**Priority:** High
**Automation Candidate:** Yes
**Preconditions:** User is logged in; cart contains two items: "Blue Wireless Earbuds" ($29.99, qty 1) and "Green Water Bottle" ($15.00, qty 1); no discount applied

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open the Cart screen | Both items visible; subtotal "$44.99"; tax "$3.82"; total "$48.81" |
| 2 | Swipe left on "Green Water Bottle" and tap "Delete" | "Green Water Bottle" is removed; "Blue Wireless Earbuds" remains |
| 3 | Observe remaining items | Only "Blue Wireless Earbuds" at qty 1 and $29.99 is shown |
| 4 | Observe the running total | Subtotal "$29.99"; tax "$2.55"; total "$32.54" |

**Pass Criteria:** Only the deleted item is removed; remaining item and its quantity are unchanged; totals are recalculated correctly.
**Fail Criteria:** Wrong item is removed; remaining item quantity or price changes; total is not recalculated; both items disappear.

---

### Feature Area: Discount Code Application

#### TC-004-01: Apply valid percentage-off discount code
**Scenario:** TS-004-01
**Priority:** Critical
**Automation Candidate:** Yes
**Preconditions:** User is logged in; cart contains "Blue Wireless Earbuds" ($29.99, qty 2); subtotal is $59.98; no discount applied; discount code `SAVE10PCT` (10% off) is valid and unused

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open the Cart screen | Subtotal: $59.98; Tax: $5.10 (8.5% of $59.98); Total: $65.08 |
| 2 | Tap the "Enter Discount Code" field | Keyboard appears; field is focused |
| 3 | Type "SAVE10PCT" and tap "Apply" | Loading indicator appears briefly |
| 4 | Observe the discount line in the totals | Discount line appears: "SAVE10PCT — 10% off: -$6.00" (10% of $59.98 = $5.998, rounded to $6.00) |
| 5 | Observe the updated subtotal, tax, and total | Discounted subtotal: $53.98; Tax: $4.59 (8.5% of $53.98); Total: $58.57 |

**Pass Criteria:** Discount of $6.00 is applied; discounted subtotal is $53.98; tax is recalculated on discounted subtotal as $4.59; total is $58.57.
**Fail Criteria:** Discount is not applied; discount is applied to wrong amount; tax is calculated on pre-discount subtotal; total is incorrect.

---

#### TC-004-05: Attempt to apply a second discount code while one is active
**Scenario:** TS-004-05
**Priority:** Critical
**Automation Candidate:** Yes
**Preconditions:** User is logged in; cart contains items with subtotal $59.98; discount code `SAVE10PCT` is currently applied; second code `SAVE5OFF` ($5.00 fixed off) is valid

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open the Cart screen | `SAVE10PCT` discount is shown in the totals breakdown |
| 2 | Observe the discount code input area | Either (a) a single code field showing `SAVE10PCT` with a "Remove" option, OR (b) field is cleared and ready for new input |
| 3 | Enter "SAVE5OFF" in the discount code field and tap "Apply" | One of: (a) confirmation dialog "This will replace your current code SAVE10PCT. Continue?" appears, OR (b) error: "Only one discount code can be applied at a time. Remove the current code first." |
| 4a | If replacement dialog: tap "Confirm" | `SAVE10PCT` is removed; `SAVE5OFF` is applied; totals update to reflect $5.00 fixed discount only |
| 4b | If rejection message: tap "Remove" on existing code, then re-apply `SAVE5OFF` | `SAVE10PCT` is removed; `SAVE5OFF` applies successfully |
| 5 | Verify only one discount is active | Totals breakdown shows exactly one discount line; both `SAVE10PCT` and `SAVE5OFF` discounts are NOT simultaneously deducted |

**Pass Criteria:** At no point are two discount codes simultaneously applied to the subtotal; the system enforces a single-code constraint.
**Fail Criteria:** Both discount codes are applied simultaneously; combined discount ($6.00 + $5.00 = $11.00) is deducted; totals reflect stacked discounts.

---

#### TC-004-07: Fixed-amount discount exceeds cart subtotal
**Scenario:** TS-004-07
**Priority:** High
**Automation Candidate:** Yes
**Preconditions:** User is logged in; cart contains one "Phone Case" at $3.99, qty 1; discount code `SAVE5OFF` ($5.00 fixed off) is valid

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open the Cart screen | Subtotal: $3.99; Tax: $0.34; Total: $4.33 |
| 2 | Enter "SAVE5OFF" in the discount code field and tap "Apply" | Discount is applied |
| 3 | Observe the discount line | Discount shows "-$3.99" (capped at subtotal) or "-$5.00" with subtotal floored at $0.00 |
| 4 | Observe the discounted subtotal, tax, and total | Discounted subtotal: $0.00; Tax: $0.00; Total: $0.00 |
| 5 | Verify total is not negative | Total displayed is "$0.00", not "-$1.01" or any negative value |

**Pass Criteria:** Total is floored at $0.00 and is not displayed as a negative number; tax on $0.00 is $0.00.
**Fail Criteria:** Total displays a negative value (e.g., "-$1.01"); app crashes when applying oversized discount; tax is calculated on a negative subtotal.

---

### Feature Area: Running Total and Tax Calculation

#### TC-005-02: Tax calculated at exactly 8.5%
**Scenario:** TS-005-02
**Priority:** Critical
**Automation Candidate:** Yes
**Preconditions:** User is logged in; cart is empty; test items loaded: "Item A" at $100.00 and "Item B" at $50.00

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Add "Item A" ($100.00) to cart and open Cart screen | Subtotal: $100.00; Tax: $8.50 (8.5% of $100.00); Total: $108.50 |
| 2 | Add "Item B" ($50.00) to cart | Subtotal updates to $150.00 |
| 3 | Observe tax and total | Tax: $12.75 (8.5% of $150.00); Total: $162.75 |
| 4 | Increase "Item A" quantity to 2 | Subtotal: $250.00 |
| 5 | Observe tax and total | Tax: $21.25 (8.5% of $250.00); Total: $271.25 |

**Pass Criteria:** Tax equals subtotal × 0.085 for each cart state; all three totals ($8.50, $12.75, $21.25) match expected values exactly.
**Fail Criteria:** Tax differs from 8.5% of subtotal for any cart state; rounding causes tax to be off by more than $0.01.

---

#### TC-005-03: Tax rounding on fractional cent amounts
**Scenario:** TS-005-03
**Priority:** High
**Automation Candidate:** Yes
**Preconditions:** User is logged in; test item "Precision Item" at $19.99 is available

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Add "Precision Item" ($19.99) to cart and open Cart screen | Subtotal: $19.99; exact tax = $19.99 × 0.085 = $1.69915 |
| 2 | Observe the tax line | Tax displays as "$1.70" (rounded half-up from $1.69915) |
| 3 | Observe the total | Total: $19.99 + $1.70 = $21.69 |
| 4 | Change quantity to 3 | Subtotal: $59.97; exact tax = $59.97 × 0.085 = $5.09745 |
| 5 | Observe tax line | Tax displays as "$5.10" (rounded half-up) |
| 6 | Observe total | Total: $59.97 + $5.10 = $65.07 |

**Pass Criteria:** Tax rounds to the nearest cent using half-up rounding; no fractional cents are displayed; totals are self-consistent (subtotal + tax = total).
**Fail Criteria:** Tax truncates instead of rounding (shows $1.69 instead of $1.70); fractional cents appear in the display; total does not equal subtotal + tax.

---

### Feature Area: Cart Persistence

#### TC-006-02: Cart persists after force-quit and re-launch
**Scenario:** TS-006-02
**Priority:** Critical
**Automation Candidate:** Yes
**Preconditions:** User is logged in as `cart_standard@test.com`; cart contains: "Blue Wireless Earbuds" qty 2, "Green Water Bottle" qty 1; discount code `SAVE10PCT` applied

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open Cart screen and note all values | Items, quantities, discount code, subtotal, tax, and total are all visible |
| 2 | Press the Home button to go to the iOS Home Screen | App moves to background |
| 3 | Open the iOS App Switcher (swipe up and hold, or double-click Home) | App cards are visible |
| 4 | Swipe up on the app card to force-quit the app | App is removed from the switcher |
| 5 | Tap the app icon to re-launch | App launches to the last screen or home screen |
| 6 | Navigate to the Cart screen | Cart is visible |
| 7 | Verify cart contents | "Blue Wireless Earbuds" qty 2 and "Green Water Bottle" qty 1 are present |
| 8 | Verify discount code | `SAVE10PCT` discount is still applied; totals reflect the discount |

**Pass Criteria:** All items, quantities, and the applied discount code are restored after force-quit and re-launch; totals are correct.
**Fail Criteria:** Cart is empty after re-launch; any item, quantity, or discount is missing; totals are incorrect.

---

#### TC-006-07: Cart isolation between users on same device
**Scenario:** TS-006-07
**Priority:** High
**Automation Candidate:** Yes
**Preconditions:** Device has `cart_standard@test.com` logged in with cart: "Blue Wireless Earbuds" qty 1; `cart_existing@test.com` has a separate cart with "Red Running Shoes" qty 3

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open Cart screen while logged in as `cart_standard@test.com` | "Blue Wireless Earbuds" qty 1 is shown |
| 2 | Log out of `cart_standard@test.com` via Settings or Profile | App returns to login screen |
| 3 | Log in as `cart_existing@test.com` | App logs in as second user |
| 4 | Navigate to Cart screen | Cart shows "Red Running Shoes" qty 3 (the second user's cart) |
| 5 | Verify `cart_standard@test.com`'s items are not visible | "Blue Wireless Earbuds" does not appear in this cart |

**Pass Criteria:** Each user sees only their own cart; no cart bleed-over between users on the same device.
**Fail Criteria:** User B can see User A's cart items; carts are merged; app shows items from both users simultaneously.

---

### Feature Area: Proceed to Checkout

#### TC-007-01: Checkout receives correct cart state
**Scenario:** TS-007-01 / TS-007-02
**Priority:** Critical
**Automation Candidate:** Yes
**Preconditions:** User is logged in; cart contains "Blue Wireless Earbuds" qty 2 ($59.98) and "Green Water Bottle" qty 1 ($15.00); discount code `SAVE10PCT` (10%) applied; note expected values before tapping

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open Cart screen and record displayed values | Subtotal: $74.98; Discount: -$7.50 (10%); Discounted subtotal: $67.48; Tax: $5.74 (8.5%); Total: $73.22 |
| 2 | Tap the "Proceed to Checkout" button | Checkout screen loads without error |
| 3 | On the checkout screen, observe the order summary section | Subtotal, discount, tax, and total match the values recorded in Step 1 exactly |
| 4 | Verify discount code is shown | `SAVE10PCT` discount is listed on the checkout summary |
| 5 | Verify line items | Both "Blue Wireless Earbuds" (qty 2) and "Green Water Bottle" (qty 1) are listed |

**Pass Criteria:** Every value on the checkout order summary (subtotal, discount, tax, total, item list) exactly matches the cart screen values recorded before tapping "Proceed to Checkout."
**Fail Criteria:** Any value differs between cart screen and checkout screen; items are missing from checkout summary; discount is not carried through; total on checkout differs from cart total by more than $0.00.

---

#### TC-007-03: Checkout button state on empty cart
**Scenario:** TS-007-03
**Priority:** High
**Automation Candidate:** Yes
**Preconditions:** User is logged in; cart is empty (empty state UI is displayed)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open the Cart screen | Empty cart state is displayed (e.g., "Your cart is empty") |
| 2 | Observe the "Proceed to Checkout" button | Button is either: (a) not visible, (b) visually disabled (greyed out), or (c) tapping it shows an error "Your cart is empty" |
| 3 | If button is disabled, attempt to tap it | Nothing happens; checkout screen does not open |

**Pass Criteria:** The checkout flow cannot be initiated from an empty cart; the user receives clear visual feedback that checkout is unavailable.
**Fail Criteria:** Checkout screen opens with an empty cart; app crashes when attempting checkout with empty cart; no visual indication that checkout is unavailable.

---

## Coverage Validation Report

### Requirement → Test Coverage Mapping
| Requirement | Covered By |
|---|---|
| Users can add items to cart | TS-001-01 to TS-001-07; TC-001-01, TC-001-07 |
| Users can update item quantities (range 1–99) | TS-002-01 to TS-002-10; TC-002-01, TC-002-03, TC-002-08 |
| Users can remove items from cart | TS-003-01 to TS-003-07; TC-003-01, TC-003-02 |
| Users can apply a discount code | TS-004-01 to TS-004-10; TC-004-01, TC-004-05, TC-004-07 |
| Discount codes can be percentage-off type | TS-004-01, TS-004-08; TC-004-01 |
| Discount codes can be fixed-amount type | TS-004-02, TS-004-07; TC-004-07 |
| Only one discount code can be applied at a time | TS-004-05; TC-004-05 |
| Users see a running total | TS-005-01, TS-005-07, TS-005-08; TC-005-02 |
| Tax is calculated at 8.5% | TS-005-02, TS-005-03; TC-005-02, TC-005-03 |
| Cart persists across sessions | TS-006-01 to TS-006-07; TC-006-02, TC-006-07 |
| Users can proceed to checkout | TS-007-01 to TS-007-05; TC-007-01, TC-007-03 |
| Minimum quantity is 1 | TS-002-03, TS-002-05; TC-002-03 |
| Maximum quantity is 99 | TS-002-04, TS-002-06, TS-002-08, TS-002-09; TC-002-08 |
| Cart persists after app background/foreground | TS-006-01, TS-006-04; TC-006-02 |
| Cart persists after force-quit | TS-006-02, TS-006-05; TC-006-02 |
| Cart is user-specific (no cross-user bleed) | TS-006-07; TC-006-07 |
| Checkout receives correct cart state | TS-007-01, TS-007-02; TC-007-01 |

### Automation Candidates
| Test Case | Reason |
|---|---|
| TC-001-01 | Core happy path, stable UI elements, high ROI for regression |
| TC-002-01 | Quantity update and total recalculation — frequent regression risk |
| TC-002-03 | Boundary enforcement at quantity minimum — easy to automate with stepper interaction |
| TC-002-08 | Direct text input boundary — important regression check with clear pass/fail |
| TC-003-01 | Empty cart state after removal — deterministic and frequently regressed |
| TC-003-02 | Multi-item removal with total recalculation — high regression value |
| TC-004-01 | Discount application is core revenue logic — must be in every regression run |
| TC-004-05 | Discount stacking prevention — critical business rule, should be automated |
| TC-004-07 | Discount exceeding subtotal edge case — deterministic, critical financial correctness |
| TC-005-02 | Tax rate correctness — deterministic calculation, high regression value |
| TC-005-03 | Tax rounding — deterministic, catches subtle calculation bugs in regression |
| TC-006-02 | Persistence after force-quit — automatable with XCUITest app lifecycle APIs |
| TC-006-07 | User cart isolation — automatable with test account switching |
| TC-007-01 | Checkout hand-off correctness — critical end-to-end path, high regression value |
| TC-007-03 | Empty cart checkout gate — simple state check, deterministic |

### Clarification Questions / Gaps
| # | Gap or Question |
|---|---|
| 1 | **Tax base:** Is tax calculated on the subtotal after discount, or on the original subtotal before any discount is applied? This document assumes tax is applied after discount (the more common approach), but the requirement text is ambiguous. |
| 2 | **Rounding rule for tax:** The requirement states 8.5% tax but does not specify the rounding method (half-up, half-even/banker's rounding, truncate). This document assumes half-up rounding. Confirm the business rule. |
| 3 | **Quantity at 0 via decrement:** The requirement states the range is 1–99 but does not specify whether decrementing from 1 should prompt item removal or simply be disabled. Test case TC-002-03 covers both branches, but the expected behaviour should be explicitly defined. |
| 4 | **Discount code replacement vs. rejection:** When a second discount code is entered while one is active, should the app (a) prompt to replace the current code, (b) silently replace it, or (c) reject the new code until the user manually removes the existing one? TC-004-05 covers all branches but a definitive spec is needed. |
| 5 | **Fixed-amount discount cap:** When a fixed-amount discount exceeds the cart subtotal, this document assumes the total is floored at $0.00. Confirm whether any partial-credit scenario applies (e.g., surplus discount applied to tax). |
| 6 | **Session persistence scope:** The requirement states "persists across sessions" but does not define session expiry. Should the cart persist indefinitely, or is there a time-to-live (e.g., 30 days)? Long-duration persistence tests are not included here without this information. |
| 7 | **Minimum supported iOS version:** Test environment tables list iOS 16 as minimum, derived from typical current support. Confirm the actual minimum supported iOS version for this app. |
| 8 | **Add-same-item behaviour:** The requirement does not specify whether adding an item already in the cart increments its quantity or adds a second line item. Assumption in TS-001-02 is that quantity increments; confirm expected behaviour. |
