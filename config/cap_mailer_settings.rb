
ActionMailer::Base.delivery_method = :smtp
ActionMailer::Base.smtp_settings = { 
  :address        => "smtp.sendgrid.com", 
  :port           => 25, 
  :domain         => 'craiggers.com', 
  :perform_deliveries => true,
  :user_name      => "alerts@craiggers.com", 
  :password       => "Zapim70JeNO53", 
  :authentication => :login,
  :enable_starttls_auto => false
}
ActionMailer::Base.default_charset = "utf-8"# or "latin1" or whatever you are using

CapMailer.configure do |config|
  config[:recipient_addresses]  = ["tech@3taps.com"]
  #config[:recipient_addresses]  = ["dfoley@3taps.com"]
  # NOTE: THERE IS A BUG IN RAILS 2.3.3 which forces us to NOT use anything but a simple email address string for the sender address.
  # https://rails.lighthouseapp.com/projects/8994/tickets/2340
  # Therefore %("Capistrano Deployment" <releases@example.com>) style addresses may not work in Rails 2.3.3
  config[:sender_address]       = "alerts@craiggers.com"
  config[:subject_prepend]      = "[WEBAPP-CAP-DEPLOY]"
  config[:site_name]            = "3taps Web App"
  config[:email_content_type]   = "text/html" # OR "text/plain" if you want the plain text version of the email
end

