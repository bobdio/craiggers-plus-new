class UpdateFavoritesForUserApi < ActiveRecord::Migration
  def self.up
    remove_column :favorites, :heading
    remove_column :favorites, :price
    remove_column :favorites, :utc
    remove_column :favorites, :path
    remove_column :favorites, :user_id
    remove_column :favorites, :postkey
    change_column :favorites, :json, :text
  end

  def self.down
    add_column :favorites, :heading, :string, :default => ""
    add_column :favorites, :price, :string, :default => ""
    add_column :favorites, :utc, :string, :default => ""
    add_column :favorites, :path, :string, :default => ""
    add_column :favorites, :user_id, :integer
    add_column :favorites, :postkey, :string
    change_column :favorites, :json, :text
  end
end
