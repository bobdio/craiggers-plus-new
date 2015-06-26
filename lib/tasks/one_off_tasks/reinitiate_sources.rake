desc "rename sources"
task :reinitiate_sources => :environment do
  Source.delete_all
  Source.create!(code: 'APTSD', name:'Apartments.com')
  Source.create!(code: 'BKPGE', name:'Backpage')
  Source.create!(code: 'CARSD', name:'Cars.com')
  Source.create!(code: 'CRAIG', name:'craigslist')
  Source.create!(code: 'E_BAY', name:'eBay')
  Source.create!(code: 'EBAYC', name:'eBay classifieds')
  Source.create!(code: 'EBAYM', name:'eBay Motors')
  Source.create!(code: 'HMNGS', name:'Hemmings')
  Source.create!(code: 'INDEE', name:'Indeed')
  Source.create!(code: 'JBOOM', name:'Jeboom')
  Source.create!(code: 'KIJIJ', name:'Kijiji')
  Source.create!(code: 'RENTD', name:'Rent.com')
end
