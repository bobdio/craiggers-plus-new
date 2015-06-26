desc "check new postings"
task :check_new_postings_from_source, [:source] => :environment do |t, args|
  source = args['source']
  host = 'http://search.3taps.com/'
  host = 'http://search.3taps.com/' if Rails.env == 'dev'

  token = 'auth_token=52583033c5aa2786f93ea4d862b74120'
  file_url = Rails.root + 'config/last_postings.yml'
  
  url = "#{host}?#{token}&source=#{source}&rpp=1"
  puts '---------------------------------------'
  puts 'url: ' + url
  
  last = begin
    data = RestClient.get url
    ActiveSupport::JSON.decode data
  rescue => e
    return {success: false, error: e.to_s}
  end
  puts "response: #{last.inspect}"
  last_posting_by_source = last['postings'].first['id'] 

  puts "file url: #{file_url.to_s}"
  current_last_postings_by_sources = YAML::load_file file_url

  if current_last_postings_by_sources[source] == last_posting_by_source
    SearchMailer.notify_about_no_new_postings(source).deliver!
    puts 'no new records for ' + source
  end
  
  puts "stored postings: #{current_last_postings_by_sources.inspect}"
  puts "received postings: #{source} => #{last_posting_by_source.inspect}"
  current_last_postings_by_sources[source] = last_posting_by_source
  File.open(file_url, 'w') {|f| f.write(current_last_postings_by_sources.to_yaml) }
end

#CRAIG EBAYC BKPGE