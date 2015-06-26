class AddSubscriptionIdToSavedSearches < ActiveRecord::Migration
  def change
    add_column :saved_searches, :subscription_id, :string
  end
end
