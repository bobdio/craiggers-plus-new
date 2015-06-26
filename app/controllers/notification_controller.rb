require "net/http"
require "uri"

class NotificationController < ApplicationController

  def create
    if verify_recaptcha(params)
      res = Net::HTTP.post_form(URI.parse("http://3taps.net/notifications/create?app=Craiggers"), params)
      render :json => {:success => true}
    else
      render :json => {:success => false, :error => {:code => "captcha", :message => "Try entering the text again"}}
    end
  end
end
