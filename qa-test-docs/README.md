# qa-test-docs

A Claude Code skill that generates a complete QA documentation suite from any PRD, feature description, Jira ticket, or requirements text.

## What it generates

From a single input, the skill produces:

1. **Test Strategy** — scope, testing types, risk assessment, entry/exit criteria
2. **Test Plan** — objectives, environment, test phases, defect severity levels
3. **Test Scenarios** — grouped by feature area, covering happy paths, negative cases, and edge cases
4. **Detailed Test Cases** — step-by-step, with explicit Pass/Fail criteria and automation tags
5. **Coverage Validation Report** — requirement-to-test mapping, automation candidates, and gaps

## Installation

1. Copy `qa-test-docs.skill` into your Claude Code skills directory:

   **Mac:**
   ```
   ~/Library/Application Support/Claude/skills/
   ```

   **Windows:**
   ```
   %APPDATA%\Claude\skills\
   ```

2. Restart Claude Code (or reload the skills list).

That's it — the skill is active immediately.

## Usage

Just describe your feature to Claude. The skill triggers automatically on phrases like:

- "Write test cases for the checkout flow"
- "I need a test plan for our password reset feature"
- "Generate QA docs from this PRD: [paste or link]"
- "Create test documentation for [feature name]"

Claude will ask for four inputs if not already provided:

| Input | Example |
|---|---|
| PRD source | Pasted text, Confluence/Jira/Notion URL, or uploaded file |
| Platform | Web, iOS, Android, API, Desktop |
| Testing type | E2E/UI, Integration, API, Unit (defaults to E2E/UI) |
| Feature/App name | Used in headings and file names |

## Export options

After reviewing the output, you can ask Claude to export as:

- **Markdown** — single `.md` file, named `[Feature]_Test_Documentation_v1.0.md`
- **Word (.docx)** — formatted document
- **Confluence** — uploaded via REST API (you'll need your space key and base URL)
- **TestRail** — grouped by module with priority and automation tags

## Files in this skill

| File | Purpose |
|---|---|
| `SKILL.md` | Core skill instructions (do not edit unless updating the workflow) |
| `template/TEST_DOCUMENTATION_TEMPLATE.md` | Blank template for manual use |
| `example/Login_Test_Documentation.md` | Full worked example — web login feature |
| `evals/evals.json` | Eval test cases for skill validation |

## Worked example

See [`example/Login_Test_Documentation.md`](example/Login_Test_Documentation.md) for a complete output generated for a web login feature, including all five sections and a coverage validation report.

## Contributing

To update the skill workflow, edit `SKILL.md` and repackage:

```bash
python3 -m scripts.package_skill ./qa-test-docs
```

This produces a new `qa-test-docs.skill` file. Commit both the source folder and the `.skill` file.
