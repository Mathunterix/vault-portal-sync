---
description: Code review with parallel specialized agents (security, clean-code, logic)
---

# /review - Parallel Code Review

Launch 3 specialized review agents in parallel to analyze code from multiple perspectives.

## Usage

```
/review                    # Review staged/modified files
/review src/lib/auth.ts    # Review specific file
/review src/api/           # Review directory
/review --all              # Review entire src/
```

## Architecture

```
/review
│
├── Phase 1: Parallel Analysis (3 agents)
│   ├── Security Agent (OWASP) → security findings
│   ├── Clean Code Agent (SOLID/DRY) → architecture findings
│   └── Logic Agent (bugs/edge cases) → logic findings
│
├── Phase 2: Synthesis
│   └── Consolidate → grouped by file, sorted by severity
│
└── Output: Markdown report
```

## Execution Steps

### Step 1: Identify files to review

If no argument provided:
```bash
git diff --name-only --cached  # staged files
git diff --name-only           # modified files
```

If argument provided:
- File path → review that file
- Directory → review all .ts/.tsx/.js/.jsx files in directory
- `--all` → review all files in src/

### Step 2: Launch parallel agents

Use the Task tool to launch 3 `code-reviewer` agents in parallel:

```
Task 1: code-reviewer with focus=security
Task 2: code-reviewer with focus=clean-code
Task 3: code-reviewer with focus=logic
```

**IMPORTANT**: Launch all 3 in a SINGLE message with multiple Task tool calls to ensure parallel execution.

Example prompt for each agent:
```
Review these files with focus on [FOCUS]:

Files:
- [file1]
- [file2]

[Include file contents or let agent read them]
```

### Step 3: Wait for results

Use TaskOutput to collect results from all 3 agents.

### Step 4: Synthesize results

Consolidate the 3 reports into a single review:

1. **Group by file** (not by agent)
2. **Sort by severity** within each file (CRITICAL > HIGH > MEDIUM > LOW)
3. **Deduplicate**: If same line mentioned by 2+ agents, merge into single finding
4. **Add summary**:
   - Total findings count by severity
   - Top 3 critical issues
   - Overall code quality score (1-10)

### Step 5: Output format

```markdown
# Code Review Report

**Files reviewed**: X
**Total findings**: Y (Critical: A, High: B, Medium: C, Low: D)
**Quality score**: N/10

## Top Issues to Fix

1. [Most critical issue]
2. [Second critical issue]
3. [Third critical issue]

---

## Findings by File

### `src/path/to/file.ts`

#### CRITICAL

**[Security] SQL Injection (line 42)**
```typescript
// Current (vulnerable)
const query = `SELECT * FROM users WHERE id = '${id}'`

// Fixed
const query = 'SELECT * FROM users WHERE id = $1'
```

#### HIGH

**[Clean Code] SRP Violation (lines 10-150)**
Class handles authentication AND data persistence. Split into:
- `AuthService` - authentication logic
- `UserRepository` - data access

**[Logic] Missing null check (line 78)**
```typescript
// Current
return user.profile.name

// Fixed
return user?.profile?.name ?? 'Unknown'
```

#### MEDIUM

...

---

### `src/path/to/other.ts`

...

---

## Recommendations

- [ ] Fix all CRITICAL issues before merge
- [ ] Address HIGH issues in this PR or create follow-up
- [ ] MEDIUM/LOW can be addressed later
```

## Severity Definitions

| Severity | Criteria | Action |
|----------|----------|--------|
| **CRITICAL** | Security vulnerability, data loss risk, RCE | Block merge |
| **HIGH** | Bugs, major code smells, missing auth | Fix before merge |
| **MEDIUM** | Minor code smells, edge cases | Fix or create ticket |
| **LOW** | Style, naming, minor improvements | Optional |

## Tips

- For large PRs, focus on changed files only (default behavior)
- Use `--all` sparingly (expensive for large codebases)
- Review reports may have false positives - use judgment
- Critical security findings should trigger secret rotation if already deployed
