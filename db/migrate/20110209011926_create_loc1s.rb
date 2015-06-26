class CreateLoc1s < ActiveRecord::Migration
  def self.up
    create_table :loc1s do |t|
      t.string :name
      t.string :code
      t.references :location

      t.timestamps
    end
  end

  def self.down
    drop_table :loc1s
  end
end
