Feature: Status counts filter

  @javascript
  Scenario: Status counts
    Given I am an anonymous user
    When I go to the landing page
    And I follow "skip this page"
    And I submit a search for "cars" in category "cars+trucks" in location "new york"
    Then I should see postings
    When I click the status counts header
    Then I should see status counts for lost, found, stolen, wanted

  @javascript
  Scenario: Searching on and clearing status 
    Given I am an anonymous user
    When I go to the landing page
    And I submit a search for "cars" in category "cars+trucks" in location "new york"
    Then I should see postings
    When I click the status counts header
    And I take note of the status count for "lost"
    And I click the "lost" status
    Then I should see postings
    And the current search should be for "cars" with category code "all" and location code "all"
    And the result count should be the same status count I saw before
    And I should see "lost" for the current status
    When I click the status count clear link
    Then I should see postings
    And the current search should not have "status" annotation
