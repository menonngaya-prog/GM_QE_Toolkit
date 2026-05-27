---
name: qa-test-docs
description: >
  Generates a complete, professional QA documentation suite — Test Strategy, Test Plan,
  Test Scenarios, Test Cases, and a Coverage Validation Report — from any PRD, feature
  description, Jira ticket, Confluence page, or requirements text.

  Use this skill whenever someone needs to: create or generate test cases, write a test
  plan, produce a test strategy, generate QA artifacts from requirements, convert a PRD
  into test documentation, or build out coverage for a feature. Trigger even on casual
  phrasings like "write test cases for X", "I need a test plan for this", "can you QA
  this feature", or "generate test docs". If the user shares any kind of requirements
  and is working in a QA or engineering context, use this skill — don't wait for them
  to say "test documentation" explicitly.
---

# QA Test Documentation Skill

Produces four QA artifacts from any input requirements, then validates coverage and
offers export options. Designed for QA engineers and teams who want reusable, shareable
test documentation.

---

## Step 1 — Gather Inputs

If not already provided, ask once (group all questions — never ask one at a time):

1. **PRD source** — pasted text, URL, or uploaded file. If a URL, fetch it immediately.
2. **Platform** — Web, iOS, Android, API, Desktop, or a combination.
3. **Testing type** — E2E/UI, Integration, API, Unit (default: E2E/UI if unspecified).
4. **Feature / App name** — used in headings and file names.

If the user says "for an example" or names a common feature (login, checkout, search),
proceed with sensible assumptions and state them upfront rather than asking.

---

## Step 2 — Analyse the Requirements

Before writing, mentally map:

- **Feature areas** — the major functional domains (e.g. auth, validation, session, accessibility)
- **User flows** — the key journeys through the feature
- **Acceptance criteria** — any explicit pass/fail conditions stated in the requirements
- **Risks & dependencies** — third-party integrations, edge cases, platform-specific concerns
- **Out of scope** — anything the requirements explicitly exclude

This analysis drives quality. Do not skip it or merge it into generation.

---

## Step 3 — Generate All Four Artifacts

Output all four in a single response, in order. Every section must reference the actual
feature — never produce generic filler. Tailor risks, flows, and steps to what the PRD says.

---

### A. Test Strategy

```
## Test Strategy — [Feature Name]

### Purpose
[One paragraph: what this feature does and why this strategy exists]

### Scope
**In Scope:** [Bullet list of what is tested]
**Out of Scope:** [Bullet list of what is explicitly excluded]

### Testing Types
| Type | Coverage | Tool |
|---|---|---|
| Functional / E2E | [specifics] | [tool] |
| API | [specifics] | [tool] |
| Security | [specifics] | [tool] |
| Performance | [specifics] | [tool] |
| Accessibility | WCAG 2.1 AA | axe-core, VoiceOver, NVDA |
| Cross-browser | Chrome, Firefox, Safari, Edge | BrowserStack |
| Regression | [specifics] | Automated suite |

### Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| [Specific risk from PRD] | Low/Med/High | Critical/High/Med | [Action] |

### Entry Criteria
- [List — what must be true before testing starts]

### Exit Criteria
- [List — what must be true before testing is complete]
```

Risks must be derived from the PRD — e.g. "Payment flow failure" if payments are involved,
not generic "Risk 1". If the PRD mentions OAuth, the risk is OAuth failure blocking users.

---

### B. Test Plan

```
## Test Plan — [Feature Name]

### Objectives
[2–4 numbered objectives tied to the feature's actual requirements]

### Test Environment
| Environment | Detail |
|---|---|
| Staging URL | [URL if known, or "[staging URL]"] |
| API Base URL | [if applicable] |
| Browsers | Chrome 124+, Firefox 125+, Safari 17+, Edge 124+ |
| Devices | Desktop (1440px), Tablet (768px), Mobile (375px) |
| Test Accounts | [describe the test personas needed — valid user, locked user, etc.] |

### Test Phases
| Phase | Scope | Duration |
|---|---|---|
| Smoke | Core happy path, API health | Day 1 |
| Functional | All flows, validation, edge cases | Days 2–3 |
| Security | [feature-specific security concerns] | Day 3 |
| Accessibility | Screen reader, keyboard nav, contrast | Day 4 |
| Cross-browser | Repeat critical paths on all browsers | Day 4 |
| Regression | Full automated suite | Day 5 |

### Defect Severity Levels
| Severity | Definition | Example |
|---|---|---|
| Critical | Blocks core function or security breach | [feature-specific example] |
| High | Major flow broken, no workaround | [feature-specific example] |
| Medium | Feature degraded, workaround exists | [feature-specific example] |
| Low | Minor UX / cosmetic | [feature-specific example] |

### Dependencies
[List of what must exist before testing can start]

### Suspension Criteria
[When testing should pause — e.g. critical API down, blocker defect]
```

