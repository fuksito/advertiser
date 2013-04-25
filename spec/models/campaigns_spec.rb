require 'spec_helper'

describe Campaigns do

  subject { Campaigns.new }
  let (:valid_campaign) { Campaigns.new(title: 'Title', starts_at_date: '2012-01-01', ends_at_date: '2012-02-01') }

  it "should create new instance" do
    subject.should be_present
  end

  it "should have starts_at and ends_at" do
    subject.should respond_to :starts_at
    subject.should respond_to :ends_at
  end

  it "should format dates to starts_date and starts_time" do
    
    test_date, test_time = '2012-12-25',  '12:00'

    subject.starts_at_date = test_date
    subject.starts_at_time = test_time
    subject.time_zone = 'Kyiv'
    subject.title = 'test'
    subject.save
    subject.starts_at.strftime('%Y-%m-%d').should eq test_date
    subject.starts_at.strftime('%H:%M').should eq test_time
    
    subject.starts_at.utc.strftime('%H:M').should_not eq test_time
  end

  it "should not save with out dates" do
    
    valid_campaign.should be_valid

    valid_campaign.starts_at_date = nil
    valid_campaign.should_not be_valid
  end

  it "should save data and reload it" do 
    some_data = ['Ukraine', ['Russian', 'Ukrainian']]
    valid_campaign.data = some_data
    valid_campaign.save
    campaign_from_db = Campaigns.find(valid_campaign.id)
    campaign_from_db.data.should == some_data
  end
  
end