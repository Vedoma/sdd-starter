# TEMPLATE - copy this into a real docs/spec/behavior/journeys/<product-flow>.feature and
# replace the content. A journey is the PRODUCT-LEVEL altitude: a few end-to-end happy paths
# that define the whole product, authored in Phase 2 with the PRD. Tag each @journey. Keep it
# thin - assert the flow and the outcome, and reference the feature scenarios (by @AC- id)
# that own the detail. Do not restate a rule a feature scenario already pins. Delete this
# template once you have a real one. See README.md in this directory and gherkin-guidelines.md.

@journey
Feature: New customer buys their first item
  As a first-time visitor
  I want to go from browsing to a confirmed order
  So that I can buy without friction

  # This journey traverses three capabilities. The DETAIL of each step lives in the feature
  # scenarios cited in the comment - this journey only asserts the end-to-end flow succeeds.

  Scenario: A visitor registers, checks out, and receives confirmation
    Given a visitor is viewing the "Aeropress Go" product page   # detail: @AC-catalog-1
    When she registers with "maria@example.com"                  # detail: @AC-login-1
    And she checks out with a valid card                         # detail: @AC-checkout-2, @AC-checkout-3
    Then her order is confirmed with an order number
    And she receives a confirmation email                        # detail: @AC-notify-1
