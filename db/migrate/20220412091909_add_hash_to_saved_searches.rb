class AddHashToSavedSearches < ActiveRecord::Migration
  def change
    change_table :saved_searches do |t|
      t.column :retvals, :string
      t.column :category, :string, :length => 4
      t.column :location, :string, :length => 10
      t.column :has_image, :boolean, :default => false
      t.column :timestamp, :string, :length => 22, :default => nil
      t.column :source, :string
      t.column :price, :string, :default => nil
      t.column :url, :string
      t.column :hash, :string, :length => 32
    end
  end
end
