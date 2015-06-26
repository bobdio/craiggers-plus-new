class AddUsernameToFavorite < ActiveRecord::Migration
  def self.up
    add_column :favorites, :username, :string
  end

  def self.down
    remove_column :favorites, :username
  end
end
