desc "rename sources"
task :reinitiate_sources => :environment do
  Source.delete_all
  Source.create!(code: 'BKPGE', name:'Backpage')
  Source.create!(code: 'CRAIG', name:'craigslist')
  Source.create!(code: 'EBAYC', name:'eBay classifieds')
  Source.create!(code: 'KIJIJ', name:'Kijiji')
  Source.create!(code: 'INDEE', name:'Indeed')
  Source.create!(code: 'NBCTY', name:'MLS')
  Source.create!(code: 'HMNGS', name:'Hemmings')
  Source.create!(code: 'EBAYM', name:'eBay Motors')
  Source.create!(code: 'JBOOM', name:'Jeboom')
  Source.create!(code: 'APTSD', name:'apartments.com')
  Source.create!(code: 'CARSD', name:'Cars.com')
end
