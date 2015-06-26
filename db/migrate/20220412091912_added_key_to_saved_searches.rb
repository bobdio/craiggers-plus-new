class AddedKeyToSavedSearches < ActiveRecord::Migration
  def up
    add_column :saved_searches, :key, :string, limit: 32

    SavedSearch.all.each do |r|
      r.generate_key
      r.save
    end
  end

  def down
    remove_column :saved_searches, :key
  end
end
