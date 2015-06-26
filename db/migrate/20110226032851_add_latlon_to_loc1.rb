class AddLatlonToLoc1 < ActiveRecord::Migration
  def self.up
    add_column :loc1s, :latlon, :string
  end

  def self.down
    remove_column :loc1s, :latlon
  end
end
