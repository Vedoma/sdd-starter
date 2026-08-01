# TEMPLATE - copy this into a real <capability>.feature, then delete this file.
#
# This is the behavioural half of the SPECIFICATION (Phase 3), authored as the technical
# spec firms up: the observable behaviour of a capability, written as examples. It is not a
# test written after the code - it defines what the code must do, and /implement makes it
# pass. How to phrase good scenarios: gherkin-guidelines.md (the vendored format contract).
# What is specific to this scaffold: README.md in this directory. The short version:
#
#   - Each Scenario is one acceptance criterion. Give it a stable @AC-<area>-<n> tag: the
#     id the technical-spec and backlog tasks CITE. Traceability flows outward FROM here.
#   - Write DECLARATIVE steps - what the user achieves, not which buttons they click.
#   - Cover the DEFINING examples: happy paths + the critical rules. Not every edge case;
#     completeness fills in as the spec and tasks firm up (see "altitude" in README.md).
#   - The Gherkin is portable; the step definitions + runner that execute it live in
#     tests/acceptance/ and are a per-project choice recorded in an ADR.

Feature: Account login
  As a registered user
  I want to sign in with my credentials
  So that I can reach my account

  Background:
    Given a registered account "ada@example.com" with a valid password

  @AC-login-1 @happy-path
  Scenario: Signing in with correct credentials
    When Ada signs in with her correct email and password
    Then she reaches her account dashboard
    And a new session is started

  @AC-login-2
  Scenario: Signing in with the wrong password
    When Ada signs in with the wrong password
    Then she is not signed in
    And she sees a generic "email or password is incorrect" message
    # Generic on purpose: the spec forbids revealing whether the email exists. The
    # scenario encodes that rule, so a "helpful" agent cannot quietly leak it.

  @AC-login-3
  Scenario Outline: Rejecting malformed input before authentication
    When a login is attempted with email "<email>" and password "<password>"
    Then the attempt is rejected as invalid input
    And no authentication is performed

    Examples:
      | email           | password | note             |
      |                 | secret   | missing email    |
      | ada@example.com |          | missing password |
      | not-an-email    | secret   | malformed email  |
