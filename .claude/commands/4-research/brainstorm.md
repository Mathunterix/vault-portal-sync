---
description: Iterative research with critical thinking and web search
---

# /brainstorm - Deep Research with Critical Analysis

Structured research process using `deep-search` agent with iterative refinement and critical thinking.

## Usage

```
/brainstorm "How to implement real-time collaboration in Next.js"
/brainstorm "Best database for multi-tenant SaaS"
/brainstorm "Auth strategies: JWT vs Sessions vs OAuth"
```

## Process

### Phase 1: Initial Research

Launch `deep-search` agent with the topic:

```
Use the Task tool with subagent_type='deep-search':

"Research: [TOPIC]

Find:
1. Current best practices (2024-2025)
2. Popular solutions/tools/libraries
3. Pros and cons of each approach
4. Real-world examples and case studies
5. Common pitfalls to avoid

Save findings to docs/deepsearch/[topic-slug].md"
```

### Phase 2: Critical Analysis

After receiving results, apply **Devil's Advocate** thinking:

```markdown
## Critical Questions

1. **Assumptions**: What assumptions are these recommendations based on?
2. **Context fit**: Does this apply to OUR specific context (stack, scale, team)?
3. **Recency**: Is this information current? Tech moves fast.
4. **Bias**: Are sources biased (vendor docs, sponsored content)?
5. **Alternatives**: What alternatives weren't mentioned?
6. **Trade-offs**: What are the hidden costs/downsides?
```

### Phase 3: Gap Identification

Identify what's missing and launch follow-up searches:

```
Gaps identified:
- [ ] Missing: Performance benchmarks
- [ ] Missing: Security implications
- [ ] Missing: Migration path from current solution
- [ ] Unclear: Cost at our scale

Launch additional deep-search for each gap.
```

### Phase 4: Synthesis

Consolidate all findings into actionable recommendation:

```markdown
# Research Summary: [TOPIC]

## Context
- Our stack: [stack]
- Our constraints: [constraints]
- Our scale: [scale]

## Options Analyzed

### Option A: [Name]
**Pros:**
- [pro 1]
- [pro 2]

**Cons:**
- [con 1]
- [con 2]

**Fit for us:** [Good/Medium/Poor] - [reason]

### Option B: [Name]
...

## Recommendation

**Recommended:** [Option X]

**Reasoning:**
1. [reason 1]
2. [reason 2]

**Risks:**
- [risk 1] → Mitigation: [mitigation]

**Next steps:**
1. [ ] [action 1]
2. [ ] [action 2]

## Sources
- [source 1](url)
- [source 2](url)
```

## Critical Thinking Techniques

### 1. Devil's Advocate
Challenge every recommendation:
- "Why NOT this approach?"
- "What could go wrong?"
- "Who benefits from recommending this?"

### 2. First Principles
Break down to fundamentals:
- "What problem are we actually solving?"
- "What are the constraints that can't change?"
- "What would we do if starting from scratch?"

### 3. Inversion
Think backwards:
- "How would we guarantee failure?"
- "What would make this the wrong choice?"

### 4. Second-Order Effects
Consider ripple effects:
- "If we choose this, what changes downstream?"
- "How does this affect [team/performance/cost] in 6 months?"

## Output Location

All brainstorm results are saved to:
```
docs/deepsearch/[topic-slug].md
```

## Example Session

```
User: /brainstorm "Real-time features for Next.js app"