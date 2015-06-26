require 'spec_helper'

describe ProfileController do

  describe "GET 'sign_up'" do
    it "should be successful" do
      get 'sign_up'
      response.should be_success
    end
  end

  describe "GET 'sign_in'" do
    it "should be successful" do
      get 'sign_in'
      response.should be_success
    end
  end

  describe "GET 'edit_profile'" do
    it "should be successful" do
      get 'edit_profile'
      response.should be_success
    end
  end

  describe "GET 'link_identities'" do
    it "should be successful" do
      get 'link_identities'
      response.should be_success
    end
  end

  describe "GET 'notification_settings'" do
    it "should be successful" do
      get 'notification_settings'
      response.should be_success
    end
  end

end
