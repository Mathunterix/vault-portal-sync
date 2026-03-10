---
description: Add JSDoc comments to help LLMs understand code better
---

# /add-llm-comments - JSDoc for LLM Context

Add strategic JSDoc comments to improve LLM comprehension of the codebase.

## Usage

```
/add-llm-comments src/lib/auth.ts       # Single file
/add-llm-comments src/lib/              # Directory
/add-llm-comments --exported            # Only exported functions
/add-llm-comments --complex             # Only complex functions (>20 lines)
```

## Philosophy

**Goal:** Help future LLM sessions understand code faster, not document for humans.

**Focus on:**
- WHY the code exists (not WHAT it does - code shows that)
- Non-obvious behavior and edge cases
- Business context and domain knowledge
- Relationships with other parts of the system

**Skip:**
- Self-explanatory functions (getters, simple utils)
- Already well-documented code
- Generated code (Prisma client, etc.)

## JSDoc Format

### Functions

```typescript
/**
 * [One-line summary of PURPOSE, not implementation]
 *
 * @context [Business/domain context - why this exists]
 * @behavior [Non-obvious behavior, edge cases]
 * @depends [Key dependencies or side effects]
 *
 * @param name - [What it represents, not just type]
 * @returns [What the return value means in context]
 *
 * @example
 * // [Realistic usage example]
 * const result = functionName(realValue)
 */
```

### Classes/Components

```typescript
/**
 * [What this component/class is responsible for]
 *
 * @context [Where it fits in the architecture]
 * @state [Key state it manages, if any]
 * @events [Events it emits or responds to]
 *
 * @example
 * // [How to use it]
 */
```

### Complex Types

```typescript
/**
 * [What this type represents in the domain]
 *
 * @context [When/where this type is used]
 * @invariants [Constraints that should always be true]
 */
```

## Process

### Step 1: Scan files

```bash
# Find functions without JSDoc
grep -r "^export function\|^export const.*=.*=>" src/ | grep -v "/**"

# Or use AST analysis for better accuracy
```

### Step 2: Identify candidates

Prioritize:
1. **Exported functions** - API surface, used elsewhere
2. **Complex functions** - >20 lines, multiple branches
3. **Domain logic** - Business rules, calculations
4. **Integration points** - API calls, DB queries, auth

Skip:
- Simple utilities (isNull, formatDate)
- React component props interfaces (TypeScript handles this)
- Test files
- Generated code

### Step 3: Generate comments

For each candidate, analyze:
- Function signature and body
- Where it's called from (grep for usages)
- Related functions in the same file
- Domain context from file path/name

### Step 4: Apply comments

Use `Edit` tool to add comments above each function.

**Important:**
- Don't modify the function code itself
- Preserve existing comments if they're good
- Keep comments concise (3-5 lines typical)

## Examples

### Before

```typescript
export async function processPayment(
  userId: string,
  amount: number,
  method: PaymentMethod
) {
  const user = await getUser(userId)
  if (!user.verified) throw new PaymentError('UNVERIFIED')

  const fee = calculateFee(amount, method)
  const total = amount + fee

  if (total > user.balance) {
    await notifyInsufficientFunds(user)
    throw new PaymentError('INSUFFICIENT_FUNDS')
  }

  return await chargeCard(user, total, method)
}
```

### After

```typescript
/**
 * Process a payment with fraud checks and fee calculation.
 *
 * @context Called from checkout flow after cart confirmation.
 *          User must be verified (KYC completed) to pay.
 * @behavior Notifies user via email if insufficient funds.
 *           Fee varies by payment method (see calculateFee).
 * @depends Stripe for actual charge (chargeCard).
 *
 * @param userId - Authenticated user's ID from session
 * @param amount - Cart total in cents (not including fees)
 * @param method - User-selected payment method
 * @returns Stripe PaymentIntent on success
 * @throws {PaymentError} UNVERIFIED | INSUFFICIENT_FUNDS | STRIPE_ERROR
 */
export async function processPayment(
  userId: string,
  amount: number,
  method: PaymentMethod
) {
  // ... code unchanged
}
```

## What NOT to Document

```typescript
// DON'T - Self-explanatory
/**
 * Gets user by ID
 * @param id - The user ID
 * @returns The user
 */
export function getUser(id: string) { ... }

// DON'T - Just restating types
/**
 * @param name - string
 * @param age - number
 */

// DON'T - Implementation details
/**
 * Uses a for loop to iterate over items
 * and filters them using Array.filter
 */
```

## Tags Reference

| Tag | When to Use |
|-----|-------------|
| `@context` | Business/domain context, where it fits |
| `@behavior` | Non-obvious behavior, edge cases |
| `@depends` | External dependencies, side effects |
| `@invariant` | Conditions that must always be true |
| `@security` | Security considerations |
| `@performance` | Performance notes (caching, N+1, etc.) |
| `@deprecated` | Migration path to replacement |
| `@see` | Related functions/files |

## Output

Report what was documented:

```markdown
## JSDoc Comments Added

### src/lib/payment.ts
- `processPayment` - Added context about checkout flow
- `calculateFee` - Added fee structure explanation
- `refundPayment` - Added partial refund behavior

### src/lib/auth.ts
- `verifyToken` - Added security context
- `refreshSession` - Added expiration behavior

### Skipped
- `src/lib/utils.ts` - Simple utilities, self-explanatory
- `src/generated/` - Generated code

**Total:** 12 functions documented
```

## Tips

- Run after major features are complete
- Focus on code that confused you (it'll confuse LLMs too)
- Update comments when behavior changes
- Keep `@example` realistic and copy-pasteable
