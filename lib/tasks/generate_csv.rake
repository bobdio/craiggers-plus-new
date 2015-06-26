require 'csv'
require 'json'

def generate_csv(input, output)
  keys = %w(code name sname type parentCode)

  CSV.generate(output) do |csv|
    csv << keys
    json_str = File.open(input).read.sub(/.*?\n/, '')
    JSON.parse(json_str).each do |hash|
      csv << keys.map{ |k| hash[k] }
    end
  end
end

desc "generate categories and locations csv files from json"
task :generate_csv => :environment do
  dir = "#{Rails.root}/public/javascripts/threetaps/search/"

  input = dir + 'craigslist_categories.js'
  output = Rails.root + 'categories.csv'
  generate_csv(input, output)

  input = dir + 'craigslist_locations.js'
  output = Rails.root + 'locations.csv'
  generate_csv(input, output)
end