---

### C. Test Scenarios

Group by feature area. Aim for 5–10 scenarios per area covering: happy path, negative
cases, edge cases, and integration points.

```
## TS-[NNN] — [Feature Area Name]
| ID | Scenario |
|----|----------|
| TS-[NNN]-01 | [Happy path scenario] |
| TS-[NNN]-02 | [Negative scenario] |
| TS-[NNN]-03 | [Edge case] |
...
```

Number scenario groups sequentially (TS-001, TS-002, etc.) and scenarios within each
group sequentially (TS-001-01, TS-001-02, etc.).

---

### D. Detailed Test Cases

Write detailed test cases for the most critical scenarios. Prioritise:
- All Critical-priority scenarios
- Happy paths for all major feature areas
- Negative cases for security, data integrity, and payments

```
#### TC-[NNN]-[NN]: [Descriptive title]
**Scenario:** TS-[NNN]-[NN]
**Priority:** Critical / High / Medium / Low
**Automation Candidate:** Yes / No
**Preconditions:** [What must be true before starting]

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | [Concrete, specific action] | [Specific, binary expected result] |

**Pass Criteria:** [What success looks like — specific and binary, not "works correctly"]
**Fail Criteria:** [What failure looks like]
```

Steps must be concrete enough that any QA engineer can execute them without extra context.
Bad: "Navigate to the feature." Good: "Click the **Workouts** tab in the bottom navigation bar."
Bad: "Verify it works." Good: "Response status is 200; auth_token cookie is present with Secure flag."

Aim for 3–5 test cases per feature area; 5–8 for Critical areas like auth and payments.

---

## Step 4 — Coverage Validation Report

After generating all four artifacts, produce this report. It closes the loop between
requirements and test coverage — the section that separates this skill from ad-hoc test writing.

```
## Coverage Validation Report

### Requirement → Test Coverage Mapping
| Requirement | Covered By |
|---|---|
| [Each requirement from the PRD] | [TC/TS IDs] |

### Automation Candidates
| Test Case | Reason |
|---|---|
| [TC ID] | [Why it's a good automation candidate] |

### Clarification Questions / Gaps
| # | Gap or Question |
|---|---|
| 1 | [Ambiguity, missing requirement, or assumption made] |
```

If the PRD is clear and complete, the gaps section may be short — that's fine. Only list
real gaps, not invented ones.

---

## Step 5 — Present for Review (MANDATORY)

Always show the generated documents before any export or upload. End with:

> "Does this look right? You can ask me to adjust anything — add more negative cases,
> expand a feature area, change priorities — before I export or upload."

Do not proceed to export until the user explicitly approves or says "looks good."

---

## Step 6 — Export

Based on what the user wants:

**Download as Markdown**
Combine all artifacts into a single `.md` file.
Naming: `[FeatureName]_Test_Documentation_v1.0.md`

**Export as Word (.docx)**
Read the `docx` skill if available and follow those instructions.

**Upload to Confluence**
Ask for: base URL, space key, parent page (optional), page title.
Use the Confluence MCP if available, or provide `curl` commands for the REST API.

**Upload to TestRail**
Group test cases by module. Assign priorities. Tag automation candidates.

---

## Quality Checklist

Before presenting to the user, verify:

- [ ] Every section references the actual feature — no generic filler
- [ ] Risks in the strategy are derived from the PRD (specific, not "Risk 1")
- [ ] Scenarios cover happy path, negative, and edge cases for each feature area
- [ ] Test case steps are concrete and unambiguous
- [ ] Pass/Fail criteria are binary — not "works correctly"
- [ ] Priorities are realistic — not everything is Critical
- [ ] Every PRD requirement has a row in the Coverage Mapping table
- [ ] Automation candidates are identified with clear reasoning

---

## Files in This Skill

- `SKILL.md` — This file
- `template/TEST_DOCUMENTATION_TEMPLATE.md` — Blank template with placeholders
- `example/Login_Test_Documentation.md` — Full worked example (web login feature)
