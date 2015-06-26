class CreateCatsAndLocationsAndSources < ActiveRecord::Migration
  def self.up
    create_table :cats do |t|
      t.string :name
      t.string :code
      t.string :group
      t.string :category
      t.boolean :hidden, :default => false
      t.integer :originate, :default => 0

      t.timestamps
    end

    create_table :subcats do |t|
      t.string :name
      t.string :code
      t.references :cat
      t.string :group
      t.string :category
      t.boolean :hidden, :default => false
      t.integer :originate, :default => 0

      t.timestamps
    end

    create_table :locations do |t|
      t.string :name
      t.string :code
      t.integer :originate, :default => 0
      t.integer :countryRank
      t.string :country
      t.integer :cityRank
      t.string :city
      t.string :stateCode
      t.string :stateName
      t.boolean :hidden, :default => false
      t.float :latitude
      t.float :longitude

      t.timestamps
    end

    create_table :sources do |t|
      t.string :code
      t.string :name
      t.string :logo_url
      t.string :logo_sm_url
      t.boolean :hidden, :default => false

      t.timestamps
    end
  end

  def self.down
    drop_table :cats
    drop_table :subcats
    drop_table :locations
    drop_table :sources
  end
end
