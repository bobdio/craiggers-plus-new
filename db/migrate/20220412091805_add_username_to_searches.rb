class AddUsernameToSearches < ActiveRecord::Migration
  def self.up
    add_column :saved_searches, :username, :string
  end

  def self.down
    remove_column :saved_searches, :username
  end
end
