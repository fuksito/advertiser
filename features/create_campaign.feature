Feature: Creating Campaigns

  In order to make advertisement
  As a customer
  I should be able to create new campaigns

  Scenario: Create first campaign

    Given I am on the home page
    When I press "Add Campaign"
    Then I should see "New Campaign"
    Then I fill in "title" with "Happy New Year"
    And I fill in "starts_at_date" with "2012-12-25"
    And I fill in "starts_at_time" with "00:00"
    And I fill in "ends_at_date" with "2013-01-14"
    And I fill in "ends_at_time" with "23:59"
    And I press "Create Campaign"
    Then I should see "Happy New Year" within "#campaign_list"
