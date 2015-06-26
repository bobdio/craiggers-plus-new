class CreateSearches < ActiveRecord::Migration
  def self.up
    create_table :searches do |t|
      t.string :query
      t.string :location
      t.string :loc_1
      t.string :loc_2
      t.string :cat
      t.string :subcat
      t.string :url
      t.string :type
      t.references :user

      t.timestamps
    end
  end

  def self.down
    drop_table :searches
  end
end
