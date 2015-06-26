# http://stackoverflow.com/questions/3794669/confirmation-email-from-devise-on-rails3-using-gmail-not-arriving
require 'tlsmail' 
Net::SMTP.enable_tls(OpenSSL::SSL::VERIFY_NONE)

#ActionMailer::Base.smtp_settings = {
#  :address              => "smtp.gmail.com",
#  :port                 => 587,
#  :domain               => "craiggers.com",
#  :user_name            => "craiggers.mail",
#  :password             => "cr4!ggers",
#  :authentication       => "plain",
#  :enable_starttls_auto => true
#}
ActionMailer::Base.smtp_settings = {
  :address              => "smtp.sendgrid.com",
  :port                 => 587,
  :user_name            => "alerts@craiggers.com",
  :password             => "Zapim70JeNO53",
  :authentication       => "plain",
  :enable_starttls_auto => true
}

#Mail.register_interceptor(DevelopmentMailInterceptor) if Rails.env.development?

