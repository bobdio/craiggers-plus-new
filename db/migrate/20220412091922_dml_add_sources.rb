class DmlAddSources < ActiveRecord::Migration
  def change
    Source.delete_all
    Source.create!(code: 'BKPGE', name:'Backpage')
    Source.create!(code: 'CRAIG', name:'Craigslist')
    Source.create!(code: 'EBAYC', name:'Ebay Classifieds')
  end
end
