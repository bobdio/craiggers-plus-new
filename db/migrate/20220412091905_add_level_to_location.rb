class AddLevelToLocation < ActiveRecord::Migration
  def self.up
    add_column :locations, :level, :string
  end

  def self.down
    remove_column :locations, :level
  end
end
