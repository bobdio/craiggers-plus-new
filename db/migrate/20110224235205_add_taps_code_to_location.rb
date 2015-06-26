class AddTapsCodeToLocation < ActiveRecord::Migration
  def self.up
    add_column :locations, :taps_code, :string
  end

  def self.down
    remove_column :locations, :taps_code
  end
end
