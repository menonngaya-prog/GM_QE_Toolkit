# [Feature Name] — QA Test Documentation
**App:** [App Name]  
**Platform:** [Web / iOS / Android / API]  
**Version:** v1.0  
**Date:** [YYYY-MM-DD]  
**QA Owner:** [Name]  
**Sprint / Release:** [Sprint N / Release X.Y]

---

## Test Strategy — [Feature Name]

### Purpose
[One paragraph describing the feature and the purpose of this test strategy.]

### Scope

**In Scope**
- [Item 1]
- [Item 2]

**Out of Scope**
- [Item 1]
- [Item 2]

### Testing Types

| Type | Coverage | Tool |
|---|---|---|
| Functional / E2E | [Description] | [Tool] |
| API | [Description] | [Tool] |
| Security | [Description] | [Tool] |
| Performance | [Description] | [Tool] |
| Accessibility | WCAG 2.1 AA | axe-core, VoiceOver, NVDA |
| Cross-browser | Chrome, Firefox, Safari, Edge | BrowserStack |
| Regression | [Description] | Automated suite |

### Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| [Risk 1] | Low / Medium / High | Critical / High / Medium | [Action] |
| [Risk 2] | | | |

### Entry Criteria
- [Condition 1]
- [Condition 2]

### Exit Criteria
- All Critical and High test cases pass
- Zero open Critical defects
- [Feature-specific criterion]

---

## Test Plan — [Feature Name]

### Objectives
1. [Objective 1]
2. [Objective 2]
3. [Objective 3]

### Test Environment

| Environment | Detail |
|---|---|
| Staging URL | [URL] |
| API Base URL | [URL] |
| Browsers | Chrome 124+, Firefox 125+, Safari 17+, Edge 124+ |
| Devices | Desktop (1440px), Tablet (768px), Mobile (375px) |
| Test Accounts | [Describe personas needed] |
| External Services | [OAuth sandbox, payment sandbox, etc.] |

### Test Phases

| Phase | Scope | Duration |
|---|---|---|
| Smoke | Core happy path | Day 1 |
| Functional | All flows, validation, edge cases | Days 2–3 |
| Security | [Feature-specific] | Day 3 |
| Accessibility | Screen reader, keyboard nav, contrast | Day 4 |
| Cross-browser | Critical paths on all browsers | Day 4 |
| Regression | Full automated suite | Day 5 |

### Defect Severity Levels

| Severity | Definition | Example |
|---|---|---|
| Critical | Blocks core function or security breach | [Example] |
| High | Major flow broken, no workaround | [Example] |
| Medium | Feature degraded, workaround exists | [Example] |
| Low | Minor UX / cosmetic | [Example] |

### Dependencies
- [Dependency 1]
- [Dependency 2]

### Suspension Criteria
[When testing should pause]

---

## Test Scenarios

### TS-001 — [Feature Area 1]

| ID | Scenario |
|----|----------|
| TS-001-01 | [Happy path] |
| TS-001-02 | [Negative case] |
| TS-001-03 | [Edge case] |
| TS-001-04 | [Validation check] |
| TS-001-05 | [Integration scenario] |

### TS-002 — [Feature Area 2]

| ID | Scenario |
|----|----------|
| TS-002-01 | [Scenario] |
| TS-002-02 | [Scenario] |

---

## Detailed Test Cases

#### TC-001-01: [Descriptive title]
**Scenario:** TS-001-01  
**Priority:** Critical / High / Medium / Low  
**Automation Candidate:** Yes / No  
**Preconditions:** [What must be true before starting]

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | [Specific action] | [Specific expected result] |
| 2 | [Specific action] | [Specific expected result] |
| 3 | [Specific action] | [Specific expected result] |

**Pass Criteria:** [Binary success condition]  
**Fail Criteria:** [Binary failure condition]

---

## Coverage Validation Report

### Requirement → Test Coverage Mapping

| Requirement | Covered By |
|---|---|
| [Requirement from PRD] | [TC/TS IDs] |

### Automation Candidates

| Test Case | Reason |
|---|---|
| [TC ID] | [Reason] |

### Clarification Questions / Gaps

| # | Gap or Question |
|---|---|
| 1 | [Ambiguity or missing requirement] |
