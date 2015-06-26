class AddTapsCodeToLoc1 < ActiveRecord::Migration
  def self.up
    add_column :loc1s, :taps_code, :string
  end

  def self.down
    remove_column :loc1s, :taps_code
  end
end
