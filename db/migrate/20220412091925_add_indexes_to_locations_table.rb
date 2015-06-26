class AddIndexesToLocationsTable < ActiveRecord::Migration
  def change
    add_index :locations, :code
    add_index :locations, :level
    add_index :locations, :parent_id
  end
end
