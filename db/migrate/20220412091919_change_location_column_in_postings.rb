class ChangeLocationColumnInPostings < ActiveRecord::Migration
  def change
  	change_table :postings do |t|
  	  t.remove :location
  	  t.references :location
  	end
  end
end
