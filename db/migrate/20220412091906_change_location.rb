class ChangeLocation < ActiveRecord::Migration
  def up
    remove_column :locations, :country,
                              :countryRank,
                              :city,
                              :cityRank,
                              :stateName,
                              :stateCode,
                              :latitude,
                              :longitude,
                              :originate,
                              :hidden

    change_table :locations do |t|
      t.string :short_name
      t.float :bounds_max_lat,
                :bounds_min_lat,
                :bounds_max_long,
                :bounds_min_long
      t.references :parent
      t.rename :name, :full_name
    end
  end

  def down
    remove_column :locations, :parent_id,
                              :short_name,
                              :bounds_max_lat,
                              :bounds_min_lat,
                              :bounds_max_long,
                              :bounds_min_long

    change_table :locations do |t|
      t.string :country
      t.integer :countryRank
      t.string :city
      t.integer :cityRank
      t.string :stateName
      t.string :stateCode
      t.float :latitude
      t.float :longitude
      t.integer :originate, default: 0
      t.boolean :hidden, default: false

      t.rename :full_name, :name
    end
  end
end
