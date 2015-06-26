class UserMailer < ActionMailer::Base
  def send_password_change_link(to, domain, token, user)
    @to, @domain, @user = to, domain, user
    @link = "#{@domain['host']}/?token=#{token}"
    mail(:to => to,:from=>"no-reply@#jeboom.com", :subject => "Jeboom.com password changing link").deliver!
  end
end
