class AdditionalDateCoulumnForSavedSearches < ActiveRecord::Migration
  def up
    change_table :saved_searches do |t|
      t.date :unsubscribed, default: nil
      t.date :deleted, default: nil
      t.remove :updated_at
    end
  end

  def down
    remove_column :saved_searches, :unsubscribed, :deleted
  end
end
