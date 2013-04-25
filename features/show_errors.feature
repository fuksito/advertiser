Feature: Show errors

  In order to have responsible form
  Should validate date fields
  And show messages if they are invalid

  Scenario: Title is blank
    
    Given I am on the "new campaign page"
    And press "Create Campaign"
    Then I should see "can't be blank" within "#title_err_msg"

  Scenario: Start or End date is blank

    Given I am on the "new campaign page"
    And press "Create Campaign"
    Then I should see "can't be blank" within "#starts_at_date_err_msg"
    Then I should see "can't be blank" within "#ends_at_date_err_msg"
    When I fill in "starts_at_date" with "2012-12-01"
    Then I should not see "can't be blank" within "#starts_at_date_err_msg"
    And I should see "can't be blank" within "#ends_at_date_err_msg"

  Scenario: End date is before Start date

    Given I am on the "new campaign page"
    And press "Create Campaign"
    When I fill in "starts_at_date" with "2012-12-01"
    And I fill in "ends_at_date" with "2012-10-01"
    And press "Create Campaign"
    Then I should see "Ends date should be after starts date" within "#ends_at_date_err_msg"