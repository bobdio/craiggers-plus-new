class PostingMailer < ActionMailer::Base

  def send_posting(to, from, posting, domain)
    @to, @from , @domain  = to, from, domain
    @posting = @domain['host'] + "/#!/posting/#{posting}"
    mail(:to => to, :from => from, :subject => "#{@domain['name']}.com posting from #{@from}")
  end

end
