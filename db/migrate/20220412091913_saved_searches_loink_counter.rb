class SavedSearchesLoinkCounter < ActiveRecord::Migration
  def up
    add_column :saved_searches, :counter, :integer, default: 0
  end

  def down
    remove_column :saved_searches, :counter
  end
end
