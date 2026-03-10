---
description: Research library documentation with parallel explore-docs agents
---

# /learn-docs - Documentation Research

Launch multiple `explore-docs` agents in parallel to research a library/framework from multiple sources.

## Usage

```
/learn-docs next.js server-actions
/learn-docs prisma transactions
/learn-docs tanstack-query mutations
/learn-docs zod "custom error messages"
```

## Process

### Step 1: Launch parallel documentation searches

Use the Task tool to launch multiple `explore-docs` agents simultaneously:

```
Launch 3 explore-docs agents in parallel (single message, multiple Task calls):

1. Official docs:
   "Research [LIBRARY] documentation for [TOPIC].
    Focus on: official docs, API reference, getting started guides.
    Find: syntax, parameters, return types, basic examples."

2. GitHub examples:
   "Search GitHub for [LIBRARY] [TOPIC] examples.
    Focus on: real-world usage, popular repos, test files.
    Find: patterns, edge cases, integration examples."

3. Community resources:
   "Search for [LIBRARY] [TOPIC] tutorials and discussions.
    Focus on: Stack Overflow, blog posts, Discord/forums.
    Find: common issues, workarounds, best practices."
```

### Step 2: Collect results

Wait for all 3 agents to complete using TaskOutput.

### Step 3: Synthesize into practical guide

Consolidate findings into a single actionable document:

```markdown
# [LIBRARY]: [TOPIC] Guide

## Quick Start

```typescript
// Minimal working example
```

## API Reference

### `functionName(params)`

**Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `param1` | `string` | Yes | Description |

**Returns:** `ReturnType`

**Example:**
```typescript
// usage example
```

## Common Patterns

### Pattern 1: [Name]
```typescript
// code
```

### Pattern 2: [Name]
```typescript
// code
```

## Gotchas & Tips

- **Gotcha 1:** [description] → Solution: [solution]
- **Tip 1:** [helpful tip]

## Integration with Our Stack

How to use this with:
- Next.js 15: [specifics]
- TypeScript: [type considerations]
- Our patterns: [how it fits]

## Sources

- [Official Docs](url)
- [GitHub Example](url)
- [Tutorial](url)
```

### Step 4: Save output

Save the guide to:
```
docs/guides/[library]-[topic].md
```

## Example Session

```
User: /learn-docs prisma "soft delete"

Agent launches 3 parallel searches:
1. explore-docs: "Prisma soft delete official documentation middleware"
2. explore-docs: "Prisma soft delete GitHub examples implementation"
3. explore-docs: "Prisma soft delete best practices Stack Overflow"

Results synthesized into:
docs/guides/prisma-soft-delete.md
```

## Tips

- Be specific with the topic (e.g., "error handling" not just "errors")
- Include version if relevant (e.g., "next.js 15 server actions")
- The more specific, the better the results
- Results are cached - same query won't re-fetch

## When to Use

| Scenario | Command |
|----------|---------|
| Learning a new library feature | `/learn-docs` |
| General research/comparison | `/brainstorm` |
| Exploring our codebase | `explore-codebase` agent |
| Quick API lookup | `explore-docs` agent directly |

## Output Location

```
docs/guides/[library]-[topic].md
```

## Integration

After learning, you can:
- Use the guide to implement the feature
- Reference it in code comments
- Share with team
