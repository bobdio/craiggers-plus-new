class AddIntervalToSavedSearches < ActiveRecord::Migration
  def change
    add_column :saved_searches, :interval, :integer
  end
end
