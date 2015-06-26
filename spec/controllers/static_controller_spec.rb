require 'spec_helper'

describe StaticController do

  describe "GET 'terms'" do
    it "should be successful" do
      get 'terms'
      response.should be_success
    end
  end

  describe "GET 'mobile'" do
    it "should be successful" do
      get 'mobile'
      response.should be_success
    end
  end

  describe "GET 'help'" do
    it "should be successful" do
      get 'help'
      response.should be_success
    end
  end

end
