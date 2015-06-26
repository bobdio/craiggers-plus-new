class AddTimestampLastPosstingToSavedSearch < ActiveRecord::Migration
  def change
    add_column :saved_searches, :timestamp_last_posting, :string, default: '0'
  end
end
