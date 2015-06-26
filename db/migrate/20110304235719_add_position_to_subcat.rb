class AddPositionToSubcat < ActiveRecord::Migration
  def self.up
    add_column :subcats, :position, :int, :default => 0
  end

  def self.down
    remove_column :subcats, :position
  end
end
