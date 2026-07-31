# TEMPLATE — copy this into a real <capability>.feature, then delete this file.
#
# This is the behavioural half of the spec, made executable: a backlog task's acceptance
# criteria expressed as scenarios and authored BEFORE the code. `/implement` makes them
# pass. See README.md in this directory for the full rules. The short version:
#
#   • Tag every scenario with the task + spec section it satisfies (@TASK-NNN @spec-§X.Y)
#     so it traces to a real backlog task (C5) and a real spec section (C1).
#   • Write DECLARATIVE steps — what the user achieves, not which buttons they click.
#   • One behaviour per scenario; use a Scenario Outline for data variations.
#   • The Gherkin is portable; the step definitions + runner that execute it live in
#     tests/acceptance/ and are a per-project choice recorded in an ADR. This file makes
#     no commitment to a runner.

@TASK-014 @spec-§4.2
Feature: Account login
  As a registered user
  I want to sign in with my credentials
  So that I can reach my account

  Background:
    Given a registered account "ada@example.com" with a valid password

  @happy-path
  Scenario: Signing in with correct credentials
    When Ada signs in with her correct email and password
    Then she reaches her account dashboard
    And a new session is started

  Scenario: Signing in with the wrong password
    When Ada signs in with the wrong password
    Then she is not signed in
    And she sees a generic "email or password is incorrect" message
    # Generic on purpose: §4.2 forbids revealing whether the email exists. The scenario
    # encodes that decision, so a "helpful" agent cannot quietly leak it.

  Scenario Outline: Rejecting malformed input before authentication
    When a login is attempted with email "<email>" and password "<password>"
    Then the attempt is rejected as invalid input
    And no authentication is performed

    Examples:
      | email           | password | note             |
      |                 | secret   | missing email    |
      | ada@example.com |          | missing password |
      | not-an-email    | secret   | malformed email  |
