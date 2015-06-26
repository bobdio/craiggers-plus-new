Feature: Expired Favorites
  
  @javascript
  Scenario: Expired favorites
    Given I am an anonymous user
    And the user has 3 expired favorited postings
    And the user has 3 old expired favorited postings
    When I go to the landing page
    And I follow "skip this page"
    And I submit the search
    Then I should see postings
    When I favorite the first 3 postings
    And I view favorites
    Then I should have 9 favorited postings
    And I should see 6 favorited postings
    And I should see 3 expired favorited postings
    And I should see 3 expired favorites notification

  @javascript
  Scenario: Deleting an expired favorite
    Given I am an anonymous user
    And the user has 3 expired favorited postings
    When I go to the landing page
    And I follow "skip this page"
    And I view favorites
    Then I should see 3 favorited postings
    And I should see 3 expired favorited postings
    When I unfavorite favorited posting 1
    Then I should see 2 favorited postings
    And I should have 2 favorited postings
