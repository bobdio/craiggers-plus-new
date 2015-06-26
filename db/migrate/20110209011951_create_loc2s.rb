class CreateLoc2s < ActiveRecord::Migration
  def self.up
    create_table :loc2s do |t|
      t.string :name
      t.string :code
      t.references :loc1

      t.timestamps
    end
  end

  def self.down
    drop_table :loc2s
  end
end
