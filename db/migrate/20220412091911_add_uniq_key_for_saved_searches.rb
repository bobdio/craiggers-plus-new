class AddUniqKeyForSavedSearches < ActiveRecord::Migration
  def up
    add_column :saved_searches, :uniq_key, :string, limit: 32

    SavedSearch.all.each do |r|
      r.generate_uniq_key
      r.save
    end
  end

  def down
    remove_column :saved_searches, :uniq_key
  end
end
