# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)
SOURCES = [
  {code: 'BKPGE', name: 'Backpage'},
  {code: 'CRAIG', name: 'craigslist'},
  {code: 'EBAYC', name: 'eBay classifieds'},
  {code: 'KIJIJ', name: 'Kijiji'},
  {code: 'INDEE', name: 'Indeed'},
  {code: 'NBCTY', name: 'MLS'},
  {code: 'EBAYM', name: 'eBay Motors'},
  {code: 'JBOOM', name: 'Jeboom'},
  {code: 'APTSD', name: 'Apartments.com'},
  {code: 'CARSD', name: 'Cars.com'}
]

SOURCES.each do |source|
  Source.create!(source) unless Source.find_by_code source[:code]
end  
  
