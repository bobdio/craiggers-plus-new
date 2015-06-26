class UpdateSearch < ActiveRecord::Migration
  def self.up
    remove_column :searches, :query
    remove_column :searches, :location
    remove_column :searches, :loc_1
    remove_column :searches, :loc_2
    remove_column :searches, :cat
    remove_column :searches, :subcat
    remove_column :searches, :sortby
    remove_column :searches, :order
  end

  def self.down
    add_column :searches, :query, :string
    add_column :searches, :location, :string
    add_column :searches, :loc_1, :string
    add_column :searches, :loc_2, :string
    add_column :searches, :cat, :string
    add_column :searches, :subcat, :string
    add_column :searches, :sortby, :string
    add_column :searches, :order, :string
  end
end
