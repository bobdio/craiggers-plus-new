class SearchMailer < ActionMailer::Base

  def send_criteria(to, from, search)
    @to, @fr, @search = to, from, search
    mail(:to => to, :from => from, :subject => "craiggers.com search from #{from}")
  end

  def search_update(search, new_count, options)
    return false if options['email'].blank?

    @search = search
    @new = new_count
    @name = options['name']
    @headings = options['headings']
    mail :to => options['email'],
         :from => 'no-reply@jeboom.com',
         :subject => "Your jeboom.com '#{@name}' search has new postings"
  end
end
