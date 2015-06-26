class AddNearbyToLocation < ActiveRecord::Migration
  def self.up
    add_column :locations, :nearby, :string
  end

  def self.down
    remove_column :locations, :nearby
  end
end
