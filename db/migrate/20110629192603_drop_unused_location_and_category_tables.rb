class DropUnusedLocationAndCategoryTables < ActiveRecord::Migration
  def self.up
    drop_table :cats
    drop_table :subcats
    drop_table :locations
    drop_table :loc1s
    drop_table :loc2s
  end

  def self.down
    create_table :cats do |t|
      t.string :name
      t.string :code

      t.timestamps
    end

    create_table :subcats do |t|
      t.string :name
      t.string :code
      t.integer :order,      :default => 0
      t.integer :position,   :default => 0
      t.references :cat

      t.timestamps
    end

    create_table :locations do |t|
      t.string :name
      t.string :code
      t.string :nearby
      t.string :taps_code

      t.timestamps
    end

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
end
