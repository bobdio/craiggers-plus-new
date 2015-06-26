class ChangeJsonInFavoriteFromStringToText < ActiveRecord::Migration
  def self.up
    change_column :favorites, :json, :text
  end

  def self.down
    change_column :favorites, :json, :string
  end
end
