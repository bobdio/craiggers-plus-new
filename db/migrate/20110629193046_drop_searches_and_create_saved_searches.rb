class DropSearchesAndCreateSavedSearches < ActiveRecord::Migration
  def self.up
    drop_table :searches
    create_table :saved_searches do |t|
      t.text :json
      t.timestamps
    end
  end

  def self.down
    create_table :searches do |t|
      t.string :url
      t.string :type
      t.references :user
      t.timestamps
      t.string :name
    end
  end
end
