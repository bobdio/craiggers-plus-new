class UpdatesToFavorites < ActiveRecord::Migration
  def self.up
    add_column :favorites, :heading, :string, :default => ""
    add_column :favorites, :price, :string, :default => ""
    add_column :favorites, :utc, :string, :default => ""
    add_column :favorites, :path, :string, :default => ""
  end

  def self.down
    remove_column :favorites, :heading
    remove_column :favorites, :price
    remove_column :favorites, :utc
    remove_column :favorites, :path
  end
end
