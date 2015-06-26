Feature: Status location counts
  Show the loc_1 counts for the current search status annotation if the status annotation is set.
  Clicking on a status location runs a search on the status for that location.

  @javascript
  Scenario: Status locations
    Given I am an anonymous user
    When I go to the landing page
    And I submit a search for "cars" in category "cars+trucks" in location "new york"
    Then I should see postings
    And status locations should not be visible
    When I click the status counts header
    And I click the "lost" status
    Then I should see postings
    And the current search should be for "cars" with category code "all" and location code "all"
    And I should see "lost" for the current status
    And status locations should be visible
    And the sum of the status location counts should equal the status count for "lost"
    And the status locations should be sorted by count hight to low and alphabetically

  # @javascript
  # Scenario: Searching by status location
  #   Given I am an anonymous user
  #   When I go to the landing page
  #   And I submit a search for "cars" in category "cars+trucks" in location ""
  #   Then I should see postings
  #   When I click the status counts header
  #   And I click the "lost" status
  #   Then I should see postings
  #   When I click the status locations header
  #   And I take note of status location 1 and its count
  #   And I click status location 1
  #   Then I should see postings
  #   And the current search location should be the status location I saw before
  #   And the result count should be the status location count I saw before
  #   And I should see "lost" for the current status
