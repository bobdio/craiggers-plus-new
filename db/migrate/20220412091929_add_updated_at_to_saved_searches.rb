class AddUpdatedAtToSavedSearches < ActiveRecord::Migration
  def change
  	change_table :saved_searches do |t|
  		t.remove :created_at

  		t.timestamps
  	end
  end
end
