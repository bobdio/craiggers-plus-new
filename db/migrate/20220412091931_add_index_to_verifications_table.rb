class AddIndexToVerificationsTable < ActiveRecord::Migration
  def change
    add_index :verifications, :secure_hash
    add_index :verifications, :name
  end
end
