class RecreateLoc1s < ActiveRecord::Migration
  def self.up

    create_table :loc1s do |t|
      t.string :name
      t.string :code
      t.references :location
      t.string :taps_code
      t.string :latlon

      t.timestamps
    end

    create_table :loc2s do |t|
      t.string :name
      t.string :code
      t.references :loc1

      t.timestamps
    end
  end

  def self.down
    drop_table :loc1s
    drop_table :loc2s
  end
end
