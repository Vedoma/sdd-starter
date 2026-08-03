<!--
TEMPLATE - copy this into a real docs/spec/behavior/discovery/<capability>.md and replace
the content. This is an Example Map: the residue of a Discovery conversation. It is optional
working material, not a gated document. Delete this template once you have a real one.
-->

# Discovery — Account login

**Capability:** `login` · **Story owner:** [name] · **Status:** questions open

> Working material from the Discovery conversation. When every question is answered and the
> agreed examples are formulated into scenarios (`/acceptance login`), this map has done its
> job and can be archived.

## Story

> As a returning customer, I want to sign in with my email and password so that I can reach
> my account.

## Rules and examples

### Rule 1 — Correct credentials sign the customer in
- **Example:** Maria signs in with `maria@example.com` and her correct password → she lands
  on her account dashboard.

### Rule 2 — Wrong credentials are refused without revealing which field was wrong
- **Example:** Maria signs in with the right email and a wrong password → she sees "Email or
  password is incorrect" (not "wrong password").
- **Example:** Someone signs in with `nobody@example.com` → the **same** generic message, so
  the form never confirms whether an account exists.

### Rule 3 — Repeated failures lock the account temporarily
- **Example:** 5 failed attempts in a row for `maria@example.com` → the 6th is refused with
  "Account locked, try again in 15 minutes", even if the password is now correct.

## Questions (resolve before / during Formulation)

- [ ] Is the lockout **5 attempts** and **15 minutes**, or does security own those numbers?
      `[OPEN - REQUIRES INPUT]`
- [ ] Does the lockout count per-account or per-IP? (Changes the examples above.)
- [ ] Is there a "remember me" behaviour in scope for the MVP, or a later capability?
- [ ] Password reset — same capability or its own story? (Out of scope here if separate.)

## Notes

Rules 1–2 look ready to formulate. Rule 3 is blocked on the two lockout questions — do not
write its scenarios until security confirms the numbers, or they will be invented.
