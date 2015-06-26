require 'spec_helper'

describe PostingController do

  describe "GET 'index'" do
    it "should be success" do
      get 'index'
      response.should be_success
    end

    it "should redirect to unsupported_browser_path if safari mobile" do
      # http://developer.apple.com/library/safari/#documentation/AppleApplications/Reference/SafariWebContent/OptimizingforSafarioniPhone/OptimizingforSafarioniPhone.html
      request.env['HTTP_USER_AGENT'] = 'Mozilla/5.0 (iPhone; U; CPU iOS 2_0 like Mac OS X; en-us) AppleWebKit/525.18.1 (KHTML, like Gecko) Version/3.1.1 Mobile/XXXXX Safari/525.20'
      get 'index'
      response.should redirect_to(unsupported_browser_path)
    end

    it "should redirect to unsupported_browser_path if internet explorer" do
      # http://www.useragentstring.com/pages/Internet%20Explorer/
      # http://en.wikipedia.org/wiki/Internet_Explorer_Mobile#User_agent
      request.env['HTTP_USER_AGENT'] = 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.1; XBLWP7; ZuneWP7)'
      get 'index'
      response.should redirect_to(unsupported_browser_path)
    end
  end

end
