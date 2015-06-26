require 'csv'
require 'json'

def generate_csv(input, output)
  keys = %w(code group_code group_name name)
  
  CSV.open(output, "wb") do |csv|
    csv << keys
    json_str = File.open(input).read.sub("\n", '')
    JSON.parse(json_str).each do |hash|
      csv << keys.map{ |k| hash[k] }
    end
  end
end

desc "generate categories and locations csv files from json"
task :generate_csv => :environment do
  dir = "#{Rails.root}/app/assets/javascripts/"

  input = dir + 'craigslist_categories.json'
  output = Rails.root+'db/data/categories.csv'
  generate_csv(input, output)

  # input = dir + 'craigslist_locations.js'
  # output = Rails.root + 'locations.csv'
  # generate_csv(input, output)
end
