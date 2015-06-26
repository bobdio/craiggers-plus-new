class ChangeSavedSearchTextToLongtext < ActiveRecord::Migration
  def self.up
    change_column :saved_searches, :json, :text
  end

  def self.down
    change_column :saved_searches, :json, :text
  end
end
