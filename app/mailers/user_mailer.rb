class UserMailer < ActionMailer::Base
  def send_password_change_link(to, domain, token, user)
    @to, @domain, @user = to, domain, user
    @link = "#{@domain['host']}/?token=#{token}"
    mail(:to => to,:from=>"no-reply@jeboom.com", :subject => "Jeboom.com password changing link").deliver!
  end

  def send_verify_email_link(secure_hash, user, email, mobile_link)
    @user, @secure_hash = user, secure_hash
    @mobile_link = mobile_link
    mail(:to => email,:from=>"no-reply@jeboom.com", :subject => "Jeboom.com verify email link").deliver!
  end
end